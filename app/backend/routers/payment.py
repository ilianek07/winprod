import json
import logging
import os
from datetime import datetime, timezone
from typing import Optional

import stripe
from core.database import get_db
from fastapi import APIRouter, Depends, HTTPException, Request
from models.auth import Subscription
from pydantic import BaseModel, EmailStr
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.sql import func

router = APIRouter(prefix="/api/v1/payment", tags=["payment"])
logger = logging.getLogger(__name__)

SUBSCRIPTION_AMOUNT = 500  # 5.00 EUR
SUBSCRIPTION_CURRENCY = "eur"
SUBSCRIPTION_INTERVAL = "month"
SUBSCRIPTION_NAME = "Analyse VIP - Abonnement mensuel"


def _init_stripe() -> None:
    key = os.getenv("STRIPE_SECRET_KEY", "")
    if not key:
        raise HTTPException(status_code=503, detail="Payment service not configured")
    stripe.api_key = key


class CreateCheckoutSessionRequest(BaseModel):
    email: str
    success_url: str
    cancel_url: str


class SubscriptionStatusResponse(BaseModel):
    status: str
    is_active: bool
    current_period_end: Optional[str] = None


class CancelSubscriptionRequest(BaseModel):
    email: str


async def _get_or_create_subscription(db: AsyncSession, email: str) -> Subscription:
    result = await db.execute(select(Subscription).where(Subscription.email == email))
    sub = result.scalar_one_or_none()
    if not sub:
        sub = Subscription(email=email, status="none")
        db.add(sub)
        await db.flush()
    return sub


@router.post("/create-checkout-session")
async def create_checkout_session(
    body: CreateCheckoutSessionRequest,
    db: AsyncSession = Depends(get_db),
):
    _init_stripe()
    email = body.email.strip().lower()

    sub = await _get_or_create_subscription(db, email)

    if sub.status == "active":
        raise HTTPException(status_code=400, detail="Un abonnement actif existe deja pour cet email")

    # Get or create Stripe customer
    if sub.stripe_customer_id:
        customer_id = sub.stripe_customer_id
    else:
        customer = await stripe.Customer.create_async(email=email)
        customer_id = customer.id
        sub.stripe_customer_id = customer_id
        sub.updated_at = datetime.now(timezone.utc)
        await db.commit()

    price_id = os.getenv("STRIPE_PRICE_ID", "")
    line_item = (
        {"price": price_id, "quantity": 1}
        if price_id
        else {
            "price_data": {
                "currency": SUBSCRIPTION_CURRENCY,
                "product_data": {"name": SUBSCRIPTION_NAME},
                "unit_amount": SUBSCRIPTION_AMOUNT,
                "recurring": {"interval": SUBSCRIPTION_INTERVAL},
            },
            "quantity": 1,
        }
    )

    session = await stripe.checkout.Session.create_async(
        customer=customer_id,
        payment_method_types=["card"],
        line_items=[line_item],
        mode="subscription",
        success_url=body.success_url,
        cancel_url=body.cancel_url,
        metadata={"email": email},
    )

    return {"url": session.url, "session_id": session.id}


@router.get("/subscription-status")
async def get_subscription_status(
    email: str,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Subscription).where(Subscription.email == email.strip().lower())
    )
    sub = result.scalar_one_or_none()

    if not sub:
        return SubscriptionStatusResponse(status="none", is_active=False)

    period_end = sub.current_period_end.isoformat() if sub.current_period_end else None
    return SubscriptionStatusResponse(
        status=sub.status,
        is_active=sub.status == "active",
        current_period_end=period_end,
    )


@router.post("/cancel-subscription")
async def cancel_subscription(
    body: CancelSubscriptionRequest,
    db: AsyncSession = Depends(get_db),
):
    _init_stripe()
    email = body.email.strip().lower()

    result = await db.execute(select(Subscription).where(Subscription.email == email))
    sub = result.scalar_one_or_none()

    if not sub or not sub.stripe_subscription_id:
        raise HTTPException(status_code=404, detail="Aucun abonnement actif trouve")

    # Cancel at period end so the user keeps access until the end of the billing cycle
    await stripe.Subscription.modify_async(
        sub.stripe_subscription_id,
        cancel_at_period_end=True,
    )

    sub.status = "canceled"
    sub.updated_at = datetime.now(timezone.utc)
    await db.commit()

    return {"message": "Abonnement annule. Acces conserve jusqu'a la fin de la periode."}


@router.post("/webhook")
async def stripe_webhook(request: Request, db: AsyncSession = Depends(get_db)):
    webhook_secret = os.getenv("STRIPE_WEBHOOK_SECRET", "")
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature", "")

    if webhook_secret:
        try:
            event = stripe.Webhook.construct_event(payload, sig_header, webhook_secret)
        except stripe.error.SignatureVerificationError:
            logger.warning("Stripe webhook: invalid signature")
            raise HTTPException(status_code=400, detail="Invalid signature")
    else:
        logger.warning("STRIPE_WEBHOOK_SECRET not set — skipping signature verification (dev only)")
        _init_stripe()
        event = stripe.Event.construct_from(json.loads(payload), stripe.api_key)

    await _dispatch_event(event, db)
    return {"received": True}


