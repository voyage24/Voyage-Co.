import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/requireAdmin";
import { createWeeklyDraft, type NewsletterOptions } from "@/lib/newsletter/compose";

export const maxDuration = 60;

const TYPES = ["packages", "hotels", "experiences", "cruises", "blogPosts"] as const;

export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;

  // Optional customisation from the admin form; falls back to defaults.
  const body = await req.json().catch(() => ({}));
  const opts: NewsletterOptions = {};
  if (body && typeof body === "object") {
    if (body.counts && typeof body.counts === "object") {
      const counts: Record<string, number> = {};
      for (const k of TYPES) {
        const v = Number(body.counts[k]);
        if (Number.isFinite(v)) counts[k] = Math.max(0, Math.min(10, Math.floor(v)));
      }
      opts.counts = counts;
    }
    if (typeof body.subject === "string") opts.subject = body.subject;
    if (typeof body.intro === "string") opts.intro = body.intro;
  }

  const draft = await createWeeklyDraft(opts);
  return NextResponse.json({ ok: true, id: draft.id });
}
