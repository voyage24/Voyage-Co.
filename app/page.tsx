import HeroSection from "@/components/home/HeroSection";
import PopularDestinations from "@/components/home/PopularDestinations";
import SignatureExperiences from "@/components/home/SignatureExperiences";
import PackagesPreview from "@/components/home/PackagesPreview";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import TrustSection from "@/components/home/TrustSection";
import RecentlyViewed from "@/components/home/RecentlyViewed";
import Recommendations from "@/components/home/Recommendations";
import PressStrip from "@/components/home/PressStrip";
import MomentsGallery from "@/components/home/MomentsGallery";
import StatsBand from "@/components/home/StatsBand";
import HomeFaq from "@/components/home/HomeFaq";
import Reveal from "@/components/ui/Reveal";
import { prisma } from "@/lib/prisma";
import { getCollection } from "@/lib/collections";
import JsonLd from "@/components/seo/JsonLd";
import { organizationJsonLd, websiteJsonLd } from "@/lib/seo";

export const revalidate = 60;

async function getHomeData() {
  try {
    return await Promise.all([
    prisma.hotel.findMany({ where: { published: true } }),
    prisma.cruise.findMany({ where: { published: true } }),
    prisma.train.findMany({ where: { published: true } }),
    prisma.package.findMany({ where: { published: true }, orderBy: [{ featured: "desc" }, { createdAt: "asc" }] }),
    prisma.experience.findMany({ where: { published: true } }),
    prisma.testimonial.findMany({ where: { published: true }, orderBy: { sortOrder: "asc" } }),
    ]);
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("Homepage catalog data unavailable; rendering with empty local data.", error);
    }
    return [[], [], [], [], [], []];
  }
}

export default async function Home() {
  const [hotels, cruises, trains, packages, experiences, testimonials] = await getHomeData();
  const homeFaq = await getCollection("homeFaq");

  // Real figures for the stats band.
  const visitStat = await prisma.siteStat.findUnique({ where: { key: "visits" } }).catch(() => null);
  const countries = new Set<string>();
  hotels.forEach(h => h.country && countries.add(h.country));
  experiences.forEach(e => e.country && countries.add(e.country));
  const stats = [
    { value: countries.size, suffix: "+", label: "Destinations" },
    { value: hotels.length, suffix: "+", label: "Luxury stays" },
    { value: experiences.length, suffix: "+", label: "Experiences" },
    { value: visitStat?.count ?? 0, suffix: "", label: "Site visits" },
  ];

  return (
    <>
      <JsonLd data={[organizationJsonLd(), websiteJsonLd()]} />
      <HeroSection hotels={hotels} cruises={cruises} trains={trains as any} packages={packages} experiences={experiences} />
      <RecentlyViewed />
      <Recommendations />
      <Reveal><PopularDestinations /></Reveal>
      <Reveal variant="left"><SignatureExperiences /></Reveal>
      <StatsBand stats={stats} />
      <Reveal variant="right"><PackagesPreview packages={packages} /></Reveal>
      <PressStrip />
      <Reveal variant="zoom"><TestimonialsSection testimonials={testimonials} /></Reveal>
      <Reveal><MomentsGallery /></Reveal>
      <Reveal><TrustSection /></Reveal>
      <Reveal><HomeFaq items={homeFaq} /></Reveal>
    </>
  );
}
