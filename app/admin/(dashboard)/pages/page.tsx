import Link from "next/link";
import { FileText, ListChecks } from "lucide-react";
import { PAGE_REGISTRY } from "@/lib/page-content";
import { LIST_REGISTRY } from "@/lib/page-lists";

export const dynamic = "force-dynamic";

export default function AdminPagesList() {
  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Pages</h1>
        <p className="text-sm text-gray-500">Edit the copy on your info &amp; marketing pages — changes go live on save.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {PAGE_REGISTRY.map((p, i) => (
          <Link key={p.page} href={`/admin/pages/${p.page}`} className={`admin-rise admin-lift rounded-xl p-5 block tile-grad-${(i % 6) + 1}`}>
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg mb-3 bg-black/[0.06] dark:bg-white/10 text-gray-700"><FileText size={18} /></span>
            <p className="font-medium text-gray-900">{p.label}</p>
            <p className="text-xs text-gray-500 mt-0.5">{p.fields.length} fields · {p.path}</p>
          </Link>
        ))}
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-900">Editable lists</h2>
        <p className="text-sm text-gray-500">Add, remove and reorder repeating content — FAQ questions, cards, links.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {LIST_REGISTRY.map((l, i) => (
          <Link key={l.key} href={`/admin/lists/${l.page}`} className={`admin-rise admin-lift rounded-xl p-5 block tile-grad-${(i % 6) + 1}`}>
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg mb-3 bg-black/[0.06] dark:bg-white/10 text-gray-700"><ListChecks size={18} /></span>
            <p className="font-medium text-gray-900">{l.label}</p>
            <p className="text-xs text-gray-500 mt-0.5">{l.default.length} items · {l.path}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
