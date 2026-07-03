import { NextRequest, NextResponse } from "next/server";
import { getLivePosition } from "@/lib/live-flight";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const p = new URL(req.url).searchParams;
  const carrier = (p.get("carrier") ?? "").toUpperCase().trim();
  const number = (p.get("number") ?? "").replace(/\D/g, "").trim();
  if (!carrier || !number) {
    return NextResponse.json({ error: "carrier and number are required" }, { status: 400 });
  }
  try {
    const position = await getLivePosition(carrier, number);
    return NextResponse.json({ position });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "";
    if (msg === "UNSUPPORTED_AIRLINE") {
      return NextResponse.json({ error: "That airline isn't supported for live tracking yet." }, { status: 400 });
    }
    return NextResponse.json({ error: "Couldn't reach the live flight service — please try again shortly." }, { status: 502 });
  }
}
