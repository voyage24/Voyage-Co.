import { NextResponse } from "next/server";
import { getCurrentCustomer } from "@/lib/customer/session";

export const dynamic = "force-dynamic";

export async function GET() {
  const customer = await getCurrentCustomer();
  if (!customer) return NextResponse.json({ customer: null });
  return NextResponse.json({ customer: { id: customer.id, email: customer.email, name: customer.name } });
}
