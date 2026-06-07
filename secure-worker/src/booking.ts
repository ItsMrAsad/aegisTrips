import crypto from "crypto";
import { generateAttestation, generateSecurityProof } from "./attestation";
import { seedCredentialToT3N, getT3NStatus } from "./t3n-client";

export interface BookingRequest {
  destination: string;
  cost: number;
  trip_type: "flight" | "hotel" | "both";
}

export interface BookingResult {
  transaction_id: string;
  status: "confirmed";
  cost: number;
  destination: string;
  trip_type: string;
  booked_with: string;
  passport_used: string;
  security_proof: string;
  tee_attestation: string;
  timestamp: string;
  t3n_status: {
    connected: boolean;
    tenant_did: string | null;
    network: string;
    credentials_sealed: boolean;
  };
}

function mockBookingApi(destination: string, cost: number, tripType: string): string {
  // Simulates external booking API call inside the TEE boundary.
  // In a real Terminal 3 deployment this would be a Rust/WASM contract
  // running inside the TDX enclave calling the Duffel flight API.
  void destination; void cost; void tripType;
  return `TXN-${crypto.randomUUID().toUpperCase()}`;
}

export async function executeBooking(req: BookingRequest): Promise<BookingResult> {
  // Load credentials from the TEE's secure environment.
  // These values never leave this function in plaintext.
  const rawCard = process.env.MOCK_CREDIT_CARD ?? "0000000000000000";
  const rawPassport = process.env.MOCK_PASSPORT ?? "PA00000000";

  // Seed credentials into the T3N secrets map — the same pattern used by
  // Terminal 3's z-tenant-flight example contract. The seeded values are
  // only accessible to contract code running inside the TDX enclave.
  const t3nConnected = getT3NStatus().connected;
  let credentialsSealed = false;
  if (t3nConnected) {
    const [cardSealed, passportSealed] = await Promise.all([
      seedCredentialToT3N("mock_credit_card", rawCard),
      seedCredentialToT3N("mock_passport", rawPassport),
    ]);
    credentialsSealed = cardSealed && passportSealed;
  }

  const transactionId = mockBookingApi(req.destination, req.cost, req.trip_type);
  const timestamp = new Date().toISOString();

  // Mask: only last 4 digits ever leave the TEE.
  const bookedWith = `VISA ****${rawCard.slice(-4)}`;
  const passportUsed = `P**T-****${rawPassport.slice(-4)}`;

  const attestation = generateAttestation(transactionId, timestamp);
  const proof = generateSecurityProof(req.destination, req.cost, transactionId);

  const t3nStatus = getT3NStatus();
  console.log(
    `[TEE] Booking confirmed: txn=${transactionId} dest=${req.destination} cost=$${req.cost} type=${req.trip_type} t3n=${t3nStatus.connected ? "live" : "sim"}`
  );
  // rawCard and rawPassport are intentionally NOT logged.

  return {
    transaction_id: transactionId,
    status: "confirmed",
    cost: req.cost,
    destination: req.destination,
    trip_type: req.trip_type,
    booked_with: bookedWith,
    passport_used: passportUsed,
    security_proof: proof,
    tee_attestation: attestation,
    timestamp,
    t3n_status: {
      connected: t3nStatus.connected,
      tenant_did: t3nStatus.tenantDid,
      network: t3nStatus.network,
      credentials_sealed: credentialsSealed,
    },
  };
}
