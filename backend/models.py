from pydantic import BaseModel
from typing import Any


class ChatRequest(BaseModel):
    message: str


class ToolCallLog(BaseModel):
    tool_name: str
    inputs: dict[str, Any]
    outputs: dict[str, Any]
    timestamp: str


class ChatResponse(BaseModel):
    reply: str
    tool_calls: list[ToolCallLog] = []
    secure_booking_result: dict[str, Any] | None = None
