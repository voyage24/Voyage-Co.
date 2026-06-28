import type { Metadata, Viewport } from "next";
import "./globals.css";
import SiteChrome from "@/components/layout/SiteChrome";
import { TripsProvider } from "@/components/providers/TripsProvider";
import { CurrencyProvider } from "@/components/providers/CurrencyProvider";
import { LanguageProvider } from "@/components/providers/LanguageProvider";
import { SettingsProvider } from "@/components/providers/SettingsProvider";
import { getSiteSettings, buildThemeHead } from "@/lib/site-settings";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import CookieConsent from "@/components/layout/CookieConsent";

export const metadata: Metadata = {
  title: "Voyages & Co. — A Sense of Place",
  description: "Voyages & Co. is a private travel atelier crafting extraordinary journeys — singular stays, wellness retreats and cultural immersions in the world's most remarkable places.",
  keywords: "luxury travel, bespoke journeys, private villas, wellness retreats, luxury hotels, voyages and co",
  openGraph: {
    title: "Voyages & Co. — A Sense of Place",
    description: "A private travel atelier crafting extraordinary journeys for the discerning.",
    siteName: "Voyages & Co.",
  },
  appleWebApp: {
    capable: true,
    title: "Voyages & Co.",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  themeColor: "#15212D",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings();
  const { css, fontHref } = buildThemeHead(settings);

  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href={fontHref} />
        <style dangerouslySetInnerHTML={{ __html: css }} />
      </head>
      <body className="bg-page text-ink">
        <a href="#main" className="skip-link">Skip to content</a>
        <SettingsProvider settings={settings}>
          <LanguageProvider>
            <CurrencyProvider>
              <TripsProvider>
                <SiteChrome>{children}</SiteChrome>
              <CookieConsent />
              </TripsProvider>
            </CurrencyProvider>
          </LanguageProvider>
        </SettingsProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
