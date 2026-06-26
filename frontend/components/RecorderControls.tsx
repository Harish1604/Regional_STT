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
    <div className="flex flex-col items-center gap-4">
      {/* Recording timer */}
      {isRecording && (
        <div className="flex items-center gap-2 animate-fade-in">
          <span className="w-2 h-2 rounded-full bg-[#ff3333] recording-pulse" />
          <span className="font-mono text-sm text-[#ff3333]">
            {formatDuration(recordingDuration)}
          </span>
        </div>
      )}

      {/* Buttons row */}
      <div className="flex items-center gap-3">
        {/* START button */}
        <button
          id="start-recording-button"
          onClick={onStartRecording}
          disabled={isRecording || isProcessing}
          className={`
            flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-sm
            border transition-all duration-150
            ${
              isRecording || isProcessing
                ? "bg-neutral-100 text-neutral-400 border-neutral-200 cursor-not-allowed"
                : "bg-neutral-900 text-white border-neutral-900 hover:bg-neutral-800 hover:border-neutral-800 active:scale-[0.97]"
            }
          `}
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 1a4 4 0 0 0-4 4v7a4 4 0 0 0 8 0V5a4 4 0 0 0-4-4z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2H3v2a9 9 0 0 0 8 8.94V23h2v-2.06A9 9 0 0 0 21 12v-2h-2z" />
          </svg>
          Start
        </button>

        {/* STOP button */}
        <button
          id="stop-recording-button"
          onClick={onStopRecording}
          disabled={!isRecording || isProcessing}
          className={`
            flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-sm
            border transition-all duration-150
            ${
              !isRecording || isProcessing
                ? "bg-neutral-100 text-neutral-400 border-neutral-200 cursor-not-allowed"
                : "bg-red-600 text-white border-red-600 hover:bg-red-700 active:scale-[0.97] recording-ring"
            }
          `}
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <rect x="6" y="6" width="12" height="12" rx="2" />
          </svg>
          Stop
        </button>

        {/* Divider */}
        <div className="w-px h-8 bg-neutral-200" />

        {/* Upload button */}
        <button
          id="upload-button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isRecording || isProcessing}
          className={`
            flex items-center gap-2 px-4 py-3 rounded-lg font-medium text-sm
            border transition-all duration-150
            ${
              isRecording || isProcessing
                ? "bg-neutral-100 text-neutral-400 border-neutral-200 cursor-not-allowed"
                : "bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50 hover:text-neutral-900 hover:border-neutral-300"
            }
          `}
        >
          <svg
            className="w-4 h-4"
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
          Upload
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*,.wav,.mp3,.ogg,.webm,.m4a,.flac"
          onChange={handleFileChange}
          className="hidden"
          id="file-upload-input"
        />
      </div>

      {/* Processing indicator */}
      {isProcessing && (
        <div className="flex items-center gap-2 animate-fade-in">
          <div className="flex gap-1">
            <span className="w-1.5 h-1.5 bg-neutral-900 rounded-full dot-1" />
            <span className="w-1.5 h-1.5 bg-neutral-900 rounded-full dot-2" />
            <span className="w-1.5 h-1.5 bg-neutral-900 rounded-full dot-3" />
          </div>
          <span className="text-xs text-neutral-500 font-medium">Processing...</span>
        </div>
      )}
    </div>
  );
}
