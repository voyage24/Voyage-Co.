"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Admin = { id: string; email: string; createdAt: string | Date; lastLoginAt: string | Date | null };

export default function AccountSettings({ admins, currentId }: { admins: Admin[]; currentId: string }) {
  const router = useRouter();

  // Change password
  const [cur, setCur] = useState("");
  const [next, setNext] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwLoading, setPwLoading] = useState(false);
  const [pwMsg, setPwMsg] = useState("");
  const [pwErr, setPwErr] = useState("");

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwMsg(""); setPwErr("");
    if (next !== confirmPw) { setPwErr("New passwords do not match"); return; }
    setPwLoading(true);
    const res = await fetch("/api/admin/account/password", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword: cur, newPassword: next }),
    });
    const data = await res.json().catch(() => ({}));
    setPwLoading(false);
    if (res.ok) { setPwMsg("Password updated."); setCur(""); setNext(""); setConfirmPw(""); }
    else setPwErr(data.error ?? "Could not update password.");
  };

  // Add admin
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [addLoading, setAddLoading] = useState(false);
  const [addMsg, setAddMsg] = useState("");
  const [addErr, setAddErr] = useState("");

  const addAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddMsg(""); setAddErr("");
    setAddLoading(true);
    const res = await fetch("/api/admin/account/admins", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password: pw }),
    });
    const data = await res.json().catch(() => ({}));
    setAddLoading(false);
    if (res.ok) { setAddMsg(`Added ${email.trim().toLowerCase()}.`); setEmail(""); setPw(""); router.refresh(); }
    else setAddErr(data.error ?? "Could not add admin.");
  };

  const removeAdmin = async (id: string, addr: string) => {
    if (!window.confirm(`Remove admin ${addr}? They will lose access immediately.`)) return;
    await fetch("/api/admin/account/admins", {
      method: "DELETE", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    router.refresh();
  };

  const input = "w-full border border-gray-300 rounded-md px-3 py-2 text-sm";

  return (
    <div className="space-y-6 max-w-xl">
      <section className="border border-gray-200 rounded-lg p-5 bg-white">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">Change your password</h2>
        <form onSubmit={changePassword} className="space-y-3">
          <input type="password" value={cur} onChange={e => setCur(e.target.value)} placeholder="Current password" required className={input} />
          <input type="password" value={next} onChange={e => setNext(e.target.value)} placeholder="New password (min 8 characters)" required className={input} />
          <input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} placeholder="Confirm new password" required className={input} />
          <div className="flex items-center gap-3">
            <button type="submit" disabled={pwLoading} className="px-4 py-2 bg-gray-900 hover:bg-gray-800 disabled:opacity-50 text-white text-sm font-medium rounded-md">
              {pwLoading ? "Updating…" : "Update password"}
            </button>
            {pwMsg && <span className="text-sm text-emerald-700">{pwMsg}</span>}
            {pwErr && <span className="text-sm text-red-600">{pwErr}</span>}
          </div>
        </form>
      </section>

      <section className="border border-gray-200 rounded-lg p-5 bg-white">
        <h2 className="text-sm font-semibold text-gray-900 mb-1">Admin team</h2>
        <p className="text-xs text-gray-500 mb-4">Add colleagues who should have full access to this console.</p>

        <div className="divide-y divide-gray-100 border border-gray-100 rounded-md mb-4">
          {admins.map(a => (
            <div key={a.id} className="flex items-center justify-between px-3 py-2 gap-3">
              <div className="min-w-0">
                <p className="text-sm text-gray-800 truncate">{a.email} {a.id === currentId && <span className="text-xs text-gray-400">(you)</span>}</p>
                <p className="text-xs text-gray-400">Last sign-in: {a.lastLoginAt ? new Date(a.lastLoginAt).toLocaleString() : "—"}</p>
              </div>
              {a.id !== currentId && (
                <button onClick={() => removeAdmin(a.id, a.email)} className="text-xs text-red-600 hover:text-red-800 shrink-0">Remove</button>
              )}
            </div>
          ))}
        </div>

        <form onSubmit={addAdmin} className="space-y-3">
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="colleague@voyagesco.com" required className={input} />
          <input type="password" value={pw} onChange={e => setPw(e.target.value)} placeholder="Temporary password (min 8 characters)" required className={input} />
          <div className="flex items-center gap-3">
            <button type="submit" disabled={addLoading} className="px-4 py-2 border border-gray-300 hover:bg-gray-50 disabled:opacity-50 text-gray-700 text-sm font-medium rounded-md">
              {addLoading ? "Adding…" : "Add admin"}
            </button>
            {addMsg && <span className="text-sm text-emerald-700">{addMsg}</span>}
            {addErr && <span className="text-sm text-red-600">{addErr}</span>}
          </div>
        </form>
      </section>
    </div>
  );
}
