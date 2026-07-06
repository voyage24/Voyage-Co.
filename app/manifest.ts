import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Voyages & Co. — Luxury Travel",
    short_name: "Voyages & Co.",
    description: "Bespoke luxury travel — handcrafted journeys, rare stays, private experiences.",
    start_url: "/",
    display: "standalone",
    background_color: "#1c0a0d",
    theme_color: "#1c0a0d",
    icons: [
      { src: "/logo-navy.png", sizes: "any", type: "image/png" },
      { src: "/logo-white.png", sizes: "any", type: "image/png", purpose: "maskable" },
    ],
    // Long-press the home-screen icon (Android / desktop PWA) for these jumps.
    shortcuts: [
      { name: "Search stays", short_name: "Search", url: "/hotels", icons: [{ src: "/logo-navy.png", sizes: "any" }] },
      { name: "My Trips", short_name: "Trips", url: "/account", icons: [{ src: "/logo-navy.png", sizes: "any" }] },
      { name: "Explore", short_name: "Explore", url: "/explore", icons: [{ src: "/logo-navy.png", sizes: "any" }] },
      { name: "Concierge", short_name: "Concierge", url: "/contact", icons: [{ src: "/logo-navy.png", sizes: "any" }] },
    ],
  };
}
