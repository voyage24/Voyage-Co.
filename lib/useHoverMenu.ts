"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// Opens a nav menu on hover for mouse users, while leaving tap/click as the way
// in on touch — where hover doesn't exist at all, so a hover-only menu would be
// unreachable.
//
// The two delays matter: `openDelay` stops a cursor merely crossing the trigger
// on its way elsewhere from flinging a panel open, and `closeDelay` gives you
// time to travel the gap from the trigger down to the panel without it closing
// underneath you. Share `hoverProps` between the trigger and the panel so the
// pair behaves as one hover target — even when the panel is portaled elsewhere
// in the DOM.
export function useHoverMenu({ openDelay = 120, closeDelay = 220 } = {}) {
  const [open, setOpen] = useState(false);
  // Whether this opening came from hover — a panel that merely drifted open
  // under the cursor shouldn't steal focus into its search box.
  const [viaHover, setViaHover] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const canHover = useRef(false);

  useEffect(() => {
    canHover.current = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  }, []);

  const clear = () => { if (timer.current) clearTimeout(timer.current); timer.current = null; };
  useEffect(() => () => clear(), []);

  const onPointerEnter = useCallback(() => {
    if (!canHover.current) return;
    clear();
    timer.current = setTimeout(() => { setViaHover(true); setOpen(true); }, openDelay);
  }, [openDelay]);

  const onPointerLeave = useCallback(() => {
    if (!canHover.current) return;
    clear();
    timer.current = setTimeout(() => setOpen(false), closeDelay);
  }, [closeDelay]);

  const toggle = useCallback(() => { clear(); setViaHover(false); setOpen(v => !v); }, []);
  const close = useCallback(() => { clear(); setOpen(false); }, []);

  // Escape closes, so a keyboard user is never trapped in an open panel.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  return { open, setOpen, viaHover, toggle, close, hoverProps: { onPointerEnter, onPointerLeave } };
}
