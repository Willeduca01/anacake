"use client";

import { useId } from "react";

export default function ChristmasLights() {
  const uniqueId = useId();

  // 16 lâmpadas distribuídas ao longo de 4 arcos de fio
  const bulbs = [
    { x: 30, y: 16, color: "#FFE899", delay: "0s" },
    { x: 60, y: 22, color: "#FFD166", delay: "0.4s" },
    { x: 90, y: 18, color: "#FFF0C2", delay: "0.8s" },
    { x: 130, y: 15, color: "#FFB703", delay: "1.2s" },
    { x: 160, y: 22, color: "#FFE899", delay: "0.3s" },
    { x: 190, y: 17, color: "#FFD166", delay: "0.7s" },
    { x: 230, y: 16, color: "#FFF0C2", delay: "1.1s" },
    { x: 260, y: 22, color: "#FFE899", delay: "0.2s" },
    { x: 290, y: 17, color: "#FFB703", delay: "0.6s" },
    { x: 330, y: 15, color: "#FFD166", delay: "1.0s" },
    { x: 360, y: 22, color: "#FFE899", delay: "0.5s" },
    { x: 390, y: 17, color: "#FFF0C2", delay: "0.9s" },
  ];

  return (
    <div
      aria-hidden="true"
      className="w-full overflow-hidden pointer-events-none select-none -mt-1 sm:-mt-2 mb-2 sm:mb-4"
    >
      <svg
        viewBox="0 0 420 32"
        className="w-full h-8 sm:h-12 drop-shadow-[0_4px_12px_rgba(255,215,0,0.35)]"
        preserveAspectRatio="none"
      >
        <defs>
          <filter id={`glow-${uniqueId}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Fio decorativo das luzes em arcos suaves */}
        <path
          d="M 0,6 Q 50,22 100,8 Q 150,22 200,8 Q 250,22 300,8 Q 350,22 420,6"
          fill="none"
          stroke="#4A2328"
          strokeWidth="1.2"
          strokeOpacity="0.7"
        />

        {/* Lâmpadas natalinas douradas */}
        {bulbs.map((b, i) => (
          <g key={i} className="animate-pulse" style={{ animationDelay: b.delay, animationDuration: "2s" }}>
            {/* Suporte da lâmpada */}
            <rect
              x={b.x - 1.2}
              y={b.y - 4}
              width="2.4"
              height="3"
              fill="#2B1518"
              rx="0.5"
            />
            {/* Lâmpada em forma de gota */}
            <ellipse
              cx={b.x}
              cy={b.y + 2.5}
              rx="3"
              ry="4.5"
              fill={b.color}
              filter={`url(#glow-${uniqueId})`}
            />
            {/* Ponto de brilho interno */}
            <circle cx={b.x - 0.8} cy={b.y + 1} r="1" fill="#FFFFFF" opacity="0.9" />
          </g>
        ))}
      </svg>
    </div>
  );
}
