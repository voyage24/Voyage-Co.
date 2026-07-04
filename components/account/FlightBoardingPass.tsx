import { Plane } from "lucide-react";

type BP = {
  airline: string;
  flightNumber: string;
  origin: string;
  originCity: string;
  destination: string;
  destinationCity: string;
  departure: string;
  arrival: string;
  duration?: string | null;
  businessPrice?: number | null;
  passenger: string;
  reference: string;
  date?: string | null;
  guests: number;
  total: number;
};

function hash(s: string): number {
  let h = 7;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

// Boarding time = 40 min before departure (typical); parsed from "HH:MM".
function minusMinutes(hhmm: string, mins: number): string {
  const m = /(\d{1,2}):(\d{2})/.exec(hhmm || "");
  if (!m) return hhmm || "—";
  let total = (+m[1]) * 60 + (+m[2]) - mins;
  total = ((total % 1440) + 1440) % 1440;
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

function fmtDate(d?: string | null): string {
  if (!d) return "—";
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(d);
  if (!m) return d;
  const dt = new Date(+m[1], +m[2] - 1, +m[3]);
  return dt.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
}

function Field({ label, value, className = "" }: { label: string; value: string; className?: string }) {
  return (
    <div className={className}>
      <p className="text-[9px] tracking-[0.16em] uppercase text-ink-faint mb-0.5">{label}</p>
      <p className="text-sm font-medium text-ink truncate">{value}</p>
    </div>
  );
}

function Stub({ label, value }: { label: string; value: string }) {
  return (
    <div className="mb-2.5">
      <p className="text-[8px] tracking-[0.16em] uppercase text-ink-faint">{label}</p>
      <p className="text-xs font-semibold text-ink truncate">{value}</p>
    </div>
  );
}

// A decorative barcode built from the booking reference (stable per booking).
function Barcode({ seed }: { seed: string }) {
  let h = hash(seed);
  const bars = Array.from({ length: 52 }, (_, i) => {
    h = (h * 1103515245 + 12345) & 0x7fffffff;
    const w = 1 + (h % 3);
    const light = ((h >> 4) & 3) === 0;
    return <span key={i} style={{ width: `${w}px` }} className={light ? "bg-ink/30" : "bg-ink"} />;
  });
  return <div className="flex items-stretch gap-[1px] h-10">{bars}</div>;
}

/**
 * Renders a flight booking as a stylised boarding pass — real route, airline,
 * times and passenger from the booking/flight, with seat/gate/zone/boarding
 * derived deterministically from the reference (the airline issues the binding
 * ones at check-in). A perforated tear-off stub carries a barcode.
 */
export default function FlightBoardingPass(props: BP) {
  const h = hash(props.reference);
  const perGuest = props.guests > 0 ? props.total / props.guests : props.total;
  const klass = props.businessPrice && perGuest >= props.businessPrice * 0.9 ? "Business" : "Economy";
  const seat = `${(klass === "Business" ? 1 : 12) + (h % 30)}${"ABCDEFHJK"[h % 8]}`;
  const gate = `${"ABCDE"[h % 5]}${1 + (h % 30)}`;
  const zone = 1 + (h % 4);
  const boarding = minusMinutes(props.departure, 40);

  return (
    <div className="bg-panel border border-line rounded-2xl shadow-card overflow-hidden">
      {/* top brand band */}
      <div className="bg-ink text-page px-6 sm:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Plane size={17} className="text-gold" />
          <div>
            <p className="text-[10px] tracking-[0.28em] uppercase text-gold leading-none">Boarding Pass</p>
            <p className="font-serif text-lg leading-tight">{props.airline}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[9px] tracking-[0.16em] uppercase text-page/50">Flight</p>
          <p className="font-mono text-base tracking-wider">{props.flightNumber}</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row">
        {/* main */}
        <div className="flex-1 p-6 sm:p-8">
          {/* route */}
          <div className="flex items-end justify-between gap-4 mb-7">
            <div>
              <p className="font-serif text-4xl sm:text-5xl font-light text-ink leading-none">{props.origin}</p>
              <p className="text-xs text-ink-faint font-light mt-1 truncate max-w-[9rem]">{props.originCity}</p>
            </div>
            <div className="flex-1 flex items-center gap-2 pb-3">
              <span className="h-px bg-line flex-1" />
              <Plane size={16} className="text-gold rotate-90 shrink-0" />
              <span className="h-px bg-line flex-1" />
            </div>
            <div className="text-right">
              <p className="font-serif text-4xl sm:text-5xl font-light text-ink leading-none">{props.destination}</p>
              <p className="text-xs text-ink-faint font-light mt-1 truncate max-w-[9rem] ml-auto">{props.destinationCity}</p>
            </div>
          </div>

          {/* details */}
          <div className="grid grid-cols-3 gap-y-5 gap-x-3">
            <Field label="Passenger" value={props.passenger} className="col-span-2" />
            <Field label="Class" value={klass} />
            <Field label="Date" value={fmtDate(props.date)} className="col-span-2" />
            <Field label="Departs" value={props.departure || "—"} />
            <Field label="Boarding" value={boarding} />
            <Field label="Gate" value={gate} />
            <Field label="Seat" value={seat} />
            <Field label="Zone" value={String(zone)} />
            <Field label="Arrives" value={props.arrival || "—"} />
            {props.duration && <Field label="Duration" value={props.duration} />}
          </div>
        </div>

        {/* perforated stub */}
        <div className="relative sm:w-56 shrink-0 border-t sm:border-t-0 sm:border-l border-dashed border-line-strong bg-panel-soft p-6 flex flex-col justify-between">
          {/* punch notches */}
          <span className="hidden sm:block absolute -left-2 -top-2 w-4 h-4 rounded-full bg-page border border-line" />
          <span className="hidden sm:block absolute -left-2 -bottom-2 w-4 h-4 rounded-full bg-page border border-line" />
          <div>
            <p className="text-[10px] tracking-[0.22em] uppercase text-gold mb-3">Boarding Pass</p>
            <Stub label="Passenger" value={props.passenger} />
            <Stub label="Flight" value={props.flightNumber} />
            <div className="grid grid-cols-2 gap-x-2">
              <Stub label="Seat" value={seat} />
              <Stub label="Gate" value={gate} />
            </div>
            <Stub label="Booking" value={props.reference} />
          </div>
          <div className="mt-4">
            <Barcode seed={props.reference} />
            <p className="text-[9px] text-center text-ink-faint mt-1 tracking-[0.2em] font-mono">{props.reference}</p>
          </div>
        </div>
      </div>

      <p className="px-6 sm:px-8 py-4 border-t border-line text-[11px] text-ink-faint font-light leading-relaxed">
        Seat, gate &amp; boarding shown are indicative — the airline confirms final details at online check-in. Please carry a valid photo ID/passport. For changes contact our concierge at hello@voyagesco.com or +91&nbsp;99199&nbsp;10213.
      </p>
    </div>
  );
}
