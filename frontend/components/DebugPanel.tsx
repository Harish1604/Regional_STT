"use client";

import { useState } from "react";
import type { DebugInfo } from "@/types/chat";
import { SUPPORTED_LANGUAGES } from "@/types/chat";

interface DebugPanelProps {
  debug: DebugInfo;
}

export default function DebugPanel({ debug }: DebugPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  const langName =
    SUPPORTED_LANGUAGES.find((l) => l.code === debug.selectedLanguage)?.name ||
    debug.selectedLanguage;

  return (
    <div className="border-t border-slate-700/50">
      {/* Toggle button */}
      <button
        id="debug-panel-toggle"
        onClick={() => setIsOpen(!isOpen)}
        className="
          w-full flex items-center justify-between px-4 py-2
          text-xs font-medium text-slate-500 hover:text-slate-400
          transition-colors duration-200
        "
      >
        <span className="flex items-center gap-1.5">
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <circle cx="12" cy="12" r="3" />
          </svg>
          Developer Panel
        </span>
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Panel content */}
      {isOpen && (
        <div className="px-4 pb-3 grid grid-cols-2 md:grid-cols-3 gap-3">
          <DebugItem
            label="Language"
            value={`${langName} (${debug.selectedLanguage})`}
          />
          <DebugItem
            label="STT Model"
            value={debug.sttModel || "—"}
          />
          <DebugItem
            label="STT Latency"
            value={
              debug.sttLatencyMs !== null ? `${debug.sttLatencyMs}ms` : "—"
            }
          />
          <DebugItem
            label="LLM Latency"
            value={
              debug.llmLatencyMs !== null ? `${debug.llmLatencyMs}ms` : "—"
            }
          />
          <DebugItem
            label="Audio Duration"
            value={
              debug.audioDurationSec !== null
                ? `${debug.audioDurationSec}s`
                : "—"
            }
          />
          <DebugItem
            label="Last Transcript"
            value={debug.lastTranscript || "—"}
            wide
          />
        </div>
      )}
    </div>
  );
}

function DebugItem({
  label,
  value,
  wide = false,
}: {
  label: string;
  value: string;
  wide?: boolean;
}) {
  return (
    <div
      className={`
        bg-slate-800/50 rounded-lg px-3 py-2 border border-slate-700/30
        ${wide ? "col-span-2 md:col-span-3" : ""}
      `}
    >
      <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-0.5">
        {label}
      </div>
      <div className="text-xs text-slate-300 font-mono truncate" title={value}>
        {value}
      </div>
    </div>
  );
}
