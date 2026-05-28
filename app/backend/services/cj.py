"""CJDropshipping API service — access token management + product price lookup.

Auth flow:
  POST /api2.0/v1/authentication/getAccessToken  →  accessToken (valid ~30 days)
  Token is cached in-process; refreshed automatically when expired.

Price lookup:
  GET /api2.0/v1/product/list?productNameEn=<keyword>&pageNum=1&pageSize=5
  Header: CJ-Access-Token: <token>
  Returns the lowest sellPrice (= dropshipper buy price) from matching results.
"""

from __future__ import annotations

import asyncio
import logging
import os
import time
from typing import Optional

import aiohttp

logger = logging.getLogger(__name__)

_CJ_BASE = "https://developers.cjdropshipping.com/api2.0/v1"
_AUTH_URL = f"{_CJ_BASE}/authentication/getAccessToken"
_PRODUCT_URL = f"{_CJ_BASE}/product/list"

TOKEN_TTL = 23 * 3600       # refresh 1 hour before the 24-hour expiry
PRICE_CACHE_TTL = 4 * 3600  # cache prices for 4 hours

_token_cache: Optional[tuple[str, float]] = None  # (token, expires_at)
_token_lock = asyncio.Lock()
_price_cache: dict[str, tuple[Optional[float], float]] = {}


# ---------------------------------------------------------------------------
# Key parsing
# ---------------------------------------------------------------------------

def _parse_api_key() -> tuple[str, str]:
    """
    Parse CJ_API_KEY from the environment.
    Expected format:  email@api@token
    e.g.  CJ5460282@api@d88f1a9046d84a0eaf6acfa69dc8289f
    """
    raw = os.environ.get("CJ_API_KEY", "").strip()
    if "@api@" in raw:
        email, token = raw.split("@api@", 1)
        return email, token
    raise ValueError("CJ_API_KEY must be in the format  email@api@apikey")


# ---------------------------------------------------------------------------
# Token management
# ---------------------------------------------------------------------------

async def get_access_token() -> Optional[str]:
    """Return a valid CJ access token, refreshing it if expired."""
    global _token_cache
    async with _token_lock:
        if _token_cache and time.time() < _token_cache[1]:
            return _token_cache[0]

        try:
            email, password = _parse_api_key()
        except ValueError as exc:
            logger.warning("CJ API key error: %s", exc)
            return None

        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    _AUTH_URL,
                    json={"email": email, "password": password},
                    timeout=aiohttp.ClientTimeout(total=10),
                ) as resp:
                    if resp.status != 200:
                        logger.warning("CJ auth failed: HTTP %s", resp.status)
                        return None
                    data = await resp.json(content_type=None)
                    if not data.get("result"):
                        logger.warning("CJ auth error: %s", data.get("message"))
                        return None
                    token = data["data"]["accessToken"]
                    _token_cache = (token, time.time() + TOKEN_TTL)
                    logger.info("CJ access token refreshed successfully")
                    return token
        except Exception as exc:
            logger.warning("CJ get_access_token exception: %s", exc)
            return None


# ---------------------------------------------------------------------------
# Product price lookup
# ---------------------------------------------------------------------------

async def get_product_price(keyword: str) -> Optional[float]:
    """
    Return the lowest CJ buy price for a keyword search, or None on failure.
    Result is cached for PRICE_CACHE_TTL seconds.
    """
    entry = _price_cache.get(keyword)
    if entry and time.time() < entry[1]:
        return entry[0]

    token = await get_access_token()
    if not token:
        logger.warning("CJ: no access token — skipping price lookup for %r", keyword)
        return None

    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(
                _PRODUCT_URL,
                params={"productNameEn": keyword, "pageNum": 1, "pageSize": 5},
                headers={"CJ-Access-Token": token},
                timeout=aiohttp.ClientTimeout(total=12),
            ) as resp:
                if resp.status != 200:
                    logger.warning("CJ product search failed: HTTP %s", resp.status)
                    return None
                data = await resp.json(content_type=None)
                if not data.get("result"):
                    logger.warning("CJ product search error: %s", data.get("message"))
                    return None

                products = (data.get("data") or {}).get("list") or []
                if not products:
                    _price_cache[keyword] = (None, time.time() + PRICE_CACHE_TTL)
                    return None

                prices: list[float] = []
                for p in products:
                    # CJ may expose the price at product level or inside productSku list
                    raw = p.get("sellPrice") or p.get("productPrice")
                    if raw:
                        try:
                            prices.append(float(raw))
                            continue
                        except (ValueError, TypeError):
                            pass
                    for sku in p.get("productSku") or []:
                        raw = sku.get("sellPrice") or sku.get("variantSellPrice")
                        if raw:
                            try:
                                prices.append(float(raw))
                            except (ValueError, TypeError):
                                pass

                price = min(prices) if prices else None
                _price_cache[keyword] = (price, time.time() + PRICE_CACHE_TTL)
                if price is not None:
                    logger.info("CJ price for %r: %.2f €", keyword, price)
                return price

    except Exception as exc:
        logger.warning("CJ get_product_price exception for %r: %s", keyword, exc)
        return None
