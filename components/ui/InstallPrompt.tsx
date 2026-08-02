"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { X, Download, Share, SquarePlus } from "lucide-react";
import Logo from "@/components/ui/Logo";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const DISMISS_KEY = "vc-install-dismissed";
const IOS_DISMISS_KEY = "vc-ios-install-dismissed";

function isDismissed(key: string) {
  try { return !!localStorage.getItem(key); } catch { return false; }
}
function markDismissed(key: string) {
  try { localStorage.setItem(key, "1"); } catch { /* ignore */ }
}

function isStandalone() {
  try {
    return window.matchMedia("(display-mode: standalone)").matches
      || (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
  } catch { return false; }
}

// iOS Safari specifically — that's the browser with the Share-sheet "Add to
// Home Screen" action. Other iOS browsers are WebKit under the hood (Apple's
// rule) but don't expose the same install path, so they're left alone.
// iPadOS 13+ reports its platform as "MacIntel" — touch-point count is what
// tells it apart from an actual Mac.
function isIosSafari() {
  const ua = navigator.userAgent;
  const iOSDevice = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const safari = /^((?!chrome|android|crios|fxios|edgios).)*safari/i.test(ua);
  return iOSDevice && safari;
}

// A subtle, one-time "add to home screen" invite.
// - Chrome/Edge/Android: the standard beforeinstallprompt event, with a real
//   one-tap Install button.
// - iOS Safari: that event doesn't exist there, so instead this shows
//   Share -> Add to Home Screen instructions (own dismiss key — a different
//   flow entirely, and a device is never both).
// Once dismissed or installed, a given flow never shows again this browser.
export default function InstallPrompt() {
  const pathname = usePathname();
  const [evt, setEvt] = useState<BeforeInstallPromptEvent | null>(null);
  const [show, setShow] = useState(false);
  const [ios, setIos] = useState(false);
  const doneRef = useRef(false);       // shown once / dismissed this session
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isStandalone()) return;

    if (isIosSafari()) {
      if (isDismissed(IOS_DISMISS_KEY)) return;
      setIos(true);
      timerRef.current = setTimeout(() => { if (!isDismissed(IOS_DISMISS_KEY)) setShow(true); }, 4000);
      return () => { if (timerRef.current) clearTimeout(timerRef.current); };
    }

    if (isDismissed(DISMISS_KEY)) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setEvt(e as BeforeInstallPromptEvent);
      // Only ever schedule the banner once, and only if not dismissed.
      if (doneRef.current || isDismissed(DISMISS_KEY)) return;
      doneRef.current = true;
      timerRef.current = setTimeout(() => { if (!isDismissed(DISMISS_KEY)) setShow(true); }, 4000);
    };

    const onInstalled = () => { markDismissed(DISMISS_KEY); setShow(false); };

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
    markDismissed(ios ? IOS_DISMISS_KEY : DISMISS_KEY);
  };

  const install = async () => {
    setShow(false);
    markDismissed(DISMISS_KEY);
    if (!evt) return;
    try {
      await evt.prompt();
      await evt.userChoice;
    } catch { /* user dismissed the native sheet */ }
    setEvt(null);
  };

  // The admin (incl. the Voyages Mail app) has its own install flow — never
  // offer the customer app there.
  if (!show || pathname?.startsWith("/admin")) return null;

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
        {ios ? (
          <div className="flex items-center gap-3 mt-3.5 text-xs text-white/80">
            <span className="inline-flex items-center gap-1.5"><Share size={14} className="text-gold" /> Tap Share</span>
            <span className="text-white/30">→</span>
            <span className="inline-flex items-center gap-1.5"><SquarePlus size={14} className="text-gold" /> Add to Home Screen</span>
          </div>
        ) : (
          <div className="flex items-center gap-3 mt-3">
            <button onClick={install} className="inline-flex items-center gap-1.5 bg-[#f4f0e9] text-vc-950 text-[11px] font-medium tracking-[0.1em] uppercase px-3.5 py-2 rounded-sm hover:bg-white transition-colors">
              <Download size={14} /> Install
            </button>
            <button onClick={close} className="text-xs tracking-[0.08em] uppercase text-white/60 hover:text-white transition-colors">Not now</button>
          </div>
        )}
      </div>
    </div>
  );
}
