import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { notifyAdminEnquiry } from "@/lib/email/notify-admin";
import { verifyTurnstile, clientIp } from "@/lib/security/turnstile";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Group-travel enquiry (weddings, corporate, multi-generational trips). Lands in
// the enquiries inbox as type "group".
export async function POST(req: Request) {
  const { name, email, phone, groupType, groupSize, destination, dates, details, turnstileToken } = await req.json().catch(() => ({}));
  if (!(await verifyTurnstile(turnstileToken, clientIp(req)))) return NextResponse.json({ error: "Verification failed. Please try again." }, { status: 400 });
  if (!name || typeof name !== "string") return NextResponse.json({ error: "Please enter your name" }, { status: 400 });
  if (!email || !EMAIL_RE.test(email)) return NextResponse.json({ error: "Please enter a valid email" }, { status: 400 });

  const message = [
    groupType && `Occasion: ${groupType}`,
    groupSize && `Group size: ${groupSize}`,
    destination && `Destination: ${destination}`,
    dates && `When: ${dates}`,
    details && `Details: ${details}`,
  ].filter(Boolean).join("\n");

  try {
    await prisma.enquiry.create({
      data: { type: "group", name, email, phone: phone || null, subject: "Group booking", message, itemTitle: destination || null },
    });
  } catch (err) {
    console.error("Group request failed:", err);
    return NextResponse.json({ error: "Something went wrong, please try again" }, { status: 500 });
  }
  await notifyAdminEnquiry({ type: "group", name, email, phone, subject: "Group booking", message });
  return NextResponse.json({ ok: true });
}
