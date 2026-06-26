"use client";

import { useState } from "react";

export default function SetupForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/admin/setup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    setLoading(false);
    if (res.ok) {
      setDone(true);
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Setup failed");
    }
  };

  if (done) {
    return (
      <div className="w-full max-w-sm bg-white rounded-lg border border-gray-200 shadow-sm p-8 text-center space-y-3">
        <h1 className="text-xl font-semibold text-gray-900">All set</h1>
        <p className="text-sm text-gray-600">Your admin account and content catalog are ready.</p>
        <a href="/admin/login" className="inline-block mt-2 px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-md">
          Go to login
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm bg-white rounded-lg border border-gray-200 shadow-sm p-8 space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">First-time Setup</h1>
        <p className="text-sm text-gray-500 mt-1">Create your admin login. This page only works once.</p>
      </div>
      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">{error}</p>
      )}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Password (min 8 characters)</label>
        <input
          type="password"
          required
          minLength={8}
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full py-2.5 bg-gray-900 hover:bg-gray-800 disabled:opacity-50 text-white text-sm font-medium rounded-md transition-colors"
      >
        {loading ? "Setting up…" : "Create admin account"}
      </button>
    </form>
  );
}
