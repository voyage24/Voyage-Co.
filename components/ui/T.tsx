"use client";

import { useLanguage } from "@/components/providers/LanguageProvider";

// Lets server components (e.g. catalog detail pages using generateStaticParams)
// render a translated string without themselves becoming client components.
export default function T({ k }: { k: string }) {
  const { t } = useLanguage();
  return <>{t(k)}</>;
}
