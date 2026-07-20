// Run a database query, returning `fallback` if the database is unreachable.
//
// The public listing pages use ISR (`revalidate`), so Next runs their queries at
// build time. If the database is down then (e.g. Neon suspended over its compute
// limit), an unwrapped query throws and fails the entire deploy — including any
// fix meant to address the outage. Wrapping the query lets the page build and
// render empty instead; once the database is back, ISR revalidation refills it.
export async function safeQuery<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    if (process.env.NODE_ENV !== "production") console.warn("safeQuery: database unavailable, using fallback —", err);
    return fallback;
  }
}
