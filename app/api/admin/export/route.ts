import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/requireAdmin";

const cell = (v: unknown) => {
  const s = v == null ? "" : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
const toCsv = (headers: string[], rows: unknown[][]) =>
  [headers.join(","), ...rows.map(r => r.map(cell).join(","))].join("\r\n");

export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;
  const type = new URL(req.url).searchParams.get("type") ?? "";

  let csv = "";
  if (type === "bookings") {
    const rows = await prisma.booking.findMany({ orderBy: { createdAt: "desc" } });
    csv = toCsv(
      ["Reference", "Status", "Type", "Item", "Guest", "Email", "Phone", "Check-in", "Check-out", "Guests", "Total", "Created"],
      rows.map(b => [b.reference, b.status, b.type, b.itemTitle, b.guestName, b.guestEmail, b.guestPhone, b.checkIn, b.checkOut, b.guests, b.total, new Date(b.createdAt).toISOString().slice(0, 10)]),
    );
  } else if (type === "enquiries") {
    const rows = await prisma.enquiry.findMany({ orderBy: { createdAt: "desc" } });
    csv = toCsv(
      ["Type", "Stage", "Status", "Name", "Email", "Phone", "Subject", "Item", "Total", "Created"],
      rows.map(e => [e.type, e.stage, e.status, e.name, e.email, e.phone, e.subject, e.itemTitle, e.total, new Date(e.createdAt).toISOString().slice(0, 10)]),
    );
  } else if (type === "customers") {
    const rows = await prisma.customer.findMany({ orderBy: { createdAt: "desc" } });
    csv = toCsv(
      ["Name", "Email", "Phone", "Tier", "Points", "Joined", "Last login"],
      rows.map(c => [c.name, c.email, c.phone, c.tier, c.points, new Date(c.createdAt).toISOString().slice(0, 10), c.lastLoginAt ? new Date(c.lastLoginAt).toISOString().slice(0, 10) : ""]),
    );
  } else {
    return NextResponse.json({ error: "Unknown export type" }, { status: 400 });
  }

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${type}-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
