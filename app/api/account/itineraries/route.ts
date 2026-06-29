import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentCustomer } from "@/lib/customer/session";

type Entry = { type: string; id: string; title: string; image?: string; href: string; price?: number };

export async function GET() {
  const customer = await getCurrentCustomer();
  if (!customer) return NextResponse.json({ loggedIn: false, itineraries: [] });
  const itineraries = await prisma.itinerary.findMany({
    where: { customerId: customer.id },
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json({ loggedIn: true, itineraries });
}

export async function POST(req: Request) {
  const customer = await getCurrentCustomer();
  if (!customer) return NextResponse.json({ error: "Please sign in" }, { status: 401 });

  const { title, notes, items, requestQuote } = await req.json().catch(() => ({}));
  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: "Add at least one item to your itinerary" }, { status: 400 });
  }
  const clean: Entry[] = items.filter((i: Entry) => i?.type && i?.id && i?.title).slice(0, 15);
  const estimate = clean.reduce((s, i) => s + (Number(i.price) || 0), 0);

  const itinerary = await prisma.itinerary.create({
    data: {
      customerId: customer.id,
      title: (typeof title === "string" && title.trim()) || "My itinerary",
      notes: typeof notes === "string" ? notes.slice(0, 2000) : null,
      items: clean,
      estimate,
      status: requestQuote ? "requested" : "draft",
    },
  });

  if (requestQuote) {
    const lines = clean.map(i => `• ${i.title}${i.price ? ` (~₹${i.price.toLocaleString("en-IN")})` : ""}`).join("\n");
    await prisma.enquiry.create({
      data: {
        type: "itinerary",
        name: customer.name?.trim() || customer.email.split("@")[0],
        email: customer.email,
        subject: `Itinerary quote: ${itinerary.title}`,
        message: `Itinerary "${itinerary.title}" — estimated ₹${estimate.toLocaleString("en-IN")}\n\n${lines}${notes ? `\n\nNotes: ${notes}` : ""}`,
        total: estimate || null,
      },
    });
  }

  return NextResponse.json({ ok: true, itinerary });
}
