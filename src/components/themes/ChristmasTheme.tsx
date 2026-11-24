"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import Snowfall from "react-snowfall";
import type { Produto } from "@/constants/products";
import ProductCard from "@/components/ProductCard";
import ChristmasLights from "./ChristmasLights";
import ChristmasSleigh from "./ChristmasSleigh";
import { getFontClass, getTamanhoClass } from "@/lib/fonts-comemorativa";

interface ChristmasThemeProps {
  nomeAba: string;
  badgeTexto?: string;
  subtitulo?: string;
  fonteTitulo?: string;
  tamanhoTitulo?: string;
  produtos: Produto[];
  onAbrirDetalhes?: (produto: Produto) => void;
  onVoltar?: () => void;
}

const SLEIGH_SESSION_KEY = "anacake_natal_sleigh_seen_v1";

export default function ChristmasTheme({
  nomeAba,
  badgeTexto,
  subtitulo,
  fonteTitulo,
  tamanhoTitulo,
  produtos,
  onAbrirDetalhes,
  onVoltar,
}: ChristmasThemeProps) {
  const shouldReduceMotion = useReducedMotion();
  const [showSleigh, setShowSleigh] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsMobile(window.innerWidth < 640);
      const handleResize = () => setIsMobile(window.innerWidth < 640);
      window.addEventListener("resize", handleResize);

      try {
        const seen = sessionStorage.getItem(SLEIGH_SESSION_KEY);
        if (!seen && !shouldReduceMotion) {
          setShowSleigh(true);
          sessionStorage.setItem(SLEIGH_SESSION_KEY, "true");
        }
      } catch {
        // Fallback
      }

      return () => window.removeEventListener("resize", handleResize);
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
      y: shouldReduceMotion ? 0 : 16,
      scale: shouldReduceMotion ? 1 : 0.96,
    },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.45, ease: "easeOut" },
    },
  };

  const textoBadge = badgeTexto?.trim() || "Especial de Fim de Ano";
  const textoSubtitulo =
    subtitulo?.trim() ||
    "Doces artesanais finos e presentes exclusivos preparados com amor para iluminar a sua ceia.";
  const classeFonte = getFontClass(fonteTitulo);
  const classeTamanho = getTamanhoClass(tamanhoTitulo);

  return (
    <div className="relative w-full rounded-3xl overflow-hidden px-3 py-6 sm:p-8 bg-gradient-to-b from-[#380A0E] via-[#240507] to-[#150204] text-white shadow-2xl border border-amber-500/25 transition-all duration-700">
      {/* Voo animado do trenó do Papai Noel na primeira visita */}
      {showSleigh && (
        <ChristmasSleigh onComplete={() => setShowSleigh(false)} />
      )}

      {/* Neve suave com react-snowfall sobre a área temática */}
      <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
        <Snowfall
          color="#FFF7EA"
          snowflakeCount={shouldReduceMotion ? 0 : isMobile ? 40 : 80}
          speed={[0.4, 1.2]}
          wind={[-0.3, 0.6]}
          radius={[0.8, 2.4]}
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
          }}
        />
      </div>

      {/* Pisca-pisca de luzinhas no topo */}
      <ChristmasLights />

      {/* Cabeçalho Festivo Customizável */}
      <div className="relative z-20 text-center max-w-2xl mx-auto space-y-2 pb-6 sm:pb-8">
        <div className="inline-flex items-center gap-2 rounded-full bg-amber-400/15 border border-amber-300/30 px-3.5 py-1 text-xs font-semibold text-amber-200 shadow-xs backdrop-blur-xs">
          <span>🎄</span>
          <span className="tracking-wide uppercase text-[11px]">
            {textoBadge}
          </span>
          <span>✨</span>
        </div>

        <h1
          className={`${classeFonte} ${classeTamanho} font-normal text-transparent bg-clip-text bg-gradient-to-r from-[#FFF6CC] via-[#FFD770] to-[#FFAA00] drop-shadow-[0_4px_16px_rgba(255,215,0,0.45)] leading-tight`}
        >
          {nomeAba || "Seleção de Natal"}
        </h1>

        <p className="text-xs sm:text-sm text-amber-100/80 max-w-lg mx-auto font-light leading-relaxed">
          {textoSubtitulo}
        </p>

        {/* Linha divisória dourada decorativa */}
        <div className="flex items-center justify-center gap-3 pt-2">
          <div className="h-px w-16 sm:w-28 bg-gradient-to-r from-transparent via-amber-400/50 to-amber-300" />
          <span className="text-amber-300 text-xs">✦</span>
          <div className="h-px w-16 sm:w-28 bg-gradient-to-l from-transparent via-amber-400/50 to-amber-300" />
        </div>
      </div>

      {/* Grid de Produtos com Entrada Escalonada */}
      <div className="relative z-20">
        {produtos.length === 0 ? (
          <div className="text-center py-12 space-y-3 bg-black/20 rounded-2xl border border-white/10 p-6 backdrop-blur-xs">
            <p className="text-amber-100 text-sm font-medium">
              Nenhum produto cadastrado para a data de Natal no momento.
            </p>
            {onVoltar && (
              <button
                type="button"
                onClick={onVoltar}
                className="text-xs font-bold text-amber-300 hover:text-amber-200 underline cursor-pointer"
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
                className="transform transition-transform duration-200 hover:-translate-y-1 hover:drop-shadow-[0_8px_20px_rgba(255,215,0,0.18)]"
              >
                <ProductCard
                  produto={produto}
                  onAbrirDetalhes={onAbrirDetalhes}
                  isChristmasTheme={true}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
