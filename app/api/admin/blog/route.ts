import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { uniqueSlug } from "@/lib/utils/slugify";

export async function GET() {
  const posts = await prisma.blogPost.findMany({ orderBy: { updatedAt: "desc" } });
  return NextResponse.json({ posts });
}

export async function POST(req: NextRequest) {
  const data = await req.json();

  if (!data.title || !data.excerpt) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const slug = await uniqueSlug(data.title, async s => !!(await prisma.blogPost.findUnique({ where: { slug: s } })));

  const post = await prisma.blogPost.create({
    data: {
      slug,
      title: data.title,
      category: data.category ?? "",
      readTime: data.readTime ?? "",
      date: data.date ?? "",
      excerpt: data.excerpt,
      image: data.image ?? "",
      author: data.author ?? "",
      content: data.content ?? [],
      published: data.published ?? true,
    },
  });

  return NextResponse.json({ post }, { status: 201 });
}
