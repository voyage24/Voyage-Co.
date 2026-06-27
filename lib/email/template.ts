// Shared branded email shell — used for the concierge auto-reply (and
// reusable anywhere else an outgoing email needs the same look). Built as
// nested tables with inline styles and web-safe fonts only, since email
// clients (Outlook especially) ignore modern CSS and webfonts entirely.

const NAVY = "#15212D";
const GOLD = "#705C38";
const INK = "#211D18";
const INK_MUTED = "#48402F";
const INK_FAINT = "#A39C8C";
const PAGE = "#F4F0E9";
const LINE = "#E5DFD2";
const LOGO_URL = "https://voyagesco.com/logo-blue.png";       // white wordmark on navy — for the dark header band
const LOGO_DARK_URL = "https://voyagesco.com/logo-navy.png";  // navy wordmark on transparent — for the light footer
const SITE_URL = "https://voyagesco.com";
const PHONE_DISPLAY = "+91 99199 10213";
const PHONE_TEL = "+919919910213";
const WHATSAPP_URL = "https://wa.me/919919910213";

export function renderConciergeEmailHTML(opts: {
  eyebrow: string;
  heading: string;
  bodyHtml: string;
  signoff: string;
  ctaLabel?: string;
}) {
  const { eyebrow, heading, bodyHtml, signoff, ctaLabel } = opts;
  return `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${PAGE};padding:32px 16px;">
  <tr><td align="center">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#FFFFFF;">
      <tr><td style="background:${NAVY};padding:40px 40px;text-align:center;">
        <img src="${LOGO_URL}" alt="Voyages & Co." style="height:46px;display:inline-block;" />
      </td></tr>
      <tr><td style="height:3px;background:${GOLD};line-height:0;font-size:0;">&nbsp;</td></tr>
      <tr><td style="padding:48px 40px 40px;font-family:Georgia,'Times New Roman',serif;">
        <p style="margin:0 0 10px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:${GOLD};font-family:Arial,Helvetica,sans-serif;font-weight:bold;">${eyebrow}</p>
        <h1 style="margin:0 0 22px;font-size:26px;font-weight:400;color:${INK};line-height:1.3;">${heading}</h1>
        <div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.7;color:${INK_MUTED};">
          ${bodyHtml}
        </div>
        ${ctaLabel ? `
        <table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:28px;">
          <tr><td style="background:${NAVY};">
            <a href="${WHATSAPP_URL}" style="display:inline-block;padding:14px 28px;font-family:Arial,Helvetica,sans-serif;font-size:12px;letter-spacing:1.5px;text-transform:uppercase;color:#FFFFFF;text-decoration:none;">${ctaLabel}</a>
          </td></tr>
        </table>` : ""}
        <p style="margin:32px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:${INK};">
          ${signoff}<br>
          <strong>The Concierge Team</strong><br>
          <span style="color:${GOLD};">Voyages &amp; Co.</span>
        </p>
      </td></tr>
      <tr><td style="background:${PAGE};padding:30px 40px;text-align:center;border-top:1px solid ${LINE};">
        <img src="${LOGO_DARK_URL}" alt="Voyages & Co." style="height:30px;margin-bottom:14px;display:inline-block;" />
        <p style="margin:0 0 6px;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:${INK_MUTED};">
          <a href="${SITE_URL}" style="color:${GOLD};text-decoration:none;">voyagesco.com</a>
          &nbsp;&nbsp;·&nbsp;&nbsp;
          <a href="tel:${PHONE_TEL}" style="color:${GOLD};text-decoration:none;">${PHONE_DISPLAY}</a>
        </p>
        <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:10px;color:${INK_FAINT};line-height:1.5;">
          This email and any attachments are confidential and intended solely for the addressee.
          If you have received this in error, please notify the sender and delete it.
          Voyages &amp; Co. does not guarantee the security of communications sent over the internet.
        </p>
      </td></tr>
    </table>
  </td></tr>
</table>`;
}

export function renderConciergeEmailText(opts: { heading: string; bodyText: string; signoff: string }) {
  const { heading, bodyText, signoff } = opts;
  return `${heading}

${bodyText}

${signoff}
The Concierge Team
Voyages & Co.

--
voyagesco.com | ${PHONE_DISPLAY}
This email and any attachments are confidential and intended solely for the addressee.
If you have received this in error, please notify the sender and delete it.`;
}
