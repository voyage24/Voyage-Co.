import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/requireAdmin";
import { draftFromSubject, draftFromContent } from "@/lib/email/compose-drafts";
import { generateText, aiConfigured } from "@/lib/ai";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

const SYSTEM = `You are the concierge of Voyages & Co., a luxury bespoke travel atelier based in India (prices in INR).
Write the BODY of a professional email — warm, elegant, refined British English, concise (2 short paragraphs).
Do NOT include a greeting line (no "Dear ...") and NO sign-off — those are added automatically by our template.
When replying to a message, directly address the sender's points and answer their questions helpfully.
Never invent specific prices, dates, booking references or facts that were not given; if details are needed, politely ask for them.
Return only the email body text, with a blank line between paragraphs.`;

// AI-written email body for Compose and Inbox replies. When `incoming` (a
// received message) is supplied, it drafts a reply addressing it. Uses the first
// configured AI provider; falls back to a content-aware template otherwise.
export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;

  const { subject, name, context, incoming } = await req.json().catch(() => ({}));
  const prompt = incoming
    ? `Write a reply to the following message from ${String(name || "a guest").slice(0, 100)} (subject: "${String(subject || "").slice(0, 200)}").
${context ? `Notes to incorporate: ${String(context).slice(0, 500)}\n` : ""}
Their message:
"""
${String(incoming).slice(0, 4000)}
"""`
    : `Subject: ${String(subject || "").slice(0, 200)}
Recipient: ${String(name || "guest").slice(0, 100)}
Context / notes: ${String(context || "none").slice(0, 800)}`;

  if (aiConfigured()) {
    const { text } = await generateText(SYSTEM, [{ role: "user", content: prompt }], 500);
    if (text) return NextResponse.json({ draft: text, source: "ai" });
  }

  // No AI configured / all failed → content-aware template.
  const fallback = incoming
    ? draftFromContent(`${subject || ""}\n${String(incoming).slice(0, 2000)}`)
    : draftFromSubject(String(subject || ""));
  return NextResponse.json({
    draft: fallback,
    source: "template",
    note: aiConfigured() ? "AI call failed — check the provider key/quota." : "No AI key configured (add GEMINI_API_KEY)",
  });
}
