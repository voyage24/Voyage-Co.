import type { Metadata } from "next";
import AdminManifestLink from "@/components/admin/AdminManifestLink";

// Gives every /admin/* route (login included, so "Add to Home Screen" works
// even signed out) its own installable identity — separate from the main
// site's manifest and from Voyages Mail's (app/admin/mail/layout.tsx, which
// intends to do the same for its own subtree). The manifest content itself
// is served from app/admin/manifest.ts; AdminManifestLink points the page's
// <link rel="manifest"> at it client-side (see that component for why).
export const metadata: Metadata = {
  title: "Voyages Admin",
  appleWebApp: { capable: true, title: "Voyages Admin", statusBarStyle: "black-translucent" },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AdminManifestLink />
      {children}
    </>
  );
}
