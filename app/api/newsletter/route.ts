import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { prisma } from "@/lib/prisma";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  const { email, language } = await req.json();

  if (!email || typeof email !== "string" || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 });
  }

  await prisma.newsletterSubscriber.upsert({
    where: { email },
    create: { email, language: language || null },
    update: {},
  });

  // Best-effort notification — a failed email should never fail the
  // subscription itself, since the subscriber is already safely stored.
  try {
    const port = Number(process.env.SMTP_PORT ?? 587);
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: port === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
    await transporter.sendMail({
      from: `"Voyages & Co. Website" <${process.env.SMTP_USER}>`,
      to: process.env.CONTACT_TO_EMAIL,
      subject: "New newsletter subscriber",
      text: `New subscriber: ${email}`,
    });
  } catch {
    // Ignore — the subscription itself already succeeded.
  }

  return NextResponse.json({ ok: true });
}
