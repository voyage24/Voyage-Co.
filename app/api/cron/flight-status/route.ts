import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getFlightPhase, statusMessage } from "@/lib/flight-status";
import { sendPushToCustomer } from "@/lib/push";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

// Polls live position for flight bookings and pushes "airborne" / "landed"
// updates to the traveller when the phase changes. Uses the keyless ADS-B feed,
// so it reflects real aircraft position — not airline gate/delay boards. To make
// it genuinely live (gate, boarding, delay minutes) add a flight-status data
// provider and run this on a short schedule (needs a Vercel plan that allows
// sub-daily crons). Today it also runs from the daily fan-out.
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Confirmed flight bookings with a customer to notify.
  const bookings = await prisma.booking.findMany({
    where: { type: "flight", status: "confirmed", customerId: { not: null }, flightStatus: { not: "landed" } },
    select: { id: true, itemId: true, itemTitle: true, customerId: true, flightStatus: true },
    take: 100,
  });
  if (bookings.length === 0) return NextResponse.json({ ok: true, checked: 0, pushed: 0 });

  const flightIds = Array.from(new Set(bookings.map(b => b.itemId)));
  const flights = await prisma.flight.findMany({ where: { id: { in: flightIds } }, select: { id: true, airlineCode: true, flightNumber: true } });
  const flightById = new Map(flights.map(f => [f.id, f]));

  let pushed = 0;
  for (const b of bookings) {
    const f = flightById.get(b.itemId);
    if (!f) continue;
    const { phase, found } = await getFlightPhase(f.airlineCode, f.flightNumber);
    if (!found || phase === b.flightStatus) continue;

    const msg = statusMessage(phase, b.itemTitle);
    await prisma.booking.update({ where: { id: b.id }, data: { flightStatus: phase, flightStatusAt: new Date() } });
    if (msg && b.customerId) {
      await sendPushToCustomer(b.customerId, { title: msg.title, body: msg.body, url: "/account" });
      pushed++;
    }
  }

  return NextResponse.json({ ok: true, checked: bookings.length, pushed });
}
