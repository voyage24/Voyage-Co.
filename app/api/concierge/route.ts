import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyTurnstile, clientIp } from "@/lib/security/turnstile";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

const MODEL = process.env.CONCIERGE_MODEL || "claude-3-5-haiku-latest";

// Builds a compact catalogue the model can recommend from (real items only).
async function getCatalogue() {
  const [packages, experiences, cruises, hotels] = await Promise.all([
    prisma.package.findMany({ where: { published: true }, select: { id: true, title: true, subtitle: true, duration: true, pricePerPerson: true, category: true }, take: 60 }),
    prisma.experience.findMany({ where: { published: true }, select: { id: true, title: true, location: true, category: true, price: true }, take: 40 }),
    prisma.cruise.findMany({ where: { published: true }, select: { id: true, name: true, region: true, duration: true, pricePerPerson: true }, take: 30 }),
    prisma.hotel.findMany({ where: { published: true }, select: { id: true, name: true, location: true, category: true, pricePerNight: true }, take: 40 }),
  ]);
  const lines: string[] = [];
  for (const p of packages) lines.push(`JOURNEY | ${p.title} | ${p.subtitle} | ${p.duration} | from ₹${p.pricePerPerson} pp | ${p.category} | /packages/${p.id}`);
  for (const e of experiences) lines.push(`EXPERIENCE | ${e.title} | ${e.location} | ${e.category} | from ₹${e.price} | /experiences/${e.id}`);
  for (const c of cruises) lines.push(`CRUISE | ${c.name} | ${c.region} | ${c.duration} | from ₹${c.pricePerPerson} pp | /cruises/${c.id}`);
  for (const h of hotels) lines.push(`STAY | ${h.name} | ${h.location} | ${h.category} | from ₹${h.pricePerNight}/night | /hotels/${h.id}`);
  return lines.join("\n");
}

const SYSTEM = (catalogue: string) => `You are the digital concierge for Voyages & Co., a luxury bespoke travel atelier (India-based, prices in INR).
Help the guest shape a trip and recommend 2–4 specific options FROM THE CATALOGUE BELOW ONLY. Never invent items, prices or links.
Reference each recommendation as a markdown link using its exact path, e.g. [Title](/packages/p1).
Be warm, concise and elegant — a few short sentences, not an essay. If nothing fits well, gently suggest the bespoke trip planner at [Plan Your Journey](/plan).
End by inviting them to refine (budget, dates, party, mood).

CATALOGUE (type | name | details | price | path):
${catalogue}`;

export async function POST(req: Request) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    return NextResponse.json({
      reply: "Our digital concierge is being prepared. In the meantime, tell us what you have in mind on the [Plan Your Journey](/plan) page, or reach our team via [Contact](/contact).",
    });
  }

  const { message, history, turnstileToken } = await req.json().catch(() => ({}));
  if (!message || typeof message !== "string") {
    return NextResponse.json({ error: "Message required" }, { status: 400 });
  }

  const prior = Array.isArray(history)
    ? history.filter((m: { role?: string; content?: string }) => (m.role === "user" || m.role === "assistant") && typeof m.content === "string").slice(-8)
    : [];

  // Bot-check the opening message only (≤1 prior user turn), so scripted clients
  // can't hammer the LLM endpoint, without challenging every reply mid-chat.
  const userTurns = prior.filter((m: { role?: string }) => m.role === "user").length;
  if (userTurns <= 1 && !(await verifyTurnstile(turnstileToken, clientIp(req)))) {
    return NextResponse.json({ reply: "Please complete the quick verification below, then send your message again." }, { status: 400 });
  }

  try {
    const catalogue = await getCatalogue();
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json" },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 700,
        system: SYSTEM(catalogue),
        messages: [...prior, { role: "user", content: message.slice(0, 1000) }],
      }),
    });
    if (!res.ok) {
      console.error("Anthropic error", res.status, await res.text().catch(() => ""));
      return NextResponse.json({ reply: "I'm having trouble just now — please try again, or use [Plan Your Journey](/plan)." });
    }
    const data = await res.json();
    const reply = (data.content ?? []).filter((b: { type: string }) => b.type === "text").map((b: { text: string }) => b.text).join("\n").trim();
    return NextResponse.json({ reply: reply || "Could you tell me a little more about the trip you have in mind?" });
  } catch (err) {
    console.error("Concierge failed:", err);
    return NextResponse.json({ reply: "I'm having trouble just now — please try again shortly." });
  }
}
