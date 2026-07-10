import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/requireAdmin";
import { draftFromSubject } from "@/lib/email/compose-drafts";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

const MODEL = process.env.CONCIERGE_MODEL || "claude-3-5-haiku-latest";

const SYSTEM = `You are the concierge of Voyages & Co., a luxury bespoke travel atelier based in India (prices in INR).
Write the BODY of a professional email — warm, elegant, refined British English, concise (2 short paragraphs).
Do NOT include a greeting line (no "Dear ...") and NO sign-off — those are added automatically by our template.
Base it strictly on the subject and any context provided. Never invent specific prices, dates, booking references or facts that were not given.
Return only the email body text, with a blank line between paragraphs.`;

// AI-written email body for the admin Compose box, tailored to the subject +
// context. Falls back to the keyword template when no ANTHROPIC_API_KEY is set.
export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;

  const { subject, name, context } = await req.json().catch(() => ({}));
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return NextResponse.json({ draft: draftFromSubject(String(subject || "")), source: "template" });

  const prompt = `Subject: ${String(subject || "").slice(0, 200)}
Recipient: ${String(name || "guest").slice(0, 100)}
Context / notes: ${String(context || "none").slice(0, 800)}`;

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json" },
      body: JSON.stringify({ model: MODEL, max_tokens: 500, system: SYSTEM, messages: [{ role: "user", content: prompt }] }),
    });
    if (!res.ok) return NextResponse.json({ draft: draftFromSubject(String(subject || "")), source: "template" });
    const data = await res.json();
    const draft = (data.content ?? []).filter((b: { type: string }) => b.type === "text").map((b: { text: string }) => b.text).join("\n").trim();
    return NextResponse.json({ draft: draft || draftFromSubject(String(subject || "")), source: draft ? "ai" : "template" });
  } catch {
    return NextResponse.json({ draft: draftFromSubject(String(subject || "")), source: "template" });
  }
}
