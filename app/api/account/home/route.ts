import { NextResponse } from "next/server";
import { getCurrentCustomer } from "@/lib/customer/session";
import { getPersonalizedHome } from "@/lib/customer/personalized-home";

export const dynamic = "force-dynamic";

// Personalised home strip data for the signed-in member (loaded client-side so
// the public home page stays static/cacheable for everyone else).
export async function GET() {
  const customer = await getCurrentCustomer();
  if (!customer) return NextResponse.json({ loggedIn: false });
  const data = await getPersonalizedHome(customer.id).catch(() => null);
  if (!data) return NextResponse.json({ loggedIn: false });
  return NextResponse.json({ loggedIn: true, data });
}
