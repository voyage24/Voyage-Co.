import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createTransport, FROM_CONCIERGE } from "@/lib/email/transport";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// "Plan Your Journey" wizard submission — a rich, qualified lead. Stored as
// an enquiry (type "planner") and emailed to the concierge. Designed so the
// same structured payload can later feed a real booking/itinerary flow.
export async function POST(req: Request) {
  const b = await req.json().catch(() => ({}));
  const { name, email, phone, destination, dates, nights, adults, children, budget, interests, occasion, notes } = b ?? {};

  if (!name || !email || typeof email !== "string" || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Name and a valid email are required" }, { status: 400 });
  }

  const summary = [
    destination && `Destination: ${destination}`,
    dates && `When: ${dates}`,
    nights && `Nights: ${nights}`,
    (adults || children) && `Party: ${adults ?? 0} adults, ${children ?? 0} children`,
    budget && `Budget: ${budget}`,
    Array.isArray(interests) && interests.length && `Interests: ${interests.join(", ")}`,
    occasion && `Occasion: ${occasion}`,
    notes && `Notes: ${notes}`,
  ].filter(Boolean).join("\n");

  try {
    await prisma.enquiry.create({
      data: {
        type: "planner",
        name,
        email,
        phone: phone || null,
        subject: "Plan Your Journey",
        message: summary,
        itemTitle: destination || null,
      },
    });
  } catch (err) {
    console.error("Failed to store planner enquiry:", err);
  }

  try {
    const transporter = createTransport();
    await transporter.sendMail({
      from: FROM_CONCIERGE(),
      to: process.env.CONTACT_TO_EMAIL,
      replyTo: email,
      subject: `[Plan Your Journey] ${destination || "New enquiry"} — ${name}`,
      text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone || "—"}\n\n${summary}`,
    });
  } catch (err) {
    console.error("Planner notification email failed:", err);
  }

  return NextResponse.json({ ok: true });
}
