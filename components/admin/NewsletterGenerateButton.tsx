"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewsletterGenerateButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleClick = async () => {
    setLoading(true);
    setError("");
    const res = await fetch("/api/admin/newsletter/generate", { method: "POST" });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (res.ok && data.id) {
      router.push(`/admin/newsletter/${data.id}`);
    } else {
      setError(data.error ?? "Could not generate draft.");
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        onClick={handleClick}
        disabled={loading}
        className="px-4 py-2 bg-gray-900 hover:bg-gray-800 disabled:opacity-50 text-white text-sm font-medium rounded-md"
      >
        {loading ? "Generating…" : "Generate this week's draft"}
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
