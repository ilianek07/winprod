"""
AI Business Coach router.
Provides a streaming chat endpoint powered by an LLM with a dropshipping expert persona.

Access rules:
  - message_index == 0  → free for all users
  - message_index  > 0  → requires VIP (is_premium=True), otherwise returns 402
"""

import json
import logging
import os

from fastapi import APIRouter, HTTPException, status
from schemas.aihub import ChatMessage, GenTxtRequest
from schemas.coach import CoachChatRequest
from services.aihub import AIHubService
from sse_starlette.sse import EventSourceResponse

logger = logging.getLogger(__name__)

COACH_MODEL = os.environ.get("COACH_MODEL", "claude-sonnet-4-6")

COACH_SYSTEM_PROMPT = """Tu es Alex, expert dropshipping et e-commerce avec 8 ans d'expérience. Tu coaches des entrepreneurs qui vendent en ligne.

Ton expertise :
- Sourcing : AliExpress, CJ Dropshipping, Alibaba, sélection fournisseurs, négociation prix
- Publicité : Facebook Ads, TikTok Ads, créatifs, copywriting, angle marketing
- Analyse produit : tendances, saturation marché, potentiel viral, timing d'entrée
- Finances : marge, CPA, ROAS, rentabilité, break-even
- Stratégie : positionnement, scaling, tests A/B, upsells, bundling

Tu connais la plateforme WinProd — un leaderboard de produits dropshipping classés par score de tendance réel (Google Trends 30j + 7j, TikTok, AliExpress commandes). Catégories disponibles :
• Top 20 Global — meilleurs produits toutes niches
• Budget <20€ — volume élevé, ticket bas (marges >80%)
• Tendance TikTok — viral en ce moment sur les réseaux
• Haute Marge — marge >75%, produits premium
• Résolution de problème — besoin précis, forte conversion
• Beauté & Bien-être, Animaux, Bébé & Enfant, Maison & Cuisine, Sport & Fitness
• Pépites (VIP) — détectés avant tout le monde, saturation <25%

Style : direct, concis, actionnable. Pas de bla-bla. Conseils pratiques immédiatement utilisables. Réponds en français sauf si l'utilisateur écrit dans une autre langue. Utilise des listes à puces pour structurer quand c'est utile."""

router = APIRouter(prefix="/api/v1/coach", tags=["coach"])


@router.post("/chat")
async def coach_chat(request: CoachChatRequest):
    """
    Streaming chat with the AI business coach (Alex).
    Returns an SSE stream where each event is JSON: {"content": "..."} or "[DONE]".
    """
    if request.message_index > 0 and not request.is_premium:
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail="VIP subscription required to continue the conversation.",
        )

    messages = [ChatMessage(role="system", content=COACH_SYSTEM_PROMPT)]
    for m in request.messages:
        messages.append(ChatMessage(role=m.role, content=m.content))

    gentxt_request = GenTxtRequest(
        messages=messages,
        model=COACH_MODEL,
        stream=True,
        temperature=0.7,
        max_tokens=1024,
    )

    service = AIHubService()

    async def event_generator():
        try:
            async for chunk in service.gentxt_stream(gentxt_request):
                yield json.dumps({"content": chunk})
        except Exception as e:
            logger.error(f"Coach stream error: {e}")
            yield json.dumps({"content": f"[ERROR] Une erreur est survenue. Veuillez réessayer."})
        finally:
            yield "[DONE]"

    return EventSourceResponse(event_generator(), media_type="text/event-stream")
