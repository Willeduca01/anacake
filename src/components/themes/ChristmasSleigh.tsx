"use client";

import { motion, useReducedMotion } from "framer-motion";

interface ChristmasSleighProps {
  onComplete?: () => void;
}

export default function ChristmasSleigh({ onComplete }: ChristmasSleighProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return null;
  }

  return (
    <motion.div
      initial={{ x: "-25vw", y: "65vh", scale: 0.65, opacity: 0, rotate: -8 }}
      animate={{
        x: "115vw",
        y: "-15vh",
        scale: [0.65, 0.95, 1.1, 1.15],
        opacity: [0, 0.95, 1, 0],
        rotate: [-8, -4, 2, 6],
      }}
      transition={{
        duration: 3.2,
        ease: "easeInOut",
      }}
      onAnimationComplete={onComplete}
      className="fixed z-50 pointer-events-none select-none drop-shadow-[0_0_20px_rgba(255,215,0,0.7)]"
      style={{ willChange: "transform, opacity" }}
    >
      <div className="relative flex items-center">
        {/* Rastro de estrelas e poeira mágica atrás do trenó */}
        <div className="absolute right-full top-1/2 -translate-y-1/2 flex items-center gap-1.5 pr-2 opacity-85">
          <span className="animate-ping inline-block text-xs text-[#FFF3B0]">✨</span>
          <span className="animate-pulse inline-block text-sm text-[#FFD166]" style={{ animationDelay: "0.2s" }}>
            ⭐
          </span>
          <span className="animate-ping inline-block text-[10px] text-[#FFE899]" style={{ animationDelay: "0.4s" }}>
            ✨
          </span>
          <span className="animate-pulse inline-block text-xs text-[#FFC043]" style={{ animationDelay: "0.6s" }}>
            🌟
          </span>
          <span className="animate-ping inline-block text-sm text-[#FFF7D6]" style={{ animationDelay: "0.1s" }}>
            ✨
          </span>
        </div>

        {/* Silhueta Dourada Artística: Trenó do Papai Noel + 2 Renas Voando */}
        <svg
          viewBox="0 0 320 90"
          className="w-56 sm:w-72 md:w-80 h-auto"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="goldSleighGrad" x1="0" y1="0" x2="320" y2="90" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FFF2B2" />
              <stop offset="0.45" stopColor="#FFD166" />
              <stop offset="1" stopColor="#FFAA00" />
            </linearGradient>
            <filter id="goldenGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" />
              <feMerge>
                <feMergeNode />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Ramo / Rédeas ligando o trenó às renas */}
          <path
            d="M 95 48 Q 140 38 185 45 Q 235 36 270 42"
            stroke="url(#goldSleighGrad)"
            strokeWidth="1.8"
            strokeDasharray="3 2"
            opacity="0.9"
          />

          {/* --- TRENÓ E PAPAI NOEL (Esquerda) --- */}
          <g filter="url(#goldenGlow)" fill="url(#goldSleighGrad)">
            {/* Lâmina inferior curva do trenó */}
            <path
              d="M 20 72 C 35 72, 85 73, 98 64 C 104 60, 102 52, 94 54 C 88 56, 40 56, 28 66 C 22 71, 15 72, 20 72 Z"
            />
            {/* Suportes verticais da lâmina */}
            <rect x="42" y="58" width="4" height="11" rx="1.5" />
            <rect x="74" y="54" width="4" height="13" rx="1.5" />

            {/* Corpo elegante do trenó */}
            <path
              d="M 28 42 C 32 30, 48 32, 56 38 C 65 34, 88 32, 96 46 C 100 52, 94 58, 86 58 C 50 58, 30 54, 28 42 Z"
            />

            {/* Saco de presentes volumoso no fundo */}
            <circle cx="44" cy="34" r="13" />
            <ellipse cx="46" cy="24" rx="5" ry="3" />

            {/* Papai Noel guiando o trenó */}
            {/* Tronco / Casaco */}
            <ellipse cx="68" cy="38" rx="10" ry="12" />
            {/* Cabeça e Barba */}
            <circle cx="70" cy="24" r="7" />
            <path d="M 67 25 Q 73 34 76 27 Q 77 22 70 23 Z" />
            {/* Gorro de Natal */}
            <path d="M 64 21 Q 69 11 77 15 Q 74 20 66 22 Z" />
            <circle cx="79" cy="16" r="2.5" />
            {/* Braço segurando as rédeas */}
            <path
              d="M 72 34 Q 85 36 94 45"
              stroke="url(#goldSleighGrad)"
              strokeWidth="4"
              strokeLinecap="round"
              fill="none"
            />
          </g>

          {/* --- PRIMEIRA RENA (Meio-Frente) --- */}
          <g filter="url(#goldenGlow)" fill="url(#goldSleighGrad)" transform="translate(160, 15) scale(0.85)">
            {/* Tronco da rena */}
            <ellipse cx="36" cy="32" rx="18" ry="10" transform="rotate(-10 36 32)" />
            {/* Pescoço e Cabeça erguida em salto */}
            <path d="M 44 26 L 56 12 Q 62 14 62 20 L 52 32 Z" />
            <ellipse cx="58" cy="14" rx="7" ry="5" transform="rotate(-15 58 14)" />
            {/* Galhadas majestosas */}
            <path
              d="M 58 10 Q 56 0 50 -4 M 58 10 Q 64 2 68 -2 M 54 4 Q 48 3 46 0"
              stroke="url(#goldSleighGrad)"
              strokeWidth="2.2"
              strokeLinecap="round"
              fill="none"
            />
            {/* Patas dianteiras estendidas no ar */}
            <path
              d="M 48 34 Q 56 46 64 54 M 46 34 Q 52 44 58 56"
              stroke="url(#goldSleighGrad)"
              strokeWidth="3.2"
              strokeLinecap="round"
              fill="none"
            />
            {/* Patas traseiras recolhidas no salto */}
            <path
              d="M 22 36 Q 16 48 10 56 M 26 36 Q 22 46 18 58"
              stroke="url(#goldSleighGrad)"
              strokeWidth="3.2"
              strokeLinecap="round"
              fill="none"
            />
          </g>

          {/* --- SEGUNDA RENA LÍDER (Frente) --- */}
          <g filter="url(#goldenGlow)" fill="url(#goldSleighGrad)" transform="translate(235, 8) scale(0.88)">
            {/* Tronco da rena */}
            <ellipse cx="36" cy="32" rx="18" ry="10" transform="rotate(-12 36 32)" />
            {/* Pescoço e Cabeça erguida */}
            <path d="M 44 26 L 56 12 Q 62 14 62 20 L 52 32 Z" />
            <ellipse cx="58" cy="14" rx="7" ry="5" transform="rotate(-18 58 14)" />
            {/* Galhadas da rena guia (Rudolph) */}
            <path
              d="M 58 10 Q 58 -2 52 -6 M 58 10 Q 66 0 70 -4 M 54 4 Q 48 2 46 -2"
              stroke="url(#goldSleighGrad)"
              strokeWidth="2.4"
              strokeLinecap="round"
              fill="none"
            />
            {/* Nariz brilhante sutil da rena guia */}
            <circle cx="64" cy="13" r="2.2" fill="#FFE57F" />
            {/* Patas dianteiras */}
            <path
              d="M 48 34 Q 58 46 66 54 M 46 34 Q 54 44 60 56"
              stroke="url(#goldSleighGrad)"
              strokeWidth="3.2"
              strokeLinecap="round"
              fill="none"
            />
            {/* Patas traseiras */}
            <path
              d="M 22 36 Q 15 48 8 56 M 26 36 Q 20 46 16 58"
              stroke="url(#goldSleighGrad)"
              strokeWidth="3.2"
              strokeLinecap="round"
              fill="none"
            />
          </g>
        </svg>
      </div>
    </motion.div>
  );
}
