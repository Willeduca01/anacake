"use client";

import { motion, useReducedMotion } from "framer-motion";

interface EasterBunnyProps {
  onComplete?: () => void;
}

export default function EasterBunny({ onComplete }: EasterBunnyProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return null;
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden select-none">
      {/* 1. Coelhinho saltador */}
      <motion.div
        initial={{ x: "-20vw", y: "62vh", scale: 0.8, opacity: 0 }}
        animate={{
          x: ["-20vw", "10vw", "32vw", "52vw", "74vw", "95vw", "118vw"],
          y: ["62vh", "34vh", "60vh", "32vh", "58vh", "28vh", "55vh"],
          scale: [0.8, 0.95, 0.9, 0.98, 0.9, 1.02, 1.05],
          opacity: [0, 1, 1, 1, 1, 0.9, 0],
          rotate: [-6, 12, -4, 14, -2, 16, 8],
        }}
        transition={{
          duration: 2.7,
          ease: "easeInOut",
          times: [0, 0.18, 0.36, 0.54, 0.72, 0.88, 1],
        }}
        onAnimationComplete={onComplete}
        className="absolute drop-shadow-[0_4px_16px_rgba(212,163,115,0.65)]"
        style={{ willChange: "transform, opacity" }}
      >
        <div className="relative flex items-center">
          {/* Rastro mágico de brilhos e cenourinhas */}
          <div className="absolute right-full top-1/2 -translate-y-1/2 flex items-center gap-2 pr-2 opacity-90">
            <span className="animate-ping text-xs text-[#FFE899]">✨</span>
            <span className="animate-pulse text-xs text-[#FFB703]">🥕</span>
            <span className="animate-ping text-[10px] text-[#FFD166]">⭐</span>
            <span className="animate-pulse text-xs text-[#FFF0C2]">✨</span>
          </div>

          {/* SVG Coelhinho minimalista em dourado/caramelo e branco perolado */}
          <svg
            viewBox="0 0 90 75"
            className="w-18 sm:w-24 h-auto"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="bunnyGold" x1="0" y1="0" x2="90" y2="75" gradientUnits="userSpaceOnUse">
                <stop stopColor="#FFF2B2" />
                <stop offset="0.5" stopColor="#E6B87D" />
                <stop offset="1" stopColor="#C48847" />
              </linearGradient>
              <filter id="bunnyGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="1.2" />
                <feMerge>
                  <feMergeNode />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Rabinho fofo de algodão */}
            <circle cx="16" cy="48" r="7" fill="#FFF7EE" filter="url(#bunnyGlow)" />

            {/* Corpo arredondado do coelho */}
            <ellipse
              cx="38"
              cy="46"
              rx="22"
              ry="17"
              fill="url(#bunnyGold)"
              transform="rotate(-8 38 46)"
              filter="url(#bunnyGlow)"
            />

            {/* Pata traseira estendida no salto */}
            <ellipse
              cx="26"
              cy="58"
              rx="12"
              ry="6"
              fill="url(#bunnyGold)"
              transform="rotate(12 26 58)"
            />

            {/* Cabeça fofa */}
            <circle cx="62" cy="34" r="14" fill="url(#bunnyGold)" filter="url(#bunnyGlow)" />

            {/* Orelhas compridas erguidas com interior rosado suave */}
            {/* Orelha traseira */}
            <ellipse
              cx="60"
              cy="13"
              rx="5"
              ry="14"
              fill="url(#bunnyGold)"
              transform="rotate(-18 60 13)"
            />
            {/* Orelha dianteira */}
            <ellipse
              cx="68"
              cy="12"
              rx="5.5"
              ry="15"
              fill="url(#bunnyGold)"
              transform="rotate(4 68 12)"
            />
            <ellipse
              cx="68"
              cy="13"
              rx="3"
              ry="11"
              fill="#F7CAD0"
              transform="rotate(4 68 13)"
              opacity="0.85"
            />

            {/* Olhinho brilhante */}
            <circle cx="68" cy="32" r="2.2" fill="#3D1E16" />
            <circle cx="67.4" cy="31.4" r="0.8" fill="#FFFFFF" />

            {/* Focinho e bigodinhos */}
            <circle cx="75" cy="36" r="1.8" fill="#F4ACB7" />
            <path
              d="M 74 38 Q 80 37 84 35 M 74 39 Q 80 40 83 43"
              stroke="#E6B87D"
              strokeWidth="0.8"
              strokeLinecap="round"
            />

            {/* Patas dianteiras estendidas no ar */}
            <ellipse
              cx="54"
              cy="55"
              rx="7"
              ry="4"
              fill="url(#bunnyGold)"
              transform="rotate(22 54 55)"
            />
          </svg>
        </div>
      </motion.div>

      {/* 2. Marcas sutis de patinhas douradas deixadas nos saltos */}
      {/* Ponto de aterrissagem 1 */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: [0, 0.7, 0], scale: [0.5, 1, 1.2] }}
        transition={{ delay: 0.9, duration: 1.4 }}
        className="absolute left-[32vw] top-[66vh] flex gap-1 -translate-x-1/2"
      >
        <div className="w-2.5 h-3.5 rounded-full bg-amber-400/50 blur-[0.5px]" />
        <div className="w-2.5 h-3.5 rounded-full bg-amber-400/50 blur-[0.5px] mt-1" />
      </motion.div>

      {/* Ponto de aterrissagem 2 */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: [0, 0.7, 0], scale: [0.5, 1, 1.2] }}
        transition={{ delay: 1.8, duration: 1.4 }}
        className="absolute left-[72vw] top-[64vh] flex gap-1 -translate-x-1/2"
      >
        <div className="w-2.5 h-3.5 rounded-full bg-amber-400/50 blur-[0.5px]" />
        <div className="w-2.5 h-3.5 rounded-full bg-amber-400/50 blur-[0.5px] mt-1" />
      </motion.div>
    </div>
  );
}
