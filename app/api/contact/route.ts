import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { EN, DICTIONARIES } from "@/lib/i18n/dictionaries";

export async function POST(req: Request) {
  const { name, email, phone, subject, message, language } = await req.json();
  const dict = DICTIONARIES[language as string] ?? EN;
  const tr = (key: string) => dict[key] ?? EN[key] ?? key;

  if (!name || !email || !subject || !message) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
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
      text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone || "—"}\nSubject: ${subject}\n\n${message}`,
      html: `
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || "—"}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${String(message).replace(/\n/g, "<br>")}</p>
      `,
    });

    // Auto-reply to the enquirer, in their own selected language. Sent
    // best-effort — its failure shouldn't fail the request, since the
    // concierge has already received the enquiry at this point.
    try {
      await transporter.sendMail({
        from: `"Voyages & Co. Concierge" <${process.env.SMTP_USER}>`,
        to: email,
        subject: tr("contact.autoReplySubject"),
        text: `${tr("contact.autoReplyGreeting")} ${name},\n\n${tr("contact.autoReplyBody")}\n\n${tr("contact.autoReplySignoff")}\nVoyages & Co.`,
        html: `
          <p>${tr("contact.autoReplyGreeting")} ${name},</p>
          <p>${tr("contact.autoReplyBody")}</p>
          <p>${tr("contact.autoReplySignoff")}<br>Voyages &amp; Co.</p>
        `,
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
