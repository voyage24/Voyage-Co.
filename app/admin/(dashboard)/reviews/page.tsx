import { prisma } from "@/lib/prisma";
import ReviewsModeration from "@/components/admin/ReviewsModeration";

export const dynamic = "force-dynamic";

export default async function AdminReviewsPage() {
  const reviews = await prisma.review.findMany({ orderBy: { createdAt: "desc" }, take: 500 });

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-1">Reviews</h1>
      <p className="text-sm text-gray-500 mb-5">Guest reviews appear on the site only after you approve them.</p>
      <ReviewsModeration reviews={reviews} />
    </div>
  );
}
