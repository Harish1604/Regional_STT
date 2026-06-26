"use client";

import { SUPPORTED_LANGUAGES } from "@/types/chat";

interface LanguageSelectorProps {
  selectedLanguage: string;
  onLanguageChange: (code: string) => void;
  disabled?: boolean;
}

export default function LanguageSelector({
  selectedLanguage,
  onLanguageChange,
  disabled = false,
}: LanguageSelectorProps) {
  return (
    <select
      id="language-selector"
      value={selectedLanguage}
      onChange={(e) => onLanguageChange(e.target.value)}
      disabled={disabled}
      className={`
        px-3 py-2 rounded-lg text-sm font-medium
        bg-white border border-neutral-200 text-neutral-900
        focus:outline-none focus:border-neutral-400
        disabled:opacity-40 disabled:cursor-not-allowed
        appearance-none cursor-pointer
        pr-8
      `}
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='%23666' viewBox='0 0 20 20'%3E%3Cpath fill-rule='evenodd' d='M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z' clip-rule='evenodd'/%3E%3C/svg%3E")`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right 8px center",
        backgroundSize: "16px",
      }}
    >
      {SUPPORTED_LANGUAGES.map((lang) => (
        <option key={lang.code} value={lang.code}>
          {lang.name} ({lang.nativeName})
        </option>
      ))}
    </select>
  );
}
