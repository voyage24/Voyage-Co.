import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentCustomer } from "@/lib/customer/session";
import { getMembership } from "@/lib/group/access";

export const dynamic = "force-dynamic";

// POST — send a chat message to the group. (Reads come via the group snapshot.)
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const customer = await getCurrentCustomer();
  if (!customer) return NextResponse.json({ error: "Please sign in" }, { status: 401 });
  if (!(await getMembership(params.id, customer.id))) return NextResponse.json({ error: "Not a member" }, { status: 403 });

  const { body } = await req.json().catch(() => ({}));
  if (!body || typeof body !== "string" || !body.trim()) return NextResponse.json({ error: "Empty message" }, { status: 400 });

  await prisma.groupMessage.create({ data: { groupId: params.id, customerId: customer.id, body: body.trim().slice(0, 2000) } });
  return NextResponse.json({ ok: true });
}
