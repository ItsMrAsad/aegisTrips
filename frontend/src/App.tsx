import React from "react";
import { useChat } from "./hooks/useChat";
import ChatPanel from "./components/ChatPanel";
import SecurityLogPanel from "./components/SecurityLogPanel";

export default function App() {
  const { messages, isLoading, sendMessage } = useChat();

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "#060912" }}>
      <Header />
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        <ChatPanel messages={messages} isLoading={isLoading} onSend={sendMessage} />
        <SecurityLogPanel messages={messages} />
      </div>
    </div>
  );
}

function Header() {
  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        height: 56,
        background: "#0d1117",
        borderBottom: "1px solid #21262d",
        flexShrink: 0,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Subtle top edge glow */}
      <div
        style={{
          position: "absolute",
          top: 0, left: 0, right: 0,
          height: 1,
          background: "linear-gradient(90deg, transparent, rgba(59,130,246,0.6), rgba(139,92,246,0.6), rgba(16,185,129,0.6), transparent)",
        }}
      />

      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div
          style={{
            width: 34, height: 34, borderRadius: 9,
            background: "linear-gradient(135deg, #1d4ed8 0%, #6d28d9 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 17, flexShrink: 0,
            boxShadow: "0 0 16px rgba(109,40,217,0.35)",
          }}
        >
          🛡️
        </div>
        <div>
          <span
            style={{
              fontWeight: 800, fontSize: 17, letterSpacing: "-0.3px",
              background: "linear-gradient(90deg, #60a5fa, #a78bfa, #34d399)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}
          >
            AegisTrips
          </span>
          <span
            style={{
              fontSize: 11, color: "#6b7280", marginLeft: 8,
              letterSpacing: "0.02em", fontWeight: 500,
            }}
          >
            Zero-Knowledge Travel Agent
          </span>
        </div>
      </div>

      {/* Status badges */}
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <Pill color="#10b981" bg="rgba(16,185,129,0.1)" border="rgba(16,185,129,0.28)" pulse>
          TEE Active
        </Pill>
        <Pill color="#8b5cf6" bg="rgba(139,92,246,0.1)" border="rgba(139,92,246,0.28)" hex>
          Terminal 3 · testnet
        </Pill>
        <Pill color="#f59e0b" bg="rgba(245,158,11,0.1)" border="rgba(245,158,11,0.25)">
          $500 budget cap
        </Pill>
      </div>
    </header>
  );
}

function Pill({
  children, color, bg, border, pulse, hex,
}: {
  children: React.ReactNode;
  color: string;
  bg: string;
  border: string;
  pulse?: boolean;
  hex?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex", alignItems: "center", gap: 6,
        background: bg, border: `1px solid ${border}`,
        borderRadius: 20, padding: "4px 11px",
        fontSize: 11, color, fontWeight: 600, whiteSpace: "nowrap",
      }}
    >
      {pulse && (
        <div
          className="pulse-dot"
          style={{
            width: 6, height: 6, borderRadius: "50%",
            background: color, flexShrink: 0,
            boxShadow: `0 0 6px ${color}`,
          }}
        />
      )}
      {hex && <span style={{ fontSize: 12, opacity: 0.8 }}>⬡</span>}
      {children}
    </div>
  );
}
