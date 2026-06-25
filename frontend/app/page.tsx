"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import type {
  ChatMessage as ChatMessageType,
  ChatHistoryItem,
  DebugInfo,
  LoadingState,
} from "@/types/chat";
import { SUPPORTED_LANGUAGES } from "@/types/chat";
import { transcribeAudio, sendChatMessage, checkHealth } from "@/lib/api";
import { AudioRecorder } from "@/lib/recorder";
import LanguageSelector from "@/components/LanguageSelector";
import RecorderControls from "@/components/RecorderControls";
import ChatWindow from "@/components/ChatWindow";
import DebugPanel from "@/components/DebugPanel";

export default function Home() {
  // --- State ---
  const [mounted, setMounted] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("ta");
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [loading, setLoading] = useState<LoadingState>({
    transcribing: false,
    generatingReply: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);
  const [debug, setDebug] = useState<DebugInfo>({
    selectedLanguage: "ta",
    lastTranscript: "",
    sttModel: "",
    sttLatencyMs: null,
    llmLatencyMs: null,
    audioDurationSec: null,
  });

  const recorderRef = useRef<AudioRecorder | null>(null);
  const errorTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // --- Health check on mount ---
  useEffect(() => {
    setMounted(true);
    checkHealth().then(setBackendOnline);
  }, []);

  // --- Update debug when language changes ---
  useEffect(() => {
    setDebug((prev) => ({ ...prev, selectedLanguage }));
  }, [selectedLanguage]);

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
      // Step 1: Transcribe
      setLoading((prev) => ({ ...prev, transcribing: true }));

      try {
        const transcribeResult = await transcribeAudio(
          audioBlob,
          selectedLanguage
        );

        if (!transcribeResult.success || !transcribeResult.transcript) {
          throw new Error("Transcription returned empty result");
        }

        // Update debug info
        setDebug((prev) => ({
          ...prev,
          lastTranscript: transcribeResult.transcript,
          sttModel: transcribeResult.model,
          sttLatencyMs: transcribeResult.latency_ms,
          audioDurationSec: transcribeResult.audio_duration_sec,
        }));

        // Add user message
        const userMessage: ChatMessageType = {
          id: generateId(),
          role: "user",
          text: transcribeResult.transcript,
          language: selectedLanguage,
          createdAt: new Date().toISOString(),
          metadata: {
            source: "stt",
            latencyMs: transcribeResult.latency_ms,
            model: transcribeResult.model,
            audioDurationSec: transcribeResult.audio_duration_sec,
          },
        };

        setMessages((prev) => [...prev, userMessage]);
        setLoading((prev) => ({ ...prev, transcribing: false }));

        // Step 2: Get LLM reply
        setLoading((prev) => ({ ...prev, generatingReply: true }));

        // Build history from existing messages
        const history: ChatHistoryItem[] = [
          ...messages.map((m) => ({
            role: m.role,
            text: m.text,
          })),
          { role: "user" as const, text: transcribeResult.transcript },
        ];

        const chatResult = await sendChatMessage(
          transcribeResult.transcript,
          selectedLanguage,
          history
        );

        if (!chatResult.success || !chatResult.reply) {
          throw new Error("Chat returned empty reply");
        }

        // Update debug info
        setDebug((prev) => ({
          ...prev,
          llmLatencyMs: chatResult.latency_ms,
        }));

        // Add assistant message
        const assistantMessage: ChatMessageType = {
          id: generateId(),
          role: "assistant",
          text: chatResult.reply,
          language: selectedLanguage,
          createdAt: new Date().toISOString(),
          metadata: {
            source: "llm",
            latencyMs: chatResult.latency_ms,
          },
        };

        setMessages((prev) => [...prev, assistantMessage]);
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : "An unexpected error occurred";
        showError(errorMsg);
        console.error("Processing error:", err);
      } finally {
        setLoading({ transcribing: false, generatingReply: false });
      }
    },
    [selectedLanguage, messages, showError]
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

  // --- Clear chat ---
  const handleClearChat = useCallback(() => {
    setMessages([]);
    setDebug((prev) => ({
      ...prev,
      lastTranscript: "",
      sttLatencyMs: null,
      llmLatencyMs: null,
      audioDurationSec: null,
    }));
  }, []);

  const isProcessing = loading.transcribing || loading.generatingReply;

  const currentLang = SUPPORTED_LANGUAGES.find(
    (l) => l.code === selectedLanguage
  );

  if (!mounted) {
    return (
      <div className="flex flex-col h-screen max-h-screen overflow-hidden bg-slate-950" />
    );
  }

  return (
    <div className="flex flex-col h-screen max-h-screen overflow-hidden">
      {/* Error Toast */}
      {error && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-slide-in-top">
          <div className="flex items-center gap-3 bg-red-500/90 backdrop-blur-sm text-white px-5 py-3 rounded-xl shadow-2xl shadow-red-500/20 max-w-lg">
            <svg
              className="w-5 h-5 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-sm font-medium">{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-2 text-white/70 hover:text-white"
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
      <header className="glass border-b border-slate-700/50 px-4 md:px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <h1 className="text-xl md:text-2xl font-bold gradient-text">
                Indic Voice Chat
              </h1>
              <p className="text-xs md:text-sm text-slate-400 mt-0.5">
                Speak in {currentLang?.name || "your language"} — powered by
                AI4Bharat IndicConformer
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* Backend status indicator */}
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
                  className={`w-2 h-2 rounded-full ${
                    backendOnline === null
                      ? "bg-yellow-400"
                      : backendOnline
                        ? "bg-emerald-400"
                        : "bg-red-400"
                  }`}
                />
                <span className="text-[11px] text-slate-500">
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

      {/* Chat Area */}
      <main className="flex-1 flex flex-col max-w-4xl w-full mx-auto overflow-hidden">
        <ChatWindow messages={messages} loading={loading} />
      </main>

      {/* Controls + Debug */}
      <footer className="glass border-t border-slate-700/50">
        <div className="max-w-4xl mx-auto">
          {/* Controls bar */}
          <div
            className={`px-4 md:px-6 py-4 ${isRecording ? "recording-glow" : ""}`}
          >
            <RecorderControls
              isRecording={isRecording}
              isProcessing={isProcessing}
              onStartRecording={handleStartRecording}
              onStopRecording={handleStopRecording}
              onFileUpload={handleFileUpload}
              onClearChat={handleClearChat}
              hasMessages={messages.length > 0}
            />
          </div>

          {/* Debug Panel */}
          <DebugPanel debug={debug} />
        </div>
      </footer>
    </div>
  );
}
