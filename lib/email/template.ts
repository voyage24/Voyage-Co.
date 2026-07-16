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
  signoff: string;  // the closing line only, e.g. "With warm regards," — the
                    // team and brand lines below are added here, so callers must
                    // never pass a complete signature (that double-signs the mail)
  team?: string;    // who it's from, e.g. "The Reservations Team"
  ctaLabel?: string;
  ctaHref?: string;
  reserveCta?: boolean; // show the "Join Voyages Reserve" band (default true)
}) {
  const { eyebrow, heading, bodyHtml, signoff, team = "The Concierge Team", ctaLabel, ctaHref, reserveCta = true } = opts;
  const reserveBand = reserveCta ? `
      <tr><td style="padding:0 40px 40px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid ${GOLD};">
          <tr><td style="padding:26px 28px;text-align:center;">
            <p style="margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:${GOLD};font-weight:bold;">Voyages Reserve</p>
            <p style="margin:0 0 16px;font-family:Georgia,'Times New Roman',serif;font-size:17px;color:${INK};line-height:1.4;">An invitation to our members' circle — member rates, priority concierge and rare access.</p>
            <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;"><tr><td style="background:${GOLD};text-align:center;">
              <a href="${SITE_URL}/membership" style="display:inline-block;padding:12px 26px;font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:${NAVY};text-decoration:none;font-weight:bold;text-align:center;line-height:1.4;">Join Voyages Reserve</a>
            </td></tr></table>
          </td></tr>
        </table>
      </td></tr>` : "";
  return `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${PAGE};padding:32px 16px;">
  <tr><td align="center">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#FFFFFF;">
      <tr><td style="background:${NAVY};padding:40px 40px;text-align:center;">
        <img src="${LOGO_URL}" alt="Voyages & Co." style="height:66px;display:inline-block;" />
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
          <tr><td style="background:${NAVY};text-align:center;">
            <a href="${ctaHref ?? WHATSAPP_URL}" style="display:inline-block;padding:14px 28px;font-family:Arial,Helvetica,sans-serif;font-size:12px;letter-spacing:1.5px;text-transform:uppercase;color:#FFFFFF;text-decoration:none;text-align:center;line-height:1.4;">${ctaLabel}</a>
          </td></tr>
        </table>` : ""}
        <p style="margin:32px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:${INK};">
          ${signoff}<br>
          <strong>${team}</strong><br>
          <span style="color:${GOLD};">Voyages &amp; Co.</span>
        </p>
      </td></tr>
      ${reserveBand}
      <tr><td style="background:${PAGE};padding:30px 40px;text-align:center;border-top:1px solid ${LINE};">
        <img src="${LOGO_DARK_URL}" alt="Voyages & Co." style="height:42px;margin-bottom:14px;display:inline-block;" />
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

// Reusable card for one curated item in the weekly newsletter — image,
// title, one line of detail, price, and a link through to the site.
export function renderNewsletterCard(opts: {
  image: string;
  title: string;
  detail: string;
  price?: string;
  url: string;
  ctaLabel: string;
}) {
  const { image, title, detail, price, url, ctaLabel } = opts;
  return `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;border:1px solid ${LINE};">
    <tr><td>
      <a href="${url}" style="text-decoration:none;">
        <img src="${image}" alt="${title.replace(/"/g, "&quot;")}" width="520" style="width:100%;max-width:520px;height:auto;display:block;" />
      </a>
    </td></tr>
    <tr><td style="padding:20px 24px 22px;">
      <h2 style="margin:0 0 6px;font-family:Georgia,'Times New Roman',serif;font-size:20px;font-weight:400;color:${INK};line-height:1.3;">${title}</h2>
      <p style="margin:0 0 ${price ? "10px" : "14px"};font-family:Arial,Helvetica,sans-serif;font-size:13px;color:${INK_MUTED};line-height:1.6;">${detail}</p>
      ${price ? `<p style="margin:0 0 14px;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:${GOLD};font-weight:bold;">${price}</p>` : ""}
      <a href="${url}" style="font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:${NAVY};text-decoration:none;font-weight:bold;border-bottom:2px solid ${GOLD};padding-bottom:2px;">${ctaLabel} &rarr;</a>
    </td></tr>
  </table>`;
}

export function renderNewsletterHTML(opts: {
  eyebrow: string;
  heading: string;
  introHtml: string;
  bodyHtml: string;
  unsubscribeUrl: string;
}) {
  const { eyebrow, heading, introHtml, bodyHtml, unsubscribeUrl } = opts;
  return `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${PAGE};padding:32px 16px;">
  <tr><td align="center">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#FFFFFF;">
      <tr><td style="background:${NAVY};padding:40px 40px;text-align:center;">
        <img src="${LOGO_URL}" alt="Voyages & Co." style="height:66px;display:inline-block;" />
      </td></tr>
      <tr><td style="height:3px;background:${GOLD};line-height:0;font-size:0;">&nbsp;</td></tr>
      <tr><td style="padding:44px 40px 16px;text-align:center;">
        <p style="margin:0 0 10px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:${GOLD};font-family:Arial,Helvetica,sans-serif;font-weight:bold;">${eyebrow}</p>
        <h1 style="margin:0 0 18px;font-family:Georgia,'Times New Roman',serif;font-size:28px;font-weight:400;color:${INK};line-height:1.3;">${heading}</h1>
        <div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.7;color:${INK_MUTED};">${introHtml}</div>
      </td></tr>
      <tr><td style="padding:28px 40px 8px;">
        ${bodyHtml}
      </td></tr>
      <tr><td style="padding:8px 40px 44px;text-align:center;">
        <table role="presentation" cellpadding="0" cellspacing="0" align="center" style="margin:0 auto;">
          <tr><td style="background:${NAVY};">
            <a href="${SITE_URL}" style="display:inline-block;padding:14px 30px;font-family:Arial,Helvetica,sans-serif;font-size:12px;letter-spacing:1.5px;text-transform:uppercase;color:#FFFFFF;text-decoration:none;">Explore More Journeys</a>
          </td></tr>
        </table>
      </td></tr>
      <tr><td style="background:${PAGE};padding:30px 40px;text-align:center;border-top:1px solid ${LINE};">
        <img src="${LOGO_DARK_URL}" alt="Voyages & Co." style="height:42px;margin-bottom:14px;display:inline-block;" />
        <p style="margin:0 0 6px;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:${INK_MUTED};">
          <a href="${SITE_URL}" style="color:${GOLD};text-decoration:none;">voyagesco.com</a>
          &nbsp;&nbsp;·&nbsp;&nbsp;
          <a href="tel:${PHONE_TEL}" style="color:${GOLD};text-decoration:none;">${PHONE_DISPLAY}</a>
        </p>
        <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:10px;color:${INK_FAINT};line-height:1.6;">
          You are receiving this because you subscribed at voyagesco.com.<br>
          <a href="${unsubscribeUrl}" style="color:${INK_FAINT};text-decoration:underline;">Unsubscribe</a>
        </p>
      </td></tr>
    </table>
  </td></tr>
</table>`;
}

export function renderConciergeEmailText(opts: { heading: string; bodyText: string; signoff: string; team?: string }) {
  const { heading, bodyText, signoff, team = "The Concierge Team" } = opts;
  return `${heading}

${bodyText}

${signoff}
${team}
Voyages & Co.

--
voyagesco.com | ${PHONE_DISPLAY}
This email and any attachments are confidential and intended solely for the addressee.
If you have received this in error, please notify the sender and delete it.`;
}
