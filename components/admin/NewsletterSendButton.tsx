"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewsletterSendButton({ id, subscriberCount }: { id: string; subscriberCount: number }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleClick = async () => {
    if (!confirm(`Send this newsletter to all ${subscriberCount} subscriber${subscriberCount === 1 ? "" : "s"}? This cannot be undone.`)) {
      return;
    }
    setLoading(true);
    setError("");
    setMessage("");
    const res = await fetch(`/api/admin/newsletter/${id}/send`, { method: "POST" });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (res.ok) {
      setMessage(`Sent to ${data.sent} of ${data.total} subscribers.`);
      router.refresh();
    } else {
      setError(data.error ?? "Send failed.");
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        onClick={handleClick}
        disabled={loading || subscriberCount === 0}
        className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white text-sm font-medium rounded-md"
      >
        {loading ? "Sending…" : `Send to ${subscriberCount} subscriber${subscriberCount === 1 ? "" : "s"}`}
      </button>
      {message && <p className="text-sm text-emerald-700">{message}</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
