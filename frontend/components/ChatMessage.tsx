"use client";

import type { ChatMessage as ChatMessageType } from "@/types/chat";

interface ChatMessageProps {
  message: ChatMessageType;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";
  const time = new Date(message.createdAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      className={`flex w-full mb-4 ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`
          relative max-w-[80%] md:max-w-[70%]
          ${
            isUser
              ? "bg-gradient-to-br from-violet-600 to-indigo-700 text-white rounded-2xl rounded-br-md"
              : "bg-slate-800/80 text-slate-100 border border-slate-700/50 rounded-2xl rounded-bl-md backdrop-blur-sm"
          }
          px-4 py-3 shadow-lg
        `}
      >
        {/* Role indicator */}
        <div
          className={`flex items-center gap-2 mb-1.5 ${
            isUser ? "justify-end" : "justify-start"
          }`}
        >
          <span className="text-xs font-semibold uppercase tracking-wider opacity-70">
            {isUser ? "You" : "Assistant"}
          </span>
          {message.metadata?.source && (
            <span
              className={`
                text-[10px] px-1.5 py-0.5 rounded-full font-medium
                ${
                  isUser
                    ? "bg-white/20 text-white/80"
                    : "bg-violet-500/20 text-violet-300"
                }
              `}
            >
              {message.metadata.source === "stt" ? "🎤 STT" : "🤖 LLM"}
            </span>
          )}
        </div>

        {/* Message text */}
        <p className="text-[15px] leading-relaxed whitespace-pre-wrap break-words">
          {message.text}
        </p>

        {/* Footer: timestamp + latency */}
        <div
          className={`flex items-center gap-2 mt-2 text-[11px] opacity-60 ${
            isUser ? "justify-end" : "justify-start"
          }`}
        >
          <span>{time}</span>
          {message.metadata?.latencyMs && (
            <span>• {message.metadata.latencyMs}ms</span>
          )}
        </div>
      </div>
    </div>
  );
}
