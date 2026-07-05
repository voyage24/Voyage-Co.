import { notFound } from "next/navigation";
import { LIST_BY_PAGE, getPageList } from "@/lib/page-lists";
import ListEditor from "@/components/admin/ListEditor";

export const dynamic = "force-dynamic";

export default async function EditListPage({ params }: { params: { list: string } }) {
  const list = LIST_BY_PAGE.get(params.list);
  if (!list) notFound();

  const items = await getPageList(list.key);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">{list.label}</h1>
        <p className="text-sm text-gray-500">{list.description ?? "Add, remove and reorder items — changes go live on save."}</p>
      </div>
      <ListEditor list={list} initialItems={items} />
    </div>
  );
}
