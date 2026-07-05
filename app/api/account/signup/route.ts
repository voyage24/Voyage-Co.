import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createCustomerSession, CUSTOMER_COOKIE_NAME, CUSTOMER_SESSION_TTL_MS } from "@/lib/customer/session";
import { createTransport, FROM_CONCIERGE } from "@/lib/email/transport";
import { renderConciergeEmailHTML, renderConciergeEmailText } from "@/lib/email/template";
import { notifyWhatsApp } from "@/lib/email/notify-admin";
import { verifyTurnstile, clientIp } from "@/lib/security/turnstile";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  const { name, email, password, turnstileToken } = await req.json().catch(() => ({}));
  if (!(await verifyTurnstile(turnstileToken, clientIp(req)))) {
    return NextResponse.json({ error: "Verification failed. Please try again." }, { status: 400 });
  }
  if (!email || typeof email !== "string" || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 });
  }
  if (!password || typeof password !== "string" || password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
  }
  const normalized = email.trim().toLowerCase();

  const existing = await prisma.customer.findUnique({ where: { email: normalized } });
  if (existing) {
    return NextResponse.json({ error: "An account with that email already exists" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const customer = await prisma.customer.create({
    data: { email: normalized, passwordHash, name: name?.trim() || null },
  });

  // Welcome the new member + alert the team. All best-effort — a mail hiccup
  // must never fail the signup.
  const firstName = customer.name?.split(" ")[0];
  try {
    if (process.env.SMTP_HOST) {
      const transporter = createTransport();
      if (process.env.CONTACT_TO_EMAIL) {
        await transporter.sendMail({
          from: FROM_CONCIERGE(),
          to: process.env.CONTACT_TO_EMAIL,
          subject: `[New account] ${customer.name || customer.email}`,
          html: `<p>A new member has just created an account.</p>
            <p><strong>Name:</strong> ${customer.name || "—"}<br/><strong>Email:</strong> ${customer.email}</p>
            <p><a href="https://voyagesco.com/admin/customers">View customers &rarr;</a></p>`,
        });
      }
      const heading = `Welcome${firstName ? `, ${firstName}` : ""}`;
      const bodyText = "Your Voyages & Co. account is ready. You can now save journeys to your wishlist, build itineraries, track your bookings, and receive tailored ideas from our concierge. We look forward to crafting something extraordinary for you.";
      await transporter.sendMail({
        from: FROM_CONCIERGE(),
        to: customer.email,
        subject: "Welcome to Voyages & Co.",
        text: renderConciergeEmailText({ heading, bodyText, signoff: "With warm regards," }),
        html: renderConciergeEmailHTML({ eyebrow: "Membership", heading, bodyHtml: `<p style="margin:0;">${bodyText}</p>`, signoff: "With warm regards," }),
      });
    }
  } catch (err) {
    console.error("Signup emails failed:", err);
  }
  await notifyWhatsApp(`🔔 New account\n${customer.name || customer.email}`);

  const { token, expiresAt } = await createCustomerSession(customer.id);
  const res = NextResponse.json({ ok: true, customer: { id: customer.id, email: customer.email, name: customer.name } });
  res.cookies.set(CUSTOMER_COOKIE_NAME, token, {
    httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax",
    path: "/", maxAge: CUSTOMER_SESSION_TTL_MS / 1000,
  });
  return res;
}
