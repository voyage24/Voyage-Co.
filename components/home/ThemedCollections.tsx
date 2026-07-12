import Link from "next/link";
import { TreePalm, Building2, Tent, Mountain, Landmark, Waves } from "lucide-react";

// Themed entry points to the catalogue — dynamic, editorial "moods" in place of a
// static banner. Each links to a real destination guide (which lists its stays).
const THEMES = [
  { label: "Barefoot islands", sub: "Maldives · Seychelles", href: "/destinations/maldives", Icon: TreePalm },
  { label: "City & business", sub: "Dubai · the Gulf", href: "/destinations/united-arab-emirates", Icon: Building2 },
  { label: "On safari", sub: "Serengeti · the Mara", href: "/destinations/tanzania", Icon: Tent },
  { label: "Alpine escapes", sub: "The Swiss Alps", href: "/destinations/switzerland", Icon: Mountain },
  { label: "Timeless Europe", sub: "Italy · France", href: "/destinations/italy", Icon: Landmark },
  { label: "Sun & sea", sub: "Greece · the Aegean", href: "/destinations/greece", Icon: Waves },
];

export default function ThemedCollections() {
  return (
    <section className="max-w-[1500px] mx-auto px-6 lg:px-12 py-14">
      <p className="text-[11px] tracking-[0.3em] uppercase text-gold mb-2">Explore by mood</p>
      <h2 className="font-serif text-2xl sm:text-3xl font-light text-ink mb-6">Where shall we take you?</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {THEMES.map(({ label, sub, href, Icon }) => (
          <Link key={label} href={href} className="group rounded-2xl border border-line bg-panel-soft p-5 hover:border-gold/40 hover:-translate-y-1 transition-all duration-300">
            <Icon size={22} className="text-gold mb-3" />
            <p className="text-sm font-medium text-ink leading-tight">{label}</p>
            <p className="text-[11px] text-ink-faint mt-1">{sub}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
