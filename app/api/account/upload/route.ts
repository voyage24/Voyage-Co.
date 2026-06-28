import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { getCurrentCustomer } from "@/lib/customer/session";

// Photo upload for logged-in customers (used by review photos). Gated to a
// valid customer session, image files only, capped at ~6MB.
export async function POST(req: Request) {
  const customer = await getCurrentCustomer();
  if (!customer) return NextResponse.json({ error: "Please sign in" }, { status: 401 });

  const form = await req.formData();
  const file = form.get("file");
  if (!file || !(file instanceof Blob)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Please upload an image" }, { status: 400 });
  }
  if (file.size > 6 * 1024 * 1024) {
    return NextResponse.json({ error: "Image too large (max 6MB)" }, { status: 400 });
  }

  const filename = (file as File).name || `review-${Date.now()}.jpg`;
  const blob = await put(`reviews/${filename}`, file, { access: "public", addRandomSuffix: true });
  return NextResponse.json({ url: blob.url });
}
