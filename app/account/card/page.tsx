import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import QRCode from "qrcode";
import { getCurrentCustomer } from "@/lib/customer/session";
import Logo from "@/components/ui/Logo";

export const dynamic = "force-dynamic";

const TIER_STYLE: Record<string, { grad: string; label: string }> = {
  member: { grad: "from-vc-950 to-[#2a1418]", label: "Member" },
  silver: { grad: "from-[#3a3f47] to-[#1c2024]", label: "Silver" },
  gold: { grad: "from-[#6b5320] to-[#2a2008]", label: "Gold" },
};

// A wallet-style digital membership card: tier, points and a QR the concierge
// can scan to pull up the member. Saveable to the phone (screenshot / add to
// home) and cached offline once viewed.
export default async function MembershipCardPage() {
  const customer = await getCurrentCustomer();
  if (!customer) redirect("/login");

  const tier = TIER_STYLE[customer.tier] ?? TIER_STYLE.member;
  const qr = await QRCode.toDataURL(`MEMBER:${customer.id}`, { margin: 1, width: 240, color: { dark: "#1c0a0d", light: "#ffffff" } });
  const since = new Date(customer.createdAt).toLocaleDateString("en-GB", { month: "short", year: "numeric" });

  return (
    <div className="max-w-md mx-auto px-4 pt-24 pb-16">
      <Link href="/account" className="inline-flex items-center gap-2 text-xs tracking-[0.1em] uppercase text-ink-muted hover:text-ink transition-colors mb-6">
        <ArrowLeft size={15} /> Back to my account
      </Link>

      <div className={`rounded-3xl overflow-hidden shadow-luxury bg-gradient-to-br ${tier.grad} text-[#f4f0e9]`}>
        <div className="p-6 flex items-start justify-between">
          <Logo size={30} tone="light" />
          <span className="text-[10px] tracking-[0.22em] uppercase border border-white/30 text-white/90 px-3 py-1 rounded-full">{tier.label}</span>
        </div>

        <div className="px-6 pb-2">
          <p className="text-[10px] tracking-[0.3em] uppercase text-gold">Member</p>
          <p className="font-serif text-2xl font-light mt-1">{customer.name || customer.email}</p>
        </div>

        <div className="flex items-end justify-between px-6 pb-6 pt-4">
          <div>
            <p className="text-3xl font-serif font-light leading-none">{(customer.points ?? 0).toLocaleString("en-IN")}</p>
            <p className="text-[10px] tracking-[0.2em] uppercase text-white/50 mt-1">Points · since {since}</p>
          </div>
          <div className="bg-white rounded-xl p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qr} alt="Membership QR" width={96} height={96} className="w-24 h-24" />
          </div>
        </div>
      </div>

      <div className="flex gap-3 mt-5">
        <Link href="/membership" className="flex-1 text-center py-3 border border-line-strong text-ink text-xs tracking-[0.14em] uppercase rounded-sm hover:bg-panel-soft transition-colors">Benefits</Link>
        <Link href="/refer" className="flex-1 text-center py-3 bg-ink text-page text-xs tracking-[0.14em] uppercase rounded-sm hover:bg-ink/90 transition-colors">Refer &amp; earn</Link>
      </div>
      <p className="text-[11px] text-ink-faint text-center mt-4">Show this card to your concierge. Saved on this device.</p>
    </div>
  );
}
