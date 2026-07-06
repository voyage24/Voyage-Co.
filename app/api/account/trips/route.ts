import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentCustomer } from "@/lib/customer/session";

export const dynamic = "force-dynamic";

// Compact trip data for the offline wallet — cached on the device so bookings,
// references and vouchers are viewable with no signal (airports, abroad).
export async function GET() {
  const customer = await getCurrentCustomer();
  if (!customer) return NextResponse.json({ loggedIn: false, trips: [] });

  const bookings = await prisma.booking.findMany({
    where: { customerId: customer.id },
    orderBy: { createdAt: "desc" },
    select: {
      reference: true, itemTitle: true, type: true, status: true,
      checkIn: true, checkOut: true, guests: true, total: true, currency: true,
      seat: true, guestName: true, documents: true,
    },
  });

  return NextResponse.json({
    loggedIn: true,
    name: customer.name || customer.email,
    cachedAt: new Date().toISOString(),
    trips: bookings,
  });
}
