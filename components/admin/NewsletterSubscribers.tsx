"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Subscriber = { email: string; createdAt: string | Date };

export default function NewsletterSubscribers({ subscribers }: { subscribers: Subscriber[] }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [adding, setAdding] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busyEmail, setBusyEmail] = useState<string | null>(null);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (adding) return;
    setAdding(true);
    setMessage("");
    setError("");
    const res = await fetch("/api/admin/newsletter/subscribers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json().catch(() => ({}));
    setAdding(false);
    if (res.ok) {
      setMessage(`Added ${email.trim().toLowerCase()}.`);
      setEmail("");
      router.refresh();
    } else {
      setError(data.error ?? "Could not add subscriber.");
    }
  };

  const handleRemove = async (addr: string) => {
    if (!confirm(`Remove ${addr} from the subscriber list?`)) return;
    setBusyEmail(addr);
    await fetch("/api/admin/newsletter/subscribers", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: addr }),
    });
    setBusyEmail(null);
    router.refresh();
  };

  return (
    <div className="border border-gray-200 rounded-lg p-5 bg-white">
      <h2 className="text-sm font-semibold text-gray-900 mb-1">Subscribers ({subscribers.length})</h2>
      <p className="text-xs text-gray-500 mb-4">Add subscribers manually, or remove anyone who should no longer receive the newsletter.</p>

      <form onSubmit={handleAdd} className="flex flex-wrap items-center gap-2 mb-4">
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="name@example.com"
          required
          className="flex-1 min-w-[200px] border border-gray-300 rounded-md px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={adding}
          className="px-4 py-2 bg-gray-900 hover:bg-gray-800 disabled:opacity-50 text-white text-sm font-medium rounded-md"
        >
          {adding ? "Adding…" : "Add subscriber"}
        </button>
      </form>
      {message && <p className="text-sm text-emerald-700 mb-3">{message}</p>}
      {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

      {subscribers.length === 0 ? (
        <p className="text-sm text-gray-400 border border-dashed border-gray-200 rounded-md p-6 text-center">
          No subscribers yet.
        </p>
      ) : (
        <div className="max-h-72 overflow-y-auto border border-gray-100 rounded-md divide-y divide-gray-100">
          {subscribers.map(s => (
            <div key={s.email} className="flex items-center justify-between px-3 py-2 gap-3">
              <span className="text-sm text-gray-800 truncate">{s.email}</span>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-xs text-gray-400">{new Date(s.createdAt).toLocaleDateString()}</span>
                <button
                  onClick={() => handleRemove(s.email)}
                  disabled={busyEmail === s.email}
                  className="text-xs text-red-600 hover:text-red-800 disabled:opacity-50"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
