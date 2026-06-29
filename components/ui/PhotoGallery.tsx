"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight, Expand } from "lucide-react";

// Hero image + (optional) thumbnail strip that opens a fullscreen, swipeable
// lightbox. Works with one image (click-to-zoom) or many (gallery).
export default function PhotoGallery({ images, alt, badge, aspect = "aspect-[16/8]" }: { images: string[]; alt: string; badge?: string | null; aspect?: string }) {
  const pics = images.filter(Boolean);
  const [open, setOpen] = useState(false);
  const [i, setI] = useState(0);
  const has = pics.length > 0;

  const go = (d: number) => setI(p => (p + d + pics.length) % pics.length);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, pics.length]);

  if (!has) return null;

  let touchX = 0;

  return (
    <>
      <div className={`relative rounded-2xl overflow-hidden ${aspect} mb-3 cursor-zoom-in group`} onClick={() => { setI(0); setOpen(true); }}>
        <Image src={pics[0]} alt={alt} fill sizes="100vw" className="object-cover ken-burns" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-vc-950/40 to-transparent" />
        {badge && (
          <span className="absolute top-4 left-4 text-[10px] font-medium tracking-[0.15em] uppercase text-gold border border-gold/50 bg-vc-950/70 backdrop-blur-sm px-3 py-1 rounded-sm">{badge}</span>
        )}
        <span className="absolute bottom-4 right-4 inline-flex items-center gap-1.5 text-[11px] tracking-[0.12em] uppercase text-white bg-vc-950/60 backdrop-blur-sm px-3 py-1.5 rounded-sm opacity-90 group-hover:opacity-100">
          <Expand size={13} /> {pics.length > 1 ? `${pics.length} photos` : "View"}
        </span>
      </div>

      {pics.length > 1 && (
        <div className="flex gap-2 overflow-x-auto scrollbar-none mb-8">
          {pics.map((src, idx) => (
            <button key={idx} onClick={() => { setI(idx); setOpen(true); }} className="relative w-20 h-16 shrink-0 rounded-md overflow-hidden border border-line hover:border-gold transition-colors">
              <Image src={src} alt="" fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-[80] bg-vc-950/95 flex items-center justify-center print:hidden"
          onClick={() => setOpen(false)}
          onTouchStart={e => { touchX = e.touches[0].clientX; }}
          onTouchEnd={e => { const dx = e.changedTouches[0].clientX - touchX; if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1); }}
        >
          <button onClick={() => setOpen(false)} className="absolute top-5 right-5 text-white/80 hover:text-white" aria-label="Close"><X size={26} /></button>
          {pics.length > 1 && (
            <>
              <button onClick={e => { e.stopPropagation(); go(-1); }} className="absolute left-3 sm:left-6 text-white/70 hover:text-white p-2" aria-label="Previous"><ChevronLeft size={32} /></button>
              <button onClick={e => { e.stopPropagation(); go(1); }} className="absolute right-3 sm:right-6 text-white/70 hover:text-white p-2" aria-label="Next"><ChevronRight size={32} /></button>
            </>
          )}
          <div className="relative w-[92vw] h-[82vh]" onClick={e => e.stopPropagation()}>
            <Image src={pics[i]} alt={`${alt} ${i + 1}`} fill sizes="92vw" className="object-contain" />
          </div>
          {pics.length > 1 && <span className="absolute bottom-5 left-1/2 -translate-x-1/2 text-xs tracking-[0.2em] text-white/70">{i + 1} / {pics.length}</span>}
        </div>
      )}
    </>
  );
}
