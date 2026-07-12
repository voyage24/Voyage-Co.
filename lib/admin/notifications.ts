import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

export type AdminNotif = { type: string; title: string; subtitle: string; href: string; at: string };
export type AdminNotifications = { items: AdminNotif[]; count: number; reviews: number };

// Cached for 30s — the bell/badge runs on every admin navigation, so this avoids
// re-running 7 queries per page load. 30s staleness is immaterial for a counter.
export const getAdminNotificationsCached = unstable_cache(
  () => getAdminNotifications(),
  ["admin-notifications"],
  { revalidate: 30 },
);

// Actionable items for the admin bell: pending bookings, new enquiries, and the
// count of reviews awaiting moderation.
export async function getAdminNotifications(): Promise<AdminNotifications> {
  try {
    const [pendingBookings, newEnquiries, pendingReviews, unreadMail, bookings, enquiries, mail] = await Promise.all([
      prisma.booking.count({ where: { status: "pending" } }),
      prisma.enquiry.count({ where: { status: "new" } }),
      prisma.review.count({ where: { status: "pending" } }),
      prisma.inboundEmail.count({ where: { archived: false, deleted: false, read: false } }).catch(() => 0),
      prisma.booking.findMany({ where: { status: "pending" }, orderBy: { createdAt: "desc" }, take: 6, select: { guestName: true, itemTitle: true, reference: true, createdAt: true } }),
      prisma.enquiry.findMany({ where: { status: "new" }, orderBy: { createdAt: "desc" }, take: 6, select: { name: true, subject: true, type: true, createdAt: true } }),
      prisma.inboundEmail.findMany({ where: { archived: false, deleted: false, read: false }, orderBy: { receivedAt: "desc" }, take: 6, select: { fromName: true, fromEmail: true, subject: true, receivedAt: true } }).catch(() => []),
    ]);

    const items: AdminNotif[] = [
      ...bookings.map(b => ({ type: "Booking", title: b.itemTitle, subtitle: `${b.guestName} · ${b.reference}`, href: "/admin/bookings", at: b.createdAt.toISOString() })),
      ...enquiries.map(e => ({ type: "Enquiry", title: e.subject || e.type, subtitle: e.name, href: "/admin/enquiries", at: e.createdAt.toISOString() })),
      ...mail.map(m => ({ type: "Message", title: m.subject || "(no subject)", subtitle: m.fromName || m.fromEmail, href: "/admin/inbox", at: m.receivedAt.toISOString() })),
    ].sort((a, b) => b.at.localeCompare(a.at)).slice(0, 8);

    return { items, count: pendingBookings + newEnquiries + unreadMail, reviews: pendingReviews };
  } catch {
    return { items: [], count: 0, reviews: 0 };
  }
}
