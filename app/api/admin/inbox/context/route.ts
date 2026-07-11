import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/requireAdmin";

// Client context for the mail app: given a sender email, return who they are and
// their recent trips/enquiries so replies can be written with full context.
export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;
  const email = req.nextUrl.searchParams.get("email");
  if (!email) return NextResponse.json({ found: false });
  const ci = { equals: email, mode: "insensitive" as const };

  const [customer, bookings, enquiryCount, openFollowups] = await Promise.all([
    prisma.customer.findFirst({ where: { email: ci }, select: { id: true, name: true, tier: true, points: true, createdAt: true } }),
    prisma.booking.findMany({ where: { guestEmail: ci }, orderBy: { createdAt: "desc" }, take: 4, select: { itemTitle: true, reference: true, status: true, checkIn: true, total: true, currency: true } }),
    prisma.enquiry.count({ where: { email: ci } }),
    prisma.followUp.count({ where: { email: ci, done: false } }),
  ]);

  if (!customer && bookings.length === 0 && enquiryCount === 0) return NextResponse.json({ found: false });

  const lifetimeValue = bookings.reduce((s, b) => s + (b.status !== "cancelled" ? b.total : 0), 0);
  return NextResponse.json({
    found: true,
    id: customer?.id ?? null,
    name: customer?.name ?? null,
    tier: customer?.tier ?? null,
    points: customer?.points ?? 0,
    memberSince: customer?.createdAt ?? null,
    bookings,
    enquiryCount,
    openFollowups,
    lifetimeValue,
  });
}
