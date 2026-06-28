import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createTransport, FROM_NEWSLETTER } from "@/lib/email/transport";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

type Criteria = { city?: string; region?: string; category?: string; country?: string; maxPrice?: string };

// Builds a Prisma where-clause for new published items of a given type that
// match the saved-search criteria and were added since the last check.
function buildWhere(type: string, c: Criteria, since: Date) {
  const where: Record<string, unknown> = { published: true, createdAt: { gt: since } };
  if (c.category) where.category = c.category;
  const max = c.maxPrice ? Number(c.maxPrice) : undefined;
  const like = (v: string) => ({ contains: v, mode: "insensitive" as const });

  if (type === "hotel") {
    if (c.city) where.city = like(c.city);
    if (c.country) where.country = like(c.country);
    if (max) where.pricePerNight = { lte: max };
  } else if (type === "experience") {
    if (c.city) where.location = like(c.city);
    if (c.country) where.country = like(c.country);
    if (max) where.price = { lte: max };
  } else if (type === "cruise") {
    if (c.region) where.region = like(c.region);
    if (max) where.pricePerPerson = { lte: max };
  } else if (type === "package") {
    if (max) where.pricePerPerson = { lte: max };
  }
  return where;
}

function titleField(type: string) { return type === "hotel" || type === "cruise" ? "name" : "title"; }

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    if (req.headers.get("authorization") !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const searches = await prisma.savedSearch.findMany({ include: { customer: { select: { email: true, name: true } } } });
  const transporter = createTransport();
  let notified = 0;

  for (const s of searches) {
    const where = buildWhere(s.type, (s.criteria as Criteria) ?? {}, s.lastNotifiedAt);
    const model = (prisma as unknown as Record<string, { findMany: (a: unknown) => Promise<{ id: string; image: string }[]> }>)[s.type];
    let matches: { id: string; image: string; name?: string; title?: string }[] = [];
    try {
      matches = (await model.findMany({ where, take: 6, orderBy: { createdAt: "desc" } })) as typeof matches;
    } catch (err) { console.error("Search-alert query failed:", err); }

    if (matches.length > 0 && s.customer?.email) {
      const tf = titleField(s.type);
      const rows = matches.map(m => {
        const title = (m as Record<string, string>)[tf];
        return `<tr><td style="padding:8px 0;"><a href="https://voyagesco.com/${s.type}s/${m.id}" style="color:#1c0a0d;text-decoration:none;font-weight:500;">${title}</a></td></tr>`;
      }).join("");
      try {
        await transporter.sendMail({
          from: FROM_NEWSLETTER(),
          to: s.customer.email,
          subject: `New journeys matching “${s.label}”`,
          html: `
            <p>Dear ${s.customer.name?.split(" ")[0] ?? "traveller"},</p>
            <p>New journeys have arrived that match your saved search <strong>${s.label}</strong>:</p>
            <table>${rows}</table>
            <p><a href="https://voyagesco.com${s.href}">View all matches &rarr;</a></p>
            <p style="color:#888;font-size:12px;">You're receiving this because you saved a search at Voyages &amp; Co. Manage it in your account.</p>
          `,
        });
        notified++;
      } catch (err) { console.error("Search-alert email failed:", err); }
    }

    await prisma.savedSearch.update({ where: { id: s.id }, data: { lastNotifiedAt: new Date() } });
  }

  return NextResponse.json({ ok: true, searches: searches.length, notified });
}
