import { prisma } from "@/lib/prisma";
import { getCurrentCustomer } from "@/lib/customer/session";

export const dynamic = "force-dynamic";

// Add-to-calendar (.ics) for a booking — the universal alternative to native
// Wallet passes: opens straight into Apple Calendar / Google Calendar / Outlook
// on any device, no signing certificate required. Adds the trip dates with the
// booking reference and a link to the voucher.

// ICS text must escape \ ; , and newlines (RFC 5545).
const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/([;,])/g, "\\$1").replace(/\r?\n/g, "\\n");

// A stored date string ("2026-08-15" etc.) → ICS all-day date (YYYYMMDD).
function icsDate(s: string): string | null {
  const d = new Date(s);
  if (isNaN(d.getTime())) return null;
  return `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, "0")}${String(d.getUTCDate()).padStart(2, "0")}`;
}
function addDay(ymd: string): string {
  const d = new Date(`${ymd.slice(0, 4)}-${ymd.slice(4, 6)}-${ymd.slice(6, 8)}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, "0")}${String(d.getUTCDate()).padStart(2, "0")}`;
}

export async function GET(_req: Request, { params }: { params: { ref: string } }) {
  const customer = await getCurrentCustomer();
  if (!customer) return new Response("Unauthorized", { status: 401 });
  const b = await prisma.booking.findFirst({ where: { reference: params.ref, customerId: customer.id } });
  if (!b) return new Response("Not found", { status: 404 });

  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://voyagesco.com";
  const start = icsDate(b.checkIn || b.createdAt.toISOString());
  if (!start) return new Response("No date on this booking", { status: 400 });
  // ICS DTEND is exclusive; a hotel's check-out day is already the right end.
  // For single-day/no-checkout bookings use the day after start.
  const end = (b.checkOut && icsDate(b.checkOut)) || addDay(start);

  const isFlight = b.type === "flight";
  const summary = isFlight ? `✈️ ${b.itemTitle}` : `${b.itemTitle} — Voyages & Co.`;
  const desc = [
    `Booking reference: ${b.reference}`,
    `Guest: ${b.guestName}`,
    b.seat ? `Seat: ${b.seat}` : "",
    `Guests: ${b.guests}`,
    ``,
    `Voucher: ${base}/account/voucher/${b.reference}`,
  ].filter(Boolean).join("\n");
  const stamp = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Voyages & Co.//Booking//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${b.reference}@voyagesco.com`,
    `DTSTAMP:${stamp}`,
    `DTSTART;VALUE=DATE:${start}`,
    `DTEND;VALUE=DATE:${end}`,
    `SUMMARY:${esc(summary)}`,
    `LOCATION:${esc(b.itemTitle)}`,
    `DESCRIPTION:${esc(desc)}`,
    `URL:${base}/account/voucher/${b.reference}`,
    "STATUS:CONFIRMED",
    "TRANSP:TRANSPARENT",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  return new Response(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="voyages-${b.reference}.ics"`,
      "Cache-Control": "no-store",
    },
  });
}
