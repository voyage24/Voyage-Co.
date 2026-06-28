import { list } from "@vercel/blob";
import MediaLibrary, { type MediaItem } from "@/components/admin/MediaLibrary";

export const dynamic = "force-dynamic";

export default async function AdminMediaPage() {
  let media: MediaItem[] = [];
  try {
    const { blobs } = await list();
    media = blobs
      .map(b => ({ url: b.url, pathname: b.pathname, size: b.size, uploadedAt: b.uploadedAt }))
      .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
  } catch {
    media = [];
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-1">Media Library</h1>
      <p className="text-sm text-gray-500 mb-5">Every uploaded image. Copy a URL to reuse it, or upload new media.</p>
      <MediaLibrary media={media} />
    </div>
  );
}
