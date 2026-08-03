"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

/**
 * Positions a field's dropdown/popover for a portal to <body> (position:
 * fixed), opening upward from the field. The hero search widgets sit low
 * in the hero section, so a dropdown that opens downward as a plain
 * absolutely-positioned child of the (short) form card routinely ran past
 * both the card's own bottom edge and the viewport, floating disconnected
 * over whatever sat behind it — there's reliably more clearance above the
 * field (into the map/photo) than below it (the page/viewport edge).
 *
 * Returns the inline style for the portaled element (fixed position, right-
 * aligned to the field, width as given) and a ref that must be attached to
 * that same portaled element, so callers can recognize clicks inside it as
 * "inside" for their own outside-click handling.
 */
export function useDropUp(fieldRef: RefObject<HTMLElement | null>, open: boolean, width: number) {
  const [style, setStyle] = useState<React.CSSProperties>({});
  const dropRef = useRef<HTMLDivElement>(null);

  const calc = () => {
    if (!fieldRef.current) return;
    const r = fieldRef.current.getBoundingClientRect();
    setStyle({ position: "fixed", zIndex: 9999, bottom: window.innerHeight - r.top + 8, left: "auto", right: window.innerWidth - r.right, width });
  };

  useEffect(() => {
    if (!open) return;
    calc();
    window.addEventListener("scroll", calc, true);
    window.addEventListener("resize", calc);
    return () => {
      window.removeEventListener("scroll", calc, true);
      window.removeEventListener("resize", calc);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return { style, dropRef };
}
