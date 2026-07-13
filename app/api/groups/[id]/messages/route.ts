import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentCustomer } from "@/lib/customer/session";
import { getMembership, displayName } from "@/lib/group/access";
import { notifyGroup } from "@/lib/group/notify";

export const dynamic = "force-dynamic";

// POST — send a chat message to the group. (Reads come via the group snapshot.)
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const customer = await getCurrentCustomer();
  if (!customer) return NextResponse.json({ error: "Please sign in" }, { status: 401 });
  if (!(await getMembership(params.id, customer.id))) return NextResponse.json({ error: "Not a member" }, { status: 403 });

  const { body } = await req.json().catch(() => ({}));
  if (!body || typeof body !== "string" || !body.trim()) return NextResponse.json({ error: "Empty message" }, { status: 400 });

  const text = body.trim().slice(0, 2000);
  await prisma.groupMessage.create({ data: { groupId: params.id, customerId: customer.id, body: text } });
  const who = displayName(customer.name, customer.email);
  await notifyGroup(params.id, customer.id, "💬 New group message", `${who}: ${text.slice(0, 90)}`).catch(() => {});
  return NextResponse.json({ ok: true });
}
