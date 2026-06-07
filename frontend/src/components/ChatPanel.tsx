import React, { useState, useRef, useEffect, KeyboardEvent } from "react";
import { ChatMessage } from "../types";
import MessageBubble from "./MessageBubble";

interface Props {
  messages: ChatMessage[];
  isLoading: boolean;
  onSend: (text: string) => void;
}

const SUGGESTIONS = [
  { label: "✈️  Flight to Munich", prompt: "Book a flight to Munich for $280" },
  { label: "🏨  Hotel in Tokyo",    prompt: "Book a hotel in Tokyo for $450"   },
  { label: "⛔  Over-budget trip",  prompt: "Book a trip to Paris for $600"    },
  { label: "🗽  NYC flight deal",   prompt: "I need to fly to New York for $199" },
];

export default function ChatPanel({ messages, isLoading, onSend }: Props) {
  const [input, setInput] = useState("");
  const [focused, setFocused] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    onSend(input.trim());
    setInput("");
    textareaRef.current?.focus();
  };

  const handleKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const canSend = input.trim().length > 0 && !isLoading;

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", height: "100%", minWidth: 0, borderRight: "1px solid #21262d" }}>

      {/* Messages area */}
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>

        {messages.length === 0 && (
          <div
            style={{
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              height: "100%", gap: 24,
            }}
          >
            {/* Placeholder icon */}
            <div
              style={{
                width: 72, height: 72, borderRadius: 20,
                background: "linear-gradient(135deg, rgba(59,130,246,0.15), rgba(139,92,246,0.15))",
                border: "1px solid rgba(139,92,246,0.25)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 32,
                boxShadow: "0 0 40px rgba(139,92,246,0.1)",
              }}
            >
              ✈️
            </div>

            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#e2e8f0", marginBottom: 8 }}>
                Where are you headed?
              </div>
              <div style={{ fontSize: 12.5, color: "#6b7280", maxWidth: 300, lineHeight: 1.6 }}>
                Your card and passport are sealed inside the TEE enclave.
                The AI only ever sees destination, cost, and trip type — nothing else.
              </div>
            </div>

            {/* Suggestion grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, width: "100%", maxWidth: 380 }}>
              {SUGGESTIONS.map((s) => (
                <button
                  key={s.prompt}
                  onClick={() => onSend(s.prompt)}
                  style={{
                    background: "#161b22",
                    border: "1px solid #21262d",
                    borderRadius: 10,
                    padding: "10px 14px",
                    color: "#8b949e",
                    fontSize: 12,
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.15s",
                    lineHeight: 1.4,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "rgba(59,130,246,0.5)";
                    e.currentTarget.style.color = "#cdd5e0";
                    e.currentTarget.style.background = "#1c2333";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "#21262d";
                    e.currentTarget.style.color = "#8b949e";
                    e.currentTarget.style.background = "#161b22";
                  }}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}

        {isLoading && <ThinkingBubble />}

        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div
        style={{
          borderTop: "1px solid #21262d",
          padding: "14px 20px",
          background: "#0d1117",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            display: "flex", gap: 10, alignItems: "flex-end",
            background: "#161b22",
            border: `1px solid ${focused ? "rgba(59,130,246,0.55)" : "#21262d"}`,
            borderRadius: 12,
            padding: "10px 14px",
            transition: "border-color 0.15s",
            boxShadow: focused ? "0 0 0 3px rgba(59,130,246,0.08)" : "none",
          }}
        >
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="e.g. Book a flight to Munich for $280..."
            rows={1}
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              color: "#e2e8f0",
              fontSize: 13,
              resize: "none",
              outline: "none",
              lineHeight: 1.5,
              fontFamily: "inherit",
              placeholderColor: "#4b5563",
            } as React.CSSProperties}
          />
          <button
            onClick={handleSend}
            disabled={!canSend}
            style={{
              background: canSend
                ? "linear-gradient(135deg, #2563eb, #7c3aed)"
                : "#21262d",
              border: "none",
              borderRadius: 8,
              color: canSend ? "#fff" : "#4b5563",
              padding: "7px 16px",
              fontSize: 12,
              fontWeight: 600,
              cursor: canSend ? "pointer" : "not-allowed",
              transition: "all 0.15s",
              flexShrink: 0,
              letterSpacing: "0.02em",
              boxShadow: canSend ? "0 2px 8px rgba(99,60,255,0.25)" : "none",
            }}
          >
            Send
          </button>
        </div>
        <div style={{ fontSize: 10, color: "#3d4451", marginTop: 7, paddingLeft: 2 }}>
          Enter to send · Shift+Enter for new line · Credentials never leave the TEE
        </div>
      </div>
    </div>
  );
}

function ThinkingBubble() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
      <AgentAvatar />
      <div
        style={{
          background: "#161b22",
          border: "1px solid #21262d",
          borderRadius: "4px 14px 14px 14px",
          padding: "10px 16px",
          display: "flex", alignItems: "center", gap: 8,
        }}
      >
        <span style={{ fontSize: 10, color: "#6b7280" }}>TEE processing</span>
        <div style={{ display: "flex", gap: 4 }}>
          <span className="thinking-dot" />
          <span className="thinking-dot" />
          <span className="thinking-dot" />
        </div>
      </div>
    </div>
  );
}

export function AgentAvatar() {
  return (
    <div
      style={{
        width: 28, height: 28, borderRadius: 8, flexShrink: 0,
        background: "linear-gradient(135deg, #1d4ed8, #6d28d9)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 13,
        boxShadow: "0 0 10px rgba(109,40,217,0.3)",
      }}
    >
      🛡️
    </div>
  );
}
