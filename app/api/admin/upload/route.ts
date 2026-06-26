import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const file = form.get("file");

  if (!file || !(file instanceof Blob)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const filename = (file as File).name || `upload-${Date.now()}`;
  const blob = await put(filename, file, { access: "public", addRandomSuffix: true });

  return NextResponse.json({ url: blob.url });
}
