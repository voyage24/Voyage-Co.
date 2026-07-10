"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, X } from "lucide-react";
import { ADMIN_ROLES } from "@/lib/admin/roles";

type User = { id: string; email: string; name: string | null; role: string; lastLoginAt: string | Date | null };

const ROLE_STYLE: Record<string, string> = {
  owner: "bg-amber-100 text-amber-800",
  manager: "bg-indigo-100 text-indigo-700",
  staff: "bg-gray-100 text-gray-600",
  trainee: "bg-emerald-100 text-emerald-700",
};

export default function TeamManager({ users, meId }: { users: User[]; meId: string }) {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", name: "", password: "", role: "staff" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [edit, setEdit] = useState({ name: "", role: "staff", password: "" });
  const [editError, setEditError] = useState("");
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

  const startEdit = (u: User) => {
    setEditId(u.id);
    setEdit({ name: u.name || "", role: u.role, password: "" });
    setEditError("");
  };

  const saveEdit = async (id: string) => {
    setBusy(true); setEditError("");
    const res = await fetch(`/api/admin/users/${id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: edit.name, role: edit.role, password: edit.password || undefined }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (res.ok) { setEditId(null); router.refresh(); }
    else setEditError(data.error ?? "Could not save.");
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
              {ADMIN_ROLES.map(r => <option key={r} value={r} className="capitalize">{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
            </select>
          </div>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button disabled={busy} className="px-4 py-2 bg-gray-900 hover:bg-gray-800 disabled:opacity-50 text-white text-sm font-medium rounded-md">{busy ? "Adding…" : "Add user"}</button>
      </form>

      <div className="space-y-2">
        {users.map(u => (
          <div key={u.id} className="border border-gray-200 rounded-lg bg-white">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-3">
              <span className={`text-[10px] uppercase tracking-wide px-2 py-0.5 rounded capitalize ${ROLE_STYLE[u.role] ?? ROLE_STYLE.staff}`}>{u.role}</span>
              <span className="text-sm font-medium text-gray-900">{u.name || u.email}</span>
              <span className="text-xs text-gray-400">{u.email}</span>
              {u.id === meId && <span className="text-[10px] text-emerald-700">you</span>}
              <span className="text-xs text-gray-400 ml-auto">{u.lastLoginAt ? `last login ${new Date(u.lastLoginAt).toLocaleDateString()}` : "never"}</span>
              <button onClick={() => editId === u.id ? setEditId(null) : startEdit(u)} className="inline-flex items-center gap-1 text-xs text-gray-600 hover:text-gray-900">
                {editId === u.id ? <X size={12} /> : <Pencil size={12} />} {editId === u.id ? "Close" : "Edit"}
              </button>
              {u.id !== meId && <button onClick={() => remove(u.id)} className="text-xs text-red-600 hover:text-red-700">Remove</button>}
            </div>

            {editId === u.id && (
              <div className="border-t border-gray-100 px-4 py-3 bg-gray-50 rounded-b-lg">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl">
                  <div>
                    <label className="text-xs text-gray-500">Name</label>
                    <input className={input} value={edit.name} onChange={e => setEdit(p => ({ ...p, name: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Role</label>
                    <select className={input} value={edit.role} onChange={e => setEdit(p => ({ ...p, role: e.target.value }))} disabled={u.id === meId}>
                      {ADMIN_ROLES.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
                    </select>
                    {u.id === meId && <p className="text-[10px] text-gray-400 mt-0.5">Another owner must change your role.</p>}
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">New password (optional)</label>
                    <input type="password" className={input} value={edit.password} onChange={e => setEdit(p => ({ ...p, password: e.target.value }))} placeholder="Leave blank to keep" />
                  </div>
                </div>
                {editError && <p className="text-sm text-red-600 mt-2">{editError}</p>}
                <button onClick={() => saveEdit(u.id)} disabled={busy} className="mt-3 px-4 py-2 bg-gray-900 hover:bg-gray-800 disabled:opacity-50 text-white text-sm font-medium rounded-md">{busy ? "Saving…" : "Save changes"}</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
