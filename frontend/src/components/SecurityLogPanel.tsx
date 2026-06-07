import React from "react";
import { ChatMessage } from "../types";
import LogEntry from "./LogEntry";

interface Props {
  messages: ChatMessage[];
}

export default function SecurityLogPanel({ messages }: Props) {
  const bookingMessages = messages.filter(
    (m) => m.role === "agent" && m.bookingResult && m.toolCalls?.length
  );

  const confirmedCount = bookingMessages.filter(
    (m) => m.bookingResult?.status === "confirmed"
  ).length;

  return (
    <div
      style={{
        width: "43%",
        display: "flex", flexDirection: "column",
        height: "100%",
        background: "#060912",
        minWidth: 0,
      }}
    >
      {/* Panel header */}
      <div
        style={{
          padding: "14px 18px",
          borderBottom: "1px solid #21262d",
          background: "#0d1117",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div
              style={{
                width: 26, height: 26, borderRadius: 7,
                background: "rgba(16,185,129,0.12)",
                border: "1px solid rgba(16,185,129,0.3)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 13,
              }}
            >
              🔍
            </div>
            <span style={{ fontWeight: 700, fontSize: 13, color: "#e2e8f0" }}>
              Security Inspector
            </span>
          </div>

          {/* Stats */}
          <div style={{ display: "flex", gap: 8 }}>
            <StatChip label="Verified" value={bookingMessages.length} color="#10b981" />
            <StatChip label="Confirmed" value={confirmedCount} color="#3b82f6" />
          </div>
        </div>

        {/* Audit banner */}
        <div
          style={{
            background: "rgba(16,185,129,0.06)",
            border: "1px solid rgba(16,185,129,0.22)",
            borderRadius: 6,
            padding: "6px 10px",
            display: "flex", alignItems: "center", gap: 7,
          }}
        >
          <div
            className="pulse-dot"
            style={{
              width: 6, height: 6, borderRadius: "50%",
              background: "#10b981", flexShrink: 0,
              boxShadow: "0 0 6px #10b981",
            }}
          />
          <span style={{ fontSize: 10, color: "#10b981", fontWeight: 700, letterSpacing: "0.05em" }}>
            CREDENTIAL AUDIT LOG — LLM CONTEXT VERIFIED CLEAN
          </span>
        </div>
      </div>

      {/* Legend */}
      <div
        style={{
          padding: "8px 18px",
          borderBottom: "1px solid #21262d",
          display: "flex", gap: 14, flexShrink: 0,
        }}
      >
        <LegendDot color="#10b981" label="LLM-visible" />
        <LegendDot color="#3b82f6" label="TEE attestation" />
        <LegendDot color="#8b5cf6" label="T3N network" />
        <LegendDot color="#ef4444" label="Credential-blocked" />
      </div>

      {/* Entries */}
      <div style={{ flex: 1, overflowY: "auto", padding: "14px 16px" }}>
        {bookingMessages.length === 0 ? (
          <EmptyState />
        ) : (
          bookingMessages.map((msg, i) => (
            <LogEntry
              key={msg.id}
              toolCall={msg.toolCalls![0]}
              result={msg.bookingResult!}
              index={i}
            />
          ))
        )}
      </div>
    </div>
  );
}

function StatChip({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div
      style={{
        display: "flex", alignItems: "center", gap: 5,
        background: `${color}12`, border: `1px solid ${color}30`,
        borderRadius: 6, padding: "3px 8px",
      }}
    >
      <span style={{ fontSize: 13, fontWeight: 700, color }}>{value}</span>
      <span style={{ fontSize: 9.5, color: `${color}88`, fontWeight: 600 }}>{label}</span>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, color: "#6b7280" }}>
      <div style={{ width: 7, height: 7, borderRadius: 2, background: color, flexShrink: 0 }} />
      {label}
    </div>
  );
}

function EmptyState() {
  return (
    <div
      style={{
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        height: "100%", gap: 14, color: "#6b7280",
      }}
    >
      <div
        style={{
          width: 56, height: 56, borderRadius: 16,
          background: "rgba(139,92,246,0.08)",
          border: "1px solid rgba(139,92,246,0.2)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 26,
        }}
      >
        🔒
      </div>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 13, marginBottom: 6, color: "#8b949e", fontWeight: 600 }}>
          No bookings yet
        </div>
        <div style={{ fontSize: 11, color: "#4b5563", lineHeight: 1.5 }}>
          Security proofs appear here after every<br />booking — confirmed or rejected.
        </div>
      </div>
      <div
        style={{
          background: "rgba(59,130,246,0.07)",
          border: "1px solid rgba(59,130,246,0.2)",
          borderRadius: 8, padding: "8px 14px",
          fontSize: 11, color: "#60a5fa",
        }}
      >
        Try: "Book a flight to Munich for $280"
      </div>
    </div>
  );
}
