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

  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkText, setBulkText] = useState("");
  const [importing, setImporting] = useState(false);
  const [bulkMessage, setBulkMessage] = useState("");

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setBulkText(prev => (prev ? prev + "\n" : "") + String(reader.result ?? ""));
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (importing || !bulkText.trim()) return;
    setImporting(true);
    setBulkMessage("");
    const res = await fetch("/api/admin/newsletter/subscribers/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emails: bulkText }),
    });
    const data = await res.json().catch(() => ({}));
    setImporting(false);
    if (res.ok) {
      setBulkMessage(`Added ${data.added}. Skipped ${data.duplicates} already subscribed${data.invalid ? `, ${data.invalid} invalid` : ""}.`);
      setBulkText("");
      router.refresh();
    } else {
      setBulkMessage(data.error ?? "Import failed.");
    }
  };

  const handleExport = () => {
    const header = "email,subscribed_at\n";
    const body = subscribers
      .map(s => `${s.email},${new Date(s.createdAt).toISOString()}`)
      .join("\n");
    const blob = new Blob([header + body], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `voyages-co-subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

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
      <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
        <h2 className="text-sm font-semibold text-gray-900">Subscribers ({subscribers.length})</h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setBulkOpen(o => !o)}
            className="text-xs px-3 py-1.5 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            {bulkOpen ? "Close import" : "Bulk import"}
          </button>
          <button
            type="button"
            onClick={handleExport}
            disabled={subscribers.length === 0}
            className="text-xs px-3 py-1.5 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Export CSV
          </button>
        </div>
      </div>
      <p className="text-xs text-gray-500 mb-4">Add subscribers manually, or remove anyone who should no longer receive the newsletter.</p>

      {bulkOpen && (
        <div className="border border-gray-200 rounded-md p-3 mb-4 bg-gray-50">
          <p className="text-xs text-gray-600 mb-2">
            Paste emails (separated by new lines, commas or spaces), or upload a .csv/.txt file. Duplicates and invalid entries are skipped.
          </p>
          <textarea
            value={bulkText}
            onChange={e => setBulkText(e.target.value)}
            rows={5}
            placeholder={"alice@example.com\nbob@example.com"}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm font-mono"
          />
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <input
              type="file"
              accept=".csv,.txt,text/csv,text/plain"
              onChange={e => handleFile(e.target.files?.[0])}
              className="text-xs text-gray-600"
            />
            <button
              type="button"
              onClick={handleImport}
              disabled={importing || !bulkText.trim()}
              className="px-4 py-2 bg-gray-900 hover:bg-gray-800 disabled:opacity-50 text-white text-sm font-medium rounded-md ml-auto"
            >
              {importing ? "Importing…" : "Import"}
            </button>
          </div>
          {bulkMessage && <p className="text-sm text-gray-700 mt-2">{bulkMessage}</p>}
        </div>
      )}

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
