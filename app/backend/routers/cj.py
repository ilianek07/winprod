from fastapi import APIRouter, Query

from services.cj import get_product_price

router = APIRouter(prefix="/api/v1/cj", tags=["cj"])


@router.get("/price")
async def cj_product_price(
    keyword: str = Query(..., description="Product name to search on CJDropshipping"),
):
    """
    Return the lowest real buy price from CJDropshipping for the given keyword.
    `price` is null when no match is found or the API is unavailable.
    """
    price = await get_product_price(keyword)
    return {"keyword": keyword, "price": price}
