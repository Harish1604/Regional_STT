import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Indic Voice Translator -- AI4Bharat STT + LLaMA",
  description:
    "Translate Indian regional-language speech to English. Powered by AI4Bharat IndicConformer STT and LLaMA.",
  keywords: [
    "AI4Bharat",
    "IndicConformer",
    "speech to text",
    "translation",
    "Indian languages",
    "Tamil",
    "Hindi",
    "Telugu",
    "LLaMA",
    "Ollama",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased bg-black text-white`}>
        {children}
      </body>
    </html>
  );
}
