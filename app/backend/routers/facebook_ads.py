from fastapi import APIRouter, Query
from services.facebook_ads import get_facebook_ads

router = APIRouter(prefix="/api/v1/ads", tags=["ads"])


@router.get("/facebook")
async def facebook_ads_endpoint(keyword: str = Query(..., min_length=1)):
    ads = await get_facebook_ads(keyword)
    return {"keyword": keyword, "ads": ads}
