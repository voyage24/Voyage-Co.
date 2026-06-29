import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// "Send a gift" request — concierge issues the card once payment is arranged.
export async function POST(req: Request) {
  const { senderName, senderEmail, recipientName, recipientEmail, amount, message } = await req.json().catch(() => ({}));
  if (!senderName || !senderEmail || !EMAIL_RE.test(senderEmail)) {
    return NextResponse.json({ error: "Please enter your name and a valid email" }, { status: 400 });
  }
  const amt = Number(amount) || 0;
  if (amt <= 0) return NextResponse.json({ error: "Please choose an amount" }, { status: 400 });

  try {
    await prisma.enquiry.create({
      data: {
        type: "gift",
        name: senderName,
        email: senderEmail,
        subject: `Gift card request — ₹${amt.toLocaleString("en-IN")}`,
        message: `Gift card request\nAmount: ₹${amt.toLocaleString("en-IN")}\nFor: ${recipientName || "—"} (${recipientEmail || "no email"})\nMessage: ${message || "—"}`,
        total: amt,
      },
    });
  } catch (err) {
    console.error("Gift request failed:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
