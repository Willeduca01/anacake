"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { Produto } from "@/constants/products";
import ProductCard from "@/components/ProductCard";
import CarnivalBannerMask from "./CarnivalBannerMask";
import CarnivalParticles from "./CarnivalParticles";
import CarnivalMaskIntro from "./CarnivalMaskIntro";
import { getFontClass, getTamanhoClass } from "@/lib/fonts-comemorativa";

interface CarnivalThemeProps {
  nomeAba: string;
  badgeTexto?: string;
  subtitulo?: string;
  fonteTitulo?: string;
  tamanhoTitulo?: string;
  produtos: Produto[];
  onAbrirDetalhes?: (produto: Produto) => void;
  onVoltar?: () => void;
}

const CARNIVAL_SESSION_KEY = "anacake_carnaval_mask_seen_v1";

export default function CarnivalTheme({
  nomeAba,
  badgeTexto,
  subtitulo,
  fonteTitulo,
  tamanhoTitulo,
  produtos,
  onAbrirDetalhes,
  onVoltar,
}: CarnivalThemeProps) {
  const shouldReduceMotion = useReducedMotion();
  const [showIntro, setShowIntro] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const seen = sessionStorage.getItem(CARNIVAL_SESSION_KEY);
        if (!seen && !shouldReduceMotion) {
          setShowIntro(true);
          sessionStorage.setItem(CARNIVAL_SESSION_KEY, "true");
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
      y: shouldReduceMotion ? 0 : 24,
      rotate: shouldReduceMotion ? 0 : -3.5,
      scale: shouldReduceMotion ? 1 : 0.94,
    },
    show: {
      opacity: 1,
      y: 0,
      rotate: 0,
      scale: 1,
      transition: shouldReduceMotion
        ? { duration: 0.3 }
        : {
            type: "spring",
            stiffness: 240,
            damping: 18,
          },
    },
  };

  const textoBadge = badgeTexto?.trim() || "Folia de Carnaval";
  const textoSubtitulo =
    subtitulo?.trim() ||
    "Doces temáticos, kits festa e delícias artesanais para encher seus dias de alegria e muito sabor.";
  const classeFonte = getFontClass(fonteTitulo);
  const classeTamanho = getTamanhoClass(tamanhoTitulo);

  return (
    <div className="relative w-full rounded-3xl overflow-hidden px-3 py-6 sm:p-8 bg-gradient-to-r from-[#280436] via-[#4D0A58] to-[#20032B] text-white shadow-2xl border border-amber-400/50 transition-all duration-700">
      {/* Barra Dourada Superior estilo Faixa de Carnaval */}
      <div className="absolute top-0 left-0 right-0 h-1 sm:h-1.5 bg-gradient-to-r from-amber-400 via-[#FFE066] to-amber-500 shadow-[0_0_12px_rgba(255,215,0,0.6)]" />

      {/* Círculos e luzes festivas de fundo (bokeh carnavalesco) */}
      <div className="absolute -top-10 -left-10 w-44 h-44 rounded-full bg-[#00F0FF]/15 blur-2xl pointer-events-none" />
      <div className="absolute top-1/4 -right-10 w-60 h-60 rounded-full bg-[#FF007F]/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-8 left-1/3 w-52 h-52 rounded-full bg-[#FFD166]/15 blur-2xl pointer-events-none" />

      {/* Intro animada: explosão de confetes e máscara veneziana dourada */}
      {showIntro && <CarnivalMaskIntro onComplete={() => setShowIntro(false)} />}

      {/* Confetes e serpentinas flutuando continuamente */}
      <CarnivalParticles />

      {/* Cabeçalho Festivo de Carnaval */}
      <div className="relative z-20 text-center max-w-3xl mx-auto space-y-2 pb-6 sm:pb-8">
        {/* Estrelinhas cintilantes */}
        <div className="flex items-center justify-center gap-1.5 text-amber-300 text-xs sm:text-sm select-none drop-shadow-xs">
          <span>✦</span>
          <span className="text-base sm:text-lg">✦</span>
          <span>✦</span>
        </div>

        {/* Badge de Folia */}
        <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#D90368]/30 via-[#FFD166]/20 to-[#00F0FF]/30 border border-amber-400/50 px-4 py-1 text-xs font-bold text-[#FFD166] shadow-sm backdrop-blur-xs">
          <span>🎭</span>
          <span className="tracking-wider uppercase text-[11px]">
            {textoBadge}
          </span>
          <span>🎊</span>
        </div>

        {/* Título com Máscaras Carnavalescas com plumas em ambos os lados */}
        <div className="flex items-center justify-center gap-2 sm:gap-6 my-2">
          <CarnivalBannerMask
            variant="magenta"
            side="left"
            className="w-12 sm:w-20 md:w-28 lg:w-32 shrink-0 transform -rotate-6 hover:rotate-0 transition-transform duration-300"
          />

          <h1
            className={`${classeFonte} ${classeTamanho} font-normal text-transparent bg-clip-text bg-gradient-to-r from-[#FFF48D] via-[#FFD166] to-[#FFAA00] drop-shadow-[0_4px_20px_rgba(255,209,102,0.55)] leading-tight text-center px-1`}
          >
            {nomeAba || "Folia de Carnaval"}
          </h1>

          <CarnivalBannerMask
            variant="turquoise"
            side="right"
            className="w-12 sm:w-20 md:w-28 lg:w-32 shrink-0 transform rotate-6 hover:rotate-0 transition-transform duration-300"
          />
        </div>

        <p className="text-xs sm:text-sm text-amber-100/90 max-w-lg mx-auto font-light leading-relaxed">
          {textoSubtitulo}
        </p>

        {/* Linha divisória festiva em dourado e magenta */}
        <div className="flex items-center justify-center gap-3 pt-2">
          <div className="h-px w-16 sm:w-28 bg-gradient-to-r from-transparent via-amber-400/70 to-amber-300" />
          <span className="text-amber-300 text-xs">✦</span>
          <div className="h-px w-16 sm:w-28 bg-gradient-to-l from-transparent via-amber-400/70 to-amber-300" />
        </div>
      </div>

      {/* Barra Dourada Inferior */}
      <div className="absolute bottom-0 left-0 right-0 h-1 sm:h-1.5 bg-gradient-to-r from-amber-400 via-[#FFE066] to-amber-500 shadow-[0_0_12px_rgba(255,215,0,0.6)]" />

      {/* Grid de Produtos com Entrada Escalonada e Tilt Divertido */}
      <div className="relative z-20">
        {produtos.length === 0 ? (
          <div className="text-center py-12 space-y-3 bg-black/35 rounded-2xl border border-[#FF007F]/25 p-6 backdrop-blur-xs">
            <p className="text-[#FFD166] text-sm font-medium">
              Nenhum produto cadastrado para a data de Carnaval no momento.
            </p>
            {onVoltar && (
              <button
                type="button"
                onClick={onVoltar}
                className="text-xs font-bold text-[#00F0FF] hover:underline cursor-pointer"
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
                className="transform transition-transform duration-200 hover:-translate-y-1 hover:drop-shadow-[0_8px_20px_rgba(217,3,104,0.3)]"
              >
                <ProductCard
                  produto={produto}
                  onAbrirDetalhes={onAbrirDetalhes}
                  isCarnivalTheme={true}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
