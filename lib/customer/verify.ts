import crypto from "crypto";
import type { Customer } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { createTransport, FROM_CONCIERGE } from "@/lib/email/transport";
import { renderConciergeEmailHTML, renderConciergeEmailText } from "@/lib/email/template";
import { notifyWhatsApp } from "@/lib/email/notify-admin";

const VERIFY_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const SITE_URL = "https://voyagesco.com";

function hashVerifyToken(token: string): string {
  const secret = process.env.SESSION_COOKIE_SECRET ?? "";
  return crypto.createHmac("sha256", secret).update(`verify:${token}`).digest("hex");
}

// Issues a fresh verification token, storing its hash + expiry on the customer,
// and returns the raw token to embed in the email link.
export async function issueVerifyToken(customerId: string): Promise<string> {
  const token = crypto.randomBytes(32).toString("hex");
  await prisma.customer.update({
    where: { id: customerId },
    data: { verifyTokenHash: hashVerifyToken(token), verifyExpiresAt: new Date(Date.now() + VERIFY_TTL_MS) },
  });
  return token;
}

// Validates a token; on success marks the account verified, clears the token,
// and returns the customer. Returns null if the token is unknown or expired.
export async function consumeVerifyToken(token: string): Promise<Customer | null> {
  if (!token) return null;
  const customer = await prisma.customer.findFirst({ where: { verifyTokenHash: hashVerifyToken(token) } });
  if (!customer) return null;
  if (customer.verifyExpiresAt && customer.verifyExpiresAt < new Date()) return null;
  return prisma.customer.update({
    where: { id: customer.id },
    data: { emailVerified: new Date(), verifyTokenHash: null, verifyExpiresAt: null },
  });
}

// Sends the "confirm your email" message. Best-effort; caller decides how to
// handle a throw (we generally let signup succeed regardless).
export async function sendVerificationEmail(customer: Customer, token: string): Promise<void> {
  if (!process.env.SMTP_HOST) return;
  const link = `${SITE_URL}/api/account/verify?token=${encodeURIComponent(token)}`;
  const firstName = customer.name?.split(" ")[0];
  const heading = `Confirm your email${firstName ? `, ${firstName}` : ""}`;
  const bodyText = "Please confirm your email address to activate your Voyages & Co. account. This link is valid for 24 hours. If you didn't create an account, you can safely ignore this message.";
  const transporter = createTransport();
  await transporter.sendMail({
    from: FROM_CONCIERGE(),
    to: customer.email,
    subject: "Confirm your Voyages & Co. account",
    text: `${renderConciergeEmailText({ heading, bodyText, signoff: "With warm regards," })}\n\nConfirm your email: ${link}`,
    html: renderConciergeEmailHTML({
      eyebrow: "Membership",
      heading,
      bodyHtml: `<p style="margin:0 0 12px;">${bodyText}</p><p style="margin:0;font-size:13px;color:#A39C8C;">Or paste this link into your browser:<br>${link}</p>`,
      signoff: "With warm regards,",
      ctaLabel: "Confirm my email",
      ctaHref: link,
    }),
  });
}

// Welcome the (now verified) member + alert the team. Runs only after the email
// is confirmed, so bogus signups never generate these notifications.
export async function sendWelcomeAndNotify(customer: Customer): Promise<void> {
  const firstName = customer.name?.split(" ")[0];
  try {
    if (process.env.SMTP_HOST) {
      const transporter = createTransport();
      if (process.env.CONTACT_TO_EMAIL) {
        await transporter.sendMail({
          from: FROM_CONCIERGE(),
          to: process.env.CONTACT_TO_EMAIL,
          subject: `[New account] ${customer.name || customer.email}`,
          html: `<p>A new member has just confirmed their account.</p>
            <p><strong>Name:</strong> ${customer.name || "—"}<br/><strong>Email:</strong> ${customer.email}</p>
            <p><a href="${SITE_URL}/admin/customers">View customers &rarr;</a></p>`,
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
    console.error("Welcome emails failed:", err);
  }
  await notifyWhatsApp(`🔔 New account (verified)\n${customer.name || customer.email}`);
}
