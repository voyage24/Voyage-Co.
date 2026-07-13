import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { prisma } from "@/lib/prisma";
import { getCurrentCustomer } from "@/lib/customer/session";
import { getMembership } from "@/lib/group/access";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// POST (multipart) — upload a photo to the group's shared album.
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const customer = await getCurrentCustomer();
  if (!customer) return NextResponse.json({ error: "Please sign in" }, { status: 401 });
  if (!(await getMembership(params.id, customer.id))) return NextResponse.json({ error: "Not a member" }, { status: 403 });

  const form = await req.formData();
  const file = form.get("file");
  const caption = form.get("caption");
  if (!file || !(file instanceof Blob)) return NextResponse.json({ error: "No photo provided" }, { status: 400 });
  if (!file.type.startsWith("image/")) return NextResponse.json({ error: "Please upload an image" }, { status: 400 });
  if (file.size > 8 * 1024 * 1024) return NextResponse.json({ error: "Image too large (max 8MB)" }, { status: 400 });

  const filename = (file as File).name || `photo-${Date.now()}.jpg`;
  const blob = await put(`groups/${params.id}/${filename}`, file, { access: "public", addRandomSuffix: true });
  await prisma.groupPhoto.create({ data: { groupId: params.id, customerId: customer.id, url: blob.url, caption: typeof caption === "string" && caption.trim() ? caption.trim().slice(0, 160) : null } });
  return NextResponse.json({ ok: true, url: blob.url });
}
