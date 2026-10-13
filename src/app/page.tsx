import HeroSection from "@/components/HeroSection";
import ServicesSection from "@/components/ServicesSection";
import LocationSection from "@/components/LocationSection";
import SeasonalBanner from "@/components/SeasonalBanner";
import { obterPromocaoConfig } from "@/lib/promocoes";

export const dynamic = "force-dynamic";

export default async function Home() {
  const promocao = await obterPromocaoConfig();

  return (
    <>
      <HeroSection />
      <ServicesSection />
      <SeasonalBanner promocao={promocao} />
      <LocationSection />
    </>
  );
}
