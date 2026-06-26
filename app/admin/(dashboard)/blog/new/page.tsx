import BlogPostForm from "@/components/admin/BlogPostForm";

export default function NewBlogPostPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Add Blog Post</h1>
      <BlogPostForm />
    </div>
  );
}
