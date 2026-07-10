// Instant skeleton while the mail app's server render is in flight, so opening
// the installed app never shows a blank screen.
export default function Loading() {
  return (
    <div className="space-y-5" aria-busy="true">
      <div className="h-6 w-24 bg-gray-200 rounded animate-pulse" />
      <div className="h-9 w-44 bg-gray-300 rounded-md animate-pulse" />
      <div className="space-y-2">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="border border-gray-200 rounded-lg bg-white px-4 py-3 flex items-center gap-3">
            <div className="w-4 h-4 rounded bg-gray-200 animate-pulse shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3.5 w-40 bg-gray-200 rounded animate-pulse" />
              <div className="h-3 w-64 max-w-full bg-gray-100 rounded animate-pulse" />
            </div>
            <div className="h-3 w-10 bg-gray-100 rounded animate-pulse shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}
