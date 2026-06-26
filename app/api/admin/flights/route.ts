import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { uniqueSlug } from "@/lib/utils/slugify";
import { requireAdmin } from "@/lib/admin/requireAdmin";

export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;
  const flights = await prisma.flight.findMany({ orderBy: { updatedAt: "desc" } });
  return NextResponse.json({ flights });
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;
  const data = await req.json();

  if (!data.origin || !data.destination || !data.airline) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const id = await uniqueSlug(
    `${data.airline}-${data.origin}-${data.destination}`,
    async slug => !!(await prisma.flight.findUnique({ where: { id: slug } }))
  );

  const flight = await prisma.flight.create({
    data: {
      id,
      origin: data.origin,
      originCity: data.originCity ?? "",
      destination: data.destination,
      destinationCity: data.destinationCity ?? "",
      airline: data.airline,
      airlineCode: data.airlineCode ?? "",
      flightNumber: data.flightNumber ?? "",
      departure: data.departure ?? "",
      arrival: data.arrival ?? "",
      duration: data.duration ?? "",
      stops: Number(data.stops) || 0,
      price: Number(data.price) || 0,
      businessPrice: data.businessPrice ? Number(data.businessPrice) : null,
      amenities: data.amenities ?? [],
      currency: data.currency || "INR",
      published: data.published ?? true,
    },
  });

  return NextResponse.json({ flight }, { status: 201 });
}
