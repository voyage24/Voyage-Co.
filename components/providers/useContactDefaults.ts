"use client";

import { useEffect, useState } from "react";

// Smart defaults for contact-style forms so guests rarely re-type their details.
// A signed-in member's name/email/phone come from their account; otherwise the
// last details a guest entered (remembered on-device) are offered. Call
// `remember()` on a successful submit to store guest details for next time.

export type ContactDefaults = { name: string; email: string; phone: string; member: boolean };
const KEY = "vc-contact-defaults";

function readLocal(): { name: string; email: string; phone: string } | null {
  try { const raw = localStorage.getItem(KEY); return raw ? JSON.parse(raw) : null; } catch { return null; }
}

// Synchronous read of remembered guest details (no network) — for lightweight
// prefills like the global footer newsletter.
export function readRememberedContact() {
  return readLocal();
}

export function rememberContact(d: { name?: string; email?: string; phone?: string }) {
  try {
    const prev = readLocal() ?? { name: "", email: "", phone: "" };
    const next = { name: d.name?.trim() || prev.name, email: d.email?.trim() || prev.email, phone: d.phone?.trim() || prev.phone };
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch { /* private mode / quota */ }
}

// Small remembered preferences (guest count, passengers…) — sensible defaults
// that carry over between visits without being intrusive.
export function getPref<T>(key: string, fallback: T): T {
  try { const raw = localStorage.getItem(`vc-pref-${key}`); return raw != null ? (JSON.parse(raw) as T) : fallback; } catch { return fallback; }
}
export function setPref<T>(key: string, value: T) {
  try { localStorage.setItem(`vc-pref-${key}`, JSON.stringify(value)); } catch { /* ignore */ }
}

// Today as YYYY-MM-DD (for date-input min, so past dates can't be chosen).
export function todayISO(): string {
  const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}

export function useContactDefaults() {
  const [defaults, setDefaults] = useState<ContactDefaults | null>(null);

  useEffect(() => {
    let cancelled = false;
    // Prefer the signed-in member; fall back to remembered guest details.
    fetch("/api/account/me")
      .then(r => r.json())
      .then(d => {
        if (cancelled) return;
        const c = d?.customer;
        if (c && c.email) {
          setDefaults({ name: c.name || "", email: c.email || "", phone: c.phone || "", member: true });
        } else {
          const local = readLocal();
          setDefaults(local ? { ...local, member: false } : { name: "", email: "", phone: "", member: false });
        }
      })
      .catch(() => {
        if (cancelled) return;
        const local = readLocal();
        setDefaults(local ? { ...local, member: false } : { name: "", email: "", phone: "", member: false });
      });
    return () => { cancelled = true; };
  }, []);

  return { defaults, remember: rememberContact };
}
