"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { Produto } from "@/constants/products";
import ProductCard from "@/components/ProductCard";
import EasterEggsHeader from "./EasterEggsHeader";
import EasterBunnyIllustration from "./EasterBunnyIllustration";
import EasterBunny from "./EasterBunny";
import EasterParticles from "./EasterParticles";
import { getFontClass, getTamanhoClass } from "@/lib/fonts-comemorativa";

interface EasterThemeProps {
  nomeAba: string;
  badgeTexto?: string;
  subtitulo?: string;
  fonteTitulo?: string;
  tamanhoTitulo?: string;
  produtos: Produto[];
  onAbrirDetalhes?: (produto: Produto) => void;
  onVoltar?: () => void;
}

const BUNNY_SESSION_KEY = "anacake_pascoa_bunny_seen_v1";

export default function EasterTheme({
  nomeAba,
  badgeTexto,
  subtitulo,
  fonteTitulo,
  tamanhoTitulo,
  produtos,
  onAbrirDetalhes,
  onVoltar,
}: EasterThemeProps) {
  const shouldReduceMotion = useReducedMotion();
  const [showBunny, setShowBunny] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const seen = sessionStorage.getItem(BUNNY_SESSION_KEY);
        if (!seen && !shouldReduceMotion) {
          setShowBunny(true);
          sessionStorage.setItem(BUNNY_SESSION_KEY, "true");
        }
      } catch {
        // Fallback
      }
    }
  }, [shouldReduceMotion]);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.08,
        delayChildren: 0.15,
      },
    },
  };

  const cardVariants: Variants = {
    hidden: {
      opacity: 0,
      y: shouldReduceMotion ? 0 : 22,
      scale: shouldReduceMotion ? 1 : 0.94,
    },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: shouldReduceMotion
        ? { duration: 0.3 }
        : {
            type: "spring",
            stiffness: 260,
            damping: 20,
          },
    },
  };

  const textoBadge = badgeTexto?.trim() || "Especial de Páscoa";
  const textoSubtitulo =
    subtitulo?.trim() ||
    "Chocolates artesanais nobres, ovos trufados e delícias de alta confeitaria para celebrar com quem você ama.";
  const classeFonte = getFontClass(fonteTitulo);
  const classeTamanho = getTamanhoClass(tamanhoTitulo);

  return (
    <div className="relative w-full rounded-3xl overflow-hidden px-3 py-6 sm:p-8 bg-gradient-to-b from-[#FFFDF9] via-[#FAF4EE] to-[#F5ECE5] text-[#4A2B20] shadow-xl border border-[#E8D8CF] transition-all duration-700">
      {/* Voo/Salto animado do coelhinho da Páscoa na primeira visita */}
      {showBunny && <EasterBunny onComplete={() => setShowBunny(false)} />}

      {/* Partículas leves de ovinhos, flores e estrelinhas em tons pastel */}
      <EasterParticles />

      {/* Ovos de Páscoa coloridos e decorados no topo (sem pisca-pisca) */}
      <EasterEggsHeader />

      {/* Cabeçalho Festivo da Páscoa */}
      <div className="relative z-20 text-center max-w-2xl mx-auto space-y-2 pb-6 sm:pb-8">
        <div className="inline-flex items-center gap-2 rounded-full bg-[#FFF2E2] border border-[#F2D4B6] px-3.5 py-1 text-xs font-semibold text-[#8C4F27] shadow-xs">
          <span>🌸</span>
          <span className="tracking-wide uppercase text-[11px] font-bold">
            {textoBadge}
          </span>
          <span>🌸</span>
        </div>

        {/* Título com Coelhos da Páscoa elegantes em ambos os lados (desktop e mobile) */}
        <div className="flex items-center justify-center gap-2 sm:gap-4 my-1 sm:my-2">
          <EasterBunnyIllustration
            side="left"
            className="w-8 h-8 sm:w-12 sm:h-12 lg:w-14 lg:h-14 text-[#06D6A0] shrink-0 drop-shadow-xs"
          />

          <h1
            className={`${classeFonte} ${classeTamanho} font-normal text-transparent bg-clip-text bg-gradient-to-r from-[#4A2418] via-[#633324] to-[#8C4A32] drop-shadow-[0_2px_4px_rgba(74,36,24,0.12)] leading-tight text-center px-1`}
          >
            {nomeAba || "Especial de Páscoa"}
          </h1>

          <EasterBunnyIllustration
            side="right"
            className="w-8 h-8 sm:w-12 sm:h-12 lg:w-14 lg:h-14 text-[#06D6A0] shrink-0 drop-shadow-xs"
          />
        </div>

        <p className="text-xs sm:text-sm text-[#6E4E42] max-w-lg mx-auto font-normal leading-relaxed">
          {textoSubtitulo}
        </p>

        {/* Linha divisória em tom caramelo suave com detalhe */}
        <div className="flex items-center justify-center gap-3 pt-2">
          <div className="h-px w-16 sm:w-28 bg-gradient-to-r from-transparent via-[#D4A373]/60 to-[#D4A373]" />
          <span className="text-[#D4A373] text-xs">✦</span>
          <div className="h-px w-16 sm:w-28 bg-gradient-to-l from-transparent via-[#D4A373]/60 to-[#D4A373]" />
        </div>
      </div>

      {/* Grid de Produtos com Entrada Escalonada e Efeito Spring */}
      <div className="relative z-20">
        {produtos.length === 0 ? (
          <div className="text-center py-12 space-y-3 bg-white/85 rounded-2xl border border-[#E8D8CF] p-6 shadow-xs backdrop-blur-xs">
            <p className="text-[#783D29] text-sm font-medium">
              Nenhum produto cadastrado para a data de Páscoa no momento.
            </p>
            {onVoltar && (
              <button
                type="button"
                onClick={onVoltar}
                className="text-xs font-bold text-[#8C4F27] hover:underline cursor-pointer"
              >
                Voltar a ver todos os produtos
              </button>
            )}
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="flex flex-col gap-3 sm:grid sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3"
          >
            {produtos.map((produto) => (
              <motion.div
                key={produto.nome}
                variants={cardVariants}
                className="transform transition-transform duration-200 hover:-translate-y-1 hover:drop-shadow-md"
              >
                <ProductCard
                  produto={produto}
                  onAbrirDetalhes={onAbrirDetalhes}
                  isEasterTheme={true}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
