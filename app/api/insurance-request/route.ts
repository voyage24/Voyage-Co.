import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { notifyAdminEnquiry } from "@/lib/email/notify-admin";
import { verifyTurnstile, clientIp } from "@/lib/security/turnstile";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Request a travel-insurance quote. Lands in the enquiries inbox as type "insurance".
export async function POST(req: Request) {
  const { name, email, phone, plan, destination, travellers, tripStart, tripEnd, details, turnstileToken } = await req.json().catch(() => ({}));
  if (!(await verifyTurnstile(turnstileToken, clientIp(req)))) return NextResponse.json({ error: "Verification failed. Please try again." }, { status: 400 });
  if (!name || typeof name !== "string") return NextResponse.json({ error: "Please enter your name" }, { status: 400 });
  if (!email || !EMAIL_RE.test(email)) return NextResponse.json({ error: "Please enter a valid email" }, { status: 400 });

  const subject = `Insurance quote — ${plan || "Travel cover"}`;
  const message = [
    plan ? `Plan: ${plan}` : null,
    destination ? `Destination: ${destination}` : null,
    travellers ? `Travellers: ${travellers}` : null,
    tripStart ? `Trip: ${tripStart}${tripEnd ? ` → ${tripEnd}` : ""}` : null,
    details ? `\n${details}` : null,
  ].filter(Boolean).join("\n");

  try {
    await prisma.enquiry.create({
      data: { type: "insurance", name, email, phone: phone || null, subject, message, itemTitle: plan || destination || null },
    });
  } catch (err) {
    console.error("Insurance request failed:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
  await notifyAdminEnquiry({ type: "insurance", name, email, phone, subject, message });
  return NextResponse.json({ ok: true });
}
