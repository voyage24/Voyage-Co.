import { prisma } from "@/lib/prisma";

// Returns how many units remain bookable for an item, or null when the item
// has no cap set ("on request" — the default bespoke behaviour). Active
// bookings (pending + confirmed) count against capacity; cancelled don't.
export async function getRemaining(type: string, itemId: string): Promise<number | null> {
  let cap: number | null | undefined;

  if (type === "hotel") cap = (await prisma.hotel.findUnique({ where: { id: itemId }, select: { availableUnits: true } }))?.availableUnits;
  else if (type === "package") cap = (await prisma.package.findUnique({ where: { id: itemId }, select: { availableUnits: true } }))?.availableUnits;
  else if (type === "experience") cap = (await prisma.experience.findUnique({ where: { id: itemId }, select: { availableUnits: true } }))?.availableUnits;
  else if (type === "cruise") cap = (await prisma.cruise.findUnique({ where: { id: itemId }, select: { availableUnits: true } }))?.availableUnits;
  else cap = null; // flights/trains: no cap

  if (cap == null) return null;

  const booked = await prisma.booking.count({
    where: { type, itemId, status: { in: ["pending", "confirmed"] } },
  });
  return Math.max(0, cap - booked);
}
