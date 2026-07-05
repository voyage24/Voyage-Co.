import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { requireAdmin } from "@/lib/admin/requireAdmin";

const MAX_BYTES = 8 * 1024 * 1024; // 8 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif", "image/svg+xml"];

export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;

  const form = await req.formData();
  const file = form.get("file");

  if (!file || !(file instanceof Blob)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }
  const type = (file as File).type || "";
  if (!ALLOWED_TYPES.includes(type)) {
    return NextResponse.json({ error: "Only image files (JPEG, PNG, WebP, GIF, AVIF, SVG) are allowed." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Image is too large — please keep it under 8 MB." }, { status: 400 });
  }

  const filename = (file as File).name || `upload-${Date.now()}`;
  const blob = await put(filename, file, { access: "public", addRandomSuffix: true });

  return NextResponse.json({ url: blob.url });
}
