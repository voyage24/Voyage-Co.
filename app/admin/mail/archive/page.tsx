import { prisma } from "@/lib/prisma";
import ArchiveList from "@/components/admin/ArchiveList";

export const dynamic = "force-dynamic";

export default async function MailArchivePage() {
  const rows = await prisma.inboundEmail.findMany({
    where: { archived: true },
    orderBy: { receivedAt: "desc" },
    take: 100,
    select: { id: true, fromName: true, fromEmail: true, subject: true, bodyText: true, receivedAt: true },
  });
  const emails = rows.map(e => ({ ...e, receivedAt: e.receivedAt.toISOString() }));

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-semibold text-gray-900">Archive</h1>
      <ArchiveList emails={emails} />
    </div>
  );
}