async def _dispatch_event(event, db: AsyncSession) -> None:
    event_type = event["type"]
    obj = event["data"]["object"]
    logger.info("Stripe event: %s", event_type)

    handlers = {
        "checkout.session.completed": _on_checkout_completed,
        "customer.subscription.created": _on_subscription_updated,
        "customer.subscription.updated": _on_subscription_updated,
        "customer.subscription.deleted": _on_subscription_deleted,
        "invoice.payment_succeeded": _on_payment_succeeded,
        "invoice.payment_failed": _on_payment_failed,
    }
    handler = handlers.get(event_type)
    if handler:
        await handler(obj, db)


async def _resolve_email_from_customer(customer_id: str) -> str:
    """Fetch the email associated with a Stripe customer."""
    try:
        customer = await stripe.Customer.retrieve_async(customer_id)
        return (customer.get("email") or "").strip().lower()
    except Exception as exc:
        logger.error("Could not retrieve Stripe customer %s: %s", customer_id, exc)
        return ""


async def _on_checkout_completed(session_data, db: AsyncSession) -> None:
    metadata = session_data.get("metadata") or {}
    email = (metadata.get("email") or session_data.get("customer_email") or "").strip().lower()
    customer_id = session_data.get("customer")
    subscription_id = session_data.get("subscription")

    if not email and customer_id:
        email = await _resolve_email_from_customer(customer_id)

    if not email:
        logger.error("checkout.session.completed: no email found")
        return

    sub = await _get_or_create_subscription(db, email)
    sub.stripe_customer_id = customer_id
    sub.stripe_subscription_id = subscription_id
    sub.status = "active"
    sub.updated_at = datetime.now(timezone.utc)
    await db.commit()
    logger.info("Subscription activated for %s", email)


async def _on_subscription_updated(subscription_data, db: AsyncSession) -> None:
    subscription_id = subscription_data.get("id")
    status = subscription_data.get("status")
    customer_id = subscription_data.get("customer")
    period_end_ts = subscription_data.get("current_period_end")

    result = await db.execute(
        select(Subscription).where(Subscription.stripe_subscription_id == subscription_id)
    )
    sub = result.scalar_one_or_none()

    if not sub and customer_id:
        result = await db.execute(
            select(Subscription).where(Subscription.stripe_customer_id == customer_id)
        )
        sub = result.scalar_one_or_none()

    if not sub:
        logger.warning("subscription.updated: no record for sub_id=%s", subscription_id)
        return

    sub.status = status
    sub.stripe_subscription_id = subscription_id
    if period_end_ts:
        sub.current_period_end = datetime.fromtimestamp(period_end_ts, tz=timezone.utc)
    sub.updated_at = datetime.now(timezone.utc)
    await db.commit()
    logger.info("Subscription %s updated to %s for %s", subscription_id, status, sub.email)


async def _on_subscription_deleted(subscription_data, db: AsyncSession) -> None:
    subscription_id = subscription_data.get("id")
    customer_id = subscription_data.get("customer")

    result = await db.execute(
        select(Subscription).where(Subscription.stripe_subscription_id == subscription_id)
    )
    sub = result.scalar_one_or_none()

    if not sub and customer_id:
        result = await db.execute(
            select(Subscription).where(Subscription.stripe_customer_id == customer_id)
        )
        sub = result.scalar_one_or_none()

    if sub:
        sub.status = "canceled"
        sub.updated_at = datetime.now(timezone.utc)
        await db.commit()
        logger.info("Subscription deleted/canceled for %s", sub.email)


async def _on_payment_succeeded(invoice_data, db: AsyncSession) -> None:
    customer_id = invoice_data.get("customer")
    subscription_id = invoice_data.get("subscription")
    if not subscription_id:
        return

    result = await db.execute(
        select(Subscription).where(Subscription.stripe_subscription_id == subscription_id)
    )
    sub = result.scalar_one_or_none()
    if not sub and customer_id:
        result = await db.execute(
            select(Subscription).where(Subscription.stripe_customer_id == customer_id)
        )
        sub = result.scalar_one_or_none()

    if sub:
        sub.status = "active"
        sub.updated_at = datetime.now(timezone.utc)
        await db.commit()
        logger.info("Payment succeeded, subscription reactivated for %s", sub.email)


async def _on_payment_failed(invoice_data, db: AsyncSession) -> None:
    customer_id = invoice_data.get("customer")
    subscription_id = invoice_data.get("subscription")

    result = await db.execute(
        select(Subscription).where(Subscription.stripe_subscription_id == subscription_id)
    )
    sub = result.scalar_one_or_none()
    if not sub and customer_id:
        result = await db.execute(
            select(Subscription).where(Subscription.stripe_customer_id == customer_id)
        )
        sub = result.scalar_one_or_none()

    if sub:
        sub.status = "past_due"
        sub.updated_at = datetime.now(timezone.utc)
        await db.commit()
        logger.info("Payment failed for %s — status set to past_due", sub.email)
