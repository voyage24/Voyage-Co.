"use client";

import { useEffect, useRef } from "react";

// Renders a Cloudflare Turnstile widget and reports its token via onToken.
// When NEXT_PUBLIC_TURNSTILE_SITE_KEY is unset (not configured yet) it renders
// nothing and reports the sentinel "disabled" so forms still submit — the
// server-side verifier also fails open in that case.

type TurnstileOptions = {
  sitekey: string;
  theme?: "auto" | "light" | "dark";
  callback?: (token: string) => void;
  "error-callback"?: () => void;
  "expired-callback"?: () => void;
};

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: TurnstileOptions) => string;
      remove: (id: string) => void;
      reset: (id?: string) => void;
    };
  }
}

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

export default function TurnstileWidget({
  onToken,
  className,
  theme = "auto",
}: {
  onToken: (token: string) => void;
  className?: string;
  theme?: "auto" | "light" | "dark";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  const cb = useRef(onToken);
  cb.current = onToken;

  useEffect(() => {
    if (!SITE_KEY) { cb.current("disabled"); return; }
    let cancelled = false;

    const render = () => {
      if (cancelled || !ref.current || !window.turnstile || widgetId.current !== null) return;
      widgetId.current = window.turnstile.render(ref.current, {
        sitekey: SITE_KEY,
        theme,
        callback: (token: string) => cb.current(token),
        "error-callback": () => cb.current(""),
        "expired-callback": () => cb.current(""),
      });
    };

    if (window.turnstile) {
      render();
    } else {
      let script = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT_SRC}"]`);
      if (!script) {
        script = document.createElement("script");
        script.src = SCRIPT_SRC;
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
      }
      script.addEventListener("load", render);
      // Fallback in case the script finished loading before the listener bound.
      const iv = window.setInterval(() => { if (window.turnstile) { window.clearInterval(iv); render(); } }, 200);
      window.setTimeout(() => window.clearInterval(iv), 6000);
    }

    return () => {
      cancelled = true;
      if (widgetId.current !== null && window.turnstile) {
        try { window.turnstile.remove(widgetId.current); } catch { /* already gone */ }
        widgetId.current = null;
      }
    };
  }, [theme]);

  if (!SITE_KEY) return null;
  return <div ref={ref} className={className} />;
}
