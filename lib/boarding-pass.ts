// Shared boarding-pass helpers. Only genuinely-known values are shown — the
// route, times, passenger, PNR and (inferred from the fare paid) the cabin
// class. Seat is shown only if one was actually booked; gate, zone and
// boarding time are left blank because they're assigned by the airline at
// check-in / the airport, so printing a made-up value would be misleading.

export function hashRef(s: string): number {
  let h = 7;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

export function fmtDate(d?: string | null): string {
  if (!d) return "—";
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(d);
  if (!m) return d;
  return new Date(+m[1], +m[2] - 1, +m[3]).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
}

// Cabin class inferred from the fare actually paid (a real booking attribute).
export function flightClass(opts: { guests: number; total: number; businessPrice?: number | null }): string {
  const perGuest = opts.guests > 0 ? opts.total / opts.guests : opts.total;
  return opts.businessPrice && perGuest >= opts.businessPrice * 0.9 ? "Business" : "Economy";
}
