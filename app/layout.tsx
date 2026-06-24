import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { TripsProvider } from "@/components/providers/TripsProvider";
import { CurrencyProvider } from "@/components/providers/CurrencyProvider";
import { LanguageProvider } from "@/components/providers/LanguageProvider";

export const metadata: Metadata = {
  title: "Voyages & Co. — A Sense of Place",
  description: "Voyages & Co. is a private travel atelier crafting extraordinary journeys — singular stays, wellness retreats and cultural immersions in the world's most remarkable places.",
  keywords: "luxury travel, bespoke journeys, private villas, wellness retreats, luxury hotels, voyages and co",
  openGraph: {
    title: "Voyages & Co. — A Sense of Place",
    description: "A private travel atelier crafting extraordinary journeys for the discerning.",
    siteName: "Voyages & Co.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-page text-ink">
        <a href="#main" className="skip-link">Skip to content</a>
        <LanguageProvider>
          <CurrencyProvider>
            <TripsProvider>
              <Navbar />
              <main id="main">{children}</main>
              <Footer />
            </TripsProvider>
          </CurrencyProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
