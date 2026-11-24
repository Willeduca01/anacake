"use client";

import { useId } from "react";
import { motion, useReducedMotion } from "framer-motion";

interface CarnivalMaskIntroProps {
  onComplete?: () => void;
}

export default function CarnivalMaskIntro({ onComplete }: CarnivalMaskIntroProps) {
  const shouldReduceMotion = useReducedMotion();
  const baseId = useId().replace(/:/g, "_");

  if (shouldReduceMotion) {
    return null;
  }

  // Partículas para a explosão lateral rápida de confetes
  const sideConfetti = [
    { color: "#FFD166", delay: 0.05, x: 280, y: -480, rot: 360, size: "w-3 h-4" },
    { color: "#FF007F", delay: 0.08, x: 360, y: -420, rot: -300, size: "w-3.5 h-3.5 rounded-full" },
    { color: "#00F0FF", delay: 0.12, x: 220, y: -510, rot: 440, size: "w-3 h-4" },
    { color: "#06D6A0", delay: 0.06, x: 310, y: -390, rot: -380, size: "w-4 h-2.5" },
    { color: "#B5179E", delay: 0.16, x: 400, y: -340, rot: 520, size: "w-3.5 h-3.5 rounded-full" },
    { color: "#FFD166", delay: 0.1, x: 190, y: -380, rot: -260, size: "w-3 h-4" },
    { color: "#FF007F", delay: 0.14, x: 250, y: -440, rot: 400, size: "w-2.5 h-5" },
    { color: "#00F0FF", delay: 0.18, x: 330, y: -470, rot: -460, size: "w-3.5 h-3.5 rounded-full" },
    { color: "#FB8500", delay: 0.09, x: 270, y: -430, rot: 320, size: "w-3 h-4" },
    { color: "#FFD166", delay: 0.15, x: 350, y: -380, rot: -340, size: "w-4 h-2" },
    { color: "#06D6A0", delay: 0.2, x: 230, y: -460, rot: 410, size: "w-3 h-3 rounded-full" },
  ];

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden select-none flex items-center justify-center">
      {/* 1. Canhão de Confetes Inferior Esquerdo */}
      <div className="absolute left-[-20px] bottom-[-20px]">
        {sideConfetti.map((c, i) => (
          <motion.div
            key={`left-${i}`}
            initial={{ x: 0, y: 0, opacity: 1, scale: 0.8 }}
            animate={{
              x: [0, c.x * 0.6, c.x],
              y: [0, c.y, c.y + 350],
              opacity: [0, 1, 1, 0],
              rotate: [0, c.rot],
              scale: [0.8, 1.2, 0.9],
            }}
            transition={{
              duration: 2.3,
              delay: c.delay,
              ease: "easeOut",
            }}
            className={`absolute shadow-sm ${c.size || "w-3 h-4 rounded-[1px]"}`}
            style={{ backgroundColor: c.color }}
          />
        ))}
      </div>

      {/* 2. Canhão de Confetes Inferior Direito */}
      <div className="absolute right-[-20px] bottom-[-20px]">
        {sideConfetti.map((c, i) => (
          <motion.div
            key={`right-${i}`}
            initial={{ x: 0, y: 0, opacity: 1, scale: 0.8 }}
            animate={{
              x: [0, -c.x * 0.6, -c.x],
              y: [0, c.y, c.y + 350],
              opacity: [0, 1, 1, 0],
              rotate: [0, -c.rot],
              scale: [0.8, 1.2, 0.9],
            }}
            transition={{
              duration: 2.3,
              delay: c.delay + 0.05,
              ease: "easeOut",
            }}
            className={`absolute shadow-sm ${c.size || "w-3 h-4 rounded-[1px]"}`}
            style={{ backgroundColor: c.color }}
          />
        ))}
      </div>

      {/* 3. Máscara Veneziana Dourada Central com Brilho e Dissolução */}
      <motion.div
        initial={{ scale: 0.2, opacity: 0, y: 30, rotate: -8 }}
        animate={{
          scale: [0.2, 1.15, 1, 1.05, 1.28],
          opacity: [0, 1, 1, 1, 0],
          y: [30, -10, 0, -5, -20],
          rotate: [-8, 4, 0, -2, 0],
          filter: [
            "blur(0px) drop-shadow(0 0 10px rgba(255,215,0,0.5))",
            "blur(0px) drop-shadow(0 0 35px rgba(255,215,0,0.9))",
            "blur(0px) drop-shadow(0 0 25px rgba(255,0,127,0.7))",
            "blur(0px) drop-shadow(0 0 40px rgba(0,240,255,0.8))",
            "blur(12px) drop-shadow(0 0 60px rgba(255,215,0,1))",
          ],
        }}
        transition={{
          duration: 2.6,
          times: [0, 0.25, 0.6, 0.82, 1],
          ease: "easeInOut",
        }}
        onAnimationComplete={onComplete}
        className="relative z-50 flex flex-col items-center justify-center pointer-events-none"
      >
        <svg
          viewBox="0 0 220 150"
          className="w-48 sm:w-64 lg:w-80 h-auto"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id={`${baseId}_goldMask`} x1="0" y1="0" x2="220" y2="150" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FFF275" />
              <stop offset="0.4" stopColor="#FFD166" />
              <stop offset="0.8" stopColor="#E09F3E" />
              <stop offset="1" stopColor="#9E641B" />
            </linearGradient>

            <linearGradient id={`${baseId}_gemMagenta`} x1="0" y1="0" x2="1" y2="1">
              <stop stopColor="#FF66B2" />
              <stop offset="100%" stopColor="#D90368" />
            </linearGradient>

            <linearGradient id={`${baseId}_gemCyan`} x1="0" y1="0" x2="1" y2="1">
              <stop stopColor="#90E0EF" />
              <stop offset="100%" stopColor="#0077B6" />
            </linearGradient>
          </defs>

          {/* Penas e plumas carnavalescas no topo */}
          <path
            d="M 110 50 C 95 20, 65 10, 50 15 C 70 30, 90 40, 105 52 Z"
            fill="url(#gemMagenta)"
            opacity="0.9"
          />
          <path
            d="M 110 50 C 125 20, 155 10, 170 15 C 150 30, 130 40, 115 52 Z"
            fill="url(#gemCyan)"
            opacity="0.9"
          />
          <path
            d="M 110 52 C 105 15, 110 0, 110 0 C 110 0, 115 15, 110 52 Z"
            fill={`url(#${baseId}_goldMask)`}
          />

          {/* Formato da Máscara Veneziana */}
          <path
            d="M 110 65 C 145 42, 195 48, 210 75 C 215 88, 205 110, 175 112 C 150 114, 130 95, 110 88 C 90 95, 70 114, 45 112 C 15 110, 5 88, 10 75 C 25 48, 75 42, 110 65 Z"
            fill={`url(#${baseId}_goldMask)`}
            stroke="#FFE699"
            strokeWidth="2.5"
          />

          {/* Recortes dos Olhos amendoados */}
          <path
            d="M 45 76 C 60 66, 85 68, 90 78 C 85 88, 60 88, 45 76 Z"
            fill="#12031C"
            stroke="#FFF275"
            strokeWidth="2"
          />
          <path
            d="M 175 76 C 160 66, 135 68, 130 78 C 135 88, 160 88, 175 76 Z"
            fill="#12031C"
            stroke="#FFF275"
            strokeWidth="2"
          />

          {/* Arabescos e filigranas douradas */}
          <path
            d="M 15 65 Q 40 55 60 60"
            stroke="#FFF275"
            strokeWidth="2"
            fill="none"
          />
          <path
            d="M 205 65 Q 180 55 160 60"
            stroke="#FFF275"
            strokeWidth="2"
            fill="none"
          />

          {/* Pedrarias reluzentes na testa da máscara */}
          <circle cx="110" cy="62" r="6" fill={`url(#${baseId}_gemMagenta)`} stroke="#FFE699" strokeWidth="1.5" />
          <circle cx="95" cy="58" r="4" fill={`url(#${baseId}_gemCyan)`} stroke="#FFE699" strokeWidth="1" />
          <circle cx="125" cy="58" r="4" fill={`url(#${baseId}_gemCyan)`} stroke="#FFE699" strokeWidth="1" />
          <circle cx="110" cy="74" r="3" fill="#FFF" />
        </svg>

        {/* Brilhos estelares ao redor da máscara */}
        <span className="absolute -top-3 -right-2 text-xl text-[#FFD166] animate-ping">✨</span>
        <span className="absolute -bottom-2 -left-2 text-xl text-[#00F0FF] animate-pulse">✨</span>
        <span className="absolute top-1/2 -right-8 text-lg text-[#FF007F] animate-ping">✨</span>
      </motion.div>
    </div>
  );
}
