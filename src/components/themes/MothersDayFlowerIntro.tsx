"use client";

import { useId } from "react";
import { motion, useReducedMotion } from "framer-motion";

interface MothersDayFlowerIntroProps {
  onComplete?: () => void;
}

export default function MothersDayFlowerIntro({ onComplete }: MothersDayFlowerIntroProps) {
  const shouldReduceMotion = useReducedMotion();
  const baseId = useId().replace(/:/g, "_");

  if (shouldReduceMotion) {
    return null;
  }

  // Brisa de pétalas que se expandem a partir do centro
  const driftingPetals = [
    { x: -140, y: -160, rot: -45, delay: 0.3, color: "#FFB5A7" },
    { x: 160, y: -140, rot: 55, delay: 0.4, color: "#E5989B" },
    { x: -180, y: 120, rot: 75, delay: 0.35, color: "#FCD5CE" },
    { x: 170, y: 150, rot: -60, delay: 0.45, color: "#FFCAD4" },
    { x: -90, y: -200, rot: 30, delay: 0.5, color: "#E5989B" },
    { x: 110, y: -190, rot: -35, delay: 0.55, color: "#FFB5A7" },
    { x: -210, y: -40, rot: -80, delay: 0.4, color: "#B56576" },
    { x: 210, y: -20, rot: 85, delay: 0.45, color: "#FCD5CE" },
  ];

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden select-none flex items-center justify-center">
      {/* Halo de luz suave ao fundo */}
      <motion.div
        initial={{ scale: 0.3, opacity: 0 }}
        animate={{
          scale: [0.3, 1.4, 2],
          opacity: [0, 0.45, 0],
        }}
        transition={{ duration: 2.5, ease: "easeOut" }}
        className="absolute w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-gradient-to-r from-[#FFCAD4] via-[#E5989B] to-[#DDA15E] blur-3xl pointer-events-none"
      />

      {/* Pétalas da brisa se dispersando do centro */}
      {driftingPetals.map((p, idx) => (
        <motion.div
          key={idx}
          initial={{ x: 0, y: 0, opacity: 0, scale: 0.4 }}
          animate={{
            x: [0, p.x * 0.6, p.x],
            y: [0, p.y * 0.6, p.y],
            opacity: [0, 1, 0],
            scale: [0.4, 1.1, 0.8],
            rotate: [0, p.rot],
          }}
          transition={{
            duration: 2.3,
            delay: p.delay,
            ease: "easeOut",
          }}
          className="absolute pointer-events-none"
        >
          <svg viewBox="0 0 18 24" className="w-4 sm:w-6 h-auto drop-shadow-sm">
            <path
              d="M 9 2 C 16 7, 17 16, 9 22 C 1 16, 2 7, 9 2 Z"
              fill={p.color}
              opacity="0.9"
            />
          </svg>
        </motion.div>
      ))}

      {/* Flor / Rosa desabrochando no centro da tela */}
      <motion.div
        initial={{ scale: 0.15, opacity: 0, rotate: -25 }}
        animate={{
          scale: [0.15, 1.05, 1, 1.08, 1.28],
          opacity: [0, 1, 1, 1, 0],
          rotate: [-25, 6, 0, -2, 4],
          filter: [
            "blur(0px) drop-shadow(0 0 10px rgba(229,152,155,0.4))",
            "blur(0px) drop-shadow(0 0 25px rgba(229,152,155,0.8))",
            "blur(0px) drop-shadow(0 0 20px rgba(221,161,94,0.6))",
            "blur(8px) drop-shadow(0 0 45px rgba(229,152,155,0.9))",
          ],
        }}
        transition={{
          duration: 2.6,
          times: [0, 0.3, 0.6, 0.82, 1],
          ease: "easeInOut",
        }}
        onAnimationComplete={onComplete}
        className="relative z-50 flex flex-col items-center justify-center pointer-events-none"
      >
        <svg
          viewBox="0 0 160 160"
          className="w-40 sm:w-56 h-auto"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id={`${baseId}_outerPetal`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FFF0EB" />
              <stop offset="50%" stopColor="#E5989B" />
              <stop offset="100%" stopColor="#B56576" />
            </linearGradient>

            <linearGradient id={`${baseId}_innerPetal`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FFF5F2" />
              <stop offset="100%" stopColor="#FFB5A7" />
            </linearGradient>

            <linearGradient id={`${baseId}_goldPistil`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FFF2D6" />
              <stop offset="100%" stopColor="#DDA15E" />
            </linearGradient>
          </defs>

          {/* Pétalas externas grandes desabrochadas */}
          <path
            d="M 80 40 C 50 15, 20 50, 45 80 C 20 110, 50 145, 80 120 C 110 145, 140 110, 115 80 C 140 50, 110 15, 80 40 Z"
            fill={`url(#${baseId}_outerPetal)`}
            opacity="0.95"
          />

          {/* Segunda camada de pétalas delicadas */}
          <path
            d="M 80 50 C 60 30, 35 60, 55 80 C 35 100, 60 130, 80 110 C 100 130, 125 100, 105 80 C 125 60, 100 30, 80 50 Z"
            fill={`url(#${baseId}_innerPetal)`}
          />

          {/* Camada central de pétalas entrelaçadas */}
          <circle cx="80" cy="80" r="24" fill="#E5989B" opacity="0.95" />
          <path
            d="M 68 76 C 72 65, 88 65, 92 76 C 94 85, 85 92, 80 92 C 75 92, 66 85, 68 76 Z"
            fill="#FFF0EB"
            opacity="0.9"
          />
          <path
            d="M 74 80 C 76 72, 84 72, 86 80 C 86 86, 80 88, 80 88 C 80 88, 74 86, 74 80 Z"
            fill="#B56576"
          />

          {/* Centro dourado cintilante */}
          <circle cx="80" cy="80" r="4.5" fill={`url(#${baseId}_goldPistil)`} />
        </svg>

        {/* Partículas de luz dourada cintilantes ao redor */}
        <span className="absolute -top-2 -right-3 text-lg text-[#DDA15E] animate-ping">✨</span>
        <span className="absolute -bottom-2 -left-2 text-base text-[#FFB5A7] animate-pulse">🌸</span>
        <span className="absolute top-1/2 -right-6 text-sm text-[#FFF2D6] animate-ping">✦</span>
      </motion.div>
    </div>
  );
}
