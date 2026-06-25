"use client";

import { useRef } from "react";

interface RecorderControlsProps {
  isRecording: boolean;
  isProcessing: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onFileUpload: (file: File) => void;
  onClearChat: () => void;
  hasMessages: boolean;
}

export default function RecorderControls({
  isRecording,
  isProcessing,
  onStartRecording,
  onStopRecording,
  onFileUpload,
  onClearChat,
  hasMessages,
}: RecorderControlsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileUpload(file);
      // Reset input so the same file can be uploaded again
      e.target.value = "";
    }
  };

  return (
    <div className="flex items-center gap-3 flex-wrap">
      {/* Record / Stop Button */}
      <button
        id="record-button"
        onClick={isRecording ? onStopRecording : onStartRecording}
        disabled={isProcessing}
        className={`
          relative flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm
          transition-all duration-300 
          disabled:opacity-50 disabled:cursor-not-allowed
          ${
            isRecording
              ? "bg-red-500/90 hover:bg-red-500 text-white shadow-lg shadow-red-500/30"
              : "bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-violet-500/25"
          }
        `}
      >
        {/* Pulse animation while recording */}
        {isRecording && (
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-300" />
          </span>
        )}

        {isRecording ? (
          <>
            <svg
              className="w-4 h-4"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <rect x="6" y="6" width="12" height="12" rx="2" />
            </svg>
            Stop Recording
          </>
        ) : (
          <>
            <svg
              className="w-4 h-4"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 1a4 4 0 0 0-4 4v7a4 4 0 0 0 8 0V5a4 4 0 0 0-4-4z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2H3v2a9 9 0 0 0 8 8.94V23h2v-2.06A9 9 0 0 0 21 12v-2h-2z" />
            </svg>
            Record
          </>
        )}
      </button>

      {/* Upload Button */}
      <button
        id="upload-button"
        onClick={() => fileInputRef.current?.click()}
        disabled={isRecording || isProcessing}
        className="
          flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm
          bg-slate-800/80 text-slate-300 border border-slate-600/50
          hover:bg-slate-700/80 hover:text-slate-100 hover:border-slate-500/50
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-all duration-200
          backdrop-blur-sm
        "
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>
        Upload Audio
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*,.wav,.mp3,.ogg,.webm,.m4a,.flac"
        onChange={handleFileChange}
        className="hidden"
        id="file-upload-input"
      />

      {/* Clear Chat Button */}
      {hasMessages && (
        <button
          id="clear-chat-button"
          onClick={onClearChat}
          disabled={isRecording || isProcessing}
          className="
            flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm
            text-slate-400 hover:text-red-400
            hover:bg-red-500/10 border border-transparent hover:border-red-500/20
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-all duration-200
          "
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
          Clear
        </button>
      )}
    </div>
  );
}
