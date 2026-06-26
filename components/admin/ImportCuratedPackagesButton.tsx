"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ImportCuratedPackagesButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleClick = async () => {
    setLoading(true);
    setMessage("");
    const res = await fetch("/api/admin/packages/import-curated", { method: "POST" });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (res.ok) {
      setMessage(data.added > 0 ? `Added ${data.added} new journeys.` : "Already up to date — nothing new to add.");
      router.refresh();
    } else {
      setMessage(data.error ?? "Import failed.");
    }
  };

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleClick}
        disabled={loading}
        className="px-4 py-2 border border-gray-300 hover:bg-gray-50 disabled:opacity-50 text-gray-700 text-sm font-medium rounded-md"
      >
        {loading ? "Importing…" : "Import Curated Worldwide Journeys"}
      </button>
      {message && <p className="text-sm text-gray-500">{message}</p>}
    </div>
  );
}
