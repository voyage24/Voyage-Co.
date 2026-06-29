import Counter from "@/components/ui/Counter";

const STATS = [
  { value: 120, suffix: "+", label: "Destinations" },
  { value: 15, suffix: "", label: "Years of craft" },
  { value: 4000, suffix: "+", label: "Journeys curated" },
  { value: 98, suffix: "%", label: "Would travel again" },
];

export default function StatsBand() {
  return (
    <section className="bg-ink text-page py-14">
      <div className="max-w-[1500px] mx-auto px-6 lg:px-12 grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
        {STATS.map(s => (
          <div key={s.label}>
            <p className="font-serif text-4xl sm:text-5xl font-light text-gold"><Counter value={s.value} suffix={s.suffix} /></p>
            <p className="text-[11px] tracking-[0.18em] uppercase text-page/60 mt-2">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
