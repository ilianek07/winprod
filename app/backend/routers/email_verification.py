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
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Vérifiez votre email — WinProd</title>
</head>
<body style="margin:0;padding:0;background-color:#09090d;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
    <tr>
      <td align="center" style="padding:48px 16px;">

        <!-- Card -->
        <table width="520" cellpadding="0" cellspacing="0" role="presentation"
               style="max-width:520px;width:100%;background:#0f0f18;border:1px solid #2a2a3d;border-radius:20px;overflow:hidden;">

          <!-- Gold top bar -->
          <tr>
            <td style="height:4px;background:linear-gradient(90deg,#b8860b,#f5c842,#b8860b);font-size:0;line-height:0;">&nbsp;</td>
          </tr>

          <!-- Header -->
          <tr>
            <td align="center" style="padding:40px 40px 0;">
              <!-- Logo wordmark -->
              <table cellpadding="0" cellspacing="0" role="presentation">
                <tr>
                  <td style="background:linear-gradient(135deg,#1a1a2e,#16213e);border:1px solid #2a2a3d;border-radius:14px;padding:12px 24px;">
                    <span style="font-size:22px;font-weight:800;letter-spacing:-0.5px;">
                      <span style="color:#f5c842;">Win</span><span style="color:#ffffff;">Prod</span>
                      <span style="font-size:18px;">&#x1F451;</span>
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px 40px 0;">
              <h1 style="margin:0 0 12px;font-size:26px;font-weight:700;color:#ffffff;line-height:1.3;">
                Bienvenue sur WinProd&nbsp;&#x1F451;
              </h1>
              <p style="margin:0 0 8px;font-size:15px;color:#a0a0b8;line-height:1.6;">
                Vous êtes à un clic de rejoindre la communauté des vendeurs qui trouvent les
                <strong style="color:#f5c842;">produits gagnants</strong> avant tout le monde.
              </p>
              <p style="margin:0 0 28px;font-size:15px;color:#a0a0b8;line-height:1.6;">
                Confirmez votre adresse email pour activer votre compte et accéder à toutes
                les fonctionnalités WinProd.
              </p>

              <!-- CTA Button -->
              <table cellpadding="0" cellspacing="0" role="presentation">
                <tr>
                  <td style="border-radius:12px;background:linear-gradient(135deg,#c9a227,#f5c842);">
                    <a href="{verification_url}"
                       style="display:inline-block;padding:15px 36px;font-size:15px;font-weight:700;
                              color:#0a0a0d;text-decoration:none;letter-spacing:0.2px;border-radius:12px;">
                      ✓&nbsp;&nbsp;Vérifier mon email
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Link fallback -->
              <p style="margin:20px 0 0;font-size:12px;color:#6b7280;line-height:1.6;">
                Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur&nbsp;:<br/>
                <a href="{verification_url}"
                   style="color:#f5c842;word-break:break-all;font-size:11px;">{verification_url}</a>
              </p>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:32px 40px 0;">
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                <tr><td style="height:1px;background:#1e1e30;font-size:0;line-height:0;">&nbsp;</td></tr>
              </table>
            </td>
          </tr>

          <!-- Security note -->
          <tr>
            <td style="padding:20px 40px 0;">
              <table cellpadding="0" cellspacing="0" role="presentation"
                     style="background:#13131f;border:1px solid #1e1e30;border-radius:10px;width:100%;">
                <tr>
                  <td style="padding:14px 18px;">
                    <p style="margin:0;font-size:12px;color:#6b7280;line-height:1.6;">
                      &#x1F512;&nbsp;<strong style="color:#9ca3af;">Lien sécurisé</strong>
                      &mdash; expire dans <strong style="color:#9ca3af;">{TOKEN_EXPIRE_HOURS}&nbsp;heures</strong>.
                      Si vous n'avez pas créé ce compte, ignorez simplement cet email.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding:28px 40px 36px;">
              <p style="margin:0 0 4px;font-size:13px;color:#6b7280;">
                Envoyé avec &#x2665; par
                <strong style="color:#f5c842;">L'équipe WinProd</strong>
              </p>
              <p style="margin:0;font-size:11px;color:#3d3d52;">
                &copy; 2025 WinProd — Tous droits réservés
              </p>
            </td>
          </tr>

        </table>
        <!-- /Card -->

      </td>
    </tr>
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
