import Link from "next/link";

export const dynamic = "force-dynamic";

const SITE = "https://voyagesco.com";

// Public-facing pages, grouped, each previewable on the live site.
const PAGE_GROUPS: { title: string; pages: { label: string; path: string }[] }[] = [
  {
    title: "Main",
    pages: [
      { label: "Home", path: "/" },
      { label: "Plan Your Journey", path: "/plan" },
      { label: "Journal", path: "/blog" },
    ],
  },
  {
    title: "Discover",
    pages: [
      { label: "Destinations", path: "/packages" },
      { label: "Stays", path: "/hotels" },
      { label: "Cruises", path: "/cruises" },
      { label: "Flights", path: "/flights" },
      { label: "Trains", path: "/trains" },
      { label: "Experiences", path: "/experiences" },
    ],
  },
  {
    title: "Maison",
    pages: [
      { label: "About", path: "/about" },
      { label: "Contact", path: "/contact" },
      { label: "Careers", path: "/careers" },
      { label: "Press", path: "/press" },
      { label: "Partners", path: "/partners" },
    ],
  },
];

// Things that change what the storefront shows.
const CONTENT_LINKS = [
  { label: "Appearance — colours, fonts, logo, hero text", href: "/admin/appearance" },
  { label: "Featured Destinations", href: "/admin/destinations" },
  { label: "Testimonials", href: "/admin/testimonials" },
  { label: "Featured journeys (homepage)", href: "/admin/packages" },
  { label: "Journal articles", href: "/admin/blog" },
];

export default function AdminStorefrontPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Storefront</h1>
          <p className="text-sm text-gray-500 mt-1">Preview the live site and manage the content &amp; media it shows.</p>
        </div>
        <a href={SITE} target="_blank" rel="noopener noreferrer"
          className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-md">
          View live site ↗
        </a>
      </div>

      {/* Pages index with preview links */}
      <section>
        <h2 className="text-sm font-semibold text-gray-900 mb-3">Pages</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {PAGE_GROUPS.map(g => (
            <div key={g.title} className="border border-gray-200 rounded-lg bg-white p-4">
              <p className="text-[10px] font-semibold tracking-[0.14em] uppercase text-gray-400 mb-2">{g.title}</p>
              <ul className="space-y-1">
                {g.pages.map(p => (
                  <li key={p.path}>
                    <a href={`${SITE}${p.path}`} target="_blank" rel="noopener noreferrer"
                      className="flex items-center justify-between text-sm text-gray-700 hover:text-gray-900 py-1 group">
                      <span>{p.label}</span>
                      <span className="text-gray-300 group-hover:text-gray-500 text-xs">Preview ↗</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Content shortcuts */}
      <section>
        <h2 className="text-sm font-semibold text-gray-900 mb-3">Content</h2>
        <div className="border border-gray-200 rounded-lg bg-white divide-y divide-gray-100">
          {CONTENT_LINKS.map(c => (
            <Link key={c.href} href={c.href} className="flex items-center justify-between px-4 py-3 text-sm text-gray-700 hover:bg-gray-50">
              <span>{c.label}</span>
              <span className="text-gray-300 text-xs">Manage →</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Media */}
      <section>
        <h2 className="text-sm font-semibold text-gray-900 mb-3">Media</h2>
        <Link href="/admin/media" className="inline-flex items-center gap-2 px-4 py-3 border border-gray-200 rounded-lg bg-white text-sm text-gray-700 hover:bg-gray-50">
          Open Media Library →
        </Link>
      </section>
    </div>
  );
}
