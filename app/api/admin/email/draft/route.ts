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

type CallResult = { text: string | null; error?: string };

// --- AI providers (first configured one wins). Gemini and Groq have free tiers. ---
async function callAnthropic(prompt: string): Promise<CallResult> {
  const key = process.env.ANTHROPIC_API_KEY; if (!key) return { text: null };
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST", headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json" },
    body: JSON.stringify({ model: process.env.CONCIERGE_MODEL || "claude-3-5-haiku-latest", max_tokens: 500, system: SYSTEM, messages: [{ role: "user", content: prompt }] }),
  });
  if (!res.ok) return { text: null, error: `anthropic ${res.status}: ${(await res.text().catch(() => "")).slice(0, 160)}` };
  const d = await res.json();
  return { text: (d.content ?? []).filter((b: { type: string }) => b.type === "text").map((b: { text: string }) => b.text).join("\n").trim() || null };
}

async function callGemini(prompt: string): Promise<CallResult> {
  const key = process.env.GEMINI_API_KEY; if (!key) return { text: null };
  // Try current models in order; Google retires older aliases over time, so a
  // 404 on one just moves to the next.
  const models = [process.env.GEMINI_MODEL, "gemini-2.0-flash", "gemini-2.5-flash", "gemini-flash-latest", "gemini-1.5-flash"].filter(Boolean) as string[];
  let lastError = "";
  for (const model of models) {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`, {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ systemInstruction: { parts: [{ text: SYSTEM }] }, contents: [{ role: "user", parts: [{ text: prompt }] }], generationConfig: { maxOutputTokens: 600 } }),
    });
    if (res.ok) {
      const d = await res.json();
      const text = (d.candidates?.[0]?.content?.parts ?? []).map((p: { text?: string }) => p.text || "").join("").trim() || null;
      return { text };
    }
    lastError = `gemini ${res.status} (${model}): ${(await res.text().catch(() => "")).slice(0, 140)}`;
    // Fall through on "model not found" (404) or per-model quota (429) — other
    // models have separate free quotas. Stop on anything else (e.g. bad key).
    if (res.status !== 404 && res.status !== 429) break;
  }
  return { text: null, error: lastError };
}

async function callGroq(prompt: string): Promise<CallResult> {
  const key = process.env.GROQ_API_KEY; if (!key) return { text: null };
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST", headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
    body: JSON.stringify({ model: process.env.GROQ_MODEL || "llama-3.1-8b-instant", max_tokens: 500, messages: [{ role: "system", content: SYSTEM }, { role: "user", content: prompt }] }),
  });
  if (!res.ok) return { text: null, error: `groq ${res.status}: ${(await res.text().catch(() => "")).slice(0, 160)}` };
  const d = await res.json();
  return { text: d.choices?.[0]?.message?.content?.trim() || null };
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

  // Try each configured provider in turn; collect failures for diagnosis.
  const anyKey = !!(process.env.ANTHROPIC_API_KEY || process.env.GEMINI_API_KEY || process.env.GROQ_API_KEY);
  const errors: string[] = [];
  for (const call of [callAnthropic, callGemini, callGroq]) {
    const r = await call(prompt).catch(e => ({ text: null, error: String(e).slice(0, 160) }));
    if (r.text) return NextResponse.json({ draft: r.text, source: "ai" });
    if (r.error) errors.push(r.error);
  }

  // No AI configured / all failed → content-aware template. If a key was set but
  // failed, surface why so it can be fixed.
  const fallback = incoming
    ? draftFromContent(`${subject || ""}\n${String(incoming).slice(0, 2000)}`)
    : draftFromSubject(String(subject || ""));
  return NextResponse.json({
    draft: fallback,
    source: "template",
    ...(anyKey ? { note: errors.length ? `AI key set but failed → ${errors.join(" | ")}` : "AI key set but returned no text" } : { note: "No AI key configured (add GEMINI_API_KEY)" }),
  });
}
