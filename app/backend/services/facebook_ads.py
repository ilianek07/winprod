import asyncio
import os
import time
from datetime import date, datetime
from typing import Optional

import aiohttp

_ADS_URL = "https://graph.facebook.com/v18.0/ads_archive"
_CACHE_TTL = 2 * 3600

_cache: dict[str, tuple[list, float]] = {}
_lock = asyncio.Lock()


def _get_token() -> Optional[str]:
    return os.environ.get("FACEBOOK_ACCESS_TOKEN", "").strip() or None


def _compute_running_days(start_time: Optional[str]) -> int:
    if not start_time:
        return 0
    try:
        start = datetime.fromisoformat(start_time.replace("Z", "+00:00")).date()
        return max(0, (date.today() - start).days)
    except Exception:
        return 0


def _normalize(raw: dict) -> dict:
    bodies = raw.get("ad_creative_bodies") or []
    body = bodies[0] if bodies else ""
    impressions_data = raw.get("impressions") or {}
    try:
        impressions_lower = int(impressions_data.get("lower_bound", 0) or 0)
    except (ValueError, TypeError):
        impressions_lower = 0
    return {
        "id": raw.get("id", ""),
        "pageName": raw.get("page_name", ""),
        "body": body[:250],
        "snapshotUrl": raw.get("ad_snapshot_url", ""),
        "runningDays": _compute_running_days(raw.get("ad_delivery_start_time")),
        "impressionsLower": impressions_lower,
    }


async def get_facebook_ads(keyword: str, limit: int = 5) -> list[dict]:
    token = _get_token()
    if not token:
        return []

    cache_key = f"{keyword}:{limit}"
    async with _lock:
        if cache_key in _cache:
            ads, ts = _cache[cache_key]
            if time.monotonic() - ts < _CACHE_TTL:
                return ads

    params = {
        "search_terms": keyword,
        "ad_reached_countries": '["FR"]',
        "ad_active_status": "ACTIVE",
        "fields": "id,page_name,ad_creative_bodies,ad_snapshot_url,ad_delivery_start_time,impressions",
        "limit": limit,
        "access_token": token,
    }

    try:
        async with aiohttp.ClientSession(timeout=aiohttp.ClientTimeout(total=10)) as session:
            async with session.get(_ADS_URL, params=params) as resp:
                if resp.status != 200:
                    return []
                data = await resp.json()
    except Exception:
        return []

    raw_ads = data.get("data", [])
    ads = [_normalize(a) for a in raw_ads[:limit]]

    async with _lock:
        _cache[cache_key] = (ads, time.monotonic())

    return ads
