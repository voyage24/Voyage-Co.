import HeroSection from "@/components/home/HeroSection";
import PopularDestinations from "@/components/home/PopularDestinations";
import SignatureExperiences from "@/components/home/SignatureExperiences";
import ReservationSection from "@/components/home/ReservationSection";
import PackagesPreview from "@/components/home/PackagesPreview";
import TrustSection from "@/components/home/TrustSection";

export default function Home() {
  return (
    <>
      <HeroSection />
      <PopularDestinations />
      <SignatureExperiences />
      <ReservationSection />
      <PackagesPreview />
      <TrustSection />
    </>
  );
}
