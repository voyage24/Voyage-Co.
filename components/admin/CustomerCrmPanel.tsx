"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Note = { id: string; body: string; author: string | null; createdAt: string };
type Task = { id: string; title: string; dueAt: string; done: boolean };

const fmt = (iso: string) => new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(new Date(iso));
const inDays = (n: number) => { const d = new Date(); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); };

export default function CustomerCrmPanel({ email, initialNotes, initialFollowups }: { email: string; initialNotes: Note[]; initialFollowups: Task[] }) {
  const router = useRouter();
  const [noteText, setNoteText] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDue, setTaskDue] = useState(inDays(3));
  const [busy, setBusy] = useState(false);

  const addNote = async () => {
    if (!noteText.trim() || busy) return;
    setBusy(true);
    await fetch("/api/admin/customers/note", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, body: noteText }) });
    setNoteText(""); setBusy(false); router.refresh();
  };
  const delNote = async (id: string) => { await fetch(`/api/admin/customers/note?id=${id}`, { method: "DELETE" }); router.refresh(); };

  const addTask = async () => {
    if (!taskTitle.trim() || busy) return;
    setBusy(true);
    await fetch("/api/admin/customers/followup", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, title: taskTitle, dueAt: taskDue }) });
    setTaskTitle(""); setTaskDue(inDays(3)); setBusy(false); router.refresh();
  };
  const toggleTask = async (id: string, done: boolean) => { await fetch("/api/admin/customers/followup", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, done }) }); router.refresh(); };
  const delTask = async (id: string) => { await fetch(`/api/admin/customers/followup?id=${id}`, { method: "DELETE" }); router.refresh(); };

  const overdue = (iso: string) => !isNaN(Date.parse(iso)) && new Date(iso) < new Date(new Date().toDateString());

  return (
    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Follow-ups */}
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Follow-ups</h2>
        <div className="space-y-1.5 mb-3">
          {initialFollowups.length === 0 && <p className="text-xs text-gray-400">No follow-ups.</p>}
          {initialFollowups.map(t => (
            <div key={t.id} className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={t.done} onChange={() => toggleTask(t.id, !t.done)} className="rounded" />
              <span className={`flex-1 ${t.done ? "line-through text-gray-400" : "text-gray-800"}`}>{t.title}</span>
              <span className={`text-[11px] ${!t.done && overdue(t.dueAt) ? "text-red-600 font-medium" : "text-gray-400"}`}>{fmt(t.dueAt)}</span>
              <button onClick={() => delTask(t.id)} className="text-gray-300 hover:text-red-500 text-xs">✕</button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input value={taskTitle} onChange={e => setTaskTitle(e.target.value)} placeholder="e.g. Chase quote reply" className="flex-1 min-w-0 rounded-md border border-gray-300 px-2.5 py-1.5 text-sm" />
          <input type="date" value={taskDue} onChange={e => setTaskDue(e.target.value)} className="rounded-md border border-gray-300 px-2 py-1.5 text-sm" />
          <button onClick={addTask} disabled={busy} className="rounded-md bg-gray-900 text-white px-3 py-1.5 text-sm hover:bg-gray-700 disabled:opacity-50">Add</button>
        </div>
      </div>

      {/* Notes */}
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Notes</h2>
        <div className="space-y-2 mb-3 max-h-40 overflow-y-auto">
          {initialNotes.length === 0 && <p className="text-xs text-gray-400">No notes yet.</p>}
          {initialNotes.map(n => (
            <div key={n.id} className="text-sm text-gray-700 bg-gray-50 rounded-md p-2">
              <p className="whitespace-pre-wrap">{n.body}</p>
              <div className="mt-1 flex items-center justify-between text-[11px] text-gray-400">
                <span>{n.author || "—"} · {fmt(n.createdAt)}</span>
                <button onClick={() => delNote(n.id)} className="hover:text-red-500">delete</button>
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input value={noteText} onChange={e => setNoteText(e.target.value)} onKeyDown={e => e.key === "Enter" && addNote()} placeholder="Add a note…" className="flex-1 min-w-0 rounded-md border border-gray-300 px-2.5 py-1.5 text-sm" />
          <button onClick={addNote} disabled={busy} className="rounded-md bg-gray-900 text-white px-3 py-1.5 text-sm hover:bg-gray-700 disabled:opacity-50">Add</button>
        </div>
      </div>
    </div>
  );
}
