import React, { useState } from "react";
import { ToolCallLog, SecureBookingResult, T3NStatus } from "../types";

interface Props {
  toolCall: ToolCallLog;
  result: SecureBookingResult;
  index: number;
}

function trunc(v: string, n = 16) {
  return v.length > n ? v.slice(0, n) + "…" : v;
}

export default function LogEntry({ toolCall, result, index }: Props) {
  const confirmed = result.status === "confirmed";
  const [open, setOpen] = useState(true);

  return (
    <div
      className="entry-in"
      style={{
        background: "#161b22",
        border: "1px solid #21262d",
        borderRadius: 10,
        marginBottom: 12,
        overflow: "hidden",
      }}
    >
      {/* Entry header */}
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          width: "100%",
          background: "none",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "11px 14px",
          borderBottom: open ? "1px solid #21262d" : "none",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 7, height: 7, borderRadius: "50%",
              background: confirmed ? "#10b981" : "#ef4444",
              boxShadow: confirmed ? "0 0 6px #10b981" : "0 0 6px #ef4444",
              flexShrink: 0,
            }}
          />
          <span style={{ fontSize: 11, fontWeight: 700, color: "#8b949e", letterSpacing: "0.06em" }}>
            BOOKING #{index + 1}
          </span>
          <span style={{ fontSize: 10, color: "#4b5563" }}>
            {new Date(result.timestamp).toLocaleTimeString()}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              fontSize: 10.5, fontWeight: 700,
              color: confirmed ? "#10b981" : "#ef4444",
            }}
          >
            {confirmed ? "✓ CONFIRMED" : "✗ REJECTED — BUDGET GUARD"}
          </span>
          <span style={{ color: "#4b5563", fontSize: 11 }}>{open ? "▾" : "▸"}</span>
        </div>
      </button>

      {open && (
        <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 10 }}>

          {/* ─── Section 1: LLM Context ─────────── */}
          <Section
            accent="#10b981"
            bg="rgba(16,185,129,0.05)"
            icon="✓"
            label="LLM CONTEXT — WHAT THE AI SAW"
            glowClass="card-glow-green"
          >
            <DataRow k="Destination" v={String(toolCall.inputs.destination)} />
            <DataRow k="Cost"        v={`$${toolCall.inputs.cost}`} />
            <DataRow k="Trip type"   v={String(toolCall.inputs.trip_type)} />
            <Divider />
            <DataRow k="Credit card"   v="NOT IN LLM CONTEXT" danger />
            <DataRow k="Passport no."  v="NOT IN LLM CONTEXT" danger />
          </Section>

          {/* ─── Section 2: TEE Response ─────────── */}
          <Section
            accent="#3b82f6"
            bg="rgba(59,130,246,0.05)"
            icon="🔒"
            label="TEE RESPONSE — SANITIZED OUTPUT"
            glowClass="card-glow-blue"
          >
            <DataRow k="Transaction ID" v={result.transaction_id} mono />
            <DataRow k="Status"         v={result.status.toUpperCase()} accent="#10b981" />
            <DataRow k="Charged to"     v={result.booked_with} />
            <DataRow k="Passport used"  v={result.passport_used} />
            <Divider />
            <DataRow
              k="TEE attestation"
              v={trunc(result.tee_attestation, 20)}
              mono tooltip={result.tee_attestation}
            />
            <DataRow
              k="Security proof"
              v={trunc(result.security_proof, 20)}
              mono tooltip={result.security_proof}
            />
            <div
              style={{
                marginTop: 8, fontSize: 9.5, color: "#10b981",
                fontWeight: 700, letterSpacing: "0.04em",
                display: "flex", alignItems: "center", gap: 5,
              }}
            >
              <span>✓</span>
              <span>HMAC-SHA256 INTEGRITY CONFIRMED</span>
            </div>
          </Section>

          {/* ─── Section 3: T3N Network ─────────── */}
          {result.t3n_status && <T3NSection t3n={result.t3n_status} />}

          {/* ─── Section 4: Blocked ─────────────── */}
          <Section
            accent="#ef4444"
            bg="rgba(239,68,68,0.05)"
            icon="⛔"
            label="CREDENTIAL ISOLATION PROOF"
            glowClass="card-glow-red"
          >
            <DataRow k="Raw card number"  v="[BLOCKED BY TEE]" danger />
            <DataRow k="Raw passport no." v="[BLOCKED BY TEE]" danger />
            <div
              style={{
                marginTop: 9,
                background: "#0d1117",
                borderRadius: 6,
                padding: "7px 12px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span style={{ fontSize: 10, color: "#6b7280" }}>Credential bytes in LLM context</span>
              <span
                style={{
                  fontSize: 14, fontWeight: 800, color: "#10b981",
                  fontFamily: "'JetBrains Mono','Fira Code',monospace",
                }}
              >
                0
              </span>
            </div>
          </Section>
        </div>
      )}
    </div>
  );
}

