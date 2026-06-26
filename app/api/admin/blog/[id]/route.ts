import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// NOTE: the [id] segment value is actually the BlogPost.slug (its primary
// key) — kept as [id] for consistency with the other admin route folders.

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const post = await prisma.blogPost.findUnique({ where: { slug: params.id } });
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ post });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const data = await req.json();
  const update: Record<string, unknown> = {};

  for (const key of ["title", "category", "readTime", "date", "excerpt", "image", "author", "published"]) {
    if (data[key] !== undefined) update[key] = data[key];
  }
  if (data.content !== undefined) update.content = data.content;

  const post = await prisma.blogPost.update({ where: { slug: params.id }, data: update });
  return NextResponse.json({ post });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await prisma.blogPost.delete({ where: { slug: params.id } });
  return NextResponse.json({ ok: true });
}
