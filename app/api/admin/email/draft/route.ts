import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/requireAdmin";
import { draftFromSubject, draftFromContent } from "@/lib/email/compose-drafts";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

const SYSTEM = `You are the concierge of Voyages & Co., a luxury bespoke travel atelier based in India (prices in INR).
Write the BODY of a professional email — warm, elegant, refined British English, concise (2 short paragraphs).
Do NOT include a greeting line (no "Dear ...") and NO sign-off — those are added automatically by our template.
When replying to a message, directly address the sender's points and answer their questions helpfully.
Never invent specific prices, dates, booking references or facts that were not given; if details are needed, politely ask for them.
Return only the email body text, with a blank line between paragraphs.`;

// --- AI providers (first configured one wins). Gemini and Groq have free tiers. ---
async function callAnthropic(prompt: string): Promise<string | null> {
  const key = process.env.ANTHROPIC_API_KEY; if (!key) return null;
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST", headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json" },
    body: JSON.stringify({ model: process.env.CONCIERGE_MODEL || "claude-3-5-haiku-latest", max_tokens: 500, system: SYSTEM, messages: [{ role: "user", content: prompt }] }),
  });
  if (!res.ok) return null;
  const d = await res.json();
  return (d.content ?? []).filter((b: { type: string }) => b.type === "text").map((b: { text: string }) => b.text).join("\n").trim() || null;
}

async function callGemini(prompt: string): Promise<string | null> {
  const key = process.env.GEMINI_API_KEY; if (!key) return null;
  const model = process.env.GEMINI_MODEL || "gemini-1.5-flash-latest";
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`, {
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ systemInstruction: { parts: [{ text: SYSTEM }] }, contents: [{ role: "user", parts: [{ text: prompt }] }], generationConfig: { maxOutputTokens: 600 } }),
  });
  if (!res.ok) return null;
  const d = await res.json();
  return (d.candidates?.[0]?.content?.parts ?? []).map((p: { text?: string }) => p.text || "").join("").trim() || null;
}

async function callGroq(prompt: string): Promise<string | null> {
  const key = process.env.GROQ_API_KEY; if (!key) return null;
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST", headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
    body: JSON.stringify({ model: process.env.GROQ_MODEL || "llama-3.1-8b-instant", max_tokens: 500, messages: [{ role: "system", content: SYSTEM }, { role: "user", content: prompt }] }),
  });
  if (!res.ok) return null;
  const d = await res.json();
  return d.choices?.[0]?.message?.content?.trim() || null;
}

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

  // Try each configured provider in turn.
  try {
    for (const call of [callAnthropic, callGemini, callGroq]) {
      const out = await call(prompt).catch(() => null);
      if (out) return NextResponse.json({ draft: out, source: "ai" });
    }
  } catch { /* fall through to template */ }

  // No AI configured / all failed → content-aware template.
  const fallback = incoming
    ? draftFromContent(`${subject || ""}\n${String(incoming).slice(0, 2000)}`)
    : draftFromSubject(String(subject || ""));
  return NextResponse.json({ draft: fallback, source: "template" });
}
