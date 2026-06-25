/**
 * Chat and API type definitions for the Regional STT Chatbot.
 */

/** Supported language definition */
export interface Language {
  code: string;
  name: string;
  nativeName: string;
}

/** List of supported languages */
export const SUPPORTED_LANGUAGES: Language[] = [
  { code: "ta", name: "Tamil", nativeName: "தமிழ்" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी" },
  { code: "te", name: "Telugu", nativeName: "తెలుగు" },
  { code: "ml", name: "Malayalam", nativeName: "മലയാളം" },
  { code: "kn", name: "Kannada", nativeName: "ಕನ್ನಡ" },
  { code: "bn", name: "Bengali", nativeName: "বাংলা" },
  { code: "gu", name: "Gujarati", nativeName: "ગુજરાતી" },
  { code: "mr", name: "Marathi", nativeName: "मराठी" },
  { code: "pa", name: "Punjabi", nativeName: "ਪੰਜਾਬੀ" },
  { code: "ur", name: "Urdu", nativeName: "اردو" },
];

/** Chat message format */
export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  language: string;
  createdAt: string;
  metadata?: {
    source?: "stt" | "llm";
    latencyMs?: number;
    model?: string;
    audioDurationSec?: number;
  };
}

/** Backend /transcribe response */
export interface TranscribeResponse {
  success: boolean;
  transcript: string;
  language: string;
  model: string;
  audio_duration_sec: number;
  latency_ms: number;
}

/** Backend /chat response */
export interface ChatAPIResponse {
  success: boolean;
  reply: string;
  language: string;
  latency_ms: number;
}

/** Backend error response */
export interface ErrorResponse {
  success: false;
  error: string;
  detail?: string;
}

/** Debug/metadata state */
export interface DebugInfo {
  selectedLanguage: string;
  lastTranscript: string;
  sttModel: string;
  sttLatencyMs: number | null;
  llmLatencyMs: number | null;
  audioDurationSec: number | null;
}

/** Chat history item for API requests */
export interface ChatHistoryItem {
  role: "user" | "assistant";
  text: string;
}

/** Application loading states */
export interface LoadingState {
  transcribing: boolean;
  generatingReply: boolean;
}
