"use client";

const ROWS = Array.from({ length: 14 }, (_, i) => 10 + i); // rows 10–23
const LEFT = ["A", "B", "C"];
const RIGHT = ["D", "E", "F"];

function hash(s: string): number {
  let h = 7;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}
// Deterministic "already taken" seats, seeded by the flight so the map is
// stable for a given flight (this is a curated experience, not live inventory).
function isTaken(seed: string, seat: string): boolean {
  return hash(seed + seat) % 10 < 3; // ~30% taken
}

function SeatBtn({ label, taken, selected, onSelect }: { label: string; taken: boolean; selected: boolean; onSelect: (s: string) => void }) {
  return (
    <button
      type="button"
      disabled={taken}
      onClick={() => onSelect(selected ? "" : label)}
      aria-label={`Seat ${label}${taken ? " (taken)" : selected ? " (selected)" : ""}`}
      aria-pressed={selected}
      className={`w-7 h-7 text-[9px] flex items-center justify-center border shrink-0 transition-colors ${
        taken
          ? "bg-ink/15 border-transparent text-ink-faint/40 cursor-not-allowed"
          : selected
            ? "bg-gold border-gold text-page font-semibold"
            : "border-line-strong text-ink-muted hover:border-ink hover:bg-panel"
      }`}
    >
      {selected ? "✓" : label.slice(-1)}
    </button>
  );
}

export default function SeatMap({ seed, value, onChange }: { seed: string; value: string; onChange: (s: string) => void }) {
  const seat = (row: number, col: string) => `${row}${col}`;
  const Head = () => (
    <div className="flex items-center gap-1 justify-center mb-1">
      <span className="w-6 shrink-0" />
      {LEFT.map(c => <span key={c} className="w-7 text-center text-[10px] text-ink-faint shrink-0">{c}</span>)}
      <span className="w-4 shrink-0" />
      {RIGHT.map(c => <span key={c} className="w-7 text-center text-[10px] text-ink-faint shrink-0">{c}</span>)}
    </div>
  );

  return (
    <div className="border border-line rounded-sm bg-panel-soft p-3">
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[9px] uppercase tracking-wider text-ink-faint mb-3">
        <span className="flex items-center gap-1"><span className="w-3 h-3 border border-line-strong inline-block" /> Available</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 bg-gold inline-block" /> Selected</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 bg-ink/20 inline-block" /> Taken</span>
      </div>
      <div className="max-h-64 overflow-auto overscroll-contain">
        <Head />
        {ROWS.map(row => (
          <div key={row} className="flex items-center gap-1 justify-center mb-1">
            <span className="w-6 text-[10px] text-ink-faint text-right pr-1 shrink-0">{row}</span>
            {LEFT.map(c => <SeatBtn key={c} label={seat(row, c)} taken={isTaken(seed, seat(row, c))} selected={value === seat(row, c)} onSelect={onChange} />)}
            <span className="w-4 shrink-0" />
            {RIGHT.map(c => <SeatBtn key={c} label={seat(row, c)} taken={isTaken(seed, seat(row, c))} selected={value === seat(row, c)} onSelect={onChange} />)}
          </div>
        ))}
      </div>
    </div>
  );
}
