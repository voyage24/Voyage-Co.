import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { EN, DICTIONARIES } from "@/lib/i18n/dictionaries";
import { renderConciergeEmailHTML, renderConciergeEmailText } from "@/lib/email/template";
import { prisma } from "@/lib/prisma";

// Appended to every outgoing email — logo, web/phone, and a confidentiality
// notice. Kept in English regardless of recipient language, consistent with
// how legal/compliance boilerplate is usually handled across markets.
const EMAIL_FOOTER_HTML = `
  <table role="presentation" width="100%" style="margin-top:32px;padding-top:16px;border-top:1px solid #ddd;font-family:Arial,Helvetica,sans-serif;">
    <tr><td style="text-align:center;">
      <img src="https://voyagesco.com/logo-blue.png" alt="Voyages & Co." style="height:22px;margin-bottom:10px;display:inline-block;" />
      <p style="margin:0 0 6px;font-size:12px;color:#555;">
        <a href="https://voyagesco.com" style="color:#705C38;text-decoration:none;">voyagesco.com</a> &nbsp;·&nbsp; +91 99199 10213
      </p>
      <p style="margin:0;font-size:11px;color:#999;line-height:1.5;">
        This email and any attachments are confidential and intended solely for the addressee.
        If you have received this in error, please notify the sender and delete it.
        Voyages &amp; Co. does not guarantee the security of communications sent over the internet.
      </p>
    </td></tr>
  </table>
`;
const EMAIL_FOOTER_TEXT =
  "\n\n--\nVoyages & Co. | voyagesco.com | +91 99199 10213\n" +
  "This email and any attachments are confidential and intended solely for the addressee. " +
  "If you have received this in error, please notify the sender and delete it.";

export async function POST(req: Request) {
  const { name, email, phone, subject, message, language } = await req.json();
  const dict = DICTIONARIES[language as string] ?? EN;
  const tr = (key: string) => dict[key] ?? EN[key] ?? key;

  if (!name || !email || !subject || !message) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Persist the enquiry first, so a lead is never lost even if the email
  // send below fails. Best-effort — a DB hiccup shouldn't block the email.
  try {
    await prisma.enquiry.create({
      data: { type: "contact", name, email, phone: phone || null, subject, message },
    });
  } catch (err) {
    console.error("Failed to store contact enquiry:", err);
  }

  const port = Number(process.env.SMTP_PORT ?? 587);
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465, // implicit TLS on 465, STARTTLS on 587
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  try {
    await transporter.sendMail({
      from: `"Voyages & Co. Concierge" <${process.env.SMTP_USER}>`,
      to: process.env.CONTACT_TO_EMAIL,
      replyTo: email,
      subject: `[Concierge Enquiry] ${subject} — ${name}`,
      text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone || "—"}\nSubject: ${subject}\n\n${message}${EMAIL_FOOTER_TEXT}`,
      html: `
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || "—"}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${String(message).replace(/\n/g, "<br>")}</p>
        ${EMAIL_FOOTER_HTML}
      `,
    });

    // Auto-reply to the enquirer, in their own selected language. Sent
    // best-effort — its failure shouldn't fail the request, since the
    // concierge has already received the enquiry at this point.
    try {
      const heading = `${tr("contact.autoReplyGreeting")} ${name},`;
      await transporter.sendMail({
        from: `"Voyages & Co. Concierge" <${process.env.SMTP_USER}>`,
        to: email,
        subject: tr("contact.autoReplySubject"),
        text: renderConciergeEmailText({
          heading,
          bodyText: tr("contact.autoReplyBody"),
          signoff: tr("contact.autoReplySignoff"),
        }),
        html: renderConciergeEmailHTML({
          eyebrow: "Voyages & Co. Concierge",
          heading,
          bodyHtml: `<p style="margin:0;">${tr("contact.autoReplyBody")}</p>`,
          signoff: tr("contact.autoReplySignoff"),
          ctaLabel: "Chat on WhatsApp",
        }),
      });
    } catch (err) {
      console.error("Auto-reply email failed:", err);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Contact form email failed:", err);
    return NextResponse.json({ error: "Failed to send message" }, { status: 502 });
  }
}
