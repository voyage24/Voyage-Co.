import { createTransport, FROM_CONCIERGE } from "./transport";

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
