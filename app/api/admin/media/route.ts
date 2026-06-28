import { NextRequest, NextResponse } from "next/server";
import { list, del } from "@vercel/blob";
import { requireAdmin } from "@/lib/admin/requireAdmin";

export const dynamic = "force-dynamic";

// List uploaded media (newest first).
export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;
  try {
    const { blobs } = await list();
    const media = blobs
      .map(b => ({ url: b.url, pathname: b.pathname, size: b.size, uploadedAt: b.uploadedAt }))
      .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
    return NextResponse.json({ media });
  } catch (err) {
    console.error("Media list failed:", err);
    return NextResponse.json({ media: [] });
  }
}

// Delete a media item by its URL.
export async function DELETE(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;
  const { url } = await req.json().catch(() => ({}));
  if (!url || typeof url !== "string") {
    return NextResponse.json({ error: "URL required" }, { status: 400 });
  }
  await del(url);
  return NextResponse.json({ ok: true });
}
