import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentCustomer } from "@/lib/customer/session";
import { notifyWhatsApp } from "@/lib/email/notify-admin";

const TYPES = ["hotel", "package", "experience", "cruise"];

export async function POST(req: Request) {
  const customer = await getCurrentCustomer();
  if (!customer) return NextResponse.json({ error: "Please sign in to leave a review" }, { status: 401 });

  const { type, itemId, rating, comment, images } = await req.json().catch(() => ({}));
  if (!TYPES.includes(type) || !itemId) {
    return NextResponse.json({ error: "Invalid item" }, { status: 400 });
  }
  const r = Number(rating);
  if (!Number.isInteger(r) || r < 1 || r > 5) {
    return NextResponse.json({ error: "Please choose a rating from 1 to 5" }, { status: 400 });
  }
  if (!comment || typeof comment !== "string" || comment.trim().length < 4) {
    return NextResponse.json({ error: "Please write a short review" }, { status: 400 });
  }

  const photos = Array.isArray(images)
    ? images.filter((u: unknown): u is string => typeof u === "string" && u.startsWith("http")).slice(0, 5)
    : [];

  await prisma.review.create({
    data: {
      customerId: customer.id,
      authorName: customer.name?.trim() || customer.email.split("@")[0],
      type, itemId, rating: r, comment: comment.trim().slice(0, 2000),
      images: photos,
      status: "pending",
    },
  });

  await notifyWhatsApp(`⭐ New ${r}-star review for ${type} (${itemId}) by ${customer.name?.trim() || customer.email} — awaiting approval at voyagesco.com/admin/reviews`);

  return NextResponse.json({ ok: true });
}
