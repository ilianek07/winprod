import logging
import os

from core.database import get_db
from fastapi import APIRouter, Depends, HTTPException
from schemas.alerts import AlertPreferencesResponse, AlertPreferencesUpdate, TriggerAlertsRequest
from services.alerts import AlertsService
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter(prefix="/api/v1/alerts", tags=["alerts"])
logger = logging.getLogger(__name__)


@router.get("/preferences", response_model=AlertPreferencesResponse)
async def get_alert_preferences(email: str, db: AsyncSession = Depends(get_db)):
    pref = await AlertsService.get_preferences(db, email.strip().lower())
    return AlertPreferencesResponse(
        email=pref.email,
        alert_trend_surge=pref.alert_trend_surge,
        alert_top10_entry=pref.alert_top10_entry,
        alert_new_pepite=pref.alert_new_pepite,
    )


@router.put("/preferences", response_model=AlertPreferencesResponse)
async def update_alert_preferences(
    email: str,
    body: AlertPreferencesUpdate,
    db: AsyncSession = Depends(get_db),
):
    pref = await AlertsService.upsert_preferences(
        db,
        email.strip().lower(),
        alert_trend_surge=body.alert_trend_surge,
        alert_top10_entry=body.alert_top10_entry,
        alert_new_pepite=body.alert_new_pepite,
    )
    return AlertPreferencesResponse(
        email=pref.email,
        alert_trend_surge=pref.alert_trend_surge,
        alert_top10_entry=pref.alert_top10_entry,
        alert_new_pepite=pref.alert_new_pepite,
    )


@router.post("/trigger")
async def trigger_alerts(body: TriggerAlertsRequest, db: AsyncSession = Depends(get_db)):
    expected = os.getenv("ALERTS_SECRET", "")
    if not expected or body.secret != expected:
        raise HTTPException(status_code=403, detail="Invalid secret")

    subscribers = await AlertsService.get_subscribers(db, body.alert_type)
    sent = 0
    for email in subscribers:
        if AlertsService.send_alert(email, body.alert_type, body.product_name):
            sent += 1

    logger.info("Triggered %s alert for '%s': %d/%d sent", body.alert_type, body.product_name, sent, len(subscribers))
    return {"sent": sent, "total_subscribers": len(subscribers)}
