import type { Metadata } from "next";

// Gives every /admin/* route (login included, so "Add to Home Screen" works
// even signed out) its own installable identity — separate from the main
// site's manifest and from Voyages Mail's (app/admin/mail/layout.tsx, which
// does the same for its own subtree). This only takes effect because the
// root layout declares its own manifest as a plain metadata field too (see
// app/layout.tsx) rather than via Next's manifest.ts file convention, which
// can't be overridden by a nested layout's metadata.manifest field.
export const metadata: Metadata = {
  title: "Voyages Admin",
  manifest: "/admin.webmanifest",
  appleWebApp: { capable: true, title: "Voyages Admin", statusBarStyle: "black-translucent" },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
