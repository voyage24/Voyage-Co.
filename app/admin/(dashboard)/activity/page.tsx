import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function fmt(d: Date): string {
  const s = Math.floor((Date.now() - d.getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 604800) return `${Math.floor(s / 86400)}d ago`;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

const ACTION_STYLE: Record<string, string> = {
  create: "bg-emerald-100 text-emerald-700",
  update: "bg-blue-100 text-blue-700",
  delete: "bg-red-100 text-red-700",
  save: "bg-indigo-100 text-indigo-700",
};

export default async function AdminActivityPage() {
  const logs = await prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 200 }).catch(() => []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Activity log</h1>
        <p className="text-sm text-gray-500">A record of recent admin changes — who changed what, and when.</p>
      </div>
      <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-100">
        {logs.length === 0 ? (
          <p className="p-8 text-center text-sm text-gray-400">No activity recorded yet.</p>
        ) : logs.map(l => (
          <div key={l.id} className="flex items-center justify-between gap-3 px-4 py-3">
            <span className="flex items-center gap-2.5 min-w-0">
              <span className={`text-[9px] uppercase tracking-wide px-1.5 py-0.5 rounded shrink-0 ${ACTION_STYLE[l.action] ?? "bg-gray-100 text-gray-600"}`}>{l.action}</span>
              <span className="text-sm text-gray-800 truncate">
                {l.entity}{l.detail ? <span className="text-gray-400"> · {l.detail}</span> : null}
              </span>
            </span>
            <span className="text-xs text-gray-400 shrink-0 text-right">{l.userEmail}<br className="sm:hidden" /><span className="hidden sm:inline"> · </span>{fmt(l.createdAt)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
