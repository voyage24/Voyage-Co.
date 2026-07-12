import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { requireAdmin } from "@/lib/admin/requireAdmin";

const MAX_BYTES = 12 * 1024 * 1024; // 12 MB
const ALLOWED = [
  "application/pdf", "image/jpeg", "image/png", "image/webp", "image/gif",
  "text/plain", "text/csv",
  "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

// Upload an email attachment (voucher, itinerary, PDF…) to Blob storage; the
// compose form then attaches it to the outgoing mail by URL.
export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;

  const form = await req.formData();
  const file = form.get("file");
  if (!file || !(file instanceof Blob)) return NextResponse.json({ error: "No file provided" }, { status: 400 });

  const type = (file as File).type || "";
  if (!ALLOWED.includes(type)) return NextResponse.json({ error: "Unsupported file type." }, { status: 400 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: "File too large — keep attachments under 12 MB." }, { status: 400 });

  const filename = (file as File).name || `attachment-${Date.now()}`;
  const blob = await put(`mail/${filename}`, file, { access: "public", addRandomSuffix: true });
  return NextResponse.json({ url: blob.url, filename });
}
