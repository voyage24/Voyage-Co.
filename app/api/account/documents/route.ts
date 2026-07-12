import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { prisma } from "@/lib/prisma";
import { getCurrentCustomer } from "@/lib/customer/session";

export const dynamic = "force-dynamic";

const MAX_BYTES = 12 * 1024 * 1024;
const ALLOWED = ["application/pdf", "image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];
const CATEGORIES = ["Passport", "Visa", "Insurance", "Tickets", "Other"];

export async function GET() {
  const customer = await getCurrentCustomer();
  if (!customer) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  const documents = await prisma.memberDocument.findMany({ where: { customerId: customer.id }, orderBy: { createdAt: "desc" } });
  return NextResponse.json({ documents });
}

export async function POST(req: NextRequest) {
  const customer = await getCurrentCustomer();
  if (!customer) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const form = await req.formData();
  const file = form.get("file");
  const label = String(form.get("label") || "").trim();
  const category = CATEGORIES.includes(String(form.get("category"))) ? String(form.get("category")) : "Other";
  if (!file || !(file instanceof Blob)) return NextResponse.json({ error: "No file provided" }, { status: 400 });

  const type = (file as File).type || "";
  if (!ALLOWED.includes(type)) return NextResponse.json({ error: "Please upload a PDF or image (JPG, PNG)." }, { status: 400 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: "File too large — keep documents under 12 MB." }, { status: 400 });

  const name = (file as File).name || `document-${Date.now()}`;
  const blob = await put(`docs/${customer.id}/${name}`, file, { access: "public", addRandomSuffix: true });
  const doc = await prisma.memberDocument.create({
    data: { customerId: customer.id, label: label || name, category, url: blob.url },
  });
  return NextResponse.json({ ok: true, document: doc });
}

export async function DELETE(req: NextRequest) {
  const customer = await getCurrentCustomer();
  if (!customer) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  // Ownership-scoped delete.
  await prisma.memberDocument.deleteMany({ where: { id, customerId: customer.id } });
  return NextResponse.json({ ok: true });
}
