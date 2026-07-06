"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, MicOff } from "lucide-react";
import { haptic } from "@/lib/haptics";

// Speak-to-fill using the Web Speech API (Chrome/Edge/Safari on mobile).
// Calls onResult with the transcript; renders nothing where unsupported.
type SR = { start: () => void; stop: () => void; lang: string; interimResults: boolean; continuous: boolean; onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null; onend: (() => void) | null; onerror: (() => void) | null };

export default function VoiceInput({ onResult, lang = "en-US" }: { onResult: (text: string) => void; lang?: string }) {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const recRef = useRef<SR | null>(null);

  useEffect(() => {
    const Ctor = (window as unknown as { SpeechRecognition?: new () => SR; webkitSpeechRecognition?: new () => SR }).SpeechRecognition
      || (window as unknown as { webkitSpeechRecognition?: new () => SR }).webkitSpeechRecognition;
    if (!Ctor) return;
    setSupported(true);
    const rec = new Ctor();
    rec.lang = lang; rec.interimResults = false; rec.continuous = false;
    rec.onresult = (e) => {
      const text = Array.from(e.results).map(r => r[0].transcript).join(" ").trim();
      if (text) { onResult(text); haptic("success"); }
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recRef.current = rec;
    return () => { try { rec.stop(); } catch { /* ignore */ } };
  }, [lang, onResult]);

  if (!supported) return null;

  const toggle = () => {
    const rec = recRef.current;
    if (!rec) return;
    if (listening) { try { rec.stop(); } catch { /* ignore */ } setListening(false); return; }
    try { rec.start(); setListening(true); haptic("select"); } catch { /* already running */ }
  };

  return (
    <button
      type="button" onClick={toggle} aria-label={listening ? "Stop listening" : "Speak"}
      className={`inline-flex items-center gap-1.5 text-xs tracking-[0.12em] uppercase transition-colors ${listening ? "text-red-600" : "text-gold hover:text-ink"}`}
    >
      {listening ? <MicOff size={14} /> : <Mic size={14} />}
      {listening ? "Listening…" : "Speak"}
    </button>
  );
}
