import crypto from "crypto";

const TEE_SECRET_KEY = process.env.TEE_SECRET_KEY ?? "fallback-tee-secret-change-me";

export function generateAttestation(transactionId: string, timestamp: string): string {
  return crypto
    .createHmac("sha256", TEE_SECRET_KEY)
    .update(transactionId + timestamp)
    .digest("hex");
}

export function generateSecurityProof(
  destination: string,
  cost: number,
  transactionId: string
): string {
  return crypto
    .createHmac("sha256", TEE_SECRET_KEY)
    .update(destination + cost.toString() + transactionId)
    .digest("hex");
}
