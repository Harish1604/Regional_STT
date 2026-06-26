"use client";

import { useRef } from "react";

interface RecorderControlsProps {
  isRecording: boolean;
  isProcessing: boolean;
  recordingDuration: number;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onFileUpload: (file: File) => void;
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export default function RecorderControls({
  isRecording,
  isProcessing,
  recordingDuration,
  onStartRecording,
  onStopRecording,
  onFileUpload,
}: RecorderControlsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileUpload(file);
      e.target.value = "";
    }
  };

  return (
    <div className="flex items-center gap-2 sm:gap-3 w-full max-w-3xl mx-auto">
      {/* Upload button (Left side, icon only on small screens) */}
      <button
        id="upload-button"
        onClick={() => fileInputRef.current?.click()}
        disabled={isRecording || isProcessing}
        title="Upload audio file"
        className={`
          flex items-center justify-center p-3 sm:px-4 sm:py-3 rounded-full sm:rounded-lg font-medium text-sm
          border transition-all duration-150 flex-shrink-0
          ${
            isRecording || isProcessing
              ? "bg-neutral-100 text-neutral-400 border-transparent cursor-not-allowed"
              : "bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50 hover:text-neutral-900"
          }
        `}
      >
        <svg
          className="w-5 h-5 sm:w-4 sm:h-4 sm:mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
          />
        </svg>
        <span className="hidden sm:inline">Upload</span>
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*,.wav,.mp3,.ogg,.webm,.m4a,.flac"
        onChange={handleFileChange}
        className="hidden"
        id="file-upload-input"
      />

      {/* Main Recording Button Area */}
      <div className="flex-1 flex items-center justify-center gap-3 bg-neutral-100 rounded-full sm:rounded-xl px-2 py-1.5 sm:p-2">
        {isRecording ? (
          <>
            <div className="flex-1 flex items-center justify-center gap-2 ml-4">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 recording-pulse" />
              <span className="font-mono text-sm font-medium text-red-500">
                {formatDuration(recordingDuration)}
              </span>
            </div>
            <button
              id="stop-recording-button"
              onClick={onStopRecording}
              disabled={isProcessing}
              className={`
                flex items-center justify-center gap-2 px-5 py-2.5 rounded-full font-medium text-sm text-white
                transition-all duration-150 shadow-sm
                ${
                  isProcessing
                    ? "bg-neutral-400 cursor-not-allowed"
                    : "bg-red-500 hover:bg-red-600 active:scale-[0.97] recording-ring"
                }
              `}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <rect x="6" y="6" width="12" height="12" rx="2" />
              </svg>
              Stop
            </button>
          </>
        ) : (
          <button
            id="start-recording-button"
            onClick={onStartRecording}
            disabled={isProcessing}
            className={`
              w-full flex items-center justify-center gap-2 px-6 py-2.5 rounded-full font-medium text-sm text-white
              transition-all duration-150 shadow-sm
              ${
                isProcessing
                  ? "bg-neutral-400 cursor-not-allowed"
                  : "bg-neutral-900 hover:bg-neutral-800 active:scale-[0.97]"
              }
            `}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 1a4 4 0 0 0-4 4v7a4 4 0 0 0 8 0V5a4 4 0 0 0-4-4z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2H3v2a9 9 0 0 0 8 8.94V23h2v-2.06A9 9 0 0 0 21 12v-2h-2z" />
            </svg>
            {isProcessing ? "Processing..." : "Tap to Speak"}
          </button>
        )}
      </div>
    </div>
  );
}
