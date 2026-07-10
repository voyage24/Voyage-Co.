// Global navigation fallback — a branded spinner shown while a route loads, so
// tapping a link gives immediate feedback instead of a frozen page. Routes with
// their own loading.tsx (e.g. listings) override this.
export default function Loading() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4">
      <div className="w-9 h-9 rounded-full border-2 border-line border-t-gold animate-spin" />
      <p className="text-[10px] tracking-[0.3em] uppercase text-ink-faint">Voyages &amp; Co.</p>
    </div>
  );
}
