"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import type { TranslationEntry, LoadingState } from "@/types/chat";
import { SUPPORTED_LANGUAGES } from "@/types/chat";
import { translateAudio, checkHealth } from "@/lib/api";
import { AudioRecorder } from "@/lib/recorder";
import LanguageSelector from "@/components/LanguageSelector";
import RecorderControls from "@/components/RecorderControls";
import TranslationResult from "@/components/TranslationResult";

export default function Home() {
  // --- State ---
  const [mounted, setMounted] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("ta");
  const [translations, setTranslations] = useState<TranslationEntry[]>([]);
  const [loading, setLoading] = useState<LoadingState>({
    transcribing: false,
    translating: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);

  const recorderRef = useRef<AudioRecorder | null>(null);
  const errorTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // --- Health check on mount ---
  useEffect(() => {
    setMounted(true);
    checkHealth().then(setBackendOnline);
  }, []);

  // --- Auto-scroll on new translations ---
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [translations]);

  // --- Recording timer ---
  useEffect(() => {
    if (isRecording) {
      setRecordingDuration(0);
      timerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  // --- Show error with auto-dismiss ---
  const showError = useCallback((msg: string) => {
    setError(msg);
    if (errorTimeoutRef.current) {
      clearTimeout(errorTimeoutRef.current);
    }
    errorTimeoutRef.current = setTimeout(() => setError(null), 8000);
  }, []);

  // --- Generate unique ID ---
  const generateId = () =>
    `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

  // --- Process audio (shared by recording and upload) ---
  const processAudio = useCallback(
    async (audioBlob: Blob | File) => {
      setLoading({ transcribing: true, translating: false });

      try {
        const result = await translateAudio(
          audioBlob,
          selectedLanguage,
          "en" // target: English
        );

        if (!result.success) {
          throw new Error("Translation returned empty result");
        }

        const entry: TranslationEntry = {
          id: generateId(),
          sourceText: result.source_text,
          translatedText: result.translated_text,
          sourceLanguage: result.source_language,
          targetLanguage: result.target_language,
          sttLatencyMs: result.stt_latency_ms,
          translationLatencyMs: result.translation_latency_ms,
          totalLatencyMs: result.total_latency_ms,
          audioDurationSec: result.audio_duration_sec,
          createdAt: new Date().toISOString(),
        };

        setTranslations((prev) => [...prev, entry]);
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : "An unexpected error occurred";
        showError(errorMsg);
        console.error("Processing error:", err);
      } finally {
        setLoading({ transcribing: false, translating: false });
      }
    },
    [selectedLanguage, showError]
  );

  // --- Recording handlers ---
  const handleStartRecording = useCallback(async () => {
    try {
      if (!recorderRef.current) {
        recorderRef.current = new AudioRecorder();
      }
      await recorderRef.current.start();
      setIsRecording(true);
      setError(null);
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to start recording";
      showError(errorMsg);
    }
  }, [showError]);

  const handleStopRecording = useCallback(async () => {
    try {
      if (!recorderRef.current) return;
      const audioBlob = await recorderRef.current.stop();
      setIsRecording(false);
      await processAudio(audioBlob);
    } catch (err) {
      setIsRecording(false);
      const errorMsg =
        err instanceof Error ? err.message : "Failed to stop recording";
      showError(errorMsg);
    }
  }, [processAudio, showError]);

  // --- File upload handler ---
  const handleFileUpload = useCallback(
    async (file: File) => {
      await processAudio(file);
    },
    [processAudio]
  );

  // --- Clear history ---
  const handleClear = useCallback(() => {
    setTranslations([]);
  }, []);

  const isProcessing = loading.transcribing || loading.translating;

  const currentLang = SUPPORTED_LANGUAGES.find(
    (l) => l.code === selectedLanguage
  );

  if (!mounted) {
    return <div className="flex flex-col h-screen bg-black" />;
  }

  return (
    <div className="flex flex-col h-screen max-h-screen overflow-hidden bg-black">
      {/* Error Toast */}
      {error && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-slide-in-top">
          <div className="flex items-center gap-3 bg-[#111] border border-[#333] text-white px-5 py-3 rounded-lg max-w-lg">
            <svg
              className="w-4 h-4 flex-shrink-0 text-[#ff3333]"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-sm">{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-2 text-[#666] hover:text-white"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="border-b border-[#222] px-4 md:px-6 py-4 bg-black">
        <div className="max-w-3xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
                Indic Voice Translator
              </h1>
              <p className="text-xs text-[#666] mt-0.5">
                Speak in {currentLang?.name || "your language"} -- translates to
                English via AI4Bharat STT + LLaMA
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* Backend status */}
              <div
                className="flex items-center gap-1.5"
                title={
                  backendOnline === null
                    ? "Checking..."
                    : backendOnline
                      ? "Backend online"
                      : "Backend offline"
                }
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    backendOnline === null
                      ? "bg-[#666]"
                      : backendOnline
                        ? "bg-white"
                        : "bg-[#ff3333]"
                  }`}
                />
                <span className="text-[11px] text-[#555]">
                  {backendOnline === null
                    ? "Checking"
                    : backendOnline
                      ? "Online"
                      : "Offline"}
                </span>
              </div>
              <LanguageSelector
                selectedLanguage={selectedLanguage}
                onLanguageChange={setSelectedLanguage}
                disabled={isRecording || isProcessing}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Recording Controls */}
      <div className="border-b border-[#222] py-6 bg-[#0a0a0a]">
        <div className="max-w-3xl mx-auto px-4 md:px-6">
          <RecorderControls
            isRecording={isRecording}
            isProcessing={isProcessing}
            recordingDuration={recordingDuration}
            onStartRecording={handleStartRecording}
            onStopRecording={handleStopRecording}
            onFileUpload={handleFileUpload}
          />
        </div>
      </div>

      {/* Results Area */}
      <main className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="max-w-3xl mx-auto px-4 md:px-6 py-6">
          {/* Empty state */}
          {translations.length === 0 && !isProcessing && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-12 h-12 rounded-full border border-[#333] flex items-center justify-center mb-4">
                <svg
                  className="w-5 h-5 text-[#555]"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 1a4 4 0 0 0-4 4v7a4 4 0 0 0 8 0V5a4 4 0 0 0-4-4z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2H3v2a9 9 0 0 0 8 8.94V23h2v-2.06A9 9 0 0 0 21 12v-2h-2z" />
                </svg>
              </div>
              <h2 className="text-base font-medium text-[#999] mb-1.5">
                Ready to translate
              </h2>
              <p className="text-sm text-[#555] max-w-sm leading-relaxed">
                Select a language, press Start, and speak.
                Your speech will be transcribed and translated to English.
              </p>
              <div className="flex flex-wrap justify-center gap-2 mt-5">
                {SUPPORTED_LANGUAGES.slice(0, 5).map((lang) => (
                  <span
                    key={lang.code}
                    className="px-3 py-1 bg-[#111] text-[#555] rounded-full text-xs border border-[#222]"
                  >
                    {lang.nativeName}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Processing indicator (shown while waiting for results) */}
          {isProcessing && (
            <div className="card px-5 py-5 mb-4 animate-fade-in">
              <div className="flex items-center gap-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-white rounded-full dot-1" />
                  <span className="w-2 h-2 bg-white rounded-full dot-2" />
                  <span className="w-2 h-2 bg-white rounded-full dot-3" />
                </div>
                <span className="text-sm text-[#888]">
                  Transcribing and translating...
                </span>
              </div>
            </div>
          )}

          {/* Translation results */}
          <div className="flex flex-col gap-4">
            {translations.map((entry) => (
              <TranslationResult key={entry.id} entry={entry} />
            ))}
          </div>

          {/* Clear button */}
          {translations.length > 0 && (
            <div className="flex justify-center mt-6 mb-4">
              <button
                id="clear-history-button"
                onClick={handleClear}
                disabled={isRecording || isProcessing}
                className="
                  text-xs text-[#555] hover:text-[#999]
                  border border-[#222] hover:border-[#444]
                  px-4 py-2 rounded-lg
                  disabled:opacity-40 disabled:cursor-not-allowed
                  transition-all
                "
              >
                Clear history
              </button>
            </div>
          )}

          {/* Scroll anchor */}
          <div ref={bottomRef} />
        </div>
      </main>
    </div>
  );
}
