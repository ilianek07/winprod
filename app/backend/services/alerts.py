import logging
import os
from typing import List

from models.auth import AlertPreference
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

logger = logging.getLogger(__name__)


class AlertsService:
    @staticmethod
    async def get_preferences(db: AsyncSession, email: str) -> AlertPreference:
        result = await db.execute(select(AlertPreference).where(AlertPreference.email == email))
        pref = result.scalar_one_or_none()
        if not pref:
            pref = AlertPreference(email=email)
            db.add(pref)
            await db.commit()
            await db.refresh(pref)
        return pref

    @staticmethod
    async def upsert_preferences(
        db: AsyncSession,
        email: str,
        alert_trend_surge: bool,
        alert_top10_entry: bool,
        alert_new_pepite: bool,
    ) -> AlertPreference:
        result = await db.execute(select(AlertPreference).where(AlertPreference.email == email))
        pref = result.scalar_one_or_none()
        if not pref:
            pref = AlertPreference(email=email)
            db.add(pref)
        pref.alert_trend_surge = alert_trend_surge
        pref.alert_top10_entry = alert_top10_entry
        pref.alert_new_pepite = alert_new_pepite
        await db.commit()
        await db.refresh(pref)
        return pref

    @staticmethod
    async def get_subscribers(db: AsyncSession, alert_type: str) -> List[str]:
        field_map = {
            "trend_surge": AlertPreference.alert_trend_surge,
            "top10_entry": AlertPreference.alert_top10_entry,
            "new_pepite": AlertPreference.alert_new_pepite,
        }
        field = field_map.get(alert_type)
        if not field:
            return []
        result = await db.execute(select(AlertPreference).where(field == True))  # noqa: E712
        return [row.email for row in result.scalars().all()]

    @staticmethod
    def send_alert(email: str, alert_type: str, product_name: str) -> bool:
        api_key = os.getenv("RESEND_API_KEY", "")
        if not api_key:
            logger.warning("RESEND_API_KEY not set, skipping alert email")
            return False

        try:
            import resend as resend_lib
            resend_lib.api_key = api_key
        except ImportError:
            logger.error("resend package not installed")
            return False

        from_email = os.getenv("RESEND_FROM_EMAIL", "alerts@winprod.app")

        subjects = {
            "trend_surge": f"\U0001f525 {product_name} explose +20% — WinProd Alerte",
            "top10_entry": f"⭐ {product_name} entre dans le Top 10 — WinProd",
            "new_pepite": f"\U0001f48e Nouvelle P\xe9pite d\xe9tect\xe9e : {product_name} — WinProd",
        }
        subject = subjects.get(alert_type, f"Alerte WinProd : {product_name}")

        cta = '<a href="https://winprod.app" style="background:#10b981;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;margin-top:16px;font-weight:bold">Voir sur WinProd</a>'

        bodies = {
            "trend_surge": (
                f"<h2>\U0001f525 Alerte Tendance</h2>"
                f"<p><strong>{product_name}</strong> vient de progresser de +20 % en 24h dans le classement WinProd.</p>"
                f"<p>Tendance virale \xe9mergente — agissez rapidement avant vos concurrents !</p>{cta}"
            ),
            "top10_entry": (
                f"<h2>⭐ Nouveau Top 10</h2>"
                f"<p><strong>{product_name}</strong> vient d’entrer dans le Top 10 des produits les plus performants.</p>"
                f"<p>Analysez-le maintenant avant tout le monde.</p>{cta}"
            ),
            "new_pepite": (
                f"<h2>\U0001f48e Nouvelle P\xe9pite</h2>"
                f"<p>Une nouvelle P\xe9pite vient d’\xeatre d\xe9tect\xe9e : <strong>{product_name}</strong>.</p>"
                f"<p>Fort potentiel viral, faible saturation — d\xe9couvrez-la avant tout le monde.</p>{cta}"
            ),
        }
        html = bodies.get(alert_type, f"<p>Alerte WinProd : {product_name}</p>")

        try:
            resend_lib.Emails.send({
                "from": from_email,
                "to": email,
                "subject": subject,
                "html": html,
            })
            logger.info("Alert email sent to %s for %s: %s", email, alert_type, product_name)
            return True
        except Exception as exc:
            logger.error("Failed to send alert to %s: %s", email, exc)
            return False
