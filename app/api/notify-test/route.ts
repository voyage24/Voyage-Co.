import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// TEMPORARY diagnostic: reports which alert channels are configured and what
// Telegram replies, without exposing any secret values. Remove after setup.
export async function GET() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  const out: Record<string, unknown> = {
    telegram: { hasToken: !!token, hasChatId: !!chatId },
    whatsapp: { hasPhone: !!process.env.WHATSAPP_ALERT_PHONE, hasApiKey: !!process.env.CALLMEBOT_APIKEY },
  };

  if (token && chatId) {
    try {
      const r = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, text: "✅ Voyages & Co. — Telegram alerts are working." }),
      });
      const data = await r.json();
      out.telegramResult = { ok: data.ok, description: data.description ?? "sent" };
    } catch (e) {
      out.telegramResult = { ok: false, error: String(e) };
    }
  }
  return NextResponse.json(out);
}
