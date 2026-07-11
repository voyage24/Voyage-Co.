"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export type CustomerRow = {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  tier: string;
  bookings: number;
  createdAt: string | Date;
  lastLoginAt: string | Date | null;
};

export default function CustomersList({ customers }: { customers: CustomerRow[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  const shown = customers.filter(c => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return c.email.toLowerCase().includes(q) || (c.name ?? "").toLowerCase().includes(q);
  });

  const setTier = async (id: string, tier: string) => {
    setBusy(id);
    await fetch(`/api/admin/customers/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tier }) });
    setBusy(null);
    router.refresh();
  };

  const remove = async (id: string, email: string) => {
    if (!confirm(`Delete the account for ${email}? Their bookings are kept but unlinked.`)) return;
    setBusy(id);
    await fetch(`/api/admin/customers/${id}`, { method: "DELETE" });
    setBusy(null);
    router.refresh();
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search name or email…"
          className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full sm:w-72"
        />
        <span className="text-xs text-gray-500">{shown.length} {shown.length === 1 ? "customer" : "customers"}</span>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-left text-gray-500">
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Phone</th>
              <th className="px-4 py-3 font-medium">Tier</th>
              <th className="px-4 py-3 font-medium">Bookings</th>
              <th className="px-4 py-3 font-medium">Joined</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {shown.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">No customers yet.</td></tr>
            )}
            {shown.map(c => (
              <tr key={c.id} className="border-b border-gray-100 last:border-0">
                <td className="px-4 py-3"><a href={`/admin/customers/${c.id}`} className="text-gray-900 font-medium hover:text-blue-600 hover:underline">{c.name || "View profile"}</a></td>
                <td className="px-4 py-3 text-gray-800"><a href={`mailto:${c.email}`} className="text-blue-600 hover:underline">{c.email}</a></td>
                <td className="px-4 py-3 text-gray-500">{c.phone || "—"}</td>
                <td className="px-4 py-3">
                  <select value={c.tier} disabled={busy === c.id} onChange={e => setTier(c.id, e.target.value)} className="border border-gray-300 rounded-md px-2 py-1 text-xs bg-white capitalize">
                    <option value="member">Member</option>
                    <option value="silver">Silver</option>
                    <option value="gold">Gold</option>
                  </select>
                </td>
                <td className="px-4 py-3 text-gray-800">{c.bookings}</td>
                <td className="px-4 py-3 text-gray-500">{new Date(c.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-right">
                  <button disabled={busy === c.id} onClick={() => remove(c.id, c.email)} className="text-red-600 hover:text-red-800 disabled:opacity-50">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
