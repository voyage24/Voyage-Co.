import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// "Notify me when available" capture for sold-out items — stored as an
// enquiry so the concierge can follow up when a spot opens.
export async function POST(req: Request) {
  const { email, type, itemId, itemTitle } = await req.json().catch(() => ({}));
  if (!email || typeof email !== "string" || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 });
  }
  try {
    await prisma.enquiry.create({
      data: {
        type: "notify",
        name: email.split("@")[0],
        email,
        subject: "Notify when available",
        message: `Wants to be notified when "${itemTitle ?? itemId}" becomes available.`,
        itemType: type || null,
        itemId: itemId || null,
        itemTitle: itemTitle || null,
      },
    });
  } catch (err) {
    console.error("Notify request failed:", err);
  }
  return NextResponse.json({ ok: true });
}
