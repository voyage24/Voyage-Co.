import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Haversine distance in km.
function distanceKm(aLat: number, aLng: number, bLat: number, bLng: number) {
  const R = 6371;
  const dLat = ((bLat - aLat) * Math.PI) / 180;
  const dLng = ((bLng - aLng) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((aLat * Math.PI) / 180) * Math.cos((bLat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s)));
}

// Nearest published stays + experiences to a set of coordinates.
export async function GET(req: NextRequest) {
  const lat = parseFloat(req.nextUrl.searchParams.get("lat") || "");
  const lng = parseFloat(req.nextUrl.searchParams.get("lng") || "");
  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    return NextResponse.json({ error: "lat and lng required" }, { status: 400 });
  }

  const [hotels, experiences] = await Promise.all([
    prisma.hotel.findMany({
      where: { published: true, lat: { not: null }, lng: { not: null } },
      select: { id: true, name: true, location: true, image: true, category: true, lat: true, lng: true },
    }),
    prisma.experience.findMany({
      where: { published: true, lat: { not: null }, lng: { not: null } },
      select: { id: true, title: true, location: true, image: true, category: true, lat: true, lng: true },
    }),
  ]);

  const stays = hotels
    .map(h => ({ type: "hotel", id: h.id, title: h.name, location: h.location, image: h.image, category: h.category, href: `/hotels/${h.id}`, km: distanceKm(lat, lng, h.lat!, h.lng!) }))
    .sort((a, b) => a.km - b.km).slice(0, 8);
  const exps = experiences
    .map(e => ({ type: "experience", id: e.id, title: e.title, location: e.location, image: e.image, category: e.category, href: `/experiences/${e.id}`, km: distanceKm(lat, lng, e.lat!, e.lng!) }))
    .sort((a, b) => a.km - b.km).slice(0, 8);

  return NextResponse.json({ stays, experiences: exps });
}
