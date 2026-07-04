// Shared boarding-pass helpers so the on-screen pass and the downloadable PDF
// show identical seat/gate/zone/boarding (all derived deterministically from
// the booking reference — the airline issues the binding ones at check-in).

export function hashRef(s: string): number {
  let h = 7;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

// Time N minutes before "HH:MM".
export function minusMinutes(hhmm: string, mins: number): string {
  const m = /(\d{1,2}):(\d{2})/.exec(hhmm || "");
  if (!m) return hhmm || "—";
  let total = (+m[1]) * 60 + (+m[2]) - mins;
  total = ((total % 1440) + 1440) % 1440;
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

export function fmtDate(d?: string | null): string {
  if (!d) return "—";
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(d);
  if (!m) return d;
  return new Date(+m[1], +m[2] - 1, +m[3]).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
}

export function boardingDetails(opts: { reference: string; departure: string; guests: number; total: number; businessPrice?: number | null }) {
  const h = hashRef(opts.reference);
  const perGuest = opts.guests > 0 ? opts.total / opts.guests : opts.total;
  const klass = opts.businessPrice && perGuest >= opts.businessPrice * 0.9 ? "Business" : "Economy";
  const seat = `${(klass === "Business" ? 1 : 12) + (h % 30)}${"ABCDEFHJK"[h % 8]}`;
  const gate = `${"ABCDE"[h % 5]}${1 + (h % 30)}`;
  const zone = 1 + (h % 4);
  const boarding = minusMinutes(opts.departure, 40);
  return { klass, seat, gate, zone, boarding };
}
