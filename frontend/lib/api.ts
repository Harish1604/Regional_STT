/**
 * API client for communicating with the FastAPI backend.
 */

import type {
  TranscribeResponse,
  ChatAPIResponse,
  ChatHistoryItem,
  TranslateAPIResponse,
} from "@/types/chat";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/**
 * Check backend health.
 */
export async function checkHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/health`, { method: "GET" });
    const data = await res.json();
    return data.status === "ok";
  } catch {
    return false;
  }
}

/**
 * Combined STT + Translation in a single API call.
 * Sends audio to the /translate endpoint which runs both STT and LLM translation.
 *
 * @param file - Audio file (Blob or File)
 * @param sourceLanguage - ISO 639-1 source language code (e.g., 'ta', 'hi')
 * @param targetLanguage - ISO 639-1 target language code (default: 'en')
 * @returns TranslateAPIResponse with source text, translated text, and latencies
 */
export async function translateAudio(
  file: Blob | File,
  sourceLanguage: string,
  targetLanguage: string = "en"
): Promise<TranslateAPIResponse> {
  const formData = new FormData();

  // If it's a Blob (from MediaRecorder), wrap it as a File
  if (file instanceof Blob && !(file instanceof File)) {
    formData.append("file", file, "recording.webm");
  } else {
    formData.append("file", file);
  }

  formData.append("source_language", sourceLanguage);
  formData.append("target_language", targetLanguage);

  const res = await fetch(`${API_BASE_URL}/translate`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(
      errorData.detail || errorData.error || `Translation failed (${res.status})`
    );
  }

  return res.json();
}

/**
 * Send audio file to the backend for transcription.
 * (Kept for backward compatibility)
 */
export async function transcribeAudio(
  file: Blob | File,
  language: string
): Promise<TranscribeResponse> {
  const formData = new FormData();

  if (file instanceof Blob && !(file instanceof File)) {
    formData.append("file", file, "recording.webm");
  } else {
    formData.append("file", file);
  }

  formData.append("language", language);

  const res = await fetch(`${API_BASE_URL}/transcribe`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(
      errorData.detail || errorData.error || `Transcription failed (${res.status})`
    );
  }

  return res.json();
}

/**
 * Send a chat message to the backend LLM.
 * (Kept for backward compatibility)
 */
export async function sendChatMessage(
  message: string,
  language: string,
  history: ChatHistoryItem[]
): Promise<ChatAPIResponse> {
  const res = await fetch(`${API_BASE_URL}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, language, history }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(
      errorData.detail || errorData.error || `Chat failed (${res.status})`
    );
  }

  return res.json();
}
