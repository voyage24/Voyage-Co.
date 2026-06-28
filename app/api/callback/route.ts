import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// "Request a callback" — lands in the enquiries inbox (type "callback") with
// the preferred day/time in the message so the concierge can call back.
export async function POST(req: Request) {
  const { name, email, phone, day, slot, note } = await req.json().catch(() => ({}));
  if (!name || typeof name !== "string") return NextResponse.json({ error: "Please enter your name" }, { status: 400 });
  if (!phone || typeof phone !== "string") return NextResponse.json({ error: "Please enter a phone number" }, { status: 400 });
  if (!email || !EMAIL_RE.test(email)) return NextResponse.json({ error: "Please enter a valid email" }, { status: 400 });

  const when = [day, slot].filter(Boolean).join(" · ") || "Any time";
  const message = `Preferred time: ${when}${note ? `\n\n${note}` : ""}`;

  try {
    await prisma.enquiry.create({
      data: { type: "callback", name, email, phone, subject: "Callback request", message },
    });
  } catch (err) {
    console.error("Callback request failed:", err);
    return NextResponse.json({ error: "Something went wrong, please try again" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
