"""
Dev-only endpoints — disabled automatically in Lambda (production).

Usage:
    GET /api/v1/dev/set-vip?email=test@example.com
    GET /api/v1/dev/revoke-vip?email=test@example.com

These routes bypass Stripe and write directly to the Subscription table so
you can test VIP features without a real payment.
"""

import logging
import os
from datetime import datetime, timedelta, timezone

from core.database import get_db
from fastapi import APIRouter, Depends, HTTPException
from models.auth import Subscription
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/dev", tags=["dev"])


def _guard_dev_only() -> None:
    """Raise 403 when running inside Lambda (production deployment)."""
    if os.getenv("IS_LAMBDA", "").lower() == "true":
        raise HTTPException(
            status_code=403,
            detail="This endpoint is disabled in production.",
        )


@router.get("/set-vip")
async def set_vip(email: str, db: AsyncSession = Depends(get_db)):
    """Grant an active VIP subscription to *email* without Stripe."""
    _guard_dev_only()

    email = email.strip().lower()
    result = await db.execute(select(Subscription).where(Subscription.email == email))
    sub = result.scalar_one_or_none()

    expiry = datetime.now(timezone.utc) + timedelta(days=30)

    if sub:
        sub.status = "active"
        sub.current_period_end = expiry
        sub.updated_at = datetime.now(timezone.utc)
    else:
        sub = Subscription(
            email=email,
            status="active",
            current_period_end=expiry,
        )
        db.add(sub)

    await db.commit()
    logger.info("[DEV] VIP granted to %s", email)

    return {
        "ok": True,
        "email": email,
        "status": "active",
        "expires_at": expiry.isoformat(),
        "next_step": "Rechargez la page — syncSubscriptionStatus() sera appele automatiquement.",
    }


@router.get("/revoke-vip")
async def revoke_vip(email: str, db: AsyncSession = Depends(get_db)):
    """Remove VIP subscription from *email* (sets status to 'none')."""
    _guard_dev_only()

    email = email.strip().lower()
    result = await db.execute(select(Subscription).where(Subscription.email == email))
    sub = result.scalar_one_or_none()

    if not sub:
        return {"ok": False, "message": f"Aucune subscription trouvee pour {email}."}

    sub.status = "none"
    sub.updated_at = datetime.now(timezone.utc)
    await db.commit()
    logger.info("[DEV] VIP revoked for %s", email)

    return {"ok": True, "email": email, "status": "none"}


@router.get("/status")
async def dev_status(db: AsyncSession = Depends(get_db)):
    """List the 20 most recent subscriptions — handy for debugging."""
    _guard_dev_only()

    result = await db.execute(
        select(Subscription).order_by(Subscription.updated_at.desc()).limit(20)
    )
    subs = result.scalars().all()

    return {
        "subscriptions": [
            {
                "email": s.email,
                "status": s.status,
                "expires_at": s.current_period_end.isoformat() if s.current_period_end else None,
            }
            for s in subs
        ]
    }
