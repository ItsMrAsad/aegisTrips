# AegisTrips — Zero-Knowledge Corporate Travel Agent

> Built for the **Terminal 3 Agent Dev Kit Hackathon**

An AI-powered corporate travel booking agent that proves **zero credentials ever touch the LLM**. Sensitive data (credit card, passport) is sealed inside a Terminal 3 TEE enclave. The AI only sees destination, cost, and trip type — nothing else.

---

## Architecture

```
User Prompt  →  FastAPI + Gemini (LLM)  →  Secure Worker (TEE)  →  Terminal 3 T3N
                      |                          |
              Tool schema has NO              Holds credentials in env
              credential fields              Returns masked data + HMAC attestation
```

```
+----------------------------------+     +----------------------------------+
|  Backend  (FastAPI + Gemini)     |---->|  Secure Worker  (Node/TS TEE)    |
|  LLM sees: destination, cost,    |     |  Holds: MOCK_CREDIT_CARD,        |
|  trip_type -- NOTHING ELSE       |<----|  MOCK_PASSPORT in env only       |
+----------------------------------+     |  Returns: masked card, txn_id,   |
                                         |  HMAC attestation, T3N DID       |
                                         +----------------------------------+
                                                       |
                                         +----------------------------------+
                                         |  Terminal 3 T3N  (testnet)       |
                                         |  Live DID: did:t3n:bdfbca32...   |
                                         +----------------------------------+
```

---

## Security Model

| Layer | What happens |
|-------|-------------|
| **Tool schema** | Gemini tool has only `destination`, `cost`, `trip_type` — credentials structurally cannot be passed |
| **TEE enclave** | `MOCK_CREDIT_CARD` and `MOCK_PASSPORT` live only in secure-worker `.env` — never sent to LLM |
| **Masked output** | TEE returns `VISA ****1111` and `P**T-****5678` — raw values never leave the enclave |
| **HMAC attestation** | Every booking gets a `HMAC-SHA256(TEE_SECRET_KEY, txnId+timestamp)` proof |
| **T3N live DID** | Agent authenticates to Terminal 3 testnet — `did:t3n:bdfbca32d6f5b095c83f1cadd0bb99a5294833db` |

---

## Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.11+
- **Google AI Studio API key** — [aistudio.google.com](https://aistudio.google.com)
- **Terminal 3 private key** — from Terminal 3 hackathon registration

---

## Setup

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/aegisTrips.git
cd aegisTrips
```

### 2. Secure Worker

```bash
cd secure-worker
npm install
cp .env.example .env
```

Edit `secure-worker/.env`:

```
AGENT_API_KEY=aegistrips-shared-secret-2024
TEE_SECRET_KEY=aegistrips-tee-attestation-key-2024
MOCK_CREDIT_CARD=4111111111111111
MOCK_PASSPORT=PA12345678
PORT=3001
T3N_PRIVATE_KEY=your-terminal3-private-key-here
T3N_ENVIRONMENT=testnet
```

### 3. Backend

```bash
cd backend
python -m venv .venv

# Windows
.venv\Scripts\activate

# macOS / Linux
source .venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
```

Edit `backend/.env`:

```
GOOGLE_API_KEY=your-google-ai-studio-key-here
AGENT_API_KEY=aegistrips-shared-secret-2024
SECURE_WORKER_URL=http://localhost:3001
```

### 4. Frontend

```bash
cd frontend
npm install
```

---

## Running

### One command (Windows)

```powershell
.\start.ps1
```

Starts all three services and opens the browser automatically at http://localhost:5173

### Manual (3 terminals)

**Terminal 1 — Secure Worker**

```bash
cd secure-worker
npm run dev
# Wait for: [TEE] T3N connected
```

**Terminal 2 — Backend**

```bash
cd backend
.venv\Scripts\activate
uvicorn main:app --reload --port 8000
```

**Terminal 3 — Frontend**

```bash
cd frontend
npm run dev
```

Open **http://localhost:5173**

---

## Demo

| Prompt | Expected result |
|--------|----------------|
| `Book a flight to Munich for $280` | Confirmed — Security Log shows `VISA ****1111`, T3N LIVE badge |
| `Book a hotel in Tokyo for $450` | Confirmed — masked passport shown |
| `Book a trip to Paris for $600` | Rejected — TEE budget guard blocks at $500 |

The **Security Log Inspector** (right panel) proves with every booking:
- What the LLM saw: only destination / cost / trip type
- What the TEE returned: masked credentials + HMAC attestation
- T3N live DID on testnet
- Credential bytes in LLM context: **0**

---

## Project Structure

```
aegisTrips/
├── start.ps1                  <- one-command launcher (Windows)
├── backend/
│   ├── main.py                <- FastAPI + Gemini two-turn tool loop
│   ├── tools.py               <- Gemini function declaration (no cred fields)
│   ├── secure_client.py       <- httpx client to secure-worker
│   ├── models.py              <- Pydantic models
│   └── requirements.txt
├── secure-worker/
│   └── src/
│       ├── index.ts           <- Express server :3001
│       ├── booking.ts         <- TEE simulation + T3N credential seeding
│       ├── t3n-client.ts      <- Terminal 3 SDK integration
│       ├── attestation.ts     <- HMAC-SHA256 proof generator
│       └── middleware.ts      <- API key auth + $500 budget guard
└── frontend/
    └── src/
        ├── App.tsx
        ├── components/
        │   ├── ChatPanel.tsx
        │   ├── MessageBubble.tsx
        │   ├── SecurityLogPanel.tsx
        │   └── LogEntry.tsx
        └── hooks/useChat.ts
```

---

## Tech Stack

| Layer | Stack |
|-------|-------|
| LLM | Gemini 2.5 Flash via Google AI Studio |
| Backend | Python, FastAPI, google-genai SDK |
| Secure enclave | Node.js, TypeScript, Express |
| T3N integration | @terminal3/t3n-sdk v3.5.0, Ethereum wallet auth |
| Frontend | React 18, TypeScript, Vite, Tailwind CSS |
| Attestation | HMAC-SHA256 |
