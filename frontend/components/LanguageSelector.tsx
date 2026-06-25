"use client";

import { SUPPORTED_LANGUAGES, type Language } from "@/types/chat";

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
    <div className="flex items-center gap-3">
      <label
        htmlFor="language-select"
        className="text-sm font-medium text-slate-300 whitespace-nowrap"
      >
        🌐 Language
      </label>
      <select
        id="language-select"
        value={selectedLanguage}
        onChange={(e) => onLanguageChange(e.target.value)}
        disabled={disabled}
        className="
          bg-slate-800/80 text-slate-100 border border-slate-600/50
          rounded-xl px-4 py-2.5 text-sm font-medium
          focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-all duration-200
          hover:border-violet-400/40
          appearance-none cursor-pointer
          backdrop-blur-sm
        "
        style={{
          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
          backgroundPosition: "right 0.5rem center",
          backgroundRepeat: "no-repeat",
          backgroundSize: "1.5em 1.5em",
          paddingRight: "2.5rem",
        }}
      >
        {SUPPORTED_LANGUAGES.map((lang: Language) => (
          <option key={lang.code} value={lang.code}>
            {lang.nativeName} — {lang.name}
          </option>
        ))}
      </select>
    </div>
  );
}
