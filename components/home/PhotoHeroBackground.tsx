import Image from "next/image";

/**
 * Fallback hero background for search tabs whose catalogue is still empty
 * (no published records yet to plot on the live map) — a curated photo
 * instead of a blank world map with nothing on it.
 */
export default function PhotoHeroBackground({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <Image src={src} alt={alt} fill sizes="100vw" priority className="object-cover ken-burns" />
    </div>
  );
}
