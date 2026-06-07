import React, { useState } from "react";
import { ChatMessage } from "../types";
import { AgentAvatar } from "./ChatPanel";

interface Props {
  message: ChatMessage;
}

export default function MessageBubble({ message }: Props) {
  const [toolOpen, setToolOpen] = useState(false);
  const isUser = message.role === "user";
  const hasToolCall = message.toolCalls && message.toolCalls.length > 0;
  const tc = message.toolCalls?.[0];
  const br = message.bookingResult;

  return (
    <div
      className="entry-in"
      style={{
        display: "flex",
        flexDirection: isUser ? "row-reverse" : "row",
        alignItems: "flex-start",
        gap: 10,
        marginBottom: 16,
        paddingLeft: isUser ? 48 : 0,
        paddingRight: isUser ? 0 : 48,
      }}
    >
      {/* Avatar */}
      {!isUser && <AgentAvatar />}

      <div style={{ minWidth: 0, flex: isUser ? "none" : 1, maxWidth: isUser ? "80%" : "100%" }}>

        {/* Label */}
        {!isUser && (
          <div style={{ fontSize: 9.5, color: "#6b7280", marginBottom: 5, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>
            AegisTrips Agent
          </div>
        )}

        {/* Bubble */}
        <div
          style={{
            padding: "10px 14px",
            borderRadius: isUser ? "14px 14px 4px 14px" : "4px 14px 14px 14px",
            fontSize: 13, lineHeight: 1.55,
            ...(isUser
              ? {
                  background: "linear-gradient(135deg, #2563eb, #7c3aed)",
                  color: "#fff",
                  boxShadow: "0 2px 12px rgba(99,60,255,0.2)",
                  marginLeft: "auto",
                  display: "inline-block",
                }
              : {
                  background: "#161b22",
                  color: "#cdd5e0",
                  border: message.isError
                    ? "1px solid rgba(239,68,68,0.4)"
                    : "1px solid #21262d",
                }),
          }}
        >
          {message.content}
        </div>

        {/* Tool call disclosure */}
        {hasToolCall && tc && (
          <div style={{ marginTop: 8 }}>
            <button
              onClick={() => setToolOpen((o) => !o)}
              style={{
                background: "rgba(59,130,246,0.08)",
                border: "1px solid rgba(59,130,246,0.25)",
                color: "#60a5fa",
                fontSize: 10.5,
                padding: "4px 10px",
                borderRadius: 6,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 5,
                fontWeight: 600,
                letterSpacing: "0.02em",
              }}
            >
              <span>{toolOpen ? "▾" : "▸"}</span>
              <span>execute_secure_booking — TEE call log</span>
            </button>

            {toolOpen && (
              <div
                style={{
                  marginTop: 6,
                  background: "#0d1117",
                  border: "1px solid #21262d",
                  borderRadius: 8,
                  padding: 12,
                  fontSize: 11.5,
                }}
              >
                {/* Inputs */}
                <SectionLabel color="#10b981">Inputs sent to TEE (no credentials)</SectionLabel>
                {Object.entries(tc.inputs).map(([k, v]) => (
                  <KV key={k} k={k} v={String(v)} />
                ))}
                <KV k="credit_card" v="—  NOT PASSED" dimValue danger />
                <KV k="passport"    v="—  NOT PASSED" dimValue danger />

                {/* Result */}
                {br && (
                  <>
                    <div style={{ borderTop: "1px solid #21262d", margin: "10px 0" }} />
                    <SectionLabel color="#3b82f6">TEE returned (masked only)</SectionLabel>
                    <KV k="txn_id"    v={br.transaction_id} mono />
                    <KV k="status"    v={br.status.toUpperCase()} accent="#10b981" />
                    <KV k="charged"   v={br.booked_with} />
                    <KV k="passport"  v={br.passport_used} />
                  </>
                )}
              </div>
            )}
          </div>
        )}

        <div style={{ fontSize: 9.5, color: "#3d4451", marginTop: 5, paddingLeft: 2, textAlign: isUser ? "right" : "left" }}>
          {message.timestamp.toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
}

function SectionLabel({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <div style={{ color, fontWeight: 700, fontSize: 10, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6 }}>
      {children}
    </div>
  );
}

function KV({ k, v, mono, accent, dimValue, danger }: { k: string; v: string; mono?: boolean; accent?: string; dimValue?: boolean; danger?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8, marginBottom: 3 }}>
      <span style={{ color: "#6b7280", flexShrink: 0 }}>{k}</span>
      <span
        style={{
          color: danger ? "rgba(239,68,68,0.65)" : accent ?? (dimValue ? "#4b5563" : "#cdd5e0"),
          fontFamily: mono ? "'JetBrains Mono','Fira Code',monospace" : undefined,
          fontSize: mono ? 10.5 : undefined,
          textAlign: "right",
        }}
      >
        {v}
      </span>
    </div>
  );
}
