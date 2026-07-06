// Haptic feedback helper. Uses the Web Vibration API (Android / some Chromium);
// iOS Safari doesn't expose vibration to the web, so these are graceful no-ops.
// Site-wide tap feedback lives in components/ui/Haptics.tsx; use these named
// patterns for meaningful moments (booking confirmed, error, etc.).

type Pattern = "tap" | "select" | "success" | "warning" | "error";

const PATTERNS: Record<Pattern, number | number[]> = {
  tap: 12,
  select: 8,
  success: [14, 40, 22],
  warning: [20, 60, 20],
  error: [30, 40, 30, 40, 30],
};

export function haptic(pattern: Pattern = "tap") {
  if (typeof navigator === "undefined" || typeof navigator.vibrate !== "function") return;
  try { navigator.vibrate(PATTERNS[pattern]); } catch { /* ignore */ }
}
