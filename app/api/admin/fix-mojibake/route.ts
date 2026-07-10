import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/requireAdmin";
import { logAudit } from "@/lib/admin/audit";
import { runMojibakeFix } from "@/lib/admin/fix-mojibake";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// GET = preview (count + samples). POST = apply the fixes.
export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;
  return NextResponse.json(await runMojibakeFix(false));
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;
  const result = await runMojibakeFix(true);
  if (result.rows) await logAudit(admin.email, "fix-encoding", "content", undefined, `${result.fields} fields in ${result.rows} records`);
  return NextResponse.json(result);
}
