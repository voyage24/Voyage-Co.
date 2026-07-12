import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentCustomer } from "@/lib/customer/session";
import { decryptBuffer } from "@/lib/crypto";

export const dynamic = "force-dynamic";

// Serves a vault document to its owner only. When the stored Blob is encrypted,
// it's fetched and decrypted here (the raw Blob URL is just ciphertext, never
// usable on its own).
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const customer = await getCurrentCustomer();
  if (!customer) return new Response("Unauthorized", { status: 401 });
  const doc = await prisma.memberDocument.findFirst({ where: { id: params.id, customerId: customer.id } });
  if (!doc) return new Response("Not found", { status: 404 });

  // Legacy / unencrypted: just redirect to the Blob URL.
  if (!doc.encrypted) return NextResponse.redirect(doc.url);

  const res = await fetch(doc.url, { cache: "no-store" });
  if (!res.ok) return new Response("File unavailable", { status: 502 });
  const cipher = Buffer.from(await res.arrayBuffer());
  const plain = decryptBuffer(cipher);
  if (!plain) return new Response("Could not decrypt", { status: 500 });

  return new Response(new Uint8Array(plain), {
    headers: {
      "Content-Type": doc.mime || "application/octet-stream",
      "Content-Disposition": `inline; filename="${doc.label.replace(/[^\w.\- ]/g, "_")}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
