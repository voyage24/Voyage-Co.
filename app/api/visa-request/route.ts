import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { notifyAdminEnquiry } from "@/lib/email/notify-admin";
import { verifyTurnstile, clientIp } from "@/lib/security/turnstile";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Request visa assistance. Lands in the enquiries inbox as type "visa".
export async function POST(req: Request) {
  const { name, email, phone, destination, nationality, travelDate, visaType, details, turnstileToken } = await req.json().catch(() => ({}));
  if (!(await verifyTurnstile(turnstileToken, clientIp(req)))) return NextResponse.json({ error: "Verification failed. Please try again." }, { status: 400 });
  if (!name || typeof name !== "string") return NextResponse.json({ error: "Please enter your name" }, { status: 400 });
  if (!email || !EMAIL_RE.test(email)) return NextResponse.json({ error: "Please enter a valid email" }, { status: 400 });
  if (!destination) return NextResponse.json({ error: "Please enter your destination" }, { status: 400 });

  const subject = `Visa assistance — ${destination}`;
  const message = [
    `Destination: ${destination}`,
    nationality ? `Passport / nationality: ${nationality}` : null,
    visaType ? `Visa type: ${visaType}` : null,
    travelDate ? `Travel date: ${travelDate}` : null,
    details ? `\n${details}` : null,
  ].filter(Boolean).join("\n");

  try {
    await prisma.enquiry.create({
      data: { type: "visa", name, email, phone: phone || null, subject, message, itemTitle: destination },
    });
  } catch (err) {
    console.error("Visa request failed:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
  await notifyAdminEnquiry({ type: "visa", name, email, phone, subject, message });
  return NextResponse.json({ ok: true });
}
