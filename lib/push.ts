import webpush from "web-push";
import { prisma } from "@/lib/prisma";

let configured = false;
function configure() {
  if (configured) return true;
  const pub = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim();
  const priv = process.env.VAPID_PRIVATE_KEY?.trim();
  const subject = process.env.VAPID_SUBJECT?.trim() || "mailto:hello@voyagesco.com";
  if (!pub || !priv) return false;
  webpush.setVapidDetails(subject, pub, priv);
  configured = true;
  return true;
}

type Sub = { id: string; endpoint: string; p256dh: string; auth: string };
type Payload = { title: string; body: string; url?: string; count?: number };

async function deliver(subs: Sub[], payload: Payload) {
  const data = JSON.stringify(payload);
  let sent = 0;
  await Promise.all(subs.map(async s => {
    try {
      await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, data);
      sent++;
    } catch (err: unknown) {
      const code = (err as { statusCode?: number })?.statusCode;
      if (code === 404 || code === 410) await prisma.pushSubscription.delete({ where: { id: s.id } }).catch(() => {});
    }
  }));
  return sent;
}

// Sends a push to every stored subscription; prunes expired/invalid ones.
export async function sendPushToAll(payload: Payload) {
  if (!configure()) return { sent: 0, configured: false };
  const subs = await prisma.pushSubscription.findMany();
  const sent = await deliver(subs, payload);
  return { sent, configured: true, total: subs.length };
}

// Sends a push to one member's devices (e.g. a booking status change). Fails
// silently — a missing subscription or missing VAPID config is never an error.
export async function sendPushToCustomer(customerId: string, payload: Payload) {
  if (!customerId) return { sent: 0, configured: false };
  // Always record it in the member's in-app inbox, even if push isn't configured.
  await prisma.memberNotification.create({
    data: { customerId, title: payload.title, body: payload.body, url: payload.url ?? null },
  }).catch(() => {});
  if (!configure()) return { sent: 0, configured: false };
  // Include the unread count so the device can show an app-icon badge.
  const count = await prisma.memberNotification.count({ where: { customerId, read: false } }).catch(() => undefined);
  const subs = await prisma.pushSubscription.findMany({ where: { customerId } });
  const sent = await deliver(subs, { ...payload, count });
  return { sent, configured: true };
}
