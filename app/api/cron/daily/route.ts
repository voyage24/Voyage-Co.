import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

// Single daily cron that fans out to every daily task. Vercel's Hobby plan
// limits the number of scheduled cron jobs, so we schedule just this one (plus
// the weekly newsletter) and trigger the individual jobs from here.
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const base = "https://voyagesco.com";
  const headers: HeadersInit = secret ? { authorization: `Bearer ${secret}` } : {};
  const jobs = ["search-alerts", "lifecycle-emails", "occasion-emails"];

  const results = await Promise.allSettled(
    jobs.map(j => fetch(`${base}/api/cron/${j}`, { headers, cache: "no-store" }).then(r => r.json()).catch(() => ({ error: j }))),
  );

  return NextResponse.json({ ok: true, jobs: results.map((r, i) => ({ job: jobs[i], ...(r.status === "fulfilled" ? r.value : { error: "failed" }) })) });
}
