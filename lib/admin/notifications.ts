import { prisma } from "@/lib/prisma";

export type AdminNotif = { type: string; title: string; subtitle: string; href: string; at: string };
export type AdminNotifications = { items: AdminNotif[]; count: number; reviews: number };

// Actionable items for the admin bell: pending bookings, new enquiries, and the
// count of reviews awaiting moderation.
export async function getAdminNotifications(): Promise<AdminNotifications> {
  try {
    const [pendingBookings, newEnquiries, pendingReviews, bookings, enquiries] = await Promise.all([
      prisma.booking.count({ where: { status: "pending" } }),
      prisma.enquiry.count({ where: { status: "new" } }),
      prisma.review.count({ where: { status: "pending" } }),
      prisma.booking.findMany({ where: { status: "pending" }, orderBy: { createdAt: "desc" }, take: 6, select: { guestName: true, itemTitle: true, reference: true, createdAt: true } }),
      prisma.enquiry.findMany({ where: { status: "new" }, orderBy: { createdAt: "desc" }, take: 6, select: { name: true, subject: true, type: true, createdAt: true } }),
    ]);

    const items: AdminNotif[] = [
      ...bookings.map(b => ({ type: "Booking", title: b.itemTitle, subtitle: `${b.guestName} · ${b.reference}`, href: "/admin/bookings", at: b.createdAt.toISOString() })),
      ...enquiries.map(e => ({ type: "Enquiry", title: e.subject || e.type, subtitle: e.name, href: "/admin/enquiries", at: e.createdAt.toISOString() })),
    ].sort((a, b) => b.at.localeCompare(a.at)).slice(0, 8);

    return { items, count: pendingBookings + newEnquiries, reviews: pendingReviews };
  } catch {
    return { items: [], count: 0, reviews: 0 };
  }
}
