import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Returns current prices for a set of items (by type+id), so the client can
// compare against the price it recorded when the visitor last viewed them and
// surface any drops. Public, read-only.
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const items: { type?: string; id?: string }[] = Array.isArray(body?.items) ? body.items.slice(0, 24) : [];
  if (!items.length) return NextResponse.json({ prices: {} });

  const byType = (t: string) => items.filter(i => i.type === t && i.id).map(i => i.id!) as string[];
  const [hotels, exps, pkgs, cruises] = await Promise.all([
    prisma.hotel.findMany({ where: { id: { in: byType("hotel") }, published: true }, select: { id: true, pricePerNight: true } }),
    prisma.experience.findMany({ where: { id: { in: byType("experience") }, published: true }, select: { id: true, price: true } }),
    prisma.package.findMany({ where: { id: { in: byType("package") }, published: true }, select: { id: true, pricePerPerson: true } }),
    prisma.cruise.findMany({ where: { id: { in: byType("cruise") }, published: true }, select: { id: true, pricePerPerson: true } }),
  ]);

  const prices: Record<string, number> = {};
  hotels.forEach(h => { prices[`hotel:${h.id}`] = h.pricePerNight; });
  exps.forEach(e => { prices[`experience:${e.id}`] = e.price; });
  pkgs.forEach(p => { prices[`package:${p.id}`] = p.pricePerPerson; });
  cruises.forEach(c => { prices[`cruise:${c.id}`] = c.pricePerPerson; });

  return NextResponse.json({ prices });
}
