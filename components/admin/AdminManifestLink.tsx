"use client";

import { useEffect } from "react";

// Next's metadata.manifest field doesn't actually override the root
// app/manifest.ts's <link rel="manifest"> tag in this app's Next version —
// the root one always wins server-side, and a nested manifest.ts convention
// file isn't routed at all for non-root segments. Swapping the href
// client-side is the reliable fix: browsers read whatever the tag points to
// at the moment "Add to Home Screen" is actually invoked (well after this
// effect has run), not just what was server-rendered. The manifest itself
// is the static public/admin.webmanifest (public, unauthenticated, and
// outside the /admin/* path the auth middleware guards).
export default function AdminManifestLink() {
  useEffect(() => {
    let link = document.querySelector<HTMLLinkElement>('link[rel="manifest"]');
    if (!link) {
      link = document.createElement("link");
      link.rel = "manifest";
      document.head.appendChild(link);
    }
    const previousHref = link.href;
    link.setAttribute("href", "/admin.webmanifest");
    return () => { link?.setAttribute("href", previousHref); };
  }, []);

  return null;
}
