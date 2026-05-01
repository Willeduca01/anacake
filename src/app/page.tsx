import HeroSection from "@/components/HeroSection";
import ServicesSection from "@/components/ServicesSection";
import LocationSection from "@/components/LocationSection";
import SeasonalBanner from "@/components/SeasonalBanner";

export default function Home() {
  return (
    <>
      <HeroSection />
      <ServicesSection />
      <SeasonalBanner />
      <LocationSection />
    </>
  );
}
