import Image from "next/image";
import { prisma } from "@/lib/prisma";

// "As featured in" logo strip — renders nothing until logos are added in
// Admin → Press & Awards.
export default async function PressStrip() {
  let items: { id: string; name: string; image: string; url: string | null }[] = [];
  try {
    items = await prisma.pressMention.findMany({
      where: { published: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      select: { id: true, name: true, image: true, url: true },
    });
  } catch { /* table not migrated yet */ }
  if (items.length === 0) return null;

  return (
    <section className="border-y border-line bg-panel-soft">
      <div className="max-w-[1500px] mx-auto px-6 lg:px-12 py-10">
        <p className="text-center text-[10px] tracking-[0.3em] uppercase text-ink-faint mb-7">As featured in</p>
        <div className="flex flex-wrap items-center justify-center gap-x-10 sm:gap-x-14 gap-y-7">
          {items.map(p => {
            const logo = (
              <div className="relative h-7 sm:h-8 w-28 sm:w-32 opacity-60 hover:opacity-100 transition-opacity grayscale hover:grayscale-0">
                <Image src={p.image} alt={p.name} fill sizes="160px" className="object-contain" />
              </div>
            );
            return p.url
              ? <a key={p.id} href={p.url} target="_blank" rel="noopener noreferrer" aria-label={p.name}>{logo}</a>
              : <div key={p.id} aria-label={p.name}>{logo}</div>;
          })}
        </div>
      </div>
    </section>
  );
}