/* ─── T3N Network section ───────────────────────────────────── */
function T3NSection({ t3n }: { t3n: T3NStatus }) {
  const live = t3n.connected;
  const accent = live ? "#8b5cf6" : "#6b7280";

  return (
    <div
      className={live ? "card-glow-purple" : undefined}
      style={{
        background: live ? "rgba(139,92,246,0.05)" : "rgba(107,114,128,0.04)",
        border: `1px solid ${live ? "rgba(139,92,246,0.25)" : "#21262d"}`,
        borderRadius: 8,
        padding: "10px 12px",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <span style={{ fontSize: 9.5, fontWeight: 700, color: accent, letterSpacing: "0.08em" }}>
          ⬡ TERMINAL 3 T3N NETWORK
        </span>
        <span
          style={{
            fontSize: 9.5, fontWeight: 700, color: accent,
            background: `${accent}18`,
            border: `1px solid ${accent}44`,
            borderRadius: 10, padding: "2px 8px",
          }}
        >
          {live ? "● LIVE" : "SIMULATION"}
        </span>
      </div>

      <DataRow k="Network" v={t3n.network.toUpperCase()} mono />
      {t3n.tenant_did ? (
        <DataRow k="Tenant DID" v={trunc(t3n.tenant_did, 22)} mono tooltip={t3n.tenant_did} accent={accent} />
      ) : (
        <DataRow k="Tenant DID" v="not registered" danger />
      )}
      <DataRow
        k="Credentials in T3N"
        v={t3n.credentials_sealed ? "✓ sealed" : "sim mode"}
        accent={t3n.credentials_sealed ? "#10b981" : "#6b7280"}
      />

      {live && (
        <div style={{ marginTop: 7, fontSize: 9.5, color: accent, fontWeight: 600, display: "flex", gap: 5, alignItems: "center" }}>
          <span>✓</span><span>Agent authenticated · DID registered on testnet</span>
        </div>
      )}
    </div>
  );
}

/* ─── Shared primitives ─────────────────────────────────────── */
function Section({
  children, accent, bg, icon, label, glowClass,
}: {
  children: React.ReactNode;
  accent: string;
  bg: string;
  icon: string;
  label: string;
  glowClass?: string;
}) {
  return (
    <div
      className={glowClass}
      style={{
        background: bg,
        border: `1px solid ${accent}28`,
        borderRadius: 8,
        padding: "10px 12px",
      }}
    >
      <div style={{ fontSize: 9.5, fontWeight: 700, color: accent, letterSpacing: "0.08em", marginBottom: 8, display: "flex", gap: 5 }}>
        <span>{icon}</span>
        <span>{label}</span>
      </div>
      {children}
    </div>
  );
}

function DataRow({
  k, v, mono, danger, accent, tooltip,
}: {
  k: string;
  v: string;
  mono?: boolean;
  danger?: boolean;
  accent?: string;
  tooltip?: string;
}) {
  const color = danger ? "rgba(239,68,68,0.75)" : accent ?? "#cdd5e0";
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8, marginBottom: 3.5 }}>
      <span style={{ fontSize: 11, color: "#6b7280", flexShrink: 0 }}>{k}</span>
      {tooltip ? (
        <span className="mono-hash" data-full={tooltip} style={{ color, textAlign: "right" }}>
          {v}
        </span>
      ) : (
        <span
          style={{
            fontSize: mono ? 10.5 : 11,
            color,
            fontFamily: mono ? "'JetBrains Mono','Fira Code',monospace" : undefined,
            textAlign: "right",
            wordBreak: "break-all",
          }}
        >
          {v}
        </span>
      )}
    </div>
  );
}

function Divider() {
  return <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", margin: "7px 0" }} />;
}
