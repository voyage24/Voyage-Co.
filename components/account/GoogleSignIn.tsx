"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

// Renders the Google Identity Services button and completes sign-in via
// /api/account/google. Renders nothing unless NEXT_PUBLIC_GOOGLE_CLIENT_ID is
// set, so it stays invisible until Google sign-in is configured.
export default function GoogleSignIn({ next = "/my-voyages" }: { next?: string }) {
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!clientId || !ref.current) return;
    const el = ref.current;

    const handle = async (response: { credential: string }) => {
      const res = await fetch("/api/account/google", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: response.credential }),
      });
      if (res.ok) { router.push(next); router.refresh(); }
    };

    const render = () => {
      const g = (window as unknown as { google?: { accounts: { id: { initialize: (o: object) => void; renderButton: (el: HTMLElement, o: object) => void } } } }).google;
      if (!g) return;
      g.accounts.id.initialize({ client_id: clientId, callback: handle });
      g.accounts.id.renderButton(el, { theme: "outline", size: "large", width: 320, text: "continue_with", shape: "rectangular" });
    };

    if (document.getElementById("gsi-script")) { render(); return; }
    const s = document.createElement("script");
    s.src = "https://accounts.google.com/gsi/client";
    s.async = true; s.defer = true; s.id = "gsi-script";
    s.onload = render;
    document.head.appendChild(s);
  }, [clientId, router, next]);

  if (!clientId) return null;
  return <div ref={ref} className="flex justify-center" />;
}
