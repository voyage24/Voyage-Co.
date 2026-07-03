"use client";

import Link from "next/link";
import { useSetting } from "@/components/providers/SettingsProvider";

/**
 * Voyages & Co. wordmark. By default a text wordmark set in Fahkwang; if an
 * appearance-panel logo image is uploaded, that image is shown instead.
 */
export default function Logo({
  className = "",
  size = 24,
  href = "/",
  tone = "dark",
  shimmer = false,
}: {
  className?: string;
  size?: number;
  href?: string | null;
  tone?: "dark" | "light";
  shimmer?: boolean;
}) {
  const customLogo = useSetting(tone === "light" ? "logo.light" : "logo.dark");
  const color = tone === "light" ? "text-[#f4f0e9]" : "text-ink";

  const mark = customLogo ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={customLogo} alt="Voyages & Co." style={{ height: size * 1.15 }} className="inline-block w-auto" />
  ) : (
    <span
      className={`font-logo ${shimmer ? "font-semibold" : "font-normal"} leading-none tracking-[0.04em] ${shimmer ? "shimmer-white" : color} transition-colors duration-300`}
      style={{ fontSize: size }}
    >
      Voyages <span className="italic font-light">&amp;</span> Co.
    </span>
  );

  if (href === null) return <span className={className}>{mark}</span>;

  return (
    <Link href={href} className={`inline-block transition-transform duration-200 hover:scale-110 active:scale-95 ${className}`} aria-label="Voyages & Co. — Home">
      {mark}
    </Link>
  );
}
