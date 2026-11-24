"use client";

import { useId } from "react";

export default function MothersDayFloralHeader() {
  const baseId = useId().replace(/:/g, "_");

  return (
    <div
      aria-hidden="true"
      className="w-full overflow-hidden pointer-events-none select-none pt-0.5 sm:pt-1 pb-1 sm:pb-2"
    >
      <svg
        viewBox="0 0 700 70"
        className="w-full h-11 sm:h-14 lg:h-16 drop-shadow-[0_4px_14px_rgba(229,152,155,0.25)]"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* Gradiente Rosa Suave */}
          <linearGradient id={`${baseId}_roseSoft`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FFF5F2" />
            <stop offset="40%" stopColor="#F8AD9D" />
            <stop offset="100%" stopColor="#E5989B" />
          </linearGradient>

          {/* Gradiente Rosa Queimado / Marsala Claro */}
          <linearGradient id={`${baseId}_roseMarsala`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FFCAD4" />
            <stop offset="100%" stopColor="#B56576" />
          </linearGradient>

          {/* Gradiente Folhas de Eucalipto / Sálvia */}
          <linearGradient id={`${baseId}_sage`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#D8E2DC" />
            <stop offset="100%" stopColor="#95A78D" />
          </linearGradient>

          {/* Gradiente Dourado Rosé */}
          <linearGradient id={`${baseId}_roseGold`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FFF6EE" />
            <stop offset="50%" stopColor="#E6B8A2" />
            <stop offset="100%" stopColor="#DDA15E" />
          </linearGradient>
        </defs>

        {/* ========================================================
            1. RAMO FLORAL DA BORDA SUPERIOR ESQUERDA (SEM CORDA)
           ======================================================== */}
        <g>
          {/* Folhinhas de sálvia se estendendo suavemente para o centro */}
          <ellipse cx="25" cy="18" rx="14" ry="6" fill={`url(#${baseId}_sage)`} transform="rotate(18 25 18)" opacity="0.85" />
          <ellipse cx="55" cy="14" rx="12" ry="5.5" fill={`url(#${baseId}_sage)`} transform="rotate(32 55 14)" opacity="0.9" />
          <ellipse cx="85" cy="22" rx="11" ry="5" fill={`url(#${baseId}_sage)`} transform="rotate(-15 85 22)" opacity="0.85" />
          <ellipse cx="115" cy="16" rx="9" ry="4" fill={`url(#${baseId}_sage)`} transform="rotate(22 115 16)" opacity="0.75" />
          <ellipse cx="140" cy="24" rx="8" ry="3.5" fill={`url(#${baseId}_sage)`} transform="rotate(-10 140 24)" opacity="0.7" />

          {/* Rosa Peônia Aberta no canto esquerdo (x=38, y=36) */}
          <g>
            <circle cx="38" cy="36" r="16" fill={`url(#${baseId}_roseMarsala)`} opacity="0.92" />
            <circle cx="37" cy="34" r="12" fill={`url(#${baseId}_roseSoft)`} />
            <circle cx="38" cy="35" r="7.5" fill="#E5989B" />
            <circle cx="39" cy="36" r="3.5" fill={`url(#${baseId}_roseGold)`} />
            {/* Contornos suaves de pétalas */}
            <path d="M 28 34 C 34 26, 44 26, 48 34" fill="none" stroke="#FFFFFF" strokeWidth="1" opacity="0.7" />
            <path d="M 31 38 C 36 43, 42 43, 46 38" fill="none" stroke="#FFFFFF" strokeWidth="1" opacity="0.7" />
          </g>

          {/* Rosa Chá Intermediária (x=72, y=28) */}
          <g>
            <circle cx="72" cy="28" r="12" fill={`url(#${baseId}_roseSoft)`} />
            <circle cx="71" cy="27" r="8" fill="#FFCAD4" />
            <circle cx="72" cy="28" r="4.5" fill="#E5989B" />
            <circle cx="73" cy="28" r="2" fill={`url(#${baseId}_roseGold)`} />
          </g>

          {/* Botão de Rosa e broto (x=102, y=32) */}
          <g>
            <ellipse cx="102" cy="32" rx="7.5" ry="9" fill={`url(#${baseId}_roseMarsala)`} transform="rotate(15 102 32)" />
            <ellipse cx="101" cy="31" rx="5" ry="6.5" fill={`url(#${baseId}_roseSoft)`} transform="rotate(15 101 31)" />
          </g>

          {/* Mini botões e detalhes perolados florais */}
          <circle cx="126" cy="22" r="4" fill="#FFCAD4" />
          <circle cx="148" cy="20" r="3" fill="#F8AD9D" />
          <circle cx="162" cy="25" r="2.2" fill={`url(#${baseId}_roseGold)`} />
        </g>

        {/* ========================================================
            2. RAMO FLORAL DA BORDA SUPERIOR DIREITA (SEM CORDA)
           ======================================================== */}
        <g>
          {/* Folhinhas de sálvia se estendendo suavemente para o centro */}
          <ellipse cx="675" cy="18" rx="14" ry="6" fill={`url(#${baseId}_sage)`} transform="rotate(-18 675 18)" opacity="0.85" />
          <ellipse cx="645" cy="14" rx="12" ry="5.5" fill={`url(#${baseId}_sage)`} transform="rotate(-32 645 14)" opacity="0.9" />
          <ellipse cx="615" cy="22" rx="11" ry="5" fill={`url(#${baseId}_sage)`} transform="rotate(15 615 22)" opacity="0.85" />
          <ellipse cx="585" cy="16" rx="9" ry="4" fill={`url(#${baseId}_sage)`} transform="rotate(-22 585 16)" opacity="0.75" />
          <ellipse cx="560" cy="24" rx="8" ry="3.5" fill={`url(#${baseId}_sage)`} transform="rotate(10 560 24)" opacity="0.7" />

          {/* Rosa Peônia Aberta no canto direito (x=662, y=36) */}
          <g>
            <circle cx="662" cy="36" r="16" fill={`url(#${baseId}_roseMarsala)`} opacity="0.92" />
            <circle cx="663" cy="34" r="12" fill={`url(#${baseId}_roseSoft)`} />
            <circle cx="662" cy="35" r="7.5" fill="#E5989B" />
            <circle cx="661" cy="36" r="3.5" fill={`url(#${baseId}_roseGold)`} />
            {/* Contornos suaves de pétalas */}
            <path d="M 652 34 C 658 26, 668 26, 672 34" fill="none" stroke="#FFFFFF" strokeWidth="1" opacity="0.7" />
            <path d="M 655 38 C 660 43, 666 43, 670 38" fill="none" stroke="#FFFFFF" strokeWidth="1" opacity="0.7" />
          </g>

          {/* Rosa Chá Intermediária (x=628, y=28) */}
          <g>
            <circle cx="628" cy="28" r="12" fill={`url(#${baseId}_roseSoft)`} />
            <circle cx="629" cy="27" r="8" fill="#FFCAD4" />
            <circle cx="628" cy="28" r="4.5" fill="#E5989B" />
            <circle cx="627" cy="28" r="2" fill={`url(#${baseId}_roseGold)`} />
          </g>

          {/* Botão de Rosa e broto (x=598, y=32) */}
          <g>
            <ellipse cx="598" cy="32" rx="7.5" ry="9" fill={`url(#${baseId}_roseMarsala)`} transform="rotate(-15 598 32)" />
            <ellipse cx="599" cy="31" rx="5" ry="6.5" fill={`url(#${baseId}_roseSoft)`} transform="rotate(-15 599 31)" />
          </g>

          {/* Mini botões e detalhes perolados florais */}
          <circle cx="574" cy="22" r="4" fill="#FFCAD4" />
          <circle cx="552" cy="20" r="3" fill="#F8AD9D" />
          <circle cx="538" cy="25" r="2.2" fill={`url(#${baseId}_roseGold)`} />
        </g>

        {/* ========================================================
            3. CENTRO ABERTO E LIMPO COM PÉTALAS LEVES E BRILHO SUAVE
           ======================================================== */}
        <g fill="#DDA15E" opacity="0.6">
          <circle cx="210" cy="18" r="1.8" />
          <circle cx="270" cy="24" r="1.5" />
          <circle cx="350" cy="16" r="2.2" />
          <circle cx="430" cy="24" r="1.5" />
          <circle cx="490" cy="18" r="1.8" />
        </g>

        {/* Duas pequenas pétalas flutuando perto do topo */}
        <path
          d="M 235 22 C 240 18, 244 24, 237 28 C 232 26, 231 23, 235 22 Z"
          fill="#F8AD9D"
          opacity="0.65"
        />
        <path
          d="M 465 22 C 460 18, 456 24, 463 28 C 468 26, 469 23, 465 22 Z"
          fill="#F8AD9D"
          opacity="0.65"
        />
      </svg>
    </div>
  );
}
