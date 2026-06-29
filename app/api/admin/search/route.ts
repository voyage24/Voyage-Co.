import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/requireAdmin";

type Hit = { type: string; title: string; subtitle: string; href: string };

export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;
  const q = (new URL(req.url).searchParams.get("q") ?? "").trim();
  if (q.length < 2) return NextResponse.json({ results: [] });
  const like = { contains: q, mode: "insensitive" as const };

  const [bookings, enquiries, customers] = await Promise.all([
    prisma.booking.findMany({ where: { OR: [{ reference: like }, { guestName: like }, { guestEmail: like }, { itemTitle: like }] }, take: 5, orderBy: { createdAt: "desc" }, select: { reference: true, guestName: true, itemTitle: true, status: true } }),
    prisma.enquiry.findMany({ where: { OR: [{ name: like }, { email: like }, { subject: like }] }, take: 5, orderBy: { createdAt: "desc" }, select: { id: true, name: true, type: true, subject: true } }),
    prisma.customer.findMany({ where: { OR: [{ name: like }, { email: like }] }, take: 5, orderBy: { createdAt: "desc" }, select: { id: true, name: true, email: true } }),
  ]);

  const results: Hit[] = [
    ...bookings.map(b => ({ type: "Booking", title: `${b.reference} · ${b.guestName}`, subtitle: `${b.itemTitle} · ${b.status}`, href: "/admin/bookings" })),
    ...enquiries.map(e => ({ type: "Enquiry", title: e.name, subtitle: `${e.type}${e.subject ? ` · ${e.subject}` : ""}`, href: "/admin/enquiries" })),
    ...customers.map(c => ({ type: "Customer", title: c.name || c.email, subtitle: c.email, href: "/admin/customers" })),
  ];
  return NextResponse.json({ results });
}
