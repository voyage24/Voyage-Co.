"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SyncCatalogButton({ endpoint, label }: { endpoint: string; label: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleClick = async () => {
    setLoading(true);
    setMessage("");
    const res = await fetch(endpoint, { method: "POST" });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (res.ok) {
      setMessage(data.added > 0 ? `Added ${data.added} missing entries.` : "Already up to date — nothing missing.");
      router.refresh();
    } else {
      setMessage(data.error ?? "Sync failed.");
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        onClick={handleClick}
        disabled={loading}
        className="px-4 py-2 border border-gray-300 hover:bg-gray-50 disabled:opacity-50 text-gray-700 text-sm font-medium rounded-md"
      >
        {loading ? "Syncing…" : label}
      </button>
      {message && <p className="text-sm text-gray-500">{message}</p>}
    </div>
  );
}
