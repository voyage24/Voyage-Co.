"use client";

import { useEffect } from "react";
import { recordView, type ViewedItem } from "@/lib/recently-viewed";

// Drop-in on a product detail page; records the view for the homepage rail.
export default function RecordView(item: ViewedItem) {
  useEffect(() => { recordView(item); }, [item]);
  return null;
}
