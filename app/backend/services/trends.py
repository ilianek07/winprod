"""
Trend scoring service.

Combines live data from:
  - Google Trends  (40 % weight) — interest over the past 3 months, 0-100.
  - TikTok Creative Center (35 % weight) — hashtag post count, log-normalised.
  - AliExpress     (25 % weight) — sales/order volume, log-normalised.

Results are cached in-process for CACHE_TTL seconds to avoid rate-limiting.
"""

from __future__ import annotations

import asyncio
import math
import re
import time
import logging
from typing import Optional

logger = logging.getLogger(__name__)

_scores_cache: dict[str, tuple[dict, float]] = {}
CACHE_TTL = 6 * 3600  # 6 hours

# Limit parallel Google Trends calls to avoid rate-limiting (pytrends is sync)
_google_sem = asyncio.Semaphore(2)


# ---------------------------------------------------------------------------
# Cache helpers
# ---------------------------------------------------------------------------

def _cached(keyword: str) -> Optional[dict]:
    entry = _scores_cache.get(keyword)
    if entry and time.time() - entry[1] < CACHE_TTL:
        return entry[0]
    return None


def _store(keyword: str, data: dict) -> None:
    _scores_cache[keyword] = (data, time.time())


# ---------------------------------------------------------------------------
# Google Trends
# ---------------------------------------------------------------------------

async def _google_trends(keyword: str) -> tuple[float, float]:
    """Return (avg_3m_score, momentum_7d) for keyword, both 0-100.

    momentum_7d measures how sharply interest is rising over the last ~2 weeks
    compared to the earlier baseline in the 3-month window.
    """
    async with _google_sem:
        try:
            from pytrends.request import TrendReq

            loop = asyncio.get_event_loop()

            def _sync() -> tuple[float, float]:
                pt = TrendReq(
                    hl="en-US",
                    tz=360,
                    timeout=(10, 25),
                    retries=1,
                    backoff_factor=0.5,
                )
                pt.build_payload([keyword], cat=0, timeframe="today 3-m", geo="", gprop="")
                df = pt.interest_over_time()
                if df.empty or keyword not in df.columns:
                    return 0.0, 0.0

                series = df[keyword]
                avg = float(series.iloc[-4:].mean())

                # Momentum: last 2 data-points vs 2 data-points from 4 weeks ago
                n = len(series)
                if n >= 6:
                    recent = float(series.iloc[-2:].mean())
                    baseline = float(series.iloc[max(0, n - 6) : max(1, n - 4)].mean())
                    if baseline > 5:
                        ratio = recent / baseline
                        # ratio 0.5→0, 1.0→33, 2.0→100
                        momentum = min(100.0, max(0.0, (ratio - 0.5) / 1.5 * 100))
                    else:
                        momentum = min(100.0, recent)
                else:
                    momentum = avg

                return min(100.0, max(0.0, avg)), momentum

            result = await loop.run_in_executor(None, _sync)
            return result
        except Exception as exc:
            logger.warning("Google Trends error for %r: %s", keyword, exc)
            return 0.0, 0.0


# ---------------------------------------------------------------------------
# TikTok Creative Center
# ---------------------------------------------------------------------------

async def _tiktok_score(keyword: str) -> float:
    """Return TikTok hashtag popularity score (0-100) via Creative Center API."""
    try:
        import aiohttp

        url = "https://ads.tiktok.com/creative_radar_api/v1/popular_trend/hashtag/list"
        params = {
            "period": 7,
            "page": 1,
            "limit": 50,
            "order_by": "post_count",
            "country_code": "US",
            "keyword": keyword,
        }
        headers = {
            "User-Agent": (
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/124.0.0.0 Safari/537.36"
            ),
            "Accept": "application/json, text/plain, */*",
            "Referer": "https://ads.tiktok.com/",
        }
        async with aiohttp.ClientSession() as session:
            async with session.get(
                url,
                params=params,
                headers=headers,
                timeout=aiohttp.ClientTimeout(total=12),
            ) as resp:
                if resp.status == 200:
                    data = await resp.json(content_type=None)
                    items = (data.get("data") or {}).get("list") or []
                    if items:
                        best_count = max(
                            (item.get("publish_cnt", 0) for item in items), default=0
                        )
                        if best_count > 0:
                            # log10 normalisation: 10^7 posts → 100
                            return min(100.0, (math.log10(best_count) / 7) * 100)
    except Exception as exc:
        logger.warning("TikTok score error for %r: %s", keyword, exc)
    return 0.0


# ---------------------------------------------------------------------------
# AliExpress
# ---------------------------------------------------------------------------

async def _aliexpress_score(keyword: str) -> float:
    """Return AliExpress popularity score (0-100) based on order/sales volume."""
    try:
        import aiohttp

        url = "https://www.aliexpress.com/wholesale"
        params = {"SearchText": keyword, "SortType": "total_transy_desc", "page": 1}
        headers = {
            "User-Agent": (
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/124.0.0.0 Safari/537.36"
            ),
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.9",
        }
        async with aiohttp.ClientSession() as session:
            async with session.get(
                url,
                params=params,
                headers=headers,
                timeout=aiohttp.ClientTimeout(total=15),
            ) as resp:
                if resp.status == 200:
                    text = await resp.text()
                    # Extract numeric order/trade counts from embedded JSON blobs
                    patterns = [
                        r'"trade_count":"(\d+)"',
                        r'"orders":"(\d+)"',
                        r'"tradeCount":(\d+)',
                        r'"sold_count":(\d+)',
                        r'"totalSales":(\d+)',
                        r'"tradeCount":"(\d+)"',
                    ]
                    counts: list[int] = []
                    for pat in patterns:
                        counts.extend(int(m) for m in re.findall(pat, text)[:20])

                    if counts:
                        counts.sort(reverse=True)
                        # Top 25 % to avoid outliers skewing the score
                        top = counts[: max(1, len(counts) // 4)]
                        avg = sum(top) / len(top)
                        # log10 normalisation: 10^5 orders → 100
                        return min(100.0, (math.log10(max(1, avg)) / 5) * 100)
    except Exception as exc:
        logger.warning("AliExpress score error for %r: %s", keyword, exc)
    return 0.0


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

async def get_trend_score(keyword: str) -> dict:
    """
    Fetch and combine trend scores from Google Trends, TikTok and AliExpress.

    Returns::

        {
            "keyword":    str,
            "google":     float,   # 0-100
            "tiktok":     float,   # 0-100
            "aliexpress": float,   # 0-100
            "score":      float,   # 0-100 weighted (Google 40%, TikTok 35%, AliExpress 25%)
            "cached":     bool,
        }
    """
    cached = _cached(keyword)
    if cached:
        return {**cached, "cached": True}

    (google, google_7d), tiktok, aliexpress = await asyncio.gather(
        _google_trends(keyword),
        _tiktok_score(keyword),
        _aliexpress_score(keyword),
    )

    score = google * 0.40 + tiktok * 0.35 + aliexpress * 0.25
    sources_hit = sum(1 for v in (google, tiktok, aliexpress) if v > 0)

    result = {
        "keyword": keyword,
        "google": round(google, 1),
        "google_7d": round(google_7d, 1),   # 7-day momentum, used for Pépites scoring
        "tiktok": round(tiktok, 1),
        "aliexpress": round(aliexpress, 1),
        "score": round(score, 1),
        "sources_hit": sources_hit,
        "cached": False,
    }
    _store(keyword, result)
    return result
