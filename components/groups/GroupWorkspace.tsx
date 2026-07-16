"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Luggage, Vote, Wallet, MessageCircle, Images, Users, Link2, Check, Trash2,
  Heart, Send, Plus, Loader2, ArrowLeft, ArrowRight, Plane, Ship, TrainFront, Sparkles, BedDouble, Package, ImagePlus,
  Utensils, ShoppingBag, Ticket, Car, Receipt, Gauge, Pencil, Download,
} from "lucide-react";
import Price from "@/components/ui/Price";
import { EXPENSE_CATEGORIES, categorizeExpense } from "@/lib/group/expense-category";
import { CURRENCIES } from "@/lib/currency";
import { useCurrency } from "@/components/providers/CurrencyProvider";
import { downloadCsv } from "@/lib/csv";
import type { GroupSnapshot } from "@/lib/group/access";

const CAT_ICON: Record<string, typeof Plane> = { Hotels: BedDouble, Flights: Plane, Food: Utensils, Shopping: ShoppingBag, Activities: Ticket, Transport: Car, Other: Receipt };
const symbolOf = (code: string) => CURRENCIES.find(c => c.code === code)?.symbol || code;

type Snap = NonNullable<GroupSnapshot>;
type Tab = "bookings" | "vote" | "expenses" | "chat" | "photos" | "members";

const TYPE_ICON: Record<string, typeof Plane> = { flight: Plane, cruise: Ship, train: TrainFront, experience: Sparkles, package: Package, hotel: BedDouble };

