import HeroSection from "@/components/home/HeroSection";
import PopularDestinations from "@/components/home/PopularDestinations";
import SignatureExperiences from "@/components/home/SignatureExperiences";
import ReservationSection from "@/components/home/ReservationSection";
import PackagesPreview from "@/components/home/PackagesPreview";
import TrustSection from "@/components/home/TrustSection";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [hotels, cruises, trains, packages, experiences] = await Promise.all([
    prisma.hotel.findMany({ where: { published: true } }),
    prisma.cruise.findMany({ where: { published: true } }),
    prisma.train.findMany({ where: { published: true } }),
    prisma.package.findMany({ where: { published: true } }),
    prisma.experience.findMany({ where: { published: true } }),
  ]);

  const hotelCities = Array.from(new Set(hotels.map(h => h.city))).sort();

  return (
    <>
      <HeroSection hotels={hotels} cruises={cruises} trains={trains as any} packages={packages} experiences={experiences} />
      <PopularDestinations />
      <SignatureExperiences />
      <ReservationSection hotelCities={hotelCities} />
      <PackagesPreview packages={packages} />
      <TrustSection />
    </>
  );
}
