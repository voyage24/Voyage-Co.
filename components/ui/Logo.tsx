import Link from "next/link";

/**
 * Voyages & Co. wordmark — set in Fahkwang, the one place on the site that
 * deviates from the global Inter typeface.
 */
export default function Logo({
  className = "",
  size = 24,
  href = "/",
  tone = "dark",
}: {
  className?: string;
  size?: number;
  href?: string | null;
  tone?: "dark" | "light";
}) {
  const color = tone === "light" ? "text-[#f4f0e9]" : "text-ink";

  const mark = (
    <span
      className={`font-logo font-normal leading-none tracking-[0.04em] ${color} transition-colors duration-300`}
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
