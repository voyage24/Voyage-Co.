import { NextRequest, NextResponse } from "next/server";
import { getCollection, COLLECTION_BY_TYPE } from "@/lib/collections";

// Public, published-only read of a collection — used by client sections (team,
// partner logos) that live on client-rendered pages.
export async function GET(_req: NextRequest, { params }: { params: { type: string } }) {
  if (!COLLECTION_BY_TYPE.has(params.type)) return NextResponse.json({ items: [] });
  const items = await getCollection(params.type);
  return NextResponse.json({ items });
}
