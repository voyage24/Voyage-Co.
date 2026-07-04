"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import WhatsAppFAB from "@/components/ui/WhatsAppFAB";
import ScrollButtons from "@/components/ui/ScrollButtons";
import ConciergeChat from "@/components/concierge/ConciergeChat";
import CompareBar from "@/components/compare/CompareBar";
import MobileTabBar from "@/components/layout/MobileTabBar";
import VisitTracker from "@/components/ui/VisitTracker";

// The admin console is a separate application surface and must not show the
// public site's nav/footer/WhatsApp button — but it still lives under the
// one unavoidable root layout, so we hide them here based on path instead
// of restructuring the whole app into multiple root layouts.
export default function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");
  const isHome = pathname === "/";

  if (isAdmin) return <>{children}</>;

  return (
    <>
      <div className="print:hidden"><Navbar /></div>
      {/* The navbar is a fixed solid band. Content pages set their own top
          padding; the homepage hero used to sit *under* a transparent navbar,
          so it now needs the same offset to start below the band. */}
      <main id="main" className={isHome ? "pt-20" : undefined}>{children}</main>
      <div className="print:hidden pb-14 sm:pb-0"><Footer /></div>
      <div className="print:hidden">
        <WhatsAppFAB />
        <ScrollButtons />
        <ConciergeChat />
        <CompareBar />
        <MobileTabBar />
      </div>
      <VisitTracker />
    </>
  );
}
