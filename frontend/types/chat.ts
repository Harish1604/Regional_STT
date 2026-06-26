/**
 * Type definitions for the Indic Voice Translator.
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

/** Target languages for translation */
export const TARGET_LANGUAGES: Language[] = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी" },
  { code: "ta", name: "Tamil", nativeName: "தமிழ்" },
];

/** Backend /translate response */
export interface TranslateAPIResponse {
  success: boolean;
  source_text: string;
  translated_text: string;
  source_language: string;
  target_language: string;
  stt_latency_ms: number;
  translation_latency_ms: number;
  llm_reply: string;
  llm_reply_latency_ms: number;
  total_latency_ms: number;
  audio_duration_sec: number;
  model: string;
}

/** A single translation entry for the history */
export interface TranslationEntry {
  id: string;
  sourceText: string;
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
  sttLatencyMs: number;
  translationLatencyMs: number;
  llmReply: string;
  llmReplyLatencyMs: number;
  totalLatencyMs: number;
  audioDurationSec: number;
  createdAt: string;
}

/** Backend /transcribe response (kept for backward compat) */
export interface TranscribeResponse {
  success: boolean;
  transcript: string;
  language: string;
  model: string;
  audio_duration_sec: number;
  latency_ms: number;
}

/** Backend /chat response (kept for backward compat) */
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

/** Chat history item for API requests */
export interface ChatHistoryItem {
  role: "user" | "assistant";
  text: string;
}

/** Application loading states */
export interface LoadingState {
  transcribing: boolean;
  translating: boolean;
  generatingReply: boolean;
}
