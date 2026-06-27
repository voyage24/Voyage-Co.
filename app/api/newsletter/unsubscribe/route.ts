import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyUnsubscribeToken } from "@/lib/newsletter/unsubscribe";

export const dynamic = "force-dynamic";

function page(title: string, message: string) {
  return new NextResponse(
    `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title></head>
    <body style="margin:0;font-family:Arial,Helvetica,sans-serif;background:#F4F0E9;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:64px 16px;"><tr><td align="center">
        <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="max-width:480px;width:100%;background:#FFFFFF;border:1px solid #E5DFD2;">
          <tr><td style="background:#15212D;padding:28px;text-align:center;">
            <img src="https://voyagesco.com/logo-blue.png" alt="Voyages & Co." style="height:30px;">
          </td></tr>
          <tr><td style="height:3px;background:#705C38;font-size:0;line-height:0;">&nbsp;</td></tr>
          <tr><td style="padding:40px 36px;text-align:center;">
            <h1 style="margin:0 0 14px;font-family:Georgia,serif;font-weight:400;font-size:24px;color:#211D18;">${title}</h1>
            <p style="margin:0 0 24px;font-size:15px;line-height:1.7;color:#48402F;">${message}</p>
            <a href="https://voyagesco.com" style="font-size:12px;letter-spacing:1.5px;text-transform:uppercase;color:#705C38;text-decoration:none;border-bottom:2px solid #705C38;padding-bottom:2px;">Return to voyagesco.com</a>
          </td></tr>
        </table>
      </td></tr></table>
    </body></html>`,
    { status: 200, headers: { "Content-Type": "text/html" } }
  );
}

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email") ?? "";
  const token = req.nextUrl.searchParams.get("token") ?? "";

  if (!email || !token || !verifyUnsubscribeToken(email, token)) {
    return page("Invalid link", "This unsubscribe link is invalid or has expired. If you continue to receive emails, please contact our concierge.");
  }

  await prisma.newsletterSubscriber.deleteMany({ where: { email } });
  return page("You've been unsubscribed", "You will no longer receive our weekly dispatch. We're sorry to see you go — you're always welcome back at voyagesco.com.");
}