export default function GroupWorkspace({ initial, meId }: { initial: Snap; meId: string }) {
  const router = useRouter();
  const [snap, setSnap] = useState<Snap>(initial);
  const [tab, setTab] = useState<Tab>("vote");
  const [copied, setCopied] = useState(false);

  const refresh = () => fetch(`/api/groups/${snap.id}`).then(r => r.json()).then(d => { if (d.ok) setSnap(d.group); }).catch(() => {});
  useEffect(() => { const t = setInterval(refresh, 5000); return () => clearInterval(t); }, [snap.id]);

  const copyInvite = async () => {
    try { await navigator.clipboard.writeText(snap.inviteUrl); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch { /* ignore */ }
  };

  const TABS: { id: Tab; label: string; Icon: typeof Vote; n?: number }[] = [
    { id: "vote", label: "Vote", Icon: Vote, n: snap.shortlist.length },
    { id: "expenses", label: "Expenses", Icon: Wallet, n: snap.expenses.length },
    { id: "chat", label: "Chat", Icon: MessageCircle, n: snap.messages.length },
    { id: "photos", label: "Photos", Icon: Images, n: snap.photos.length },
    { id: "bookings", label: "Bookings", Icon: Luggage, n: snap.bookings.length },
    { id: "members", label: "Members", Icon: Users, n: snap.members.length },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-28">
      <Link href="/groups" className="inline-flex items-center gap-1.5 text-xs tracking-[0.12em] uppercase text-ink-muted link-underline mb-4"><ArrowLeft size={13} /> All group trips</Link>
      <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
        <div>
          <h1 className="font-serif text-3xl font-light text-ink">{snap.title}</h1>
          {snap.destination && <p className="text-sm text-ink-muted font-light mt-1">{snap.destination}</p>}
          <div className="flex -space-x-2 mt-3">
            {snap.members.slice(0, 6).map(m => (
              <span key={m.customerId} title={m.name} className="w-8 h-8 rounded-full bg-gold/15 border border-page text-gold text-xs flex items-center justify-center">{m.name.charAt(0).toUpperCase()}</span>
            ))}
            {snap.members.length > 6 && <span className="w-8 h-8 rounded-full bg-panel-soft border border-page text-ink-muted text-[10px] flex items-center justify-center">+{snap.members.length - 6}</span>}
          </div>
        </div>
        <button onClick={copyInvite} className="inline-flex items-center gap-2 px-4 py-2.5 border border-gold/50 text-gold text-xs tracking-[0.14em] uppercase rounded-sm hover:bg-gold/10 transition-colors">
          {copied ? <><Check size={14} /> Link copied</> : <><Link2 size={14} /> Invite link</>}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto border-b border-line mb-6 -mx-1 px-1">
        {TABS.map(({ id, label, Icon, n }) => (
          <button key={id} onClick={() => setTab(id)} className={`shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs tracking-[0.1em] uppercase border-b-2 -mb-px transition-colors ${tab === id ? "border-gold text-ink" : "border-transparent text-ink-muted hover:text-ink"}`}>
            <Icon size={14} /> {label}{typeof n === "number" && n > 0 && <span className="text-ink-faint">({n})</span>}
          </button>
        ))}
      </div>

      {tab === "vote" && <VoteTab snap={snap} onChange={refresh} />}
      {tab === "expenses" && <ExpensesTab snap={snap} meId={meId} onChange={refresh} />}
      {tab === "chat" && <ChatTab snap={snap} onChange={refresh} />}
      {tab === "photos" && <PhotosTab snap={snap} onChange={refresh} />}
      {tab === "bookings" && <BookingsTab snap={snap} />}
      {tab === "members" && <MembersTab snap={snap} meId={meId} onChange={refresh} copyInvite={copyInvite} copied={copied} onLeave={() => router.push("/groups")} />}
    </div>
  );
}

// ── Vote ─────────────────────────────────────────────────────────────────────
function VoteTab({ snap, onChange }: { snap: Snap; onChange: () => void }) {
  const [busy, setBusy] = useState<string | null>(null);
  const vote = async (itemId: string) => { setBusy(itemId); await fetch(`/api/groups/${snap.id}/shortlist/${itemId}`, { method: "POST" }); await onChange(); setBusy(null); };
  const remove = async (itemId: string) => { if (!confirm("Remove this from the shortlist?")) return; setBusy(itemId); await fetch(`/api/groups/${snap.id}/shortlist/${itemId}`, { method: "DELETE" }); await onChange(); setBusy(null); };

  if (snap.shortlist.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-line p-8 text-center">
        <Vote size={22} className="text-gold mx-auto mb-3" />
        <p className="text-ink font-light mb-1">Nothing to vote on yet</p>
        <p className="text-sm text-ink-muted font-light mb-4">Add stays from the <Link href="/plan" className="text-gold link-underline">Smart Trip Planner</Link> (choose &ldquo;Plan as a group&rdquo;), or add favourites you&apos;ve saved.</p>
      </div>
    );
  }
  const leaderVotes = snap.shortlist[0]?.votes ?? 0;
  return (
    <div className="space-y-3">
      {snap.shortlist.map(s => (
        <div key={s.id} className={`rounded-2xl border bg-panel p-4 ${s.votes > 0 && s.votes === leaderVotes ? "border-gold/50" : "border-line"}`}>
          <div className="flex gap-4">
            {s.image && <Link href={s.href} className="relative w-24 h-20 shrink-0 rounded-xl overflow-hidden bg-vc-950"><img src={s.image} alt={s.title} className="w-full h-full object-cover" loading="lazy" /></Link>}
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <Link href={s.href} className="min-w-0"><p className="text-sm font-medium text-ink hover:text-gold transition-colors line-clamp-2">{s.title}</p></Link>
                {s.votes > 0 && s.votes === leaderVotes && <span className="shrink-0 text-[9px] tracking-[0.14em] uppercase text-gold border border-gold/40 rounded-full px-2 py-0.5">Leading</span>}
              </div>
              {typeof s.price === "number" && <p className="text-sm text-ink mt-1"><Price amount={s.price} className="font-medium" /></p>}
              <p className="text-[11px] text-ink-faint mt-1 capitalize">{s.type} · added by {s.addedBy}{s.voters.length ? ` · ${s.voters.slice(0, 3).join(", ")}${s.voters.length > 3 ? "…" : ""}` : ""}</p>
              <div className="flex items-center gap-2 mt-2.5">
                <button onClick={() => vote(s.id)} disabled={busy === s.id} className={`inline-flex items-center gap-1.5 text-xs rounded-full px-3 py-1.5 border transition-colors ${s.youVoted ? "border-gold bg-gold/15 text-gold" : "border-line text-ink-muted hover:border-gold hover:text-ink"}`}>
                  <Heart size={13} className={s.youVoted ? "fill-gold" : ""} /> {s.votes} {s.votes === 1 ? "vote" : "votes"}
                </button>
                <button onClick={() => remove(s.id)} disabled={busy === s.id} className="text-ink-faint hover:text-red-500 transition-colors p-1.5" title="Remove"><Trash2 size={14} /></button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Minimal set of "A pays B" transfers that zeroes out everyone's balance.
function settleUp(balances: Snap["balances"]): { from: string; to: string; amount: number }[] {
  const debtors = balances.filter(b => b.net < 0).map(b => ({ name: b.name, amt: -b.net })).sort((a, b) => b.amt - a.amt);
  const creditors = balances.filter(b => b.net > 0).map(b => ({ name: b.name, amt: b.net })).sort((a, b) => b.amt - a.amt);
  const tx: { from: string; to: string; amount: number }[] = [];
  let i = 0, j = 0;
  while (i < debtors.length && j < creditors.length) {
    const pay = Math.min(debtors[i].amt, creditors[j].amt);
    if (pay >= 1) tx.push({ from: debtors[i].name, to: creditors[j].name, amount: Math.round(pay) });
    debtors[i].amt -= pay; creditors[j].amt -= pay;
    if (debtors[i].amt < 1) i++;
    if (creditors[j].amt < 1) j++;
  }
  return tx;
}

// ── Expenses ─────────────────────────────────────────────────────────────────
function ExpensesTab({ snap, meId, onChange }: { snap: Snap; meId: string; onChange: () => void }) {
  const { currency: displayCurrency } = useCurrency();
  const displayCode = displayCurrency.code;
  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState(displayCode || "INR");
  const [paidBy, setPaidBy] = useState(meId);
  const [among, setAmong] = useState<string[]>(snap.members.map(m => m.customerId));
  const [category, setCategory] = useState<string>("Other");
  const [catTouched, setCatTouched] = useState(false);
  const [busy, setBusy] = useState(false);
  const [budgetInput, setBudgetInput] = useState(snap.dailyBudget ? String(snap.dailyBudget) : "");
  const [editingBudget, setEditingBudget] = useState(false);
  const [savingBudget, setSavingBudget] = useState(false);
  const [currencyTouched, setCurrencyTouched] = useState(false);

  // Match the "spent in" currency to the one totals are shown in until picked.
  useEffect(() => { if (!currencyTouched) setCurrency(displayCode); }, [displayCode, currencyTouched]);

  const saveBudget = async () => {
    setSavingBudget(true);
    await fetch(`/api/groups/${snap.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ dailyBudget: budgetInput ? Number(budgetInput) : null }) });
    setSavingBudget(false); setEditingBudget(false); await onChange();
  };

  // Auto-categorise from the description as they type, until they pick manually.
  const onDesc = (v: string) => { setDesc(v); if (!catTouched) setCategory(categorizeExpense(v)); };

  const add = async () => {
    if (busy || !desc.trim() || !(Number(amount) > 0)) return;
    setBusy(true);
    await fetch(`/api/groups/${snap.id}/expenses`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ description: desc, amount: Number(amount), currency, category, paidById: paidBy, splitAmong: among }) });
    setDesc(""); setAmount(""); setCategory("Other"); setCatTouched(false); setAmong(snap.members.map(m => m.customerId));
    await onChange(); setBusy(false);
  };
  const toggle = (id: string) => setAmong(a => a.includes(id) ? a.filter(x => x !== id) : [...a, id]);
  const del = async (id: string) => { await fetch(`/api/groups/${snap.id}/expenses/${id}`, { method: "DELETE" }); onChange(); };

  const exportCsv = () => {
    const header = ["Date", "Description", "Category", "Paid by", "Split ways", "Amount (INR)", "Original amount", "Currency"];
    const rows = snap.expenses.map(e => [e.createdAt.slice(0, 10), e.description, e.category, e.paidBy, e.among.length, e.amount, e.origAmount ?? "", e.origCurrency ?? "INR"]);
    downloadCsv(`${snap.title.replace(/[^\w]+/g, "-")}-expenses`, [header, ...rows]);
  };
  const transfers = settleUp(snap.balances);

  const budget = snap.dailyBudget || 0;
  const pct = budget > 0 ? Math.min(100, Math.round((snap.todaySpend / budget) * 100)) : 0;
  const over = budget > 0 && snap.todaySpend > budget;
  const barColor = over ? "bg-red-500" : pct > 80 ? "bg-amber-500" : "bg-emerald-500";

  return (
    <div>
      {/* Daily budget vs actual */}
      <div className="rounded-2xl border border-line bg-panel-soft p-4 mb-5">
        <div className="flex items-center justify-between mb-3">
          <p className="inline-flex items-center gap-1.5 text-[10px] tracking-[0.2em] uppercase text-gold"><Gauge size={13} /> Daily budget</p>
          {snap.isOwner && !editingBudget && (
            <button onClick={() => setEditingBudget(true)} className="inline-flex items-center gap-1 text-[11px] text-ink-muted hover:text-ink"><Pencil size={12} /> {budget > 0 ? "Edit" : "Set budget"}</button>
          )}
        </div>
        {editingBudget ? (
          <div className="flex gap-2">
            <input value={budgetInput} onChange={e => setBudgetInput(e.target.value.replace(/[^\d]/g, ""))} inputMode="numeric" placeholder="₹ per day" className="flex-1 px-3 py-2 rounded-lg bg-panel border border-line text-ink text-sm focus:outline-none focus:border-gold" />
            <button onClick={saveBudget} disabled={savingBudget} className="px-4 py-2 bg-ink text-page text-xs tracking-[0.12em] uppercase rounded-sm hover:bg-ink/90 disabled:opacity-50">{savingBudget ? "…" : "Save"}</button>
            <button onClick={() => { setEditingBudget(false); setBudgetInput(snap.dailyBudget ? String(snap.dailyBudget) : ""); }} className="px-3 py-2 border border-line text-ink-muted text-xs rounded-sm">Cancel</button>
          </div>
        ) : budget > 0 ? (
          <>
            <div className="flex items-end justify-between mb-1.5">
              <p className="text-sm text-ink">Today: <Price amount={snap.todaySpend} className="font-medium" /> <span className="text-ink-faint">/ <Price amount={budget} /></span></p>
              <p className={`text-xs font-medium ${over ? "text-red-500" : "text-emerald-600"}`}>{over ? <>Over by <Price amount={snap.todaySpend - budget} /></> : <><Price amount={budget - snap.todaySpend} /> left</>}</p>
            </div>
            <div className="h-2 rounded-full bg-panel overflow-hidden"><div className={`h-full rounded-full ${barColor} transition-all`} style={{ width: `${pct}%` }} /></div>
            <p className="text-[11px] text-ink-faint mt-2">Averaging <Price amount={snap.dailyAverage} />/day over {snap.daysActive} {snap.daysActive === 1 ? "day" : "days"}.</p>
          </>
        ) : (
          <p className="text-sm text-ink-muted font-light">No daily budget set{snap.dailyAverage > 0 ? <> — you&apos;re averaging <Price amount={snap.dailyAverage} />/day.</> : "."}</p>
        )}
      </div>

      {/* Balances */}
      <div className="rounded-2xl border border-line bg-panel-soft p-4 mb-5">
        <p className="text-[10px] tracking-[0.2em] uppercase text-gold mb-3">Who owes what</p>
        <div className="space-y-1.5">
          {snap.balances.map(b => (
            <div key={b.customerId} className="flex items-center justify-between text-sm">
              <span className="text-ink">{b.name}</span>
              {b.net > 0 ? <span className="text-emerald-600">gets back <Price amount={b.net} className="font-medium" /></span>
                : b.net < 0 ? <span className="text-red-500">owes <Price amount={-b.net} className="font-medium" /></span>
                : <span className="text-ink-faint">settled</span>}
            </div>
          ))}
        </div>
        {transfers.length > 0 && (
          <div className="mt-4 pt-3 border-t border-line">
            <p className="text-[10px] tracking-[0.2em] uppercase text-gold mb-2">Settle up</p>
            <ul className="space-y-1.5">
              {transfers.map((t, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-ink">
                  <span className="font-medium">{t.from}</span>
                  <ArrowRight size={13} className="text-ink-faint shrink-0" />
                  <span className="font-medium">{t.to}</span>
                  <Price amount={t.amount} className="ml-auto text-gold font-medium" />
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Spend by category (auto-grouped) */}
      {snap.categoryTotals.length > 0 && (
        <div className="rounded-2xl border border-line bg-panel p-4 mb-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] tracking-[0.2em] uppercase text-gold">Spend by category</p>
            <Price amount={snap.totalSpend} className="text-sm font-medium text-ink" />
          </div>
          <div className="space-y-2.5">
            {snap.categoryTotals.map(ct => {
              const Icon = CAT_ICON[ct.category] || Receipt;
              const pct = snap.totalSpend > 0 ? Math.round((ct.total / snap.totalSpend) * 100) : 0;
              return (
                <div key={ct.category}>
                  <div className="flex items-center gap-2 text-sm mb-1">
                    <Icon size={14} className="text-gold shrink-0" />
                    <span className="text-ink">{ct.category}</span>
                    <span className="text-[11px] text-ink-faint">{pct}%</span>
                    <Price amount={ct.total} className="ml-auto text-ink font-medium" />
                  </div>
                  <div className="h-1.5 rounded-full bg-panel-soft overflow-hidden"><div className="h-full bg-gold/70 rounded-full" style={{ width: `${pct}%` }} /></div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add */}
      <div className="rounded-2xl border border-line bg-panel p-4 mb-5">
        <div className="flex gap-2 mb-3">
          <input value={desc} onChange={e => onDesc(e.target.value)} placeholder="What was it for?" className="flex-1 min-w-0 px-3 py-2.5 rounded-lg bg-panel-soft border border-line text-ink text-sm focus:outline-none focus:border-gold" />
          <input value={amount} onChange={e => setAmount(e.target.value.replace(/[^\d]/g, ""))} inputMode="numeric" placeholder="Amount" className="w-24 px-3 py-2.5 rounded-lg bg-panel-soft border border-line text-ink text-sm focus:outline-none focus:border-gold" />
          <select value={currency} onChange={e => { setCurrency(e.target.value); setCurrencyTouched(true); }} className="w-24 px-2 py-2.5 rounded-lg bg-panel-soft border border-line text-ink text-sm focus:outline-none focus:border-gold" title="Currency spent in">
            {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.code}</option>)}
          </select>
        </div>
        <div className="flex flex-wrap gap-1.5 mb-3">
          {EXPENSE_CATEGORIES.map(cat => {
            const Icon = CAT_ICON[cat] || Receipt;
            return (
              <button key={cat} type="button" onClick={() => { setCategory(cat); setCatTouched(true); }} className={`inline-flex items-center gap-1 text-xs rounded-full px-2.5 py-1.5 border transition-colors ${category === cat ? "border-gold bg-gold/15 text-gold" : "border-line text-ink-muted hover:border-gold"}`}>
                <Icon size={12} /> {cat}
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs text-ink-muted">Paid by</span>
          <select value={paidBy} onChange={e => setPaidBy(e.target.value)} className="flex-1 px-3 py-2 rounded-lg bg-panel-soft border border-line text-ink text-sm focus:outline-none focus:border-gold">
            {snap.members.map(m => <option key={m.customerId} value={m.customerId}>{m.customerId === meId ? "You" : m.name}</option>)}
          </select>
        </div>
        <p className="text-xs text-ink-muted mb-2">Split between</p>
        <div className="flex flex-wrap gap-2 mb-3">
          {snap.members.map(m => (
            <button key={m.customerId} onClick={() => toggle(m.customerId)} className={`text-xs rounded-full px-3 py-1.5 border transition-colors ${among.includes(m.customerId) ? "border-gold bg-gold/15 text-gold" : "border-line text-ink-muted"}`}>
              {m.customerId === meId ? "You" : m.name}
            </button>
          ))}
        </div>
        <button onClick={add} disabled={busy || !desc.trim() || !(Number(amount) > 0) || among.length === 0} className="inline-flex items-center gap-2 px-5 py-2.5 bg-ink text-page text-xs tracking-[0.14em] uppercase rounded-sm hover:bg-ink/90 disabled:opacity-50">
          {busy ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} Add expense
        </button>
      </div>

      {/* List */}
      {snap.expenses.length > 0 && (
        <div className="flex justify-end mb-2">
          <button onClick={exportCsv} className="inline-flex items-center gap-1.5 text-[11px] tracking-[0.14em] uppercase text-ink-muted hover:text-gold transition-colors"><Download size={13} /> Export CSV</button>
        </div>
      )}
      <div className="space-y-2">
        {snap.expenses.map(e => {
          const Icon = CAT_ICON[e.category] || Receipt;
          return (
            <div key={e.id} className="flex items-center gap-3 rounded-xl border border-line bg-panel px-4 py-3">
              <span className="w-8 h-8 rounded-full bg-gold/10 text-gold flex items-center justify-center shrink-0"><Icon size={15} /></span>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-ink truncate">{e.description}</p>
                <p className="text-[11px] text-ink-faint">{e.origCurrency && e.origAmount ? `${symbolOf(e.origCurrency)}${e.origAmount.toLocaleString()} · ` : ""}{e.category} · {e.paidBy} paid · split {e.among.length} ways · <Price amount={e.share} />/each</p>
              </div>
              <Price amount={e.amount} className="text-sm font-medium text-ink shrink-0" />
              <button onClick={() => del(e.id)} className="text-ink-faint hover:text-red-500 p-1" title="Remove"><Trash2 size={14} /></button>
            </div>
          );
        })}
        {snap.expenses.length === 0 && <p className="text-sm text-ink-muted font-light text-center py-4">No expenses logged yet.</p>}
      </div>
    </div>
  );
}

// ── Chat ─────────────────────────────────────────────────────────────────────
function ChatTab({ snap, onChange }: { snap: Snap; onChange: () => void }) {
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => { endRef.current?.scrollIntoView({ block: "end" }); }, [snap.messages.length]);

  const send = async () => {
    if (busy || !body.trim()) return;
    setBusy(true);
    const text = body; setBody("");
    await fetch(`/api/groups/${snap.id}/messages`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ body: text }) });
    await onChange(); setBusy(false);
  };

  return (
    <div>
      <div className="rounded-2xl border border-line bg-panel-soft p-4 h-[52vh] overflow-y-auto space-y-3">
        {snap.messages.length === 0 && <p className="text-sm text-ink-muted font-light text-center py-8">Say hello — start planning together.</p>}
        {snap.messages.map(m => (
          <div key={m.id} className={`flex flex-col ${m.mine ? "items-end" : "items-start"}`}>
            {!m.mine && <span className="text-[10px] text-ink-faint mb-0.5 px-1">{m.name}</span>}
            <span className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm ${m.mine ? "bg-ink text-page" : "bg-panel border border-line text-ink"}`}>{m.body}</span>
          </div>
        ))}
        <div ref={endRef} />
      </div>
      <form onSubmit={e => { e.preventDefault(); send(); }} className="flex gap-2 mt-3">
        <input value={body} onChange={e => setBody(e.target.value)} placeholder="Message the group…" className="flex-1 px-4 py-3 rounded-full bg-panel border border-line text-ink text-sm focus:outline-none focus:border-gold" />
        <button type="submit" disabled={busy || !body.trim()} className="w-12 h-12 rounded-full bg-ink text-page flex items-center justify-center hover:bg-ink/90 disabled:opacity-50 shrink-0"><Send size={16} /></button>
      </form>
    </div>
  );
}

// ── Photos ───────────────────────────────────────────────────────────────────
function PhotosTab({ snap, onChange }: { snap: Snap; onChange: () => void }) {
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const upload = async (file: File) => {
    setBusy(true);
    const fd = new FormData(); fd.append("file", file);
    await fetch(`/api/groups/${snap.id}/photos`, { method: "POST", body: fd });
    await onChange(); setBusy(false);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div>
      <button onClick={() => inputRef.current?.click()} disabled={busy} className="w-full flex items-center justify-center gap-2 rounded-2xl border border-dashed border-line-strong p-5 mb-5 text-sm text-ink-muted hover:border-gold hover:text-ink transition-colors disabled:opacity-60">
        {busy ? <Loader2 size={16} className="animate-spin" /> : <ImagePlus size={16} className="text-gold" />} {busy ? "Uploading…" : "Add a photo"}
      </button>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) upload(f); }} />
      {snap.photos.length === 0 ? (
        <p className="text-sm text-ink-muted font-light text-center py-6">No photos yet — share the first snap from your trip.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {snap.photos.map(p => (
            <a key={p.id} href={p.url} target="_blank" rel="noopener noreferrer" className="group relative aspect-square rounded-xl overflow-hidden bg-vc-950">
              <img src={p.url} alt={p.caption || "Trip photo"} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
              <span className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-2 text-[10px] text-white/90">{p.by}{p.caption ? ` · ${p.caption}` : ""}</span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Bookings ─────────────────────────────────────────────────────────────────
function BookingsTab({ snap }: { snap: Snap }) {
  if (snap.bookings.length === 0) return <p className="text-sm text-ink-muted font-light text-center py-8">No bookings yet. When members book on Voyages &amp; Co., their trips show here for everyone.</p>;
  return (
    <div className="space-y-2">
      {snap.bookings.map(b => {
        const Icon = TYPE_ICON[b.type] || Luggage;
        return (
          <Link key={b.reference} href={`/account/pass/${b.reference}`} className="flex items-center gap-3 rounded-xl border border-line bg-panel px-4 py-3 hover:border-gold/40 transition-colors">
            <Icon size={16} className="text-gold shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-sm text-ink truncate">{b.itemTitle}</p>
              <p className="text-[11px] text-ink-faint capitalize">{b.by} · {b.type}{b.checkIn ? ` · ${b.checkIn}` : ""}{b.status === "pending" ? " · pending" : ""}</p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

// ── Members ──────────────────────────────────────────────────────────────────
function MembersTab({ snap, meId, onChange, copyInvite, copied, onLeave }: { snap: Snap; meId: string; onChange: () => void; copyInvite: () => void; copied: boolean; onLeave: () => void }) {
  const disband = async () => { if (!confirm("Delete this group trip for everyone? This cannot be undone.")) return; await fetch(`/api/groups/${snap.id}`, { method: "DELETE" }); onLeave(); };
  return (
    <div>
      <div className="rounded-2xl border border-gold/30 bg-panel-soft p-4 mb-5">
        <p className="text-[10px] tracking-[0.2em] uppercase text-gold mb-1.5">Invite the group</p>
        <p className="text-xs text-ink-muted font-light mb-3">Anyone with this link can join and take part.</p>
        <div className="flex gap-2">
          <input readOnly value={snap.inviteUrl} onFocus={e => e.target.select()} className="flex-1 min-w-0 px-3 py-2 rounded-lg bg-panel border border-line text-ink-muted text-xs focus:outline-none" />
          <button onClick={copyInvite} className="inline-flex items-center gap-1.5 px-3 py-2 bg-ink text-page text-xs tracking-[0.12em] uppercase rounded-sm hover:bg-ink/90 shrink-0">{copied ? <Check size={13} /> : <Link2 size={13} />} Copy</button>
        </div>
      </div>
      <div className="space-y-2">
        {snap.members.map(m => (
          <div key={m.customerId} className="flex items-center gap-3 rounded-xl border border-line bg-panel px-4 py-3">
            <span className="w-9 h-9 rounded-full bg-gold/15 text-gold text-sm flex items-center justify-center">{m.name.charAt(0).toUpperCase()}</span>
            <span className="flex-1 text-sm text-ink">{m.name}{m.customerId === meId ? " (you)" : ""}</span>
            {m.isOwner && <span className="text-[10px] tracking-[0.14em] uppercase text-gold">Organiser</span>}
          </div>
        ))}
      </div>
      {snap.isOwner && (
        <button onClick={disband} className="mt-6 inline-flex items-center gap-2 text-xs tracking-[0.12em] uppercase text-red-500 hover:text-red-600"><Trash2 size={14} /> Delete this group trip</button>
      )}
    </div>
  );
}
