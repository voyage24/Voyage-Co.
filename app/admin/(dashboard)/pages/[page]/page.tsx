import { notFound } from "next/navigation";
import { PAGE_REGISTRY, getPageContent } from "@/lib/page-content";
import PageContentForm from "@/components/admin/PageContentForm";

export const dynamic = "force-dynamic";

export default async function EditPageContent({ params }: { params: { page: string } }) {
  const page = PAGE_REGISTRY.find(p => p.page === params.page);
  if (!page) notFound();

  const c = await getPageContent();
  const values: Record<string, string> = {};
  for (const f of page.fields) values[f.key] = c(f.key);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">{page.label}</h1>
        <p className="text-sm text-gray-500">Edit this page&apos;s copy.</p>
      </div>
      <PageContentForm page={page} values={values} />
    </div>
  );
}
