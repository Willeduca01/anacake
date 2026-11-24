"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { Produto } from "@/constants/products";
import ProductCard from "@/components/ProductCard";
import MothersDayFloralHeader from "./MothersDayFloralHeader";
import MothersDayPetals from "./MothersDayPetals";
import MothersDayFlowerIntro from "./MothersDayFlowerIntro";
import { getFontClass, getTamanhoClass } from "@/lib/fonts-comemorativa";

interface MothersDayThemeProps {
  nomeAba: string;
  badgeTexto?: string;
  subtitulo?: string;
  fonteTitulo?: string;
  tamanhoTitulo?: string;
  produtos: Produto[];
  onAbrirDetalhes?: (produto: Produto) => void;
  onVoltar?: () => void;
}

const MOTHERS_DAY_SESSION_KEY = "anacake_maes_intro_seen_v1";

export default function MothersDayTheme({
  nomeAba,
  badgeTexto,
  subtitulo,
  fonteTitulo,
  tamanhoTitulo,
  produtos,
  onAbrirDetalhes,
  onVoltar,
}: MothersDayThemeProps) {
  const shouldReduceMotion = useReducedMotion();
  const [showIntro, setShowIntro] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const seen = sessionStorage.getItem(MOTHERS_DAY_SESSION_KEY);
        if (!seen && !shouldReduceMotion) {
          setShowIntro(true);
          sessionStorage.setItem(MOTHERS_DAY_SESSION_KEY, "true");
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
        staggerChildren: shouldReduceMotion ? 0 : 0.07,
        delayChildren: 0.12,
      },
    },
  };

  const cardVariants: Variants = {
    hidden: {
      opacity: 0,
      y: shouldReduceMotion ? 0 : 16,
      scale: shouldReduceMotion ? 1 : 0.97,
    },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: shouldReduceMotion
        ? { duration: 0.3 }
        : {
            duration: 0.45,
            ease: "easeOut",
          },
    },
  };

  const textoBadge = badgeTexto?.trim() || "Especial Dia das Mães";
  const textoSubtitulo =
    subtitulo?.trim() ||
    "Doces afetivos, caixas especiais e presentes criados com todo amor para homenagear quem sempre cuidou de você.";
  const classeFonte = getFontClass(fonteTitulo);
  const classeTamanho = getTamanhoClass(tamanhoTitulo);

  return (
    <div className="relative w-full rounded-3xl overflow-hidden px-3 py-6 sm:p-8 bg-gradient-to-b from-[#FFF7F4] via-[#FAF0EC] to-[#F5E6E1] text-[#4A202A] shadow-xl border border-[#F0D5CD] transition-all duration-700">
      {/* Intro animada: flor desabrochando com brisa de pétalas e luz dourada */}
      {showIntro && <MothersDayFlowerIntro onComplete={() => setShowIntro(false)} />}

      {/* Pétalas de rosa e corações caindo suavemente */}
      <MothersDayPetals />

      {/* Ramo floral delicado nas bordas superiores (sem cordas) */}
      <MothersDayFloralHeader />

      {/* Cabeçalho Sofisticado e Delicado de Dia das Mães */}
      <div className="relative z-20 text-center max-w-2xl mx-auto space-y-2 pb-6 sm:pb-8">
        <div className="inline-flex items-center gap-2 rounded-full bg-[#FCECE8] border border-[#F5CAC3] px-4 py-1 text-xs font-semibold text-[#8C3446] shadow-xs">
          <span>💖</span>
          <span className="tracking-wide uppercase text-[11px] font-bold">
            {textoBadge}
          </span>
          <span>🌸</span>
        </div>

        <h1
          className={`${classeFonte} ${classeTamanho} font-normal text-transparent bg-clip-text bg-gradient-to-r from-[#4A1E28] via-[#6B2A38] to-[#8C3446] drop-shadow-[0_2px_8px_rgba(74,30,40,0.12)] leading-tight text-center px-1`}
        >
          {nomeAba || "Especial Dia das Mães"}
        </h1>

        <p className="text-xs sm:text-sm text-[#7A4B56] max-w-lg mx-auto font-normal leading-relaxed">
          {textoSubtitulo}
        </p>

        {/* Linha divisória suave em tom rosé */}
        <div className="flex items-center justify-center gap-3 pt-2">
          <div className="h-px w-16 sm:w-28 bg-gradient-to-r from-transparent via-[#E5989B]/50 to-transparent" />
          <span className="text-[#E5989B] text-xs">🌸</span>
          <div className="h-px w-16 sm:w-28 bg-gradient-to-l from-transparent via-[#E5989B]/50 to-transparent" />
        </div>
      </div>

      {/* Grid de Produtos com Entrada Suave e Stagger Fluido */}
      <div className="relative z-20">
        {produtos.length === 0 ? (
          <div className="text-center py-12 space-y-3 bg-white/80 rounded-2xl border border-[#F0D5CD] p-6 shadow-xs backdrop-blur-xs">
            <p className="text-[#8C3446] text-sm font-medium">
              Nenhum produto cadastrado para o Dia das Mães no momento.
            </p>
            {onVoltar && (
              <button
                type="button"
                onClick={onVoltar}
                className="text-xs font-bold text-[#8C3446] hover:underline cursor-pointer"
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
                  isMothersDayTheme={true}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
