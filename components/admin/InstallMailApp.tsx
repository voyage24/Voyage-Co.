"use client";

import { useEffect, useState } from "react";
import { Download, Share, X } from "lucide-react";

type BeforeInstallPromptEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };
const KEY = "vc-mail-install-dismissed";

// Lets the admin install "Voyages Mail" to their phone's home screen — an
// install button where supported (Android/desktop Chrome), iOS instructions
// otherwise. Hidden once installed or dismissed.
export default function InstallMailApp() {
  const [evt, setEvt] = useState<BeforeInstallPromptEvent | null>(null);
  const [hidden, setHidden] = useState(true);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    try { if (sessionStorage.getItem(KEY)) return; } catch { /* ignore */ }
    const standalone = window.matchMedia?.("(display-mode: standalone)").matches || (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    if (standalone) return; // already installed
    const ios = /iPhone|iPad|iPod/.test(navigator.userAgent);
    setIsIOS(ios);
    setHidden(false);
    const handler = (e: Event) => { e.preventDefault(); setEvt(e as BeforeInstallPromptEvent); };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const install = async () => {
    if (!evt) return;
    try { await evt.prompt(); await evt.userChoice; } catch { /* dismissed */ }
    setHidden(true);
  };
  const dismiss = () => { setHidden(true); try { sessionStorage.setItem(KEY, "1"); } catch { /* ignore */ } };

  if (hidden) return null;

  return (
    <div className="relative rounded-lg border border-gray-200 bg-gray-900 text-gray-100 px-4 py-3 mb-4 flex items-center gap-3">
      <Download size={18} className="text-gold shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">Install Voyages Mail</p>
        {isIOS ? (
          <p className="text-xs text-gray-400">Tap <Share size={11} className="inline -mt-0.5" /> Share, then &ldquo;Add to Home Screen&rdquo; to open your inbox like an app.</p>
        ) : (
          <p className="text-xs text-gray-400">Add it to your home screen to open the inbox like an app.</p>
        )}
      </div>
      {!isIOS && evt && (
        <button onClick={install} className="shrink-0 text-xs bg-gold text-gray-900 font-medium px-3 py-1.5 rounded-md hover:bg-gold/90">Install</button>
      )}
      <button onClick={dismiss} aria-label="Dismiss" className="shrink-0 text-gray-500 hover:text-gray-200"><X size={16} /></button>
    </div>
  );
}
