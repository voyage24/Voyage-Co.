import { prisma } from "@/lib/prisma";
import BlogPageClient from "@/components/pages/BlogPageClient";
import { safeQuery } from "@/lib/safe-query";

export const revalidate = 60;

export default async function BlogPage() {
  const posts = await safeQuery(() => prisma.blogPost.findMany({ where: { published: true }, orderBy: { createdAt: "desc" } }), []);
  return <BlogPageClient posts={posts} />;
}
