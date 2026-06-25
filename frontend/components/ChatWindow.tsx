"use client";

import { useEffect, useRef } from "react";
import type { ChatMessage as ChatMessageType, LoadingState } from "@/types/chat";
import ChatMessage from "./ChatMessage";

interface ChatWindowProps {
  messages: ChatMessageType[];
  loading: LoadingState;
}

export default function ChatWindow({ messages, loading }: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages or loading state change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const isLoading = loading.transcribing || loading.generatingReply;

  return (
    <div
      ref={containerRef}
      className="
        flex-1 overflow-y-auto
        px-4 py-6
        scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent
      "
    >
      {/* Empty state */}
      {messages.length === 0 && !isLoading && (
        <div className="flex flex-col items-center justify-center h-full text-center px-4">
          <div className="text-6xl mb-4">🗣️</div>
          <h2 className="text-xl font-semibold text-slate-200 mb-2">
            Start a Conversation
          </h2>
          <p className="text-slate-400 max-w-md text-sm leading-relaxed">
            Select a language, then click the microphone button and speak.
            Your speech will be transcribed and the assistant will reply
            in the same language.
          </p>
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            {["தமிழ்", "हिन्दी", "తెలుగు", "മലയാളം", "ಕನ್ನಡ"].map(
              (lang) => (
                <span
                  key={lang}
                  className="px-3 py-1 bg-slate-800/60 text-slate-400 rounded-full text-xs border border-slate-700/40"
                >
                  {lang}
                </span>
              )
            )}
          </div>
        </div>
      )}

      {/* Messages */}
      {messages.map((msg) => (
        <ChatMessage key={msg.id} message={msg} />
      ))}

      {/* Loading indicators */}
      {loading.transcribing && (
        <div className="flex justify-start mb-4">
          <div className="bg-slate-800/80 border border-slate-700/50 rounded-2xl rounded-bl-md px-4 py-3 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
              <span className="text-sm text-slate-400">
                Transcribing speech...
              </span>
            </div>
          </div>
        </div>
      )}

      {loading.generatingReply && (
        <div className="flex justify-start mb-4">
          <div className="bg-slate-800/80 border border-slate-700/50 rounded-2xl rounded-bl-md px-4 py-3 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
              <span className="text-sm text-slate-400">
                Generating reply...
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Scroll anchor */}
      <div ref={bottomRef} />
    </div>
  );
}
