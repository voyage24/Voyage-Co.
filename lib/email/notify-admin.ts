import { createTransport, FROM_CONCIERGE } from "./transport";

// WhatsApp via CallMeBot — fires only when both vars are set:
//   WHATSAPP_ALERT_PHONE (number, country code, no +) + CALLMEBOT_APIKEY
async function sendCallMeBot(text: string) {
  const phone = process.env.WHATSAPP_ALERT_PHONE;
  const apikey = process.env.CALLMEBOT_APIKEY;
  if (!phone || !apikey) return;
  try {
    await fetch(`https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(phone)}&text=${encodeURIComponent(text)}&apikey=${encodeURIComponent(apikey)}`);
  } catch (err) { console.error("WhatsApp (CallMeBot) alert failed:", err); }
}

// Telegram via the free Bot API — fires only when both vars are set:
//   TELEGRAM_BOT_TOKEN (from @BotFather) + TELEGRAM_CHAT_ID (your chat id)
async function sendTelegram(text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;
  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text }),
    });
  } catch (err) { console.error("Telegram alert failed:", err); }
}

// Push a short owner alert to whichever channels are configured (WhatsApp
// and/or Telegram). Best-effort; never throws.
export async function notifyWhatsApp(text: string) {
  await Promise.allSettled([sendCallMeBot(text), sendTelegram(text)]);
}

// Best-effort heads-up to the team whenever a new enquiry/lead arrives, so
// nothing is missed without having to watch the admin inbox. Never throws —
// the lead is already saved by the time this runs.
export async function notifyAdminEnquiry(e: {
  type: string;
  name: string;
  email: string;
  phone?: string | null;
  subject?: string | null;
  message?: string | null;
  total?: number | null;
}) {
  // WhatsApp alert (own number) — fires independently of email.
  await notifyWhatsApp(`🔔 New ${e.type} enquiry\n${e.name} (${e.email})${e.total ? ` · ₹${e.total.toLocaleString("en-IN")}` : ""}\nvoyagesco.com/admin/enquiries`);

  const to = process.env.CONTACT_TO_EMAIL;
  if (!to || !process.env.SMTP_HOST) return;
  try {
    const transporter = createTransport();
    await transporter.sendMail({
      from: FROM_CONCIERGE(),
      to,
      replyTo: e.email,
      subject: `[New ${e.type}] ${e.subject || e.name}`,
      html: `
        <p>A new <strong>${e.type}</strong> enquiry has just arrived.</p>
        <p>
          <strong>Name:</strong> ${e.name}<br/>
          <strong>Email:</strong> ${e.email}<br/>
          ${e.phone ? `<strong>Phone:</strong> ${e.phone}<br/>` : ""}
          ${e.total ? `<strong>Value:</strong> ₹${e.total.toLocaleString("en-IN")}<br/>` : ""}
        </p>
        ${e.message ? `<p>${String(e.message).replace(/\n/g, "<br/>")}</p>` : ""}
        <p><a href="https://voyagesco.com/admin/enquiries">Open it in the admin &rarr;</a></p>
      `,
    });
  } catch (err) {
    console.error("Admin enquiry notification failed:", err);
  }
}
