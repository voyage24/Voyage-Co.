"use client";

import { useState } from "react";

export default function ImageListUploadField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string[];
  onChange: (urls: string[]) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [urlInput, setUrlInput] = useState("");

  const MAX_BYTES = 8 * 1024 * 1024;

  const uploadOne = async (file: File): Promise<string> => {
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/admin/upload", { method: "POST", body: form });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.url) throw new Error(data.error || `${file.name}: upload failed`);
    return data.url;
  };

  const handleFiles = async (files: FileList) => {
    setError("");
    const list = Array.from(files);
    const bad = list.find(f => !f.type.startsWith("image/"));
    if (bad) { setError("Please choose only image files."); return; }
    const tooBig = list.find(f => f.size > MAX_BYTES);
    if (tooBig) { setError(`${tooBig.name} is too large — keep each image under 8 MB.`); return; }

    setUploading(true);
    try {
      const urls = await Promise.all(list.map(uploadOne));
      onChange([...value, ...urls]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const addUrl = () => {
    const url = urlInput.trim();
    if (!url) return;
    onChange([...value, url]);
    setUrlInput("");
  };

  const remove = (i: number) => onChange(value.filter((_, idx) => idx !== i));

  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>

      {value.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {value.map((url, i) => (
            <div key={i} className="relative group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="h-20 w-28 rounded border border-gray-200 object-cover" />
              <button
                type="button"
                onClick={() => remove(i)}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-gray-900 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Remove image"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2 items-start">
        <input
          type="text"
          value={urlInput}
          onChange={e => setUrlInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addUrl(); } }}
          placeholder="Paste an image URL and press Enter…"
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
        />
        <label className="px-3 py-2 border border-gray-300 rounded-md text-sm cursor-pointer hover:bg-gray-50 whitespace-nowrap">
          {uploading ? "Uploading…" : "Upload"}
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            disabled={uploading}
            onChange={e => {
              if (e.target.files?.length) handleFiles(e.target.files);
              e.target.value = "";
            }}
          />
        </label>
      </div>
      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
    </div>
  );
}
