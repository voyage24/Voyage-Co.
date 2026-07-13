"use client";

import { useEffect, useState } from "react";
import { Plane, BedDouble, Utensils, ShoppingBag, Ticket, Car, Receipt, Plus, Loader2, Trash2, Download } from "lucide-react";
import Price from "@/components/ui/Price";
import { EXPENSE_CATEGORIES, categorizeExpense } from "@/lib/group/expense-category";
import { CURRENCIES } from "@/lib/currency";
import { useCurrency } from "@/components/providers/CurrencyProvider";
import { downloadCsv } from "@/lib/csv";

const CAT_ICON: Record<string, typeof Plane> = { Hotels: BedDouble, Flights: Plane, Food: Utensils, Shopping: ShoppingBag, Activities: Ticket, Transport: Car, Other: Receipt };
const symbolOf = (code: string) => CURRENCIES.find(c => c.code === code)?.symbol || code;

type Expense = { id: string; description: string; amount: number; category: string; spentOn: string; bookingRef: string | null; origCurrency: string | null; origAmount: number | null };
type Trip = { reference: string; title: string };
type Data = { expenses: Expense[]; total: number; categoryTotals: { category: string; total: number }[]; trips: Trip[] };

const today = () => new Date().toISOString().slice(0, 10);

export default function PersonalExpenses({ initialRef }: { initialRef: string }) {
  const { currency: displayCurrency } = useCurrency();
  const displayCode = displayCurrency.code;
  const [data, setData] = useState<Data | null>(null);
  const [filterRef, setFilterRef] = useState(initialRef);
  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState(displayCode || "INR");
  const [category, setCategory] = useState("Other");
  const [catTouched, setCatTouched] = useState(false);
  const [spentOn, setSpentOn] = useState(today());
  const [tripRef, setTripRef] = useState(initialRef);
  const [busy, setBusy] = useState(false);

  const load = () => fetch(`/api/account/expenses${filterRef ? `?ref=${encodeURIComponent(filterRef)}` : ""}`).then(r => r.json()).then(d => { if (d.loggedIn) setData(d); }).catch(() => {});
  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [filterRef]);

  const onDesc = (v: string) => { setDesc(v); if (!catTouched) setCategory(categorizeExpense(v)); };

  const add = async () => {
    if (busy || !desc.trim() || !(Number(amount) > 0)) return;
    setBusy(true);
    await fetch("/api/account/expenses", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ description: desc, amount: Number(amount), currency, category, spentOn, bookingRef: tripRef || null }) });
    setDesc(""); setAmount(""); setCategory("Other"); setCatTouched(false); setSpentOn(today());
    await load(); setBusy(false);
  };
  const del = async (id: string) => { await fetch(`/api/account/expenses/${id}`, { method: "DELETE" }); load(); };

  const exportCsv = () => {
    if (!data) return;
    const tripName = filterRef ? data.trips.find(t => t.reference === filterRef)?.title : "";
    const header = ["Date", "Description", "Category", "Amount (INR)", "Original amount", "Currency"];
    const rows = data.expenses.map(e => [e.spentOn, e.description, e.category, e.amount, e.origAmount ?? "", e.origCurrency ?? "INR"]);
    downloadCsv(`voyages-expenses${tripName ? `-${tripName.replace(/[^\w]+/g, "-")}` : ""}`, [header, ...rows]);
  };

  if (!data) return <div className="py-12 text-center"><Loader2 size={22} className="animate-spin text-gold mx-auto" /></div>;

  return (
    <div>
      {/* Total + trip filter */}
      <div className="rounded-2xl border border-line bg-gradient-to-br from-vc-950 to-[#2a1216] text-[#f4f0e9] p-5 mb-5">
        <div className="flex items-center justify-between">
          <p className="text-[10px] tracking-[0.28em] uppercase text-gold">{filterRef ? "This trip" : "Total spent"}</p>
          <p className="font-serif text-3xl font-light"><Price amount={data.total} /></p>
        </div>
        {data.trips.length > 0 && (
          <select value={filterRef} onChange={e => setFilterRef(e.target.value)} className="mt-3 w-full px-3 py-2 rounded-lg bg-white/10 border border-white/15 text-white text-sm focus:outline-none">
            <option value="">All trips</option>
            {data.trips.map(t => <option key={t.reference} value={t.reference} className="text-ink">{t.title}</option>)}
          </select>
        )}
        {data.expenses.length > 0 && (
          <button onClick={exportCsv} className="mt-3 inline-flex items-center gap-1.5 text-[11px] tracking-[0.14em] uppercase text-white/70 hover:text-gold transition-colors"><Download size={13} /> Export CSV</button>
        )}
      </div>

      {/* By category */}
      {data.categoryTotals.length > 0 && (
        <div className="rounded-2xl border border-line bg-panel p-4 mb-5">
          <p className="text-[10px] tracking-[0.2em] uppercase text-gold mb-3">Spend by category</p>
          <div className="space-y-2.5">
            {data.categoryTotals.map(ct => {
              const Icon = CAT_ICON[ct.category] || Receipt;
              const pct = data.total > 0 ? Math.round((ct.total / data.total) * 100) : 0;
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
          <select value={currency} onChange={e => setCurrency(e.target.value)} className="w-24 px-2 py-2.5 rounded-lg bg-panel-soft border border-line text-ink text-sm focus:outline-none focus:border-gold" title="Currency spent in">
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
        <div className="flex flex-wrap gap-2 mb-3">
          <input type="date" value={spentOn} onChange={e => setSpentOn(e.target.value)} className="px-3 py-2 rounded-lg bg-panel-soft border border-line text-ink text-sm focus:outline-none focus:border-gold" />
          {data.trips.length > 0 && (
            <select value={tripRef} onChange={e => setTripRef(e.target.value)} className="flex-1 min-w-0 px-3 py-2 rounded-lg bg-panel-soft border border-line text-ink text-sm focus:outline-none focus:border-gold">
              <option value="">No trip</option>
              {data.trips.map(t => <option key={t.reference} value={t.reference}>{t.title}</option>)}
            </select>
          )}
        </div>
        <button onClick={add} disabled={busy || !desc.trim() || !(Number(amount) > 0)} className="inline-flex items-center gap-2 px-5 py-2.5 bg-ink text-page text-xs tracking-[0.14em] uppercase rounded-sm hover:bg-ink/90 disabled:opacity-50">
          {busy ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} Add expense
        </button>
      </div>

      {/* List */}
      <div className="space-y-2">
        {data.expenses.map(e => {
          const Icon = CAT_ICON[e.category] || Receipt;
          return (
            <div key={e.id} className="flex items-center gap-3 rounded-xl border border-line bg-panel px-4 py-3">
              <span className="w-8 h-8 rounded-full bg-gold/10 text-gold flex items-center justify-center shrink-0"><Icon size={15} /></span>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-ink truncate">{e.description}</p>
                <p className="text-[11px] text-ink-faint">{e.origCurrency && e.origAmount ? `${symbolOf(e.origCurrency)}${e.origAmount.toLocaleString()} · ` : ""}{e.category} · {e.spentOn}</p>
              </div>
              <Price amount={e.amount} className="text-sm font-medium text-ink shrink-0" />
              <button onClick={() => del(e.id)} className="text-ink-faint hover:text-red-500 p-1" title="Remove"><Trash2 size={14} /></button>
            </div>
          );
        })}
        {data.expenses.length === 0 && <p className="text-sm text-ink-muted font-light text-center py-6">No expenses logged yet — add your first above.</p>}
      </div>
    </div>
  );
}
