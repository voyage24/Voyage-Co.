"use client";

import { useState, useEffect } from "react";
import { X, Download } from "lucide-react";
import Logo from "@/components/ui/Logo";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const DISMISS_KEY = "vc-install-dismissed";

// A subtle "add to home screen" invite. Uses the standard beforeinstallprompt
// event (Chrome/Edge/Android). Hidden once installed or dismissed. iOS Safari
// doesn't fire the event, so nothing shows there — by design, to avoid nagging.
export default function InstallPrompt() {
  const [evt, setEvt] = useState<BeforeInstallPromptEvent | null>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(DISMISS_KEY)) return;
      if (window.matchMedia("(display-mode: standalone)").matches) return;
    } catch { /* storage blocked — still allow the prompt */ }
    const handler = (e: Event) => {
      e.preventDefault();
      setEvt(e as BeforeInstallPromptEvent);
      // Give visitors a moment to settle before inviting them.
      setTimeout(() => setShow(true), 4000);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const install = async () => {
    if (!evt) return;
    setShow(false);
    try {
      await evt.prompt();
      await evt.userChoice;
    } catch { /* user dismissed the native sheet */ }
    setEvt(null);
    try { localStorage.setItem(DISMISS_KEY, "1"); } catch { /* ignore */ }
  };

  const dismiss = () => {
    setShow(false);
    try { localStorage.setItem(DISMISS_KEY, "1"); } catch { /* ignore */ }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-x-4 bottom-[5.5rem] sm:inset-x-auto sm:right-6 sm:bottom-6 z-40 sm:max-w-sm animate-slide-up">
      <div className="flex items-center gap-3 bg-vc-950 text-[#f4f0e9] border border-white/10 rounded-xl shadow-luxury px-4 py-3.5">
        <div className="shrink-0"><Logo size={22} tone="light" /></div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium leading-tight">Add to your home screen</p>
          <p className="text-xs text-white/60 leading-tight mt-0.5">Open Voyages &amp; Co. like an app — faster, full-screen.</p>
        </div>
        <button onClick={install} className="shrink-0 inline-flex items-center gap-1.5 bg-[#f4f0e9] text-vc-950 text-[11px] font-medium tracking-[0.1em] uppercase px-3 py-2 rounded-sm hover:bg-white transition-colors">
          <Download size={14} /> Install
        </button>
        <button onClick={dismiss} aria-label="Dismiss" className="shrink-0 text-white/50 hover:text-white transition-colors"><X size={16} /></button>
      </div>
    </div>
  );
}
