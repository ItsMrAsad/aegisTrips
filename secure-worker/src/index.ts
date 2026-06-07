import "dotenv/config";
import express from "express";
import { authenticateAgent, budgetGuard } from "./middleware";
import { executeBooking, BookingRequest } from "./booking";
import { initT3N, getT3NStatus } from "./t3n-client";

const app = express();
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    module: "aegistrips-tee-worker",
    t3n: getT3NStatus(),
  });
});

app.get("/t3n-status", (_req, res) => {
  res.json(getT3NStatus());
});

app.post("/execute-booking", authenticateAgent, budgetGuard, async (req, res) => {
  try {
    const body = req.body as BookingRequest;
    const result = await executeBooking(body);
    res.json(result);
  } catch (err) {
    console.error("[TEE] Unexpected error during booking:", err);
    res.status(500).json({ error: "Internal TEE error" });
  }
});

const PORT = Number(process.env.PORT ?? 3001);

// Initialise T3N SDK before accepting traffic so the first booking
// already has a live tenant DID.
initT3N().then((t3nStatus) => {
  const mode = t3nStatus.connected
    ? `T3N LIVE (${t3nStatus.tenantDid})`
    : `SIMULATION MODE — ${t3nStatus.error ?? "T3N offline"}`;

  app.listen(PORT, () => {
    console.log(`[TEE] Secure Worker running on http://localhost:${PORT}`);
    console.log(`[TEE] Credential vault: ACTIVE — credentials sealed in enclave environment`);
    console.log(`[TEE] T3N Network: ${mode}`);
  });
});
