import nodemailer from "nodemailer";

// Single place that builds the SMTP transport from env, so every outgoing
// email (concierge replies, newsletter, future confirmations) uses the
// same configuration.
export function createTransport() {
  const port = Number(process.env.SMTP_PORT ?? 587);
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465, // implicit TLS on 465, STARTTLS on 587
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

export const FROM_NEWSLETTER = () => `"Voyages & Co." <${process.env.SMTP_USER}>`;
export const FROM_CONCIERGE = () => `"Voyages & Co. Concierge" <${process.env.SMTP_USER}>`;
