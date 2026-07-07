"use client";

import { useState, useEffect, useRef } from "react";
import { X, Download } from "lucide-react";
import Logo from "@/components/ui/Logo";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const DISMISS_KEY = "vc-install-dismissed";

function isDismissed() {
  try { return !!localStorage.getItem(DISMISS_KEY); } catch { return false; }
}
function markDismissed() {
  try { localStorage.setItem(DISMISS_KEY, "1"); } catch { /* ignore */ }
}

// A subtle, one-time "add to home screen" invite. Uses the standard
// beforeinstallprompt event (Chrome/Edge/Android). Once dismissed or installed
// it never shows again — Chrome can fire the event repeatedly, so we guard every
// path against re-showing. iOS Safari doesn't fire the event, so nothing shows
// there by design.
export default function InstallPrompt() {
  const [evt, setEvt] = useState<BeforeInstallPromptEvent | null>(null);
  const [show, setShow] = useState(false);
  const doneRef = useRef(false);       // shown once / dismissed this session
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isDismissed()) return;
    try { if (window.matchMedia("(display-mode: standalone)").matches) return; } catch { /* ignore */ }

    const handler = (e: Event) => {
      e.preventDefault();
      setEvt(e as BeforeInstallPromptEvent);
      // Only ever schedule the banner once, and only if not dismissed.
      if (doneRef.current || isDismissed()) return;
      doneRef.current = true;
      timerRef.current = setTimeout(() => { if (!isDismissed()) setShow(true); }, 4000);
    };

    const onInstalled = () => { markDismissed(); setShow(false); };

    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", onInstalled);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const close = () => {
    setShow(false);
    doneRef.current = true;
    if (timerRef.current) clearTimeout(timerRef.current);
    markDismissed();
  };

  const install = async () => {
    setShow(false);
    markDismissed();
    if (!evt) return;
    try {
      await evt.prompt();
      await evt.userChoice;
    } catch { /* user dismissed the native sheet */ }
    setEvt(null);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-x-4 bottom-[5.5rem] sm:inset-x-auto sm:right-6 sm:bottom-6 z-40 sm:max-w-sm animate-slide-up">
      <div className="relative bg-vc-950 text-[#f4f0e9] border border-white/10 rounded-xl shadow-luxury p-4 pr-10">
        <button
          onClick={close} aria-label="Close"
          className="absolute top-2.5 right-2.5 w-7 h-7 flex items-center justify-center rounded-full bg-white/10 text-white/80 hover:bg-white/20 hover:text-white transition-colors"
        >
          <X size={15} />
        </button>
        <div className="flex items-center gap-3">
          <div className="shrink-0"><Logo size={22} tone="light" /></div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium leading-tight">Add to your home screen</p>
            <p className="text-xs text-white/60 leading-tight mt-0.5">Open Voyages &amp; Co. like an app — faster, full-screen.</p>
          </div>
        </div>
        <div className="flex items-center gap-3 mt-3">
          <button onClick={install} className="inline-flex items-center gap-1.5 bg-[#f4f0e9] text-vc-950 text-[11px] font-medium tracking-[0.1em] uppercase px-3.5 py-2 rounded-sm hover:bg-white transition-colors">
            <Download size={14} /> Install
          </button>
          <button onClick={close} className="text-xs tracking-[0.08em] uppercase text-white/60 hover:text-white transition-colors">Not now</button>
        </div>
      </div>
    </div>
  );
}
