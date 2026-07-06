// Placeholder card grid shown while a listing page loads — matches the real
// card footprint so the layout doesn't jump when content arrives.
export default function CardGridSkeleton({ count = 6, label = "Loading" }: { count?: number; label?: string }) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20" aria-busy="true" aria-label={label}>
      <div className="h-3 w-24 bg-line rounded mb-4 animate-pulse" />
      <div className="h-9 w-64 max-w-full bg-line/70 rounded mb-10 animate-pulse" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-line overflow-hidden">
            <div className="aspect-[4/3] bg-line/60 animate-pulse" />
            <div className="p-5 space-y-3">
              <div className="h-3 w-20 bg-line rounded animate-pulse" />
              <div className="h-5 w-3/4 bg-line/70 rounded animate-pulse" />
              <div className="h-3 w-1/2 bg-line rounded animate-pulse" />
              <div className="h-8 w-full bg-line/50 rounded animate-pulse mt-4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
