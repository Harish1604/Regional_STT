"use client";

import type { TranslationEntry } from "@/types/chat";
import { SUPPORTED_LANGUAGES } from "@/types/chat";

interface TranslationResultProps {
  entry: TranslationEntry;
}

export default function TranslationResult({ entry }: TranslationResultProps) {
  const sourceLang = SUPPORTED_LANGUAGES.find(
    (l) => l.code === entry.sourceLanguage
  );

  return (
    <div className="card animate-fade-in">
      {/* Source text */}
      <div className="px-5 pt-5 pb-4 border-b border-[#222]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium uppercase tracking-widest text-[#666]">
            Source -- {sourceLang?.name || entry.sourceLanguage}
          </span>
          <span className="text-xs text-[#444]">
            STT {entry.sttLatencyMs}ms
          </span>
        </div>
        <p className="text-[15px] leading-relaxed text-white/90 whitespace-pre-wrap">
          {entry.sourceText}
        </p>
      </div>

      {/* Translated text */}
      <div className="px-5 pt-4 pb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium uppercase tracking-widest text-[#666]">
            Translation -- English
          </span>
          <span className="text-xs text-[#444]">
            LLM {entry.translationLatencyMs}ms
          </span>
        </div>
        <p className="text-[15px] leading-relaxed text-white whitespace-pre-wrap">
          {entry.translatedText}
        </p>
      </div>

      {/* Footer stats */}
      <div className="px-5 py-3 border-t border-[#222] flex items-center justify-between text-[11px] text-[#555]">
        <span>
          {new Date(entry.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          })}
        </span>
        <div className="flex items-center gap-3">
          <span>Audio: {entry.audioDurationSec.toFixed(1)}s</span>
          <span>Total: {entry.totalLatencyMs}ms</span>
        </div>
      </div>
    </div>
  );
}
