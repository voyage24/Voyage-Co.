import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import BlogPostForm from "@/components/admin/BlogPostForm";

export default async function EditBlogPostPage({ params }: { params: { id: string } }) {
  const post = await prisma.blogPost.findUnique({ where: { slug: params.id } });
  if (!post) notFound();

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Edit Blog Post</h1>
      <BlogPostForm initial={post} />
    </div>
  );
}
