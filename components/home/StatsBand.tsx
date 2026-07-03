import Counter from "@/components/ui/Counter";

export type StatItem = { value: number; suffix?: string; label: string };

// Real figures are passed from the homepage (catalogue counts + live visits).
export default function StatsBand({ stats }: { stats: StatItem[] }) {
  return (
    <section className="text-[#f4f0e9] py-16" style={{ background: "radial-gradient(120% 150% at 50% 0%, #2c5375 0%, #1c3c5c 55%, #163049 100%)" }}>
      <div className="max-w-[1500px] mx-auto px-6 lg:px-12 grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
        {stats.map(s => (
          <div key={s.label}>
            <p className="font-serif text-4xl sm:text-5xl font-light text-gold">
              <Counter value={s.value} suffix={s.suffix ?? ""} />
            </p>
            <p className="text-[11px] tracking-[0.18em] uppercase text-[#f4f0e9]/60 mt-2">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
