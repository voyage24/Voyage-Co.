"use client";

import { useState } from "react";

export default function ImageUploadField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
}) {
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file: File) => {
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: form });
      const data = await res.json();
      if (data.url) onChange(data.url);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      <div className="flex gap-2 items-start">
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="Paste an image URL…"
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
        />
        <label className="px-3 py-2 border border-gray-300 rounded-md text-sm cursor-pointer hover:bg-gray-50 whitespace-nowrap">
          {uploading ? "Uploading…" : "Upload"}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            disabled={uploading}
            onChange={e => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
        </label>
      </div>
      {value && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={value} alt="" className="mt-2 h-24 w-auto rounded border border-gray-200 object-cover" />
      )}
    </div>
  );
}
