"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ImageUploadField from "@/components/admin/ImageUploadField";
import { FONT_OPTIONS, type SiteSettings } from "@/lib/site-settings";

const COLORS: { key: keyof SiteSettings; label: string }[] = [
  { key: "color.page", label: "Background" },
  { key: "color.panel", label: "Card background" },
  { key: "color.ink", label: "Text" },
  { key: "color.inkMuted", label: "Muted text" },
  { key: "color.gold", label: "Accent (gold)" },
  { key: "color.line", label: "Borders" },
];

const CONTACT: { key: keyof SiteSettings; label: string; placeholder?: string }[] = [
  { key: "contact.phone", label: "Phone (display)", placeholder: "+91 99199 10213" },
  { key: "contact.whatsapp", label: "WhatsApp number (digits only)", placeholder: "919919910213" },
  { key: "contact.email", label: "Email", placeholder: "hello@voyagesco.com" },
  { key: "social.instagram", label: "Instagram URL" },
  { key: "social.pinterest", label: "Pinterest URL" },
  { key: "social.linkedin", label: "LinkedIn URL" },
];

const input = "w-full border border-gray-300 rounded-md px-3 py-2 text-sm";
const sectionTitle = "text-sm font-semibold text-gray-900 mb-3";

export default function AppearanceForm({ initial }: { initial: SiteSettings }) {
  const router = useRouter();
  const [s, setS] = useState<SiteSettings>(initial);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const set = (key: keyof SiteSettings, value: string) => setS(prev => ({ ...prev, [key]: value }));

  const save = async () => {
    setSaving(true); setMsg("");
    const res = await fetch("/api/admin/settings", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(s),
    });
    setSaving(false);
    if (res.ok) { setMsg("Saved. Changes are live on the website."); router.refresh(); }
    else setMsg("Could not save.");
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <section className="border border-gray-200 rounded-lg p-5 bg-white">
        <h2 className={sectionTitle}>Brand colours</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {COLORS.map(c => (
            <div key={c.key} className="flex items-center justify-between border border-gray-200 rounded-md px-3 py-2">
              <span className="text-sm text-gray-700">{c.label}</span>
              <div className="flex items-center gap-2">
                <input type="color" value={s[c.key] || "#000000"} onChange={e => set(c.key, e.target.value)} className="w-8 h-8 rounded border border-gray-300 cursor-pointer" />
                <input value={s[c.key]} onChange={e => set(c.key, e.target.value)} className="w-20 border border-gray-300 rounded-md px-2 py-1 text-xs font-mono" />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="border border-gray-200 rounded-lg p-5 bg-white">
        <h2 className={sectionTitle}>Fonts</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Headings</label>
            <select value={s["font.heading"]} onChange={e => set("font.heading", e.target.value)} className={input}>
              {FONT_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Body text</label>
            <select value={s["font.body"]} onChange={e => set("font.body", e.target.value)} className={input}>
              {FONT_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-2">Preview after saving — fonts load from Google Fonts.</p>
      </section>

      <section className="border border-gray-200 rounded-lg p-5 bg-white">
        <h2 className={sectionTitle}>Logo</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ImageUploadField label="Logo for dark areas (white wordmark)" value={s["logo.light"]} onChange={url => set("logo.light", url)} />
          <ImageUploadField label="Logo for light areas (dark wordmark)" value={s["logo.dark"]} onChange={url => set("logo.dark", url)} />
        </div>
      </section>

      <section className="border border-gray-200 rounded-lg p-5 bg-white">
        <h2 className={sectionTitle}>Contact &amp; social</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {CONTACT.map(f => (
            <div key={f.key}>
              <label className="block text-xs text-gray-500 mb-1">{f.label}</label>
              <input value={s[f.key]} onChange={e => set(f.key, e.target.value)} placeholder={f.placeholder} className={input} />
            </div>
          ))}
        </div>
      </section>

      <section className="border border-gray-200 rounded-lg p-5 bg-white">
        <h2 className={sectionTitle}>Homepage hero text</h2>
        <p className="text-xs text-gray-400 mb-3">Leave blank to use the built-in (translated) copy.</p>
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Headline</label>
            <input value={s["hero.headline"]} onChange={e => set("hero.headline", e.target.value)} className={input} />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Sub-text</label>
            <textarea rows={2} value={s["hero.subtext"]} onChange={e => set("hero.subtext", e.target.value)} className={input} />
          </div>
        </div>
      </section>

      <div className="flex items-center gap-3">
        <button onClick={save} disabled={saving} className="px-5 py-2.5 bg-gray-900 hover:bg-gray-800 disabled:opacity-50 text-white text-sm font-medium rounded-md">
          {saving ? "Saving…" : "Save appearance"}
        </button>
        {msg && <span className="text-sm text-emerald-700">{msg}</span>}
      </div>
    </div>
  );
}
