import { prisma } from "@/lib/prisma";
import { fixMojibake, hasMojibake } from "@/lib/mojibake";

// Repairs mis-encoded "mojibake" characters (e.g. "â€"" → "—", "Ã©" → "é") across
// stored content. Runs server-side where the DB is connected. Idempotent — only
// rewrites fields that actually contain mojibake.

type Target = { model: string; idField: string; fields: string[] };
const TARGETS: Target[] = [
  { model: "hotel", idField: "id", fields: ["name", "location", "city", "country", "region", "description", "badge", "brand", "highlights", "amenities"] },
  { model: "package", idField: "id", fields: ["title", "subtitle", "badge", "highlights", "includes", "destinations"] },
  { model: "experience", idField: "id", fields: ["title", "location", "country", "description", "badge", "includes"] },
  { model: "cruise", idField: "id", fields: ["name", "cruiseLine", "ship", "region", "departurePort", "description", "badge", "highlights", "amenities", "includes", "ports"] },
  { model: "blogPost", idField: "slug", fields: ["title", "excerpt", "author", "category", "content"] },
  { model: "pageContent", idField: "key", fields: ["value"] },
  { model: "review", idField: "id", fields: ["authorName", "comment"] },
  { model: "testimonial", idField: "id", fields: ["quote", "author", "detail"] },
];

const changed = (a: unknown, b: unknown) => JSON.stringify(a) !== JSON.stringify(b);

export type MojibakeResult = { rows: number; fields: number; samples: string[] };

export async function runMojibakeFix(apply: boolean): Promise<MojibakeResult> {
  let rows = 0, fields = 0;
  const samples: string[] = [];

  type ModelClient = { findMany: () => Promise<Record<string, unknown>[]>; update: (args: { where: Record<string, unknown>; data: Record<string, unknown> }) => Promise<unknown> };
  const db = prisma as unknown as Record<string, ModelClient>;
  for (const t of TARGETS) {
    const client = db[t.model];
    if (!client) continue;
    let records: Record<string, unknown>[] = [];
    try { records = await client.findMany(); } catch { continue; }
    for (const row of records) {
      const data: Record<string, unknown> = {};
      for (const f of t.fields) {
        const v = row[f];
        if (v == null) continue;
        const flat = Array.isArray(v) ? v.join(" ") : String(v);
        if (!hasMojibake(flat)) continue;
        const fixed = fixMojibake(v);
        if (changed(v, fixed)) {
          data[f] = fixed;
          fields++;
          if (samples.length < 10) samples.push(`${t.model}.${f}: ${Array.isArray(v) ? v.join(" ") : String(v)}`.slice(0, 120));
        }
      }
      if (Object.keys(data).length) {
        rows++;
        if (apply) await client.update({ where: { [t.idField]: row[t.idField] }, data }).catch(() => {});
      }
    }
  }
  return { rows, fields, samples };
}
