"use client";

import { usePathname } from "next/navigation";

// Replays a subtle fade/rise-in on every route change by re-keying the wrapper
// on the pathname. Enter-only (pure CSS) — no exit animation, which keeps it
// lightweight and avoids any framer-motion dependency.
export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div key={pathname} className="page-transition">
      {children}
    </div>
  );
}
