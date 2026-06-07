export interface ToolCallLog {
  tool_name: string;
  inputs: {
    destination: string;
    cost: number;
    trip_type: string;
  };
  outputs: Record<string, unknown>;
  timestamp: string;
}

export interface T3NStatus {
  connected: boolean;
  tenant_did: string | null;
  network: string;
  credentials_sealed: boolean;
}

export interface SecureBookingResult {
  transaction_id: string;
  status: string;
  cost: number;
  destination: string;
  trip_type: string;
  booked_with: string;
  passport_used: string;
  security_proof: string;
  tee_attestation: string;
  timestamp: string;
  t3n_status?: T3NStatus;
}

export interface ChatApiResponse {
  reply: string;
  tool_calls: ToolCallLog[];
  secure_booking_result: SecureBookingResult | null;
}

export interface ChatMessage {
  id: string;
  role: "user" | "agent";
  content: string;
  toolCalls?: ToolCallLog[];
  bookingResult?: SecureBookingResult;
  isError?: boolean;
  timestamp: Date;
}
