import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentCustomer } from "@/lib/customer/session";

const TYPES = ["hotel", "package", "experience", "cruise"];

export async function POST(req: Request) {
  const customer = await getCurrentCustomer();
  if (!customer) return NextResponse.json({ error: "Please sign in to leave a review" }, { status: 401 });

  const { type, itemId, rating, comment } = await req.json().catch(() => ({}));
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

  await prisma.review.create({
    data: {
      customerId: customer.id,
      authorName: customer.name?.trim() || customer.email.split("@")[0],
      type, itemId, rating: r, comment: comment.trim().slice(0, 2000),
      status: "pending",
    },
  });

  return NextResponse.json({ ok: true });
}
