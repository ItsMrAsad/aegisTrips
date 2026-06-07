import os
import httpx
from dotenv import load_dotenv

load_dotenv()

SECURE_WORKER_URL = os.getenv("SECURE_WORKER_URL", "http://localhost:3001")
AGENT_API_KEY = os.getenv("AGENT_API_KEY", "")


async def call_secure_worker(destination: str, cost: float, trip_type: str) -> dict:
    headers = {
        "X-Agent-Api-Key": AGENT_API_KEY,
        "Content-Type": "application/json",
    }
    payload = {"destination": destination, "cost": cost, "trip_type": trip_type}

    async with httpx.AsyncClient(timeout=15.0) as client:
        response = await client.post(
            f"{SECURE_WORKER_URL}/execute-booking",
            json=payload,
            headers=headers,
        )

    if response.status_code == 401:
        raise PermissionError("Secure worker rejected agent identity — check AGENT_API_KEY")

    if response.status_code == 400:
        data = response.json()
        raise ValueError(data.get("error", "Budget limit exceeded"))

    response.raise_for_status()
    return response.json()
