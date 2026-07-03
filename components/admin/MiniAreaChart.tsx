// Lightweight animated area/line chart (no chart library). Uses currentColor
// for the line/dots so it adapts to light & dark admin; yellow gradient fill.
export default function MiniAreaChart({ data, format = (n: number) => String(n) }: { data: { label: string; count: number }[]; format?: (n: number) => string }) {
  const W = 620, H = 190, padL = 26, padR = 12, padT = 14, padB = 24;
  const n = Math.max(1, data.length);
  const max = Math.max(1, ...data.map(d => d.count));
  const innerW = W - padL - padR, innerH = H - padT - padB;
  const baseline = padT + innerH;
  const X = (i: number) => padL + (n <= 1 ? innerW / 2 : (i * innerW) / (n - 1));
  const Y = (v: number) => padT + innerH - (v / max) * innerH;

  const line = data.map((d, i) => `${i ? "L" : "M"}${X(i).toFixed(1)},${Y(d.count).toFixed(1)}`).join(" ");
  const area = `${line} L${X(data.length - 1).toFixed(1)},${baseline} L${X(0).toFixed(1)},${baseline} Z`;
  const ticks = Array.from(new Set([0, Math.round(max / 2), max]));

  return (
    <div className="text-gray-900">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label="Bookings over the last 14 days">
        <defs>
          <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#E6E800" stopOpacity="0.5" />
            <stop offset="1" stopColor="#E6E800" stopOpacity="0" />
          </linearGradient>
        </defs>

        {ticks.map(t => (
          <g key={t}>
            <line x1={padL} x2={W - padR} y1={Y(t)} y2={Y(t)} stroke="currentColor" strokeOpacity="0.1" />
            <text x={padL - 6} y={Y(t) + 3} textAnchor="end" fontSize="9" fill="currentColor" fillOpacity="0.45">{format(t)}</text>
          </g>
        ))}

        <path d={area} fill="url(#chartFill)" className="chart-area" />
        <path d={line} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" className="chart-line" />

        {data.map((d, i) => (
          <g key={i}>
            <circle cx={X(i)} cy={Y(d.count)} r="3" fill="#E6E800" stroke="currentColor" strokeWidth="1.5" className="chart-dot" style={{ animationDelay: `${0.5 + i * 0.05}s` }}>
              <title>{`${d.label}: ${format(d.count)}`}</title>
            </circle>
            {i % 2 === 0 && <text x={X(i)} y={H - 8} textAnchor="middle" fontSize="9" fill="currentColor" fillOpacity="0.45">{d.label.split(" ")[0]}</text>}
          </g>
        ))}
      </svg>
    </div>
  );
}
