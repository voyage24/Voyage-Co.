"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type User = { id: string; email: string; name: string | null; role: string; lastLoginAt: string | Date | null };

export default function TeamManager({ users, meId }: { users: User[]; meId: string }) {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", name: "", password: "", role: "staff" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const set = (k: keyof typeof form, v: string) => setForm(f => ({ ...f, [k]: v }));
  const input = "w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900";

  const add = async (e: React.FormEvent) => {
    e.preventDefault(); setError(""); setBusy(true);
    const res = await fetch("/api/admin/users", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (res.ok) { setForm({ email: "", name: "", password: "", role: "staff" }); router.refresh(); }
    else setError(data.error ?? "Could not add user.");
  };
  const remove = async (id: string) => {
    if (!confirm("Remove this admin user?")) return;
    const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    if (!res.ok) { const d = await res.json().catch(() => ({})); alert(d.error ?? "Could not remove."); return; }
    router.refresh();
  };

  return (
    <div className="space-y-8">
      <form onSubmit={add} className="bg-white border border-gray-200 rounded-lg p-5 max-w-xl space-y-3">
        <p className="text-sm font-medium text-gray-900">Add a team member</p>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="text-xs text-gray-500">Email *</label><input className={input} value={form.email} onChange={e => set("email", e.target.value)} /></div>
          <div><label className="text-xs text-gray-500">Name</label><input className={input} value={form.name} onChange={e => set("name", e.target.value)} /></div>
          <div><label className="text-xs text-gray-500">Password * (min 8)</label><input type="password" className={input} value={form.password} onChange={e => set("password", e.target.value)} /></div>
          <div>
            <label className="text-xs text-gray-500">Role</label>
            <select className={input} value={form.role} onChange={e => set("role", e.target.value)}>
              <option value="staff">Staff</option>
              <option value="owner">Owner</option>
            </select>
          </div>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button disabled={busy} className="px-4 py-2 bg-gray-900 hover:bg-gray-800 disabled:opacity-50 text-white text-sm font-medium rounded-md">{busy ? "Adding…" : "Add user"}</button>
      </form>

      <div className="space-y-2">
        {users.map(u => (
          <div key={u.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 border border-gray-200 rounded-lg bg-white px-4 py-3">
            <span className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded bg-gray-100 text-gray-600 capitalize">{u.role}</span>
            <span className="text-sm font-medium text-gray-900">{u.name || u.email}</span>
            <span className="text-xs text-gray-400">{u.email}</span>
            {u.id === meId && <span className="text-[10px] text-emerald-700">you</span>}
            <span className="text-xs text-gray-400 ml-auto">{u.lastLoginAt ? `last login ${new Date(u.lastLoginAt).toLocaleDateString()}` : "never"}</span>
            {u.id !== meId && <button onClick={() => remove(u.id)} className="text-xs text-red-600 hover:text-red-700">Remove</button>}
          </div>
        ))}
      </div>
    </div>
  );
}
