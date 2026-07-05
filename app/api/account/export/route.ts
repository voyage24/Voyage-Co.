import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentCustomer } from "@/lib/customer/session";

// Self-service data export (GDPR). Returns everything we hold that's linked to
// the signed-in member, as a downloadable JSON file.
export async function GET() {
  const customer = await getCurrentCustomer();
  if (!customer) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const [bookings, saved, searches, itineraries, reviews] = await Promise.all([
    prisma.booking.findMany({ where: { customerId: customer.id }, orderBy: { createdAt: "desc" } }),
    prisma.savedItem.findMany({ where: { customerId: customer.id }, orderBy: { createdAt: "desc" } }),
    prisma.savedSearch.findMany({ where: { customerId: customer.id }, orderBy: { createdAt: "desc" } }),
    prisma.itinerary.findMany({ where: { customerId: customer.id }, orderBy: { createdAt: "desc" } }),
    prisma.review.findMany({ where: { customerId: customer.id }, orderBy: { createdAt: "desc" } }),
  ]);

  const data = {
    exportedAt: new Date().toISOString(),
    profile: {
      email: customer.email,
      name: customer.name,
      phone: customer.phone,
      tier: customer.tier,
      points: customer.points,
      birthday: customer.birthday,
      anniversary: customer.anniversary,
      emailVerified: customer.emailVerified,
      createdAt: customer.createdAt,
    },
    bookings,
    savedItems: saved,
    savedSearches: searches,
    itineraries,
    reviews,
  };

  return new NextResponse(JSON.stringify(data, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="voyages-co-data-${customer.id}.json"`,
    },
  });
}
