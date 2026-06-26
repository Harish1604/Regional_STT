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

  const timeString = new Date(entry.createdAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="flex flex-col gap-6 w-full animate-fade-in">
      {/* USER BUBBLE (Right aligned) */}
      <div className="flex flex-col items-end self-end max-w-[85%] sm:max-w-[75%]">
        <div className="flex items-center gap-2 mb-1.5 px-1">
          <span className="text-[10px] uppercase tracking-widest text-neutral-400 font-semibold">
            {sourceLang?.name || entry.sourceLanguage}
          </span>
        </div>
        
        <div className="bg-neutral-900 text-white rounded-2xl rounded-tr-sm px-4 py-3 shadow-sm">
          {/* Original STT Text (Smaller, slightly faded) */}
          <div className="text-[13px] text-neutral-300 mb-2 font-medium leading-snug">
            {entry.sourceText}
          </div>
          
          {/* Translated English Text (Main) */}
          <div className="text-[15px] leading-relaxed font-medium">
            {entry.translatedText}
          </div>
        </div>
        
        <div className="flex items-center gap-2 mt-1.5 px-1 text-[10px] text-neutral-400">
          <span>{timeString}</span>
          <span>•</span>
          <span>Audio: {entry.audioDurationSec.toFixed(1)}s</span>
        </div>
      </div>

      {/* AI BUBBLE (Left aligned) */}
      {entry.llmReply && (
        <div className="flex flex-col items-start self-start max-w-[85%] sm:max-w-[75%]">
          <div className="flex items-center gap-1.5 mb-1.5 px-1">
            <svg
              className="w-3.5 h-3.5 text-neutral-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
              />
            </svg>
            <span className="text-[10px] uppercase tracking-widest text-neutral-500 font-semibold">
              AI Assistant
            </span>
          </div>
          
          <div className="bg-neutral-100 text-neutral-900 border border-neutral-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
            <p className="text-[15px] leading-relaxed whitespace-pre-wrap">
              {entry.llmReply}
            </p>
          </div>
          
          <div className="flex items-center gap-2 mt-1.5 px-1 text-[10px] text-neutral-400">
            <span>{timeString}</span>
            <span>•</span>
            <span>Total latency: {entry.totalLatencyMs}ms</span>
          </div>
        </div>
      )}
    </div>
  );
}
