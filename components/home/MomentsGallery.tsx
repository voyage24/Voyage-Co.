import Image from "next/image";
import { prisma } from "@/lib/prisma";

// Guest "Moments" gallery — renders nothing until photos are added in
// Admin → Moments.
export default async function MomentsGallery() {
  let items: { id: string; image: string; caption: string | null; handle: string | null; link: string | null }[] = [];
  try {
    items = await prisma.moment.findMany({
      where: { published: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      take: 12,
      select: { id: true, image: true, caption: true, handle: true, link: true },
    });
  } catch { /* not migrated yet */ }
  if (items.length < 3) return null;

  return (
    <section className="py-16">
      <div className="max-w-[1500px] mx-auto px-6 lg:px-12">
        <div className="text-center mb-8">
          <p className="text-[11px] tracking-[0.3em] uppercase text-gold mb-2">Moments</p>
          <h2 className="font-serif text-2xl sm:text-3xl font-light text-ink">Stories from our travellers</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
          {items.map(m => {
            const tile = (
              <div className="group relative aspect-square rounded-lg overflow-hidden">
                <Image src={m.image} alt={m.caption ?? "Travel moment"} fill sizes="(max-width:640px) 50vw, 16vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                {(m.caption || m.handle) && (
                  <div className="absolute inset-0 bg-gradient-to-t from-vc-950/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                    <p className="text-[11px] text-white/90 font-light">{m.handle || m.caption}</p>
                  </div>
                )}
              </div>
            );
            return m.link
              ? <a key={m.id} href={m.link} target="_blank" rel="noopener noreferrer">{tile}</a>
              : <div key={m.id}>{tile}</div>;
          })}
        </div>
      </div>
    </section>
  );
}
