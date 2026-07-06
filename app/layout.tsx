import type { Metadata, Viewport } from "next";
import "./globals.css";
import SiteChrome from "@/components/layout/SiteChrome";
import { TripsProvider } from "@/components/providers/TripsProvider";
import { CurrencyProvider } from "@/components/providers/CurrencyProvider";
import { LanguageProvider } from "@/components/providers/LanguageProvider";
import { SettingsProvider } from "@/components/providers/SettingsProvider";
import { ContentProvider } from "@/components/providers/ContentProvider";
import { getSiteSettings, buildThemeHead } from "@/lib/site-settings";
import { getPageContentMap } from "@/lib/page-content";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import CookieConsent from "@/components/layout/CookieConsent";
import Haptics from "@/components/ui/Haptics";
import PullToRefresh from "@/components/ui/PullToRefresh";
import ServiceWorkerRegister from "@/components/layout/ServiceWorkerRegister";
import InstallPrompt from "@/components/ui/InstallPrompt";
import DevBanner from "@/components/layout/DevBanner";

export const metadata: Metadata = {
  metadataBase: new URL("https://voyagesco.com"),
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
  // Favicon + apple-touch icon come from app/icon.png and app/apple-icon.png
  // (Next's file conventions) — no metadata.icons override, which would
  // otherwise replace them.
};

export const viewport: Viewport = {
  themeColor: "#15212D",
  width: "device-width",
  initialScale: 1,
  // Prevent iOS Safari from auto-zooming the page when a form field is focused
  // — that zoom shifts the whole layout (incl. fixed nav) left and never resets,
  // which broke the search pickers. Interactive maps use Leaflet's own pinch
  // gestures, so they still zoom independently of the page.
  maximumScale: 1,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings();
  const content = await getPageContentMap();
  const { css, fontHref } = buildThemeHead(settings);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    name: "Voyages & Co.",
    url: "https://voyagesco.com",
    description: "A private travel atelier crafting extraordinary bespoke journeys worldwide.",
    telephone: settings["contact.phone"],
    email: settings["contact.email"],
    sameAs: [settings["social.instagram"], settings["social.pinterest"], settings["social.linkedin"]].filter(Boolean),
  };

  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');var s=window.matchMedia('(prefers-color-scheme: dark)').matches;if(t==='dark'||((!t||t==='system')&&s)){document.documentElement.classList.add('dark');}}catch(e){}})();`,
          }}
        />
        <link rel="stylesheet" href={fontHref} />
        <style dangerouslySetInnerHTML={{ __html: css }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body className="bg-page text-ink">
        <a href="#main" className="skip-link">Skip to content</a>
        <SettingsProvider settings={settings}>
          <ContentProvider content={content}>
          <LanguageProvider>
            <CurrencyProvider>
              <TripsProvider>
                <SiteChrome>{children}</SiteChrome>
              <CookieConsent />
              </TripsProvider>
            </CurrencyProvider>
          </LanguageProvider>
          </ContentProvider>
        </SettingsProvider>
        <Haptics />
        <PullToRefresh />
        <ServiceWorkerRegister />
        <InstallPrompt />
        <DevBanner />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
