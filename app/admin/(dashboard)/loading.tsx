// Shown immediately while the next admin page renders on the server, so a tap
// gives instant feedback instead of feeling unresponsive during the delay.
export default function AdminLoading() {
  return (
    <div className="flex items-center justify-center py-32">
      <div className="h-8 w-8 rounded-full border-2 border-gray-300 border-t-gray-900 animate-spin dark:border-white/20 dark:border-t-white" />
    </div>
  );
}
