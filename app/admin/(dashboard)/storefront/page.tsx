import Link from "next/link";
import {
  BedDouble, Package, Sparkles, Ship, TrainFront, Plane, Newspaper, Tag, Quote,
  MapPin, Image as ImageIcon, Award, LayoutGrid, Palette, LayoutTemplate,
  ListChecks, Menu as MenuIcon, Plus, FolderOpen,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import StorefrontPreview from "@/components/admin/StorefrontPreview";
import { PAGE_REGISTRY } from "@/lib/page-content";
import { LIST_REGISTRY } from "@/lib/page-lists";
import { COLLECTIONS } from "@/lib/collections";

export const dynamic = "force-dynamic";

const SITE = "https://voyagesco.com";

async function count(fn: () => Promise<number>): Promise<number> {
  try { return await fn(); } catch { return 0; }
}

export default async function AdminStorefrontPage() {
  const [hotels, packages, experiences, cruises, trains, flights, blog, offers, testimonials, destinations, moments, press, collections] = await Promise.all([
    count(() => prisma.hotel.count({ where: { published: true } })),
    count(() => prisma.package.count({ where: { published: true } })),
    count(() => prisma.experience.count({ where: { published: true } })),
    count(() => prisma.cruise.count({ where: { published: true } })),
    count(() => prisma.train.count({ where: { published: true } })),
    count(() => prisma.flight.count({ where: { published: true } })),
    count(() => prisma.blogPost.count({ where: { published: true } })),
    count(() => prisma.offer.count({ where: { published: true } })),
    count(() => prisma.testimonial.count({ where: { published: true } })),
    count(() => prisma.featuredDestination.count({ where: { published: true } })),
    count(() => prisma.moment.count({ where: { published: true } })),
    count(() => prisma.pressMention.count({ where: { published: true } })),
    count(() => prisma.collection.count()),
  ]);

  const STATS: { label: string; n: number; href: string; Icon: typeof BedDouble; grad: number }[] = [
    { label: "Stays", n: hotels, href: "/admin/hotels", Icon: BedDouble, grad: 1 },
    { label: "Journeys", n: packages, href: "/admin/packages", Icon: Package, grad: 2 },
    { label: "Experiences", n: experiences, href: "/admin/experiences", Icon: Sparkles, grad: 3 },
    { label: "Cruises", n: cruises, href: "/admin/cruises", Icon: Ship, grad: 4 },
    { label: "Trains", n: trains, href: "/admin/trains", Icon: TrainFront, grad: 5 },
    { label: "Flights", n: flights, href: "/admin/flights", Icon: Plane, grad: 6 },
    { label: "Journal posts", n: blog, href: "/admin/blog", Icon: Newspaper, grad: 7 },
    { label: "Offers", n: offers, href: "/admin/offers", Icon: Tag, grad: 8 },
    { label: "Testimonials", n: testimonials, href: "/admin/testimonials", Icon: Quote, grad: 9 },
    { label: "Featured destinations", n: destinations, href: "/admin/destinations", Icon: MapPin, grad: 10 },
    { label: "Moments", n: moments, href: "/admin/moments", Icon: ImageIcon, grad: 1 },
    { label: "Press & awards", n: press, href: "/admin/press", Icon: Award, grad: 2 },
  ];

  const QUICK_ADD = [
    { label: "Hotel", href: "/admin/hotels/new" },
    { label: "Journey", href: "/admin/packages/new" },
    { label: "Experience", href: "/admin/experiences/new" },
    { label: "Cruise", href: "/admin/cruises/new" },
    { label: "Journal post", href: "/admin/blog/new" },
    { label: "Testimonial", href: "/admin/testimonials/new" },
  ];

  const MANAGE: { label: string; sub: string; href: string; Icon: typeof BedDouble }[] = [
    { label: "Appearance", sub: "Colours, fonts, logo, hero text, referral reward", href: "/admin/appearance", Icon: Palette },
    { label: "Page copy", sub: `${PAGE_REGISTRY.length} editable pages`, href: "/admin/pages", Icon: LayoutTemplate },
    { label: "Editable lists", sub: `${LIST_REGISTRY.length} lists — FAQ, cards, nav, footer…`, href: "/admin/pages", Icon: ListChecks },
    { label: "Collections", sub: `${COLLECTIONS.length} types — team, events, logos, home FAQ`, href: "/admin/collections", Icon: LayoutGrid },
    { label: "Navigation & footer", sub: "Menu links and footer columns", href: "/admin/pages/nav", Icon: MenuIcon },
    { label: "Media library", sub: "Uploaded images", href: "/admin/media", Icon: FolderOpen },
  ];

  const pages = [...PAGE_REGISTRY].sort((a, b) => a.label.localeCompare(b.label));

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Storefront</h1>
          <p className="text-sm text-gray-500 mt-1">Everything the public site shows — content, pages, appearance and media, in one place.</p>
        </div>
        <a href={SITE} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-md">View live site ↗</a>
      </div>

      {/* At a glance */}
      <section>
        <h2 className="text-sm font-semibold text-gray-900 mb-3">At a glance — published content</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {STATS.map(s => (
            <Link key={s.label} href={s.href} className={`admin-rise admin-lift rounded-xl p-4 block tile-grad-${s.grad}`}>
              <s.Icon size={17} className="mb-2 text-gray-700" />
              <p className="text-2xl font-bold text-gray-900">{s.n}</p>
              <p className="text-xs text-gray-600">{s.label}</p>
            </Link>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2 mt-4">
          <span className="text-xs text-gray-500 mr-1">Quick add:</span>
          {QUICK_ADD.map(q => (
            <Link key={q.href} href={q.href} className="inline-flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50">
              <Plus size={13} /> {q.label}
            </Link>
          ))}
        </div>
      </section>

      {/* Live preview */}
      <section>
        <h2 className="text-sm font-semibold text-gray-900 mb-3">Live preview</h2>
        <StorefrontPreview />
      </section>

      {/* Manage */}
      <section>
        <h2 className="text-sm font-semibold text-gray-900 mb-3">Content, appearance &amp; media</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {MANAGE.map(m => (
            <Link key={m.label} href={m.href} className="flex items-start gap-3 border border-gray-200 rounded-lg bg-white p-4 hover:bg-gray-50">
              <span className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-gray-100 text-gray-700 shrink-0"><m.Icon size={16} /></span>
              <span className="min-w-0">
                <span className="block text-sm font-medium text-gray-900">{m.label}</span>
                <span className="block text-xs text-gray-500">{m.sub}</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Pages — edit copy + preview */}
      <section>
        <h2 className="text-sm font-semibold text-gray-900 mb-1">Pages</h2>
        <p className="text-xs text-gray-500 mb-3">Edit each page&apos;s copy, or preview it on the live site.</p>
        <div className="border border-gray-200 rounded-lg bg-white divide-y divide-gray-100">
          {pages.map(p => (
            <div key={p.page} className="flex items-center justify-between gap-3 px-4 py-2.5">
              <span className="text-sm text-gray-800 truncate">{p.label}</span>
              <span className="flex items-center gap-3 shrink-0">
                <Link href={`/admin/pages/${p.page}`} className="text-xs text-gray-600 hover:text-gray-900 underline">Edit copy</Link>
                <a href={`${SITE}${p.path}`} target="_blank" rel="noopener noreferrer" className="text-xs text-gray-400 hover:text-gray-700">Preview ↗</a>
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
