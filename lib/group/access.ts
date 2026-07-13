import { prisma } from "@/lib/prisma";

// Shared helpers for the group-trip workspace: membership guard, member-name
// resolution, expense balances and a single snapshot the UI polls.

export function displayName(name: string | null | undefined, email: string): string {
  return (name && name.trim()) || email.split("@")[0];
}

export async function getMembership(groupId: string, customerId: string) {
  return prisma.groupMember.findUnique({ where: { groupId_customerId: { groupId, customerId } } });
}

export type GroupSnapshot = Awaited<ReturnType<typeof getGroupSnapshot>>;

// The full workspace state for a viewer who is a confirmed member. Returns null
// if the group doesn't exist or the viewer isn't a member.
export async function getGroupSnapshot(groupId: string, viewerId: string) {
  const group = await prisma.groupTrip.findUnique({
    where: { id: groupId },
    include: { members: { include: { customer: { select: { id: true, name: true, email: true } } }, orderBy: { joinedAt: "asc" } } },
  });
  if (!group) return null;
  if (!group.members.some(m => m.customerId === viewerId)) return null;

  const nameOf = new Map(group.members.map(m => [m.customerId, displayName(m.customer.name, m.customer.email)]));
  const memberIds = group.members.map(m => m.customerId);

  const [shortlistRows, expenseRows, messageRows, photoRows, bookingRows] = await Promise.all([
    prisma.groupShortlistItem.findMany({ where: { groupId }, include: { votes: true }, orderBy: { createdAt: "asc" } }),
    prisma.groupExpense.findMany({ where: { groupId }, orderBy: { createdAt: "desc" } }),
    prisma.groupMessage.findMany({ where: { groupId }, orderBy: { createdAt: "asc" }, take: 200 }),
    prisma.groupPhoto.findMany({ where: { groupId }, orderBy: { createdAt: "desc" }, take: 120 }),
    prisma.booking.findMany({ where: { customerId: { in: memberIds }, status: { not: "cancelled" } }, orderBy: { checkIn: "asc" }, select: { reference: true, itemTitle: true, type: true, checkIn: true, checkOut: true, status: true, customerId: true, image: true } }),
  ]);

  const shortlist = shortlistRows
    .map(s => ({
      id: s.id, type: s.type, itemId: s.itemId, title: s.title, image: s.image, href: s.href, price: s.price,
      addedBy: nameOf.get(s.addedById) || "A member",
      votes: s.votes.length,
      voters: s.votes.map(v => nameOf.get(v.customerId) || "Someone"),
      youVoted: s.votes.some(v => v.customerId === viewerId),
    }))
    .sort((a, b) => b.votes - a.votes || a.title.localeCompare(b.title));

  // Expense balances — each expense split equally among its participants.
  const paid = new Map<string, number>(), owed = new Map<string, number>();
  for (const id of memberIds) { paid.set(id, 0); owed.set(id, 0); }
  const expenses = expenseRows.map(e => {
    const among: string[] = Array.isArray(e.splitAmong) ? (e.splitAmong as string[]).filter(id => memberIds.includes(id)) : [];
    const participants = among.length ? among : memberIds;
    const share = e.amount / participants.length;
    paid.set(e.paidById, (paid.get(e.paidById) || 0) + e.amount);
    for (const id of participants) owed.set(id, (owed.get(id) || 0) + share);
    return {
      id: e.id, description: e.description, amount: e.amount, category: e.category,
      origCurrency: e.origCurrency, origAmount: e.origAmount,
      paidById: e.paidById, paidBy: nameOf.get(e.paidById) || "A member",
      among: participants.map(id => nameOf.get(id) || "?"),
      share: Math.round(share), createdAt: e.createdAt.toISOString(),
    };
  });

  // Totals grouped by category (auto-grouped spend), largest first.
  const catMap = new Map<string, number>();
  for (const e of expenseRows) catMap.set(e.category, (catMap.get(e.category) || 0) + e.amount);
  const categoryTotals = Array.from(catMap.entries()).map(([category, total]) => ({ category, total })).sort((a, b) => b.total - a.total);
  const totalSpend = expenseRows.reduce((s, e) => s + e.amount, 0);

  // Daily budget vs actual — today's spend and the running daily average.
  const dayKey = (d: Date) => d.toISOString().slice(0, 10);
  const todayKey = new Date().toISOString().slice(0, 10);
  const activeDays = new Set(expenseRows.map(e => dayKey(e.createdAt)));
  const daysActive = Math.max(1, activeDays.size);
  const todaySpend = expenseRows.filter(e => dayKey(e.createdAt) === todayKey).reduce((s, e) => s + e.amount, 0);
  const dailyAverage = Math.round(totalSpend / daysActive);
  const balances = memberIds.map(id => ({
    customerId: id, name: nameOf.get(id) || "?",
    paid: Math.round(paid.get(id) || 0),
    owes: Math.round(owed.get(id) || 0),
    net: Math.round((paid.get(id) || 0) - (owed.get(id) || 0)),
  }));

  const messages = messageRows.map(m => ({ id: m.id, customerId: m.customerId, name: nameOf.get(m.customerId) || "Someone", body: m.body, createdAt: m.createdAt.toISOString(), mine: m.customerId === viewerId }));
  const photos = photoRows.map(p => ({ id: p.id, url: p.url, caption: p.caption, by: nameOf.get(p.customerId) || "Someone", createdAt: p.createdAt.toISOString() }));
  const bookings = bookingRows.map(b => ({ reference: b.reference, itemTitle: b.itemTitle, type: b.type, checkIn: b.checkIn, checkOut: b.checkOut, status: b.status, image: b.image, by: nameOf.get(b.customerId!) || "A member" }));

  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://voyagesco.com";
  return {
    id: group.id, title: group.title, destination: group.destination,
    ownerId: group.ownerId, isOwner: group.ownerId === viewerId,
    dailyBudget: group.dailyBudget, todaySpend, dailyAverage, daysActive,
    inviteUrl: `${base}/groups/join/${group.shareToken}`,
    members: group.members.map(m => ({ customerId: m.customerId, name: displayName(m.customer.name, m.customer.email), isOwner: m.customerId === group.ownerId })),
    shortlist, expenses, balances, categoryTotals, totalSpend, messages, photos, bookings,
  };
}
