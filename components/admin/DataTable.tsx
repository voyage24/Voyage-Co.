"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export interface DataTableColumn {
  key: string;
  label: string;
}

const PAGE_SIZE = 25;

export default function DataTable({
  rows,
  columns,
  basePath,
  apiPath,
  idField = "id",
}: {
  rows: Record<string, any>[];
  columns: DataTableColumn[];
  basePath: string;
  apiPath: string;
  idField?: string;
}) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(row =>
      columns.some(c => String(row[c.key] ?? "").toLowerCase().includes(q))
    );
  }, [rows, columns, query]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const pageRows = filtered.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this record? This cannot be undone.")) return;
    setBusyId(id);
    await fetch(`${apiPath}/${encodeURIComponent(id)}`, { method: "DELETE" });
    setBusyId(null);
    router.refresh();
  };

  const handleTogglePublished = async (id: string, published: boolean) => {
    setBusyId(id);
    await fetch(`${apiPath}/${encodeURIComponent(id)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !published }),
    });
    setBusyId(null);
    router.refresh();
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <input
          value={query}
          onChange={e => { setQuery(e.target.value); setPage(0); }}
          placeholder="Search…"
          className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full sm:w-72"
        />
        <span className="text-xs text-gray-500">
          {filtered.length} {filtered.length === 1 ? "record" : "records"}
          {query && ` (filtered from ${rows.length})`}
        </span>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 text-left text-gray-500">
            {columns.map(c => (
              <th key={c.key} className="px-4 py-3 font-medium">{c.label}</th>
            ))}
            <th className="px-4 py-3 font-medium">Published</th>
            <th className="px-4 py-3 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {pageRows.length === 0 && (
            <tr>
              <td colSpan={columns.length + 2} className="px-4 py-8 text-center text-gray-400">
                {rows.length === 0 ? "No records yet." : "No records match your search."}
              </td>
            </tr>
          )}
          {pageRows.map(row => {
            const id = row[idField];
            return (
              <tr key={id} className="border-b border-gray-100 last:border-0">
                {columns.map(c => (
                  <td key={c.key} className="px-4 py-3 text-gray-800">
                    {String(row[c.key] ?? "")}
                  </td>
                ))}
                <td className="px-4 py-3">
                  <button
                    disabled={busyId === id}
                    onClick={() => handleTogglePublished(id, row.published)}
                    className={`text-xs px-2 py-1 rounded-full border ${
                      row.published
                        ? "bg-green-50 text-green-700 border-green-200"
                        : "bg-gray-100 text-gray-500 border-gray-200"
                    }`}
                  >
                    {row.published ? "Published" : "Draft"}
                  </button>
                </td>
                <td className="px-4 py-3 text-right space-x-3 whitespace-nowrap">
                  <Link href={`${basePath}/${encodeURIComponent(id)}`} className="text-gray-600 hover:text-gray-900 underline">
                    Edit
                  </Link>
                  <button
                    disabled={busyId === id}
                    onClick={() => handleDelete(id)}
                    className="text-red-600 hover:text-red-800 underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      </div>

      {pageCount > 1 && (
        <div className="flex items-center justify-between gap-3 mt-3">
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={safePage === 0}
            className="text-sm px-3 py-1.5 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-40"
          >
            ← Previous
          </button>
          <span className="text-xs text-gray-500">Page {safePage + 1} of {pageCount}</span>
          <button
            onClick={() => setPage(p => Math.min(pageCount - 1, p + 1))}
            disabled={safePage >= pageCount - 1}
            className="text-sm px-3 py-1.5 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-40"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
