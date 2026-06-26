"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface FlightData {
  id?: string;
  origin: string;
  originCity: string;
  destination: string;
  destinationCity: string;
  airline: string;
  airlineCode: string;
  flightNumber: string;
  departure: string;
  arrival: string;
  duration: string;
  stops: number;
  price: number;
  businessPrice: number | null;
  amenities: string[];
  currency: string;
  published: boolean;
}

const BLANK: FlightData = {
  origin: "", originCity: "", destination: "", destinationCity: "",
  airline: "", airlineCode: "", flightNumber: "", departure: "", arrival: "", duration: "",
  stops: 0, price: 0, businessPrice: null, amenities: [], currency: "INR", published: true,
};

const inputClass = "w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900";
const labelClass = "block text-xs font-medium text-gray-600 mb-1";

export default function FlightForm({ initial }: { initial?: FlightData }) {
  const router = useRouter();
  const [form, setForm] = useState<FlightData>(initial ?? BLANK);
  const [saving, setSaving] = useState(false);
  const isEdit = !!initial?.id;

  const set = <K extends keyof FlightData>(key: K, value: FlightData[K]) => setForm(p => ({ ...p, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const url = isEdit ? `/api/admin/flights/${encodeURIComponent(initial!.id!)}` : "/api/admin/flights";
    const res = await fetch(url, {
      method: isEdit ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (res.ok) {
      router.push("/admin/flights");
      router.refresh();
    } else {
      alert("Failed to save. Please check required fields.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
      <div className="grid grid-cols-2 gap-4">
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
          <label className={labelClass}>Airline *</label>
          <input required className={inputClass} value={form.airline} onChange={e => set("airline", e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Airline Code</label>
          <input className={inputClass} value={form.airlineCode} onChange={e => set("airlineCode", e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Flight Number</label>
          <input className={inputClass} value={form.flightNumber} onChange={e => set("flightNumber", e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Duration</label>
          <input className={inputClass} placeholder="2h 20m" value={form.duration} onChange={e => set("duration", e.target.value)} />
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
          <label className={labelClass}>Stops</label>
          <input type="number" min={0} className={inputClass} value={form.stops} onChange={e => set("stops", Number(e.target.value))} />
        </div>
        <div>
          <label className={labelClass}>Currency</label>
          <input className={inputClass} value={form.currency} onChange={e => set("currency", e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Price (Economy)</label>
          <input type="number" className={inputClass} value={form.price} onChange={e => set("price", Number(e.target.value))} />
        </div>
        <div>
          <label className={labelClass}>Business Price</label>
          <input type="number" className={inputClass} value={form.businessPrice ?? ""} onChange={e => set("businessPrice", e.target.value ? Number(e.target.value) : null)} />
        </div>
      </div>

      <div>
        <label className={labelClass}>Amenities (one per line)</label>
        <textarea
          rows={3}
          className={inputClass}
          value={form.amenities.join("\n")}
          onChange={e => set("amenities", e.target.value.split("\n").map(s => s.trim()).filter(Boolean))}
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-gray-700">
        <input type="checkbox" checked={form.published} onChange={e => set("published", e.target.checked)} />
        Published (visible on the live site)
      </label>

      <button type="submit" disabled={saving} className="px-5 py-2.5 bg-gray-900 hover:bg-gray-800 disabled:opacity-50 text-white text-sm font-medium rounded-md">
        {saving ? "Saving…" : isEdit ? "Save Changes" : "Create Flight"}
      </button>
    </form>
  );
}
