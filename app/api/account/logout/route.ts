import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { destroyCustomerSession, CUSTOMER_COOKIE_NAME } from "@/lib/customer/session";

export async function POST() {
  const token = cookies().get(CUSTOMER_COOKIE_NAME)?.value;
  await destroyCustomerSession(token);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(CUSTOMER_COOKIE_NAME, "", { path: "/", maxAge: 0 });
  return res;
}
