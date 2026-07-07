"use client";

import { useEffect, useState } from "react";
import { Bell, BellRing } from "lucide-react";

const VAPID = (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "").trim();

function urlB64ToUint8Array(base64: string) {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(b64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}

// Lets a visitor enable browser push notifications. Renders nothing where
// push isn't supported or the VAPID key is missing.
export default function PushSubscribe() {
  const [state, setState] = useState<"loading" | "off" | "on" | "denied" | "unsupported">("loading");
  const [busy, setBusy] = useState(false);
  const [test, setTest] = useState("");

  const sendTest = async () => {
    setTest("Sending…");
    try {
      const res = await fetch("/api/push/test", { method: "POST" });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) { setTest("Sign in first."); return; }
      if (!d.configured) setTest("Server VAPID keys not configured.");
      else if (d.subscriptions === 0) setTest("No device registered — turn off and on again.");
      else if (d.sent === 0) setTest("Send failed (key mismatch?). Turn off and on again.");
      else setTest("Sent ✓ — check for the notification.");
    } catch { setTest("Could not reach the server."); }
  };

  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator) || !("PushManager" in window) || !VAPID) { setState("unsupported"); return; }
    if (Notification.permission === "denied") { setState("denied"); return; }
    navigator.serviceWorker.ready.then(reg => reg.pushManager.getSubscription()).then(s => setState(s ? "on" : "off")).catch(() => setState("off"));
  }, []);

  const enable = async () => {
    setBusy(true);
    try {
      const perm = await Notification.requestPermission();
      if (perm !== "granted") { setState("denied"); return; }
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlB64ToUint8Array(VAPID) });
      await fetch("/api/push/subscribe", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(sub) });
      setState("on");
    } catch { /* ignore */ } finally { setBusy(false); }
  };

  const disable = async () => {
    setBusy(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) { await fetch("/api/push/subscribe", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ endpoint: sub.endpoint }) }); await sub.unsubscribe(); }
      setState("off");
    } catch { /* ignore */ } finally { setBusy(false); }
  };

  if (state === "loading" || state === "unsupported") return null;

  if (state === "denied") {
    return <p className="text-xs text-ink-faint">Notifications are blocked in your browser settings.</p>;
  }

  return state === "on" ? (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-4">
        <button onClick={disable} disabled={busy} className="inline-flex items-center gap-2 text-xs tracking-[0.12em] uppercase text-gold hover:text-ink transition-colors disabled:opacity-50">
          <BellRing size={15} /> Notifications on — turn off
        </button>
        <button onClick={sendTest} className="text-xs tracking-[0.12em] uppercase text-ink-faint hover:text-ink transition-colors">Send test</button>
      </div>
      {test && <p className="text-[11px] text-ink-faint">{test}</p>}
    </div>
  ) : (
    <button onClick={enable} disabled={busy} className="inline-flex items-center gap-2 text-xs tracking-[0.12em] uppercase text-ink-muted hover:text-ink transition-colors disabled:opacity-50">
      <Bell size={15} /> {busy ? "Enabling…" : "Enable notifications"}
    </button>
  );
}
