import HeroSection from "@/components/home/HeroSection";
import PopularDestinations from "@/components/home/PopularDestinations";
import SignatureExperiences from "@/components/home/SignatureExperiences";
import PackagesPreview from "@/components/home/PackagesPreview";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import TrustSection from "@/components/home/TrustSection";
import RecentlyViewed from "@/components/home/RecentlyViewed";
import PressStrip from "@/components/home/PressStrip";
import MomentsGallery from "@/components/home/MomentsGallery";
import StatsBand from "@/components/home/StatsBand";
import Reveal from "@/components/ui/Reveal";
import { prisma } from "@/lib/prisma";
import JsonLd from "@/components/seo/JsonLd";
import { organizationJsonLd, websiteJsonLd } from "@/lib/seo";

export const revalidate = 60;

export default async function Home() {
  const [hotels, cruises, trains, packages, experiences, testimonials] = await Promise.all([
    prisma.hotel.findMany({ where: { published: true } }),
    prisma.cruise.findMany({ where: { published: true } }),
    prisma.train.findMany({ where: { published: true } }),
    prisma.package.findMany({ where: { published: true }, orderBy: [{ featured: "desc" }, { createdAt: "asc" }] }),
    prisma.experience.findMany({ where: { published: true } }),
    prisma.testimonial.findMany({ where: { published: true }, orderBy: { sortOrder: "asc" } }),
  ]);

  return (
    <>
      <JsonLd data={[organizationJsonLd(), websiteJsonLd()]} />
      <HeroSection hotels={hotels} cruises={cruises} trains={trains as any} packages={packages} experiences={experiences} />
      <RecentlyViewed />
      <Reveal><PopularDestinations /></Reveal>
      <Reveal variant="left"><SignatureExperiences /></Reveal>
      <StatsBand />
      <Reveal variant="right"><PackagesPreview packages={packages} /></Reveal>
      <PressStrip />
      <Reveal variant="zoom"><TestimonialsSection testimonials={testimonials} /></Reveal>
      <Reveal><MomentsGallery /></Reveal>
      <Reveal><TrustSection /></Reveal>
    </>
  );
}
