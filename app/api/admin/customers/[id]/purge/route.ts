import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireOwner } from "@/lib/admin/requireAdmin";
import { logAudit } from "@/lib/admin/audit";
import { reversePointsForBookings } from "@/lib/loyalty";

export const dynamic = "force-dynamic";

// Permanently delete a client's commercial records — bookings, enquiries,
// quotes, staff notes and follow-ups. Owner-only, and the caller must retype the
// client's email, because none of this is recoverable. The account itself and
// the mail history are deliberately left alone.
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireOwner(req);
  if (admin instanceof NextResponse) return admin;

  const customer = await prisma.customer.findUnique({ where: { id: params.id }, select: { id: true, email: true } });
  if (!customer) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { confirmEmail } = await req.json().catch(() => ({}));
  if (String(confirmEmail || "").trim().toLowerCase() !== customer.email.toLowerCase()) {
    return NextResponse.json({ error: "Type the client's email exactly to confirm." }, { status: 400 });
  }

  // Records are email-keyed (guests book without an account), so match on the
  // account id and the email, case-insensitively.
  const ci = { equals: customer.email, mode: "insensitive" as const };

  // Take back points earned by the journeys we're about to delete.
  const owned = await prisma.booking.findMany({
    where: { OR: [{ customerId: customer.id }, { guestEmail: ci }] },
    select: { customerId: true, total: true, pointsAwarded: true },
  });
  await reversePointsForBookings(owned);

  const [bookings, enquiries, quotes, notes, followups] = await prisma.$transaction([
    prisma.booking.deleteMany({ where: { OR: [{ customerId: customer.id }, { guestEmail: ci }] } }),
    prisma.enquiry.deleteMany({ where: { email: ci } }),
    prisma.quote.deleteMany({ where: { customerEmail: ci } }),
    prisma.customerNote.deleteMany({ where: { email: ci } }),
    prisma.followUp.deleteMany({ where: { email: ci } }),
  ]);

  const deleted = { bookings: bookings.count, enquiries: enquiries.count, quotes: quotes.count, notes: notes.count, followups: followups.count };
  await logAudit(
    admin.email, "purge", "customer", customer.id,
    `Purged ${customer.email}: ${deleted.bookings} bookings, ${deleted.enquiries} enquiries, ${deleted.quotes} quotes, ${deleted.notes} notes, ${deleted.followups} follow-ups`,
  );

  return NextResponse.json({ ok: true, deleted });
}
