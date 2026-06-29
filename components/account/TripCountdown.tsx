"use client";

// Shows "N days to go" for an upcoming confirmed trip. Renders nothing if the
// date is missing, unparseable, or in the past.
export default function TripCountdown({ checkIn }: { checkIn: string | null }) {
  if (!checkIn) return null;
  const d = new Date(checkIn);
  if (isNaN(d.getTime())) return null;
  const days = Math.ceil((new Date(d).setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0)) / 86400000);
  if (days < 0) return null;
  const label = days === 0 ? "Today ✦" : days === 1 ? "Tomorrow ✦" : `${days} days to go`;
  return (
    <span className="inline-flex items-center text-[10px] tracking-[0.14em] uppercase border border-gold/50 text-gold px-2.5 py-1 rounded-full">{label}</span>
  );
}
