import { prisma } from "@/lib/prisma";
import BlogPageClient from "@/components/pages/BlogPageClient";

export const revalidate = 60;

export default async function BlogPage() {
  const posts = await prisma.blogPost.findMany({ where: { published: true }, orderBy: { createdAt: "desc" } });
  return <BlogPageClient posts={posts} />;
}
