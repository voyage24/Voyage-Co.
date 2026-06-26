"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export interface DataTableColumn {
  key: string;
  label: string;
}

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
          {rows.length === 0 && (
            <tr>
              <td colSpan={columns.length + 2} className="px-4 py-8 text-center text-gray-400">
                No records yet.
              </td>
            </tr>
          )}
          {rows.map(row => {
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
  );
}
