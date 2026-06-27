"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import WhatsAppFAB from "@/components/ui/WhatsAppFAB";
import ScrollButtons from "@/components/ui/ScrollButtons";

// The admin console is a separate application surface and must not show the
// public site's nav/footer/WhatsApp button — but it still lives under the
// one unavoidable root layout, so we hide them here based on path instead
// of restructuring the whole app into multiple root layouts.
export default function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  if (isAdmin) return <>{children}</>;

  return (
    <>
      <Navbar />
      <main id="main">{children}</main>
      <Footer />
      <WhatsAppFAB />
      <ScrollButtons />
    </>
  );
}
