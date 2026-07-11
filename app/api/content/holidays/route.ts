import { NextResponse } from "next/server";
import { getCountryMeta } from "@/lib/country-meta";

export const dynamic = "force-dynamic";

// Upcoming public holidays / festivals at a destination, so guests know what
// might be closed — or which celebrations they could catch. Data from the free
// Nager.Date API (no key), which computes moving dates (Easter, and where
// supported Diwali/Eid/Lunar New Year). Cached a day. Returns [] when the
// country isn't supported, so the card just hides.

type Holiday = { date: string; name: string; localName: string };

async function fetchYear(year: number, iso2: string): Promise<Holiday[]> {
  try {
    const res = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/${iso2}`, {
      next: { revalidate: 86400 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    if (!Array.isArray(data)) return [];
    return data.map((h: { date: string; name: string; localName: string }) => ({ date: h.date, name: h.name, localName: h.localName }));
  } catch {
    return [];
  }
}

export async function GET(req: Request) {
  const country = new URL(req.url).searchParams.get("country");
  const meta = getCountryMeta(country);
  if (!meta) return NextResponse.json({ holidays: [] });

  const now = new Date();
  const year = now.getUTCFullYear();
  const today = now.toISOString().slice(0, 10);

  const [thisYear, nextYear] = await Promise.all([fetchYear(year, meta.iso2), fetchYear(year + 1, meta.iso2)]);
  const upcoming = [...thisYear, ...nextYear]
    .filter(h => h.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 5);

  return NextResponse.json({ holidays: upcoming });
}
