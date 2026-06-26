"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface TrainClass { type: string; price: number; available: number }

interface TrainData {
  id?: string;
  name: string;
  number: string;
  origin: string;
  originCity: string;
  destination: string;
  destinationCity: string;
  departure: string;
  arrival: string;
  duration: string;
  classes: TrainClass[];
  runsDays: string[];
  published: boolean;
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const BLANK: TrainData = {
  name: "", number: "", origin: "", originCity: "", destination: "", destinationCity: "",
  departure: "", arrival: "", duration: "", classes: [], runsDays: [...DAYS], published: true,
};

const inputClass = "w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900";
const labelClass = "block text-xs font-medium text-gray-600 mb-1";

export default function TrainForm({ initial }: { initial?: TrainData }) {
  const router = useRouter();
  const [form, setForm] = useState<TrainData>(initial ?? BLANK);
  const [saving, setSaving] = useState(false);
  const isEdit = !!initial?.id;

  const set = <K extends keyof TrainData>(key: K, value: TrainData[K]) => setForm(p => ({ ...p, [key]: value }));

  const updateClass = (i: number, field: keyof TrainClass, value: string) => {
    const classes = [...form.classes];
    classes[i] = { ...classes[i], [field]: field === "type" ? value : Number(value) };
    set("classes", classes);
  };
  const addClass = () => set("classes", [...form.classes, { type: "", price: 0, available: 0 }]);
  const removeClass = (i: number) => set("classes", form.classes.filter((_, idx) => idx !== i));

  const toggleDay = (day: string) => {
    set("runsDays", form.runsDays.includes(day) ? form.runsDays.filter(d => d !== day) : [...form.runsDays, day]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const url = isEdit ? `/api/admin/trains/${encodeURIComponent(initial!.id!)}` : "/api/admin/trains";
    const res = await fetch(url, {
      method: isEdit ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (res.ok) {
      router.push("/admin/trains");
      router.refresh();
    } else {
      alert("Failed to save. Please check required fields.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Train Name *</label>
          <input required className={inputClass} value={form.name} onChange={e => set("name", e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Train Number</label>
          <input className={inputClass} value={form.number} onChange={e => set("number", e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Origin Code *</label>
          <input required className={inputClass} value={form.origin} onChange={e => set("origin", e.target.value.toUpperCase())} />
        </div>
        <div>
          <label className={labelClass}>Origin City</label>
          <input className={inputClass} value={form.originCity} onChange={e => set("originCity", e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Destination Code *</label>
          <input required className={inputClass} value={form.destination} onChange={e => set("destination", e.target.value.toUpperCase())} />
        </div>
        <div>
          <label className={labelClass}>Destination City</label>
          <input className={inputClass} value={form.destinationCity} onChange={e => set("destinationCity", e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Departure (HH:MM)</label>
          <input className={inputClass} value={form.departure} onChange={e => set("departure", e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Arrival (HH:MM)</label>
          <input className={inputClass} value={form.arrival} onChange={e => set("arrival", e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Duration</label>
          <input className={inputClass} placeholder="15h 00m" value={form.duration} onChange={e => set("duration", e.target.value)} />
        </div>
      </div>

      <div>
        <label className={labelClass}>Runs On</label>
        <div className="flex gap-2 flex-wrap">
          {DAYS.map(day => (
            <button
              key={day}
              type="button"
              onClick={() => toggleDay(day)}
              className={`px-3 py-1.5 rounded-md text-xs border ${
                form.runsDays.includes(day) ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-600 border-gray-300"
              }`}
            >
              {day}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className={labelClass}>Classes</label>
        <div className="space-y-2">
          {form.classes.map((c, i) => (
            <div key={i} className="flex flex-col sm:flex-row gap-2 sm:items-center">
              <input placeholder="Type (3A, 2A…)" className={inputClass} value={c.type} onChange={e => updateClass(i, "type", e.target.value)} />
              <input type="number" placeholder="Price" className={inputClass} value={c.price} onChange={e => updateClass(i, "price", e.target.value)} />
              <input type="number" placeholder="Available" className={inputClass} value={c.available} onChange={e => updateClass(i, "available", e.target.value)} />
              <button type="button" onClick={() => removeClass(i)} className="text-red-600 text-xs whitespace-nowrap self-start sm:self-auto">Remove</button>
            </div>
          ))}
        </div>
        <button type="button" onClick={addClass} className="mt-2 text-sm text-gray-700 underline">+ Add class</button>
      </div>

      <label className="flex items-center gap-2 text-sm text-gray-700">
        <input type="checkbox" checked={form.published} onChange={e => set("published", e.target.checked)} />
        Published (visible on the live site)
      </label>

      <button type="submit" disabled={saving} className="px-5 py-2.5 bg-gray-900 hover:bg-gray-800 disabled:opacity-50 text-white text-sm font-medium rounded-md">
        {saving ? "Saving…" : isEdit ? "Save Changes" : "Create Train"}
      </button>
    </form>
  );
}
