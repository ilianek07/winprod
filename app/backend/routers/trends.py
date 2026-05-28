import asyncio

from fastapi import APIRouter, Query
from pydantic import BaseModel

from services.trends import get_trend_score

router = APIRouter(prefix="/api/v1/trends", tags=["trends"])


class BatchRequest(BaseModel):
    keywords: list[str]


@router.get("/score")
async def score_single(keyword: str = Query(..., description="Product name or search keyword")):
    """Return trend score for a single keyword from Google Trends, TikTok and AliExpress."""
    return await get_trend_score(keyword)


@router.post("/batch")
async def score_batch(body: BatchRequest):
    """Return trend scores for up to 20 keywords concurrently."""
    keywords = body.keywords[:20]
    results = await asyncio.gather(*[get_trend_score(kw) for kw in keywords])
    return {"scores": list(results)}
