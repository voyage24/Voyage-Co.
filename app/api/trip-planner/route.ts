import { NextResponse } from "next/server";
import { buildTripPlan } from "@/lib/trip-planner";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Natural-language trip planner: { prompt } → a full grounded itinerary.
export async function POST(req: Request) {
  const { prompt } = await req.json().catch(() => ({}));
  if (!prompt || typeof prompt !== "string" || prompt.trim().length < 2) {
    return NextResponse.json({ ok: false, error: "Tell us where you'd like to go — e.g. “Paris for 5 days in September”.", suggestions: [] }, { status: 400 });
  }
  try {
    const plan = await buildTripPlan(prompt.trim().slice(0, 240));
    return NextResponse.json(plan);
  } catch (err) {
    console.error("Trip planner failed:", err);
    return NextResponse.json({ ok: false, error: "We couldn't build that itinerary just now. Please try again.", suggestions: [] }, { status: 500 });
  }
}
