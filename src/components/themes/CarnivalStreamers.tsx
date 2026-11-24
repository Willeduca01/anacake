"use client";

import { useId } from "react";

export default function CarnivalStreamers() {
  const baseId = useId().replace(/:/g, "_");

  return (
    <div
      aria-hidden="true"
      className="w-full overflow-hidden pointer-events-none select-none -mt-1 sm:-mt-2 mb-2 sm:mb-4"
    >
      <svg
        viewBox="0 0 600 60"
        className="w-full h-10 sm:h-14 lg:h-16 drop-shadow-[0_4px_12px_rgba(217,3,104,0.35)]"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id={`${baseId}_gold`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FFF275" />
            <stop offset="100%" stopColor="#FF8C00" />
          </linearGradient>

          <linearGradient id={`${baseId}_magenta`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FF007F" />
            <stop offset="100%" stopColor="#9B5DE5" />
          </linearGradient>

          <linearGradient id={`${baseId}_cyan`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#00F0FF" />
            <stop offset="100%" stopColor="#00B4D8" />
          </linearGradient>

          <linearGradient id={`${baseId}_green`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#00F5D4" />
            <stop offset="100%" stopColor="#06D6A0" />
          </linearGradient>
        </defs>

        {/* Fita superior ondulada conectando todo o topo */}
        <path
          d="M 0 6 Q 60 22 120 8 Q 180 24 240 8 Q 300 24 360 8 Q 420 24 480 8 Q 540 24 600 6"
          fill="none"
          stroke={`url(#${baseId}_gold)`}
          strokeWidth="2.2"
          opacity="0.85"
        />

        {/* Serpentinas espiraladas penduradas balançando */}
        {/* Serpentina 1: Dourada (x=45) */}
        <g
          className="animate-[sway_3.2s_ease-in-out_infinite]"
          style={{ transformOrigin: "45px 6px" }}
        >
          <path
            d="M 45 6 C 35 15, 55 22, 45 32 C 35 42, 55 48, 43 56"
            fill="none"
            stroke={`url(#${baseId}_gold)`}
            strokeWidth="3.2"
            strokeLinecap="round"
          />
        </g>

        {/* Serpentina 2: Magenta (x=110) */}
        <g
          className="animate-[sway_2.8s_ease-in-out_infinite]"
          style={{ transformOrigin: "110px 8px", animationDelay: "0.4s" }}
        >
          <path
            d="M 110 8 C 122 18, 98 25, 112 36 C 124 46, 100 52, 114 60"
            fill="none"
            stroke={`url(#${baseId}_magenta)`}
            strokeWidth="3.5"
            strokeLinecap="round"
          />
        </g>

        {/* Serpentina 3: Ciano (x=175) */}
        <g
          className="animate-[sway_3.5s_ease-in-out_infinite]"
          style={{ transformOrigin: "175px 8px", animationDelay: "0.8s" }}
        >
          <path
            d="M 175 8 C 163 18, 187 26, 173 38 C 162 48, 185 54, 172 58"
            fill="none"
            stroke={`url(#${baseId}_cyan)`}
            strokeWidth="3"
            strokeLinecap="round"
          />
        </g>

        {/* Serpentina 4: Verde folia (x=240) */}
        <g
          className="animate-[sway_3s_ease-in-out_infinite]"
          style={{ transformOrigin: "240px 8px", animationDelay: "0.2s" }}
        >
          <path
            d="M 240 8 C 252 17, 230 25, 242 36 C 254 46, 232 52, 244 59"
            fill="none"
            stroke={`url(#${baseId}_green)`}
            strokeWidth="3.2"
            strokeLinecap="round"
          />
        </g>

        {/* Serpentina 5: Dourada central (x=305) */}
        <g
          className="animate-[sway_3.6s_ease-in-out_infinite]"
          style={{ transformOrigin: "305px 8px", animationDelay: "0.6s" }}
        >
          <path
            d="M 305 8 C 293 18, 317 26, 303 38 C 291 48, 315 54, 301 60"
            fill="none"
            stroke={`url(#${baseId}_gold)`}
            strokeWidth="3.5"
            strokeLinecap="round"
          />
        </g>

        {/* Serpentina 6: Magenta (x=370) */}
        <g
          className="animate-[sway_2.9s_ease-in-out_infinite]"
          style={{ transformOrigin: "370px 8px", animationDelay: "0.9s" }}
        >
          <path
            d="M 370 8 C 382 17, 360 25, 372 36 C 384 46, 362 52, 374 58"
            fill="none"
            stroke={`url(#${baseId}_magenta)`}
            strokeWidth="3.2"
            strokeLinecap="round"
          />
        </g>

        {/* Serpentina 7: Ciano (x=435) */}
        <g
          className="animate-[sway_3.3s_ease-in-out_infinite]"
          style={{ transformOrigin: "435px 8px", animationDelay: "0.3s" }}
        >
          <path
            d="M 435 8 C 423 18, 447 26, 433 38 C 421 48, 445 54, 431 60"
            fill="none"
            stroke={`url(#${baseId}_cyan)`}
            strokeWidth="3"
            strokeLinecap="round"
          />
        </g>

        {/* Serpentina 8: Verde folia (x=500) */}
        <g
          className="animate-[sway_3.1s_ease-in-out_infinite]"
          style={{ transformOrigin: "500px 8px", animationDelay: "0.7s" }}
        >
          <path
            d="M 500 8 C 512 17, 490 25, 502 36 C 514 46, 492 52, 504 57"
            fill="none"
            stroke={`url(#${baseId}_green)`}
            strokeWidth="3.2"
            strokeLinecap="round"
          />
        </g>

        {/* Serpentina 9: Dourada (x=560) */}
        <g
          className="animate-[sway_3.4s_ease-in-out_infinite]"
          style={{ transformOrigin: "560px 6px", animationDelay: "0.5s" }}
        >
          <path
            d="M 560 6 C 548 16, 570 23, 558 34 C 547 44, 568 50, 557 58"
            fill="none"
            stroke={`url(#${baseId}_gold)`}
            strokeWidth="3"
            strokeLinecap="round"
          />
        </g>

        {/* Brilhos e confetes de topo */}
        <g fill="#FFF275" opacity="0.9">
          <circle cx="75" cy="18" r="2.5" />
          <circle cx="205" cy="19" r="2.2" />
          <circle cx="340" cy="18" r="2.5" />
          <circle cx="470" cy="19" r="2.2" />
        </g>
        <g fill="#00F0FF" opacity="0.8">
          <circle cx="140" cy="22" r="2" />
          <circle cx="270" cy="20" r="2.2" />
          <circle cx="400" cy="22" r="2" />
          <circle cx="530" cy="21" r="2.2" />
        </g>
      </svg>
    </div>
  );
}
