import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { notifyAdminEnquiry } from "@/lib/email/notify-admin";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Captures a completed "Find your journey" quiz as a lead (type "quiz").
export async function POST(req: Request) {
  const { name, email, result, answers } = await req.json().catch(() => ({}));
  if (!name || typeof name !== "string") return NextResponse.json({ error: "Please enter your name" }, { status: 400 });
  if (!email || !EMAIL_RE.test(email)) return NextResponse.json({ error: "Please enter a valid email" }, { status: 400 });

  const summary = answers && typeof answers === "object"
    ? Object.entries(answers).map(([k, v]) => `${k}: ${v}`).join("\n")
    : "";
  const message = `Travel style: ${result || "—"}\n\n${summary}`;

  try {
    await prisma.enquiry.create({
      data: { type: "quiz", name, email, subject: `Journey match: ${result || "quiz"}`, message },
    });
  } catch (err) {
    console.error("Quiz lead failed:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
  await notifyAdminEnquiry({ type: "quiz", name, email, subject: `Journey match: ${result || "quiz"}`, message });
  return NextResponse.json({ ok: true });
}
