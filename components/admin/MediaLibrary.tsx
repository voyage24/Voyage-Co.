"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export type MediaItem = { url: string; pathname: string; size: number; uploadedAt: string | Date };

export default function MediaLibrary({ media }: { media: MediaItem[] }) {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const upload = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      await fetch("/api/admin/upload", { method: "POST", body: form });
      router.refresh();
    } finally {
      setUploading(false);
    }
  };

  const copy = async (url: string) => {
    await navigator.clipboard.writeText(url).catch(() => {});
    setCopied(url);
    setTimeout(() => setCopied(c => (c === url ? null : c)), 1500);
  };

  const remove = async (url: string) => {
    if (!confirm("Delete this image? Anything still using it will show a broken image.")) return;
    setBusy(url);
    await fetch("/api/admin/media", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url }) });
    setBusy(null);
    router.refresh();
  };

  return (
    <div>
      <label className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-md cursor-pointer mb-6">
        {uploading ? "Uploading…" : "Upload image"}
        <input type="file" accept="image/*" className="hidden" disabled={uploading}
          onChange={e => upload(e.target.files?.[0])} />
      </label>

      {media.length === 0 ? (
        <p className="text-sm text-gray-400 border border-dashed border-gray-200 rounded-md p-10 text-center">
          No media yet. Upload an image to get started.
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {media.map(m => (
            <div key={m.url} className="border border-gray-200 rounded-lg overflow-hidden bg-white">
              <div className="relative aspect-[4/3] bg-gray-50">
                <Image src={m.url} alt={m.pathname} fill sizes="200px" className="object-cover" />
              </div>
              <div className="p-2.5">
                <p className="text-[11px] text-gray-500 truncate" title={m.pathname}>{m.pathname}</p>
                <p className="text-[10px] text-gray-400 mb-2">{(m.size / 1024).toFixed(0)} KB</p>
                <div className="flex items-center justify-between">
                  <button onClick={() => copy(m.url)} className="text-xs text-blue-600 hover:underline">
                    {copied === m.url ? "Copied!" : "Copy URL"}
                  </button>
                  <button onClick={() => remove(m.url)} disabled={busy === m.url} className="text-xs text-red-600 hover:text-red-800 disabled:opacity-50">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
