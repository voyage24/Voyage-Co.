import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { notifyAdminEnquiry } from "@/lib/email/notify-admin";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Request a concierge add-on service (transfers, private chef, charter…).
// Lands in the enquiries inbox as type "service".
export async function POST(req: Request) {
  const { name, email, phone, service, date, details } = await req.json().catch(() => ({}));
  if (!name || typeof name !== "string") return NextResponse.json({ error: "Please enter your name" }, { status: 400 });
  if (!email || !EMAIL_RE.test(email)) return NextResponse.json({ error: "Please enter a valid email" }, { status: 400 });
  if (!service) return NextResponse.json({ error: "Please choose a service" }, { status: 400 });

  const message = `Service: ${service}${date ? `\nWhen: ${date}` : ""}${details ? `\n\n${details}` : ""}`;
  try {
    await prisma.enquiry.create({
      data: { type: "service", name, email, phone: phone || null, subject: `Concierge service — ${service}`, message },
    });
  } catch (err) {
    console.error("Service request failed:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
  await notifyAdminEnquiry({ type: "service", name, email, phone, subject: `Concierge service — ${service}`, message });
  return NextResponse.json({ ok: true });
}
