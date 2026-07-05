import crypto from "crypto";
import bcrypt from "bcryptjs";
import type { Customer } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { createTransport, FROM_CONCIERGE } from "@/lib/email/transport";
import { renderConciergeEmailHTML, renderConciergeEmailText } from "@/lib/email/template";

const RESET_TTL_MS = 60 * 60 * 1000; // 1 hour
const SITE_URL = "https://voyagesco.com";

function hashResetToken(token: string): string {
  const secret = process.env.SESSION_COOKIE_SECRET ?? "";
  return crypto.createHmac("sha256", secret).update(`reset:${token}`).digest("hex");
}

// Issues a fresh reset token, storing its hash + expiry, and returns the raw
// token to embed in the email link.
export async function issueResetToken(customerId: string): Promise<string> {
  const token = crypto.randomBytes(32).toString("hex");
  await prisma.customer.update({
    where: { id: customerId },
    data: { resetTokenHash: hashResetToken(token), resetExpiresAt: new Date(Date.now() + RESET_TTL_MS) },
  });
  return token;
}

// Validates a token and, on success, sets the new password, clears the token,
// and marks the email verified (receiving the reset proves inbox control).
// Returns the updated customer, or null if the token is unknown or expired.
export async function resetPassword(token: string, newPassword: string): Promise<Customer | null> {
  if (!token) return null;
  const customer = await prisma.customer.findFirst({ where: { resetTokenHash: hashResetToken(token) } });
  if (!customer) return null;
  if (customer.resetExpiresAt && customer.resetExpiresAt < new Date()) return null;
  const passwordHash = await bcrypt.hash(newPassword, 12);
  return prisma.customer.update({
    where: { id: customer.id },
    data: {
      passwordHash,
      resetTokenHash: null,
      resetExpiresAt: null,
      emailVerified: customer.emailVerified ?? new Date(),
    },
  });
}

// Sends the "reset your password" message. Best-effort.
export async function sendResetEmail(customer: Customer, token: string): Promise<void> {
  if (!process.env.SMTP_HOST) return;
  const link = `${SITE_URL}/reset?token=${encodeURIComponent(token)}`;
  const firstName = customer.name?.split(" ")[0];
  const heading = `Reset your password${firstName ? `, ${firstName}` : ""}`;
  const bodyText = "We received a request to reset your Voyages & Co. password. This link is valid for one hour. If you didn't ask for this, you can safely ignore this email — your password won't change.";
  const transporter = createTransport();
  await transporter.sendMail({
    from: FROM_CONCIERGE(),
    to: customer.email,
    subject: "Reset your Voyages & Co. password",
    text: `${renderConciergeEmailText({ heading, bodyText, signoff: "With warm regards," })}\n\nReset your password: ${link}`,
    html: renderConciergeEmailHTML({
      eyebrow: "Account",
      heading,
      bodyHtml: `<p style="margin:0 0 12px;">${bodyText}</p><p style="margin:0;font-size:13px;color:#A39C8C;">Or paste this link into your browser:<br>${link}</p>`,
      signoff: "With warm regards,",
      ctaLabel: "Reset my password",
      ctaHref: link,
    }),
  });
}
