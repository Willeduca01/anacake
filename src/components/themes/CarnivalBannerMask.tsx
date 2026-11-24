"use client";

import { useId } from "react";

interface CarnivalBannerMaskProps {
  className?: string;
  variant?: "magenta" | "turquoise";
  side?: "left" | "right";
}

export default function CarnivalBannerMask({
  className = "w-24 sm:w-32 lg:w-40 h-auto",
  variant = "magenta",
  side = "left",
}: CarnivalBannerMaskProps) {
  const baseId = useId().replace(/:/g, "_");
  const isRight = side === "right";

  const isTurquoise = variant === "turquoise";

  return (
    <div
      aria-hidden="true"
      className={`inline-flex items-center justify-center select-none pointer-events-none drop-shadow-[0_8px_24px_rgba(255,0,127,0.45)] transition-transform duration-300 hover:scale-105 ${
        isRight ? "scale-x-[-1]" : ""
      } ${className}`}
    >
      <svg
        viewBox="0 0 240 180"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <defs>
          {/* Gradiente Ouro Real */}
          <linearGradient id={`${baseId}_gold`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FFF48D" />
            <stop offset="40%" stopColor="#FFD166" />
            <stop offset="80%" stopColor="#E09F3E" />
            <stop offset="100%" stopColor="#9E641B" />
          </linearGradient>

          {/* Gradiente Pluma Amarela */}
          <linearGradient id={`${baseId}_featherYellow`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFF275" />
            <stop offset="100%" stopColor="#FB8500" />
          </linearGradient>

          {/* Gradiente Pluma Turquesa */}
          <linearGradient id={`${baseId}_featherCyan`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#00F0FF" />
            <stop offset="100%" stopColor="#0077B6" />
          </linearGradient>

          {/* Gradiente Pluma Verde Folia */}
          <linearGradient id={`${baseId}_featherGreen`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#00F5D4" />
            <stop offset="100%" stopColor="#06D6A0" />
          </linearGradient>

          {/* Gradiente Pluma Magenta */}
          <linearGradient id={`${baseId}_featherMagenta`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FF54A2" />
            <stop offset="100%" stopColor="#D90368" />
          </linearGradient>

          {/* Gradiente do Corpo da Máscara */}
          <linearGradient id={`${baseId}_maskBody`} x1="0" y1="0" x2="1" y2="1">
            {isTurquoise ? (
              <>
                <stop offset="0%" stopColor="#00B4D8" />
                <stop offset="60%" stopColor="#0077B6" />
                <stop offset="100%" stopColor="#03045E" />
              </>
            ) : (
              <>
                <stop offset="0%" stopColor="#FF007F" />
                <stop offset="60%" stopColor="#D90368" />
                <stop offset="100%" stopColor="#540D6E" />
              </>
            )}
          </linearGradient>
        </defs>

        {/* 1. PLUMAS TROPICAIS CARNAVALESCAS EXPLODINDO NO TOPO */}
        {/* Pluma Traseira Esquerda (Verde) */}
        <path
          d="M 120 70 C 85 40, 50 25, 30 35 C 55 55, 85 68, 110 75 Z"
          fill={`url(#${baseId}_featherGreen)`}
          opacity="0.95"
        />

        {/* Pluma Traseira Direita (Roxa/Magenta) */}
        <path
          d="M 120 70 C 155 40, 190 25, 210 35 C 185 55, 155 68, 130 75 Z"
          fill={`url(#${baseId}_featherMagenta)`}
          opacity="0.95"
        />

        {/* Pluma Turquesa Esquerda */}
        <path
          d="M 120 72 C 95 30, 75 10, 60 12 C 85 38, 105 58, 115 76 Z"
          fill={`url(#${baseId}_featherCyan)`}
        />

        {/* Pluma Turquesa Direita */}
        <path
          d="M 120 72 C 145 30, 165 10, 180 12 C 155 38, 135 58, 125 76 Z"
          fill={`url(#${baseId}_featherCyan)`}
        />

        {/* Pluma Amarela Dourada Central Alta */}
        <path
          d="M 120 75 C 112 25, 115 0, 120 0 C 125 0, 128 25, 120 75 Z"
          fill={`url(#${baseId}_featherYellow)`}
        />
        {/* Nervura central da pluma amarela */}
        <line x1="120" y1="5" x2="120" y2="70" stroke="#FFF48D" strokeWidth="1.5" opacity="0.8" />

        {/* 2. CORPO DA MÁSCARA CARNAVALESCA */}
        <path
          d="M 120 90 C 155 65, 205 70, 225 96 C 232 110, 220 134, 188 136 C 158 138, 138 116, 120 110 C 102 116, 82 138, 52 136 C 20 134, 8 110, 15 96 C 35 70, 85 65, 120 90 Z"
          fill={`url(#${baseId}_maskBody)`}
          stroke={`url(#${baseId}_gold)`}
          strokeWidth="3.5"
        />

        {/* 3. RECORTES DOS OLHOS */}
        <path
          d="M 52 102 C 68 90, 96 92, 102 104 C 96 116, 68 116, 52 102 Z"
          fill="#1C062A"
          stroke={`url(#${baseId}_gold)`}
          strokeWidth="2.5"
        />
        <path
          d="M 188 102 C 172 90, 144 92, 138 104 C 144 116, 172 116, 188 102 Z"
          fill="#1C062A"
          stroke={`url(#${baseId}_gold)`}
          strokeWidth="2.5"
        />

        {/* 4. FILIGRANAS E ARABESCOS DOURADOS */}
        {/* Arabesco asa esquerda */}
        <path
          d="M 22 92 Q 48 80 72 86 Q 92 90 102 84"
          stroke={`url(#${baseId}_gold)`}
          strokeWidth="2.2"
          fill="none"
          strokeLinecap="round"
        />
        {/* Arabesco asa direita */}
        <path
          d="M 218 92 Q 192 80 168 86 Q 148 90 138 84"
          stroke={`url(#${baseId}_gold)`}
          strokeWidth="2.2"
          fill="none"
          strokeLinecap="round"
        />
        {/* Bordadura inferior estilizada */}
        <path
          d="M 40 125 Q 75 130 105 115"
          stroke="#FFD166"
          strokeWidth="1.8"
          fill="none"
          strokeDasharray="2 3"
        />
        <path
          d="M 200 125 Q 165 130 135 115"
          stroke="#FFD166"
          strokeWidth="1.8"
          fill="none"
          strokeDasharray="2 3"
        />

        {/* 5. JOIAS E PEDRARIAS CENTRAIS */}
        <circle cx="120" cy="85" r="7.5" fill="#FFD166" stroke="#FFF" strokeWidth="1.5" />
        <circle cx="120" cy="85" r="4.5" fill="#D90368" />
        <circle cx="102" cy="80" r="4.5" fill="#00F0FF" stroke="#FFD166" strokeWidth="1.2" />
        <circle cx="138" cy="80" r="4.5" fill="#00F0FF" stroke="#FFD166" strokeWidth="1.2" />
        <circle cx="120" cy="100" r="3" fill="#FFF" />

        {/* Brilhos cintilantes */}
        <path
          d="M 120 68 L 122 73 L 127 75 L 122 77 L 120 82 L 118 77 L 113 75 L 118 73 Z"
          fill="#FFF"
        />
      </svg>
    </div>
  );
}
