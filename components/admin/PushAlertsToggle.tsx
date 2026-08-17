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

// Registers/unregisters this device for admin push notifications — bookings,
// enquiries, follow-up reminders and new mail all route through the same
// subscription (see lib/push.ts sendPushToAdmins), so enabling it once here
// covers every alert type, not just whichever page this is mounted on. The
// subscription is keyed to the device, not the session, so alerts keep
// arriving even after the admin's login session expires.
export default function PushAlertsToggle({
  onLabel = "Get notified on this device",
  offLabel = "Notifications on — turn off",
}: {
  onLabel?: string;
  offLabel?: string;
}) {
  const [state, setState] = useState<"loading" | "off" | "on" | "denied" | "unsupported">("loading");
  const [busy, setBusy] = useState(false);

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
      const sub = await reg.pushManager.getSubscription()
        ?? await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlB64ToUint8Array(VAPID) });
      await fetch("/api/admin/push/subscribe", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(sub) });
      setState("on");
    } catch { /* ignore */ } finally { setBusy(false); }
  };

  const disable = async () => {
    setBusy(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) await fetch("/api/admin/push/subscribe", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ endpoint: sub.endpoint }) });
      setState("off");
    } catch { /* ignore */ } finally { setBusy(false); }
  };

  if (state === "loading" || state === "unsupported") return null;
  if (state === "denied") return <p className="text-xs text-gray-400">Notifications are blocked in this browser&apos;s settings.</p>;

  return state === "on" ? (
    <button onClick={disable} disabled={busy} className="inline-flex items-center gap-1.5 text-xs text-emerald-700 hover:text-emerald-900 disabled:opacity-50">
      <BellRing size={14} /> {offLabel}
    </button>
  ) : (
    <button onClick={enable} disabled={busy} className="inline-flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-900 disabled:opacity-50">
      <Bell size={14} /> {busy ? "Enabling…" : onLabel}
    </button>
  );
}
