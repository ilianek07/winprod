import logging
import os
import secrets
from datetime import datetime, timedelta, timezone

import httpx
from core.database import get_db
from fastapi import APIRouter, Depends, HTTPException
from models.auth import EmailVerification
from pydantic import BaseModel
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter(prefix="/api/v1/email-verification", tags=["email-verification"])
logger = logging.getLogger(__name__)

TOKEN_EXPIRE_HOURS = 24

VERIFY_PATH = "/auth/verify-email"


def _build_redirect_url(client_redirect_url: str) -> str:
    """Return the canonical redirect URL for verification emails.

    If SITE_URL is set (e.g. https://winprod.org in production) it takes
    precedence over whatever the client sent, preventing localhost links from
    landing in production emails.
    """
    site_url = os.getenv("SITE_URL", "").rstrip("/")
    if site_url:
        return f"{site_url}{VERIFY_PATH}"
    return client_redirect_url


# ── Pydantic schemas ──────────────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    email: str
    redirect_url: str  # e.g. "https://mon-site.com/auth/verify-email"


class VerifyRequest(BaseModel):
    token: str


class ResendRequest(BaseModel):
    email: str
    redirect_url: str


# ── Email sending ─────────────────────────────────────────────────────────────

async def _send_verification_email(email: str, token: str, redirect_url: str) -> None:
    """Call the Resend API to send a verification email.

    If RESEND_API_KEY is not set the URL is logged at WARNING level so it can
    be used during local development without a Resend account.
    """
    api_key = os.getenv("RESEND_API_KEY", "")
    from_address = os.getenv("RESEND_FROM_EMAIL", "onboarding@resend.dev")
    site_name = os.getenv("SITE_NAME", "VIP Analyse")

    verification_url = f"{redirect_url}?token={token}"

    if not api_key:
        logger.warning(
            "RESEND_API_KEY non configurée — email non envoyé. "
            "URL de vérification (dev only): %s",
            verification_url,
        )
        return

    html_body = f"""
<!DOCTYPE html>
<html lang="fr">
<body style="margin:0;padding:0;background:#0a0a0f;font-family:-apple-system,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:40px 16px;">
      <table width="480" cellpadding="0" cellspacing="0"
             style="background:#0f0f17;border:1px solid #1e1e2e;border-radius:16px;">
        <tr><td style="padding:40px 32px;">
          <h1 style="margin:0 0 8px;font-size:22px;color:#ffffff;">
            Vérifiez votre email
          </h1>
          <p style="margin:0 0 24px;font-size:14px;color:#9ca3af;">
            Cliquez sur le bouton ci-dessous pour confirmer votre adresse et
            accéder à <strong style="color:#fff;">{site_name}</strong>.
          </p>
          <a href="{verification_url}"
             style="display:inline-block;padding:12px 28px;
                    background:linear-gradient(135deg,#10b981,#3b82f6);
                    color:#ffffff;text-decoration:none;border-radius:10px;
                    font-weight:600;font-size:14px;">
            Vérifier mon email
          </a>
          <p style="margin:24px 0 0;font-size:12px;color:#6b7280;">
            Ce lien expire dans {TOKEN_EXPIRE_HOURS}&nbsp;heures.<br>
            Si vous n'avez pas créé de compte, ignorez cet email.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
"""

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(
                "https://api.resend.com/emails",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "from": from_address,
                    "to": [email],
                    "subject": f"Vérifiez votre email — {site_name}",
                    "html": html_body,
                },
            )
        if resp.status_code not in (200, 201):
            logger.warning(
                "Resend API error %s: %s — email non envoyé. "
                "URL de vérification (dev only): %s",
                resp.status_code,
                resp.text,
                verification_url,
            )
    except Exception as exc:
        logger.warning(
            "Erreur réseau Resend: %s — email non envoyé. "
            "URL de vérification (dev only): %s",
            exc,
            verification_url,
        )


# ── Helper ────────────────────────────────────────────────────────────────────

async def _create_token(db: AsyncSession, email: str) -> str:
    """Delete any pending tokens for this email and create a fresh one."""
    await db.execute(
        delete(EmailVerification).where(
            EmailVerification.email == email,
            EmailVerification.is_verified.is_(False),
        )
    )
    token = secrets.token_urlsafe(32)
    expires_at = datetime.now(timezone.utc) + timedelta(hours=TOKEN_EXPIRE_HOURS)
    db.add(EmailVerification(email=email, token=token, is_verified=False, expires_at=expires_at))
    await db.commit()
    return token


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.post("/register")
async def register(body: RegisterRequest, db: AsyncSession = Depends(get_db)):
    """Start sign-up: create a verification token and send the email."""
    email = body.email.strip().lower()

    # Already verified → can sign in straight away
    existing = await db.execute(
        select(EmailVerification).where(
            EmailVerification.email == email,
            EmailVerification.is_verified.is_(True),
        )
    )
    if existing.scalar_one_or_none():
        return {"already_verified": True, "message": "Email déjà vérifié"}

    token = await _create_token(db, email)
    await _send_verification_email(email, token, _build_redirect_url(body.redirect_url))
    return {"already_verified": False, "message": "Email de vérification envoyé"}


@router.post("/verify")
async def verify_email(body: VerifyRequest, db: AsyncSession = Depends(get_db)):
    """Mark a token as verified and return the associated email."""
    result = await db.execute(
        select(EmailVerification).where(EmailVerification.token == body.token)
    )
    record = result.scalar_one_or_none()

    if not record:
        raise HTTPException(status_code=404, detail="Lien de vérification invalide ou déjà utilisé")

    if record.is_verified:
        return {"email": record.email, "verified": True, "already_done": True}

    if datetime.now(timezone.utc) > record.expires_at:
        raise HTTPException(
            status_code=410,
            detail="Lien expiré. Demandez un nouvel email de vérification.",
        )

    record.is_verified = True
    await db.commit()
    return {"email": record.email, "verified": True, "already_done": False}


@router.get("/check")
async def check_verification(email: str, db: AsyncSession = Depends(get_db)):
    """Return whether an email address has been verified."""
    result = await db.execute(
        select(EmailVerification).where(
            EmailVerification.email == email.strip().lower(),
            EmailVerification.is_verified.is_(True),
        )
    )
    return {"verified": result.scalar_one_or_none() is not None}


@router.post("/resend")
async def resend_verification(body: ResendRequest, db: AsyncSession = Depends(get_db)):
    """Issue a new token and resend the verification email."""
    email = body.email.strip().lower()

    existing = await db.execute(
        select(EmailVerification).where(
            EmailVerification.email == email,
            EmailVerification.is_verified.is_(True),
        )
    )
    if existing.scalar_one_or_none():
        return {"already_verified": True, "message": "Email déjà vérifié"}

    token = await _create_token(db, email)
    await _send_verification_email(email, token, _build_redirect_url(body.redirect_url))
    return {"already_verified": False, "message": "Email de vérification renvoyé"}
