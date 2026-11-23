import HeroSection from "@/components/HeroSection";
import ServicesSection from "@/components/ServicesSection";
import LocationSection from "@/components/LocationSection";
import SeasonalBanner from "@/components/SeasonalBanner";
import HashScrollHandler from "@/components/HashScrollHandler";
import { obterPromocaoConfig } from "@/lib/promocoes";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Início | Ana Cake - Confeitaria Artesanal",
  description:
    "Conheça a Ana Cake: doces finos, bolos para festas e salgados artesanais feitos com amor e ingredientes selecionados.",
};

export default async function InicioPage() {
  const promocao = await obterPromocaoConfig();

  return (
    <>
      <HashScrollHandler />
      <HeroSection />
      <ServicesSection />
      <SeasonalBanner promocao={promocao} />
      <LocationSection />
    </>
  );
}
