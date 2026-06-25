import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Indic Voice Chat — AI4Bharat STT",
  description:
    "Indian regional-language speech chatbot powered by AI4Bharat IndicConformer STT. Speak in Tamil, Hindi, Telugu, Malayalam, Kannada and more.",
  keywords: [
    "AI4Bharat",
    "IndicConformer",
    "speech to text",
    "Indian languages",
    "Tamil",
    "Hindi",
    "Telugu",
    "chatbot",
    "STT",
    "ASR",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased text-slate-100`}>
        {children}
      </body>
    </html>
  );
}
