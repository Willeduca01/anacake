"use client";

import { useId } from "react";

export default function EasterEggsHeader() {
  const baseId = useId().replace(/:/g, "_");

  // Conjunto de 8 ovos decorados inspirados na arte de Páscoa artesanal
  // Cada um com sua paleta viva e padrões (corações, poás, listras, ziguezague, ondas)
  return (
    <div
      aria-hidden="true"
      className="w-full overflow-hidden pointer-events-none select-none pt-1 sm:pt-2 pb-2 sm:pb-3"
    >
      <svg
        viewBox="0 0 760 84"
        className="w-full h-12 sm:h-16 lg:h-20 drop-shadow-[0_4px_10px_rgba(74,43,32,0.08)]"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* Efeito de brilho 3D no topo do ovo */}
          <linearGradient id={`${baseId}_eggShine`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.45" />
            <stop offset="35%" stopColor="#FFFFFF" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.08" />
          </linearGradient>

          {/* OVO 1: Rosa Magenta com Corações */}
          <clipPath id={`${baseId}_clip1`}>
            <ellipse cx="48" cy="40" rx="20" ry="28" />
          </clipPath>

          {/* OVO 2: Branco com Poás Azul Celeste */}
          <clipPath id={`${baseId}_clip2`}>
            <ellipse cx="140" cy="42" rx="21" ry="29" />
          </clipPath>

          {/* OVO 3: Rosa Doce com Listras Brancas Horizontais */}
          <clipPath id={`${baseId}_clip3`}>
            <ellipse cx="236" cy="40" rx="20" ry="28" />
          </clipPath>

          {/* OVO 4: Roxo Lavanda com Ondas e Pontilhados */}
          <clipPath id={`${baseId}_clip4`}>
            <ellipse cx="332" cy="42" rx="21" ry="29" />
          </clipPath>

          {/* OVO 5: Verde Menta com Listras Verticais */}
          <clipPath id={`${baseId}_clip5`}>
            <ellipse cx="428" cy="40" rx="20" ry="28" />
          </clipPath>

          {/* OVO 6: Verde Lima com Malha/Treliça em Losango */}
          <clipPath id={`${baseId}_clip6`}>
            <ellipse cx="524" cy="42" rx="21" ry="29" />
          </clipPath>

          {/* OVO 7: Amarelo Baunilha com Zig-Zag Laranja/Caramelo */}
          <clipPath id={`${baseId}_clip7`}>
            <ellipse cx="620" cy="40" rx="20" ry="28" />
          </clipPath>

          {/* OVO 8: Rosa Suave com Poás e Faixa Dourada */}
          <clipPath id={`${baseId}_clip8`}>
            <ellipse cx="712" cy="42" rx="21" ry="29" />
          </clipPath>
        </defs>

        {/* --- OVO 1 (x=48) Rosa com Corações --- */}
        <g clipPath={`url(#${baseId}_clip1)`} transform="rotate(-3 48 40)">
          <rect x="25" y="10" width="46" height="60" fill="#E63956" />
          {/* Corações estampados */}
          <g fill="#A61530" opacity="0.9">
            <path d="M 40 24 C 40 20 44 19 46 22 C 48 19 52 20 52 24 C 52 29 46 33 46 33 C 46 33 40 29 40 24 Z" />
            <path d="M 32 38 C 32 35 35 34 37 36 C 39 34 42 35 42 38 C 42 42 37 45 37 45 C 37 45 32 42 32 38 Z" />
            <path d="M 54 38 C 54 35 57 34 59 36 C 61 34 64 35 64 38 C 64 42 59 45 59 45 C 59 45 54 42 54 38 Z" />
            <path d="M 42 52 C 42 48 46 47 48 50 C 50 47 54 48 54 52 C 54 57 48 61 48 61 C 48 61 42 57 42 52 Z" />
          </g>
          <ellipse cx="48" cy="40" rx="20" ry="28" fill={`url(#${baseId}_eggShine)`} />
        </g>

        {/* --- OVO 2 (x=140) Branco Perolado com Poás Azul Celeste --- */}
        <g clipPath={`url(#${baseId}_clip2)`} transform="rotate(2 140 42)">
          <rect x="115" y="10" width="50" height="64" fill="#FFFFFF" />
          <g fill="#00A8E8">
            <circle cx="132" cy="25" r="3.5" />
            <circle cx="150" cy="27" r="4.2" />
            <circle cx="127" cy="42" r="4" />
            <circle cx="143" cy="44" r="5" />
            <circle cx="158" cy="40" r="3.5" />
            <circle cx="133" cy="58" r="4.5" />
            <circle cx="151" cy="59" r="3.8" />
          </g>
          <ellipse cx="140" cy="42" rx="21" ry="29" fill={`url(#${baseId}_eggShine)`} />
        </g>

        {/* --- OVO 3 (x=236) Rosa com Listras Brancas Horizontais --- */}
        <g clipPath={`url(#${baseId}_clip3)`} transform="rotate(-2 236 40)">
          <rect x="212" y="10" width="48" height="60" fill="#FF5D8F" />
          <g stroke="#FFFFFF" strokeWidth="3.2" strokeLinecap="round">
            <line x1="210" y1="20" x2="262" y2="20" />
            <line x1="210" y1="28" x2="262" y2="28" strokeWidth="4.5" />
            <line x1="210" y1="38" x2="262" y2="38" strokeWidth="3" />
            <line x1="210" y1="46" x2="262" y2="46" strokeWidth="5" />
            <line x1="210" y1="56" x2="262" y2="56" strokeWidth="3.2" />
          </g>
          <ellipse cx="236" cy="40" rx="20" ry="28" fill={`url(#${baseId}_eggShine)`} />
        </g>

        {/* --- OVO 4 (x=332) Roxo com Ondas e Pontinhos --- */}
        <g clipPath={`url(#${baseId}_clip4)`} transform="rotate(3 332 42)">
          <rect x="307" y="10" width="50" height="64" fill="#8338EC" />
          <path
            d="M 305 32 Q 318 26 332 32 T 359 32"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="3.5"
          />
          <path
            d="M 305 44 Q 318 38 332 44 T 359 44"
            fill="none"
            stroke="#5A189A"
            strokeWidth="3"
          />
          <path
            d="M 305 54 Q 318 48 332 54 T 359 54"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="3.5"
          />
          <g fill="#E0AAFF">
            <circle cx="320" cy="24" r="2.2" />
            <circle cx="332" cy="22" r="2.2" />
            <circle cx="344" cy="24" r="2.2" />
            <circle cx="320" cy="38" r="2.2" />
            <circle cx="332" cy="37" r="2.2" />
            <circle cx="344" cy="38" r="2.2" />
          </g>
          <ellipse cx="332" cy="42" rx="21" ry="29" fill={`url(#${baseId}_eggShine)`} />
        </g>

        {/* --- OVO 5 (x=428) Verde Menta com Listras Verticais --- */}
        <g clipPath={`url(#${baseId}_clip5)`} transform="rotate(-3 428 40)">
          <rect x="404" y="10" width="48" height="60" fill="#2EC4B6" />
          <g stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round">
            <line x1="416" y1="12" x2="416" y2="68" strokeWidth="2.5" />
            <line x1="422" y1="12" x2="422" y2="68" strokeWidth="3.5" />
            <line x1="428" y1="12" x2="428" y2="68" strokeWidth="4" />
            <line x1="434" y1="12" x2="434" y2="68" strokeWidth="3.5" />
            <line x1="440" y1="12" x2="440" y2="68" strokeWidth="2.5" />
          </g>
          <ellipse cx="428" cy="40" rx="20" ry="28" fill={`url(#${baseId}_eggShine)`} />
        </g>

        {/* --- OVO 6 (x=524) Verde Lima com Treliça Branca e Faixa Rosa --- */}
        <g clipPath={`url(#${baseId}_clip6)`} transform="rotate(2 524 42)">
          <rect x="499" y="10" width="50" height="64" fill="#70E000" />
          {/* Treliça / Losangos brancos */}
          <g stroke="#FFFFFF" strokeWidth="1.6" opacity="0.9">
            <line x1="505" y1="15" x2="545" y2="45" />
            <line x1="500" y1="28" x2="545" y2="62" />
            <line x1="505" y1="45" x2="535" y2="68" />
            <line x1="545" y1="15" x2="505" y2="45" />
            <line x1="545" y1="28" x2="500" y2="62" />
            <line x1="540" y1="45" x2="510" y2="68" />
          </g>
          {/* Base com faixa rosa */}
          <rect x="500" y="55" width="48" height="18" fill="#FF006E" />
          <circle cx="516" cy="62" r="2.5" fill="#FFFFFF" />
          <circle cx="524" cy="62" r="2.5" fill="#FFFFFF" />
          <circle cx="532" cy="62" r="2.5" fill="#FFFFFF" />
          <ellipse cx="524" cy="42" rx="21" ry="29" fill={`url(#${baseId}_eggShine)`} />
        </g>

        {/* --- OVO 7 (x=620) Amarelo Baunilha com Zig-Zag e Poás --- */}
        <g clipPath={`url(#${baseId}_clip7)`} transform="rotate(-2 620 40)">
          <rect x="596" y="10" width="48" height="60" fill="#FFB703" />
          <path
            d="M 595 28 L 603 24 L 611 28 L 619 24 L 627 28 L 635 24 L 645 28"
            fill="none"
            stroke="#FB8500"
            strokeWidth="3.2"
            strokeLinecap="round"
          />
          <path
            d="M 595 40 L 603 36 L 611 40 L 619 36 L 627 40 L 635 36 L 645 40"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="3.2"
            strokeLinecap="round"
          />
          <path
            d="M 595 52 L 603 48 L 611 52 L 619 48 L 627 52 L 635 48 L 645 52"
            fill="none"
            stroke="#FB8500"
            strokeWidth="3.2"
            strokeLinecap="round"
          />
          <ellipse cx="620" cy="40" rx="20" ry="28" fill={`url(#${baseId}_eggShine)`} />
        </g>

        {/* --- OVO 8 (x=712) Branco com Poás Vermelhos/Coral --- */}
        <g clipPath={`url(#${baseId}_clip8)`} transform="rotate(3 712 42)">
          <rect x="687" y="10" width="50" height="64" fill="#FFFFFF" />
          <g fill="#E63946">
            <circle cx="702" cy="26" r="4" />
            <circle cx="720" cy="27" r="4.5" />
            <circle cx="698" cy="43" r="4.2" />
            <circle cx="715" cy="44" r="5" />
            <circle cx="728" cy="41" r="3.5" />
            <circle cx="704" cy="58" r="4.5" />
            <circle cx="721" cy="59" r="4" />
          </g>
          <ellipse cx="712" cy="42" rx="21" ry="29" fill={`url(#${baseId}_eggShine)`} />
        </g>

        {/* Pequenas florzinhas e estrelinhas de primavera entre os ovos */}
        <g fill="#FFAAA6" opacity="0.75">
          <circle cx="95" cy="42" r="2.5" />
          <circle cx="188" cy="38" r="2.2" />
          <circle cx="284" cy="44" r="2.5" />
          <circle cx="380" cy="38" r="2.2" />
          <circle cx="476" cy="44" r="2.5" />
          <circle cx="572" cy="38" r="2.2" />
          <circle cx="666" cy="43" r="2.5" />
        </g>
        <g fill="#06D6A0" opacity="0.6">
          <circle cx="98" cy="46" r="1.8" />
          <circle cx="185" cy="42" r="1.8" />
          <circle cx="287" cy="48" r="1.8" />
          <circle cx="377" cy="42" r="1.8" />
          <circle cx="479" cy="48" r="1.8" />
          <circle cx="569" cy="42" r="1.8" />
          <circle cx="669" cy="47" r="1.8" />
        </g>
      </svg>
    </div>
  );
}
