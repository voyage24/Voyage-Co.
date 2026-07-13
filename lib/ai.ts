// Shared AI text generation used by both the concierge chat and email drafts.
// Tries the first configured provider in order — Anthropic (paid), then the
// free tiers Gemini and Groq — so a single key powers everything.

export type AiMessage = { role: "user" | "assistant"; content: string };
export type AiResult = { text: string | null; source: string; error?: string };

async function anthropic(system: string, messages: AiMessage[], maxTokens: number, _json: boolean): Promise<AiResult> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return { text: null, source: "none" };
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST", headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json" },
    body: JSON.stringify({ model: process.env.CONCIERGE_MODEL || "claude-3-5-haiku-latest", max_tokens: maxTokens, system, messages }),
  });
  if (!res.ok) return { text: null, source: "anthropic", error: `${res.status}: ${(await res.text().catch(() => "")).slice(0, 140)}` };
  const d = await res.json();
  const text = (d.content ?? []).filter((b: { type: string }) => b.type === "text").map((b: { text: string }) => b.text).join("\n").trim();
  return { text: text || null, source: "anthropic" };
}

async function gemini(system: string, messages: AiMessage[], maxTokens: number, json: boolean): Promise<AiResult> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return { text: null, source: "none" };
  const models = [process.env.GEMINI_MODEL, "gemini-2.0-flash", "gemini-2.5-flash", "gemini-flash-latest", "gemini-1.5-flash"].filter(Boolean) as string[];
  const contents = messages.map(m => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] }));
  const generationConfig: Record<string, unknown> = { maxOutputTokens: maxTokens };
  if (json) generationConfig.responseMimeType = "application/json";
  let lastError = "";
  for (const model of models) {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`, {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ systemInstruction: { parts: [{ text: system }] }, contents, generationConfig }),
    });
    if (res.ok) {
      const d = await res.json();
      const text = (d.candidates?.[0]?.content?.parts ?? []).map((p: { text?: string }) => p.text || "").join("").trim();
      return { text: text || null, source: "gemini" };
    }
    lastError = `${res.status} (${model}): ${(await res.text().catch(() => "")).slice(0, 120)}`;
    if (res.status !== 404 && res.status !== 429) break;
  }
  return { text: null, source: "gemini", error: lastError };
}

async function groq(system: string, messages: AiMessage[], maxTokens: number, json: boolean): Promise<AiResult> {
  const key = process.env.GROQ_API_KEY;
  if (!key) return { text: null, source: "none" };
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST", headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
    body: JSON.stringify({ model: process.env.GROQ_MODEL || "llama-3.1-8b-instant", max_tokens: maxTokens, messages: [{ role: "system", content: system }, ...messages], ...(json ? { response_format: { type: "json_object" } } : {}) }),
  });
  if (!res.ok) return { text: null, source: "groq", error: `${res.status}: ${(await res.text().catch(() => "")).slice(0, 140)}` };
  const d = await res.json();
  return { text: d.choices?.[0]?.message?.content?.trim() || null, source: "groq" };
}

export function aiConfigured(): boolean {
  return !!(process.env.ANTHROPIC_API_KEY || process.env.GEMINI_API_KEY || process.env.GROQ_API_KEY);
}

// Runs the first configured provider that returns text. Returns the text and
// which provider produced it, or an error summary if all configured ones failed.
// `json: true` asks providers that support it (Groq, Gemini) to return strictly
// valid JSON — weaker models otherwise emit unparseable near-JSON.
export async function generateText(system: string, messages: AiMessage[], maxTokens = 600, opts?: { json?: boolean }): Promise<AiResult> {
  const json = opts?.json ?? false;
  const errors: string[] = [];
  for (const call of [anthropic, gemini, groq]) {
    const r = await call(system, messages, maxTokens, json).catch(e => ({ text: null, source: "error", error: String(e).slice(0, 140) } as AiResult));
    if (r.text) return r;
    if (r.error) errors.push(`${r.source} ${r.error}`);
  }
  return { text: null, source: "none", error: errors.join(" | ") || undefined };
}
