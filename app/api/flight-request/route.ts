import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { notifyAdminEnquiry } from "@/lib/email/notify-admin";
import { verifyTurnstile, clientIp } from "@/lib/security/turnstile";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Request-to-book a live flight fare. Lands in the enquiries inbox as type
// "flight" — the concierge confirms fares & tickets manually.
export async function POST(req: Request) {
  const { name, email, phone, route, date, returnDate, passengers, cabin, price, airline, details, turnstileToken } = await req.json().catch(() => ({}));
  if (!(await verifyTurnstile(turnstileToken, clientIp(req)))) return NextResponse.json({ error: "Verification failed. Please try again." }, { status: 400 });
  if (!name || typeof name !== "string") return NextResponse.json({ error: "Please enter your name" }, { status: 400 });
  if (!email || !EMAIL_RE.test(email)) return NextResponse.json({ error: "Please enter a valid email" }, { status: 400 });
  if (!route) return NextResponse.json({ error: "Missing flight details" }, { status: 400 });

  const subject = `Flight request — ${route}`;
  const message = [
    airline ? `Airline: ${airline}` : null,
    `Route: ${route}`,
    date ? `Depart: ${date}` : null,
    returnDate ? `Return: ${returnDate}` : null,
    `Passengers: ${passengers ?? 1}`,
    cabin ? `Cabin: ${cabin}` : null,
    price ? `Quoted fare: ₹${Number(price).toLocaleString("en-IN")}` : null,
    details ? `\n${details}` : null,
  ].filter(Boolean).join("\n");

  try {
    await prisma.enquiry.create({
      data: { type: "flight", name, email, phone: phone || null, subject, message, itemTitle: route, total: price ? Math.round(Number(price)) : null },
    });
  } catch (err) {
    console.error("Flight request failed:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
  await notifyAdminEnquiry({ type: "flight", name, email, phone, subject, message, total: price ? Math.round(Number(price)) : undefined });
  return NextResponse.json({ ok: true });
}
