from typing import List
from pydantic import BaseModel, Field


class CoachMessage(BaseModel):
    role: str = Field(..., description="Message role: user or assistant.")
    content: str = Field(..., description="Message text content.")


class CoachChatRequest(BaseModel):
    messages: List[CoachMessage] = Field(..., description="Conversation history including the new user message.")
    is_premium: bool = Field(default=False, description="Whether the user has a VIP subscription.")
    message_index: int = Field(default=0, ge=0, description="0-based index of the current user message (number of prior exchanges).")
