import os
import asyncio
import logging
from datetime import datetime, timezone

from google import genai
from google.genai import types
from google.genai.errors import ServerError, ClientError
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from models import ChatRequest, ChatResponse, ToolCallLog
from tools import GEMINI_TOOL
from secure_client import call_secure_worker

load_dotenv()

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger(__name__)

app = FastAPI(title="AegisTrips Backend", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

gemini = genai.Client(api_key=os.getenv("GOOGLE_API_KEY"))
# Fallback order: try each model until one works
MODELS = ["gemini-2.5-flash", "gemini-3.5-flash"]

SYSTEM_PROMPT = (
    "You are AegisTrips, a corporate travel booking agent. "
    "Extract the destination, cost, and trip type from the user's message, "
    "then use the execute_secure_booking tool to complete the booking. "
    "Never ask for or handle credit card numbers or passport details — "
    "those are managed exclusively by the Terminal 3 TEE secure enclave. "
    "Be concise and professional."
)

GENERATE_CONFIG = types.GenerateContentConfig(
    system_instruction=SYSTEM_PROMPT,
    tools=[GEMINI_TOOL],
)


def _redact_for_log(result: dict) -> dict:
    safe = dict(result)
    for key in ("security_proof", "tee_attestation"):
        if key in safe:
            safe[key] = "[REDACTED_IN_LOGS]"
    return safe


async def _generate_with_fallback(contents: list, max_retries: int = 2) -> tuple[object, str]:
    """Try each model in MODELS, retrying on 503. Returns (response, model_used)."""
    for model in MODELS:
        for attempt in range(max_retries):
            try:
                resp = await gemini.aio.models.generate_content(
                    model=model, contents=contents, config=GENERATE_CONFIG
                )
                return resp, model
            except ServerError as e:
                if "503" in str(e) or "UNAVAILABLE" in str(e):
                    if attempt < max_retries - 1:
                        await asyncio.sleep(2)
                        continue
                    logger.warning("Model %s unavailable, trying next", model)
                    break
                raise
    raise HTTPException(status_code=503, detail="All Gemini models are temporarily unavailable. Try again in a moment.")


@app.get("/health")
async def health():
    return {"status": "ok", "module": "aegistrips-backend", "llm": MODELS[0]}


@app.post("/chat", response_model=ChatResponse)
async def chat(req: ChatRequest):
    tool_call_logs: list[ToolCallLog] = []
    booking_result: dict | None = None

    contents: list[types.Content] = [
        types.Content(role="user", parts=[types.Part(text=req.message)])
    ]

    # First Gemini call — expect a function_call part
    try:
        first_response, model_used = await _generate_with_fallback(contents)
        logger.info("Using model: %s", model_used)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Gemini API error: {e}")

    # Find the function call in the response parts
    fn_call = None
    for part in first_response.candidates[0].content.parts:
        if part.function_call and part.function_call.name:
            fn_call = part.function_call
            break

    if fn_call is None:
        # Gemini answered directly without invoking the tool
        return ChatResponse(reply=first_response.text, tool_calls=tool_call_logs)

    tool_input = dict(fn_call.args)
    timestamp = datetime.now(timezone.utc).isoformat()
    logger.info("Tool call: %s inputs=%s", fn_call.name, tool_input)

    fn_response_part: types.Part

    try:
        booking_result = await call_secure_worker(
            destination=tool_input["destination"],
            cost=float(tool_input["cost"]),
            trip_type=tool_input["trip_type"],
        )
        logger.info("Secure worker response (sanitized): %s", _redact_for_log(booking_result))

        tool_call_logs.append(
            ToolCallLog(
                tool_name=fn_call.name,
                inputs=tool_input,
                outputs=booking_result,
                timestamp=timestamp,
            )
        )
        fn_response_part = types.Part(
            function_response=types.FunctionResponse(
                name=fn_call.name,
                response={"result": booking_result},
            )
        )

    except ValueError as e:
        tool_call_logs.append(
            ToolCallLog(
                tool_name=fn_call.name,
                inputs=tool_input,
                outputs={"error": str(e)},
                timestamp=timestamp,
            )
        )
        fn_response_part = types.Part(
            function_response=types.FunctionResponse(
                name=fn_call.name,
                response={"error": str(e)},
            )
        )

    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))

    # Build multi-turn contents and make second Gemini call
    contents.append(first_response.candidates[0].content)
    contents.append(types.Content(role="user", parts=[fn_response_part]))

    try:
        second_response, _ = await _generate_with_fallback(contents)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Gemini API error: {e}")

    return ChatResponse(
        reply=second_response.text,
        tool_calls=tool_call_logs,
        secure_booking_result=booking_result,
    )
