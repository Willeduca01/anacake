"use client";

import { useId } from "react";

export default function EasterGarland() {
  const uniqueId = useId();

  // Ovos decorativos e raminhos pendurados na guirlanda superior
  const items = [
    { x: 35, y: 18, color: "#F4ACB7", decor: "#FFF", delay: "0s" },
    { x: 75, y: 24, color: "#D8E2DC", decor: "#D4A373", delay: "0.3s" },
    { x: 115, y: 17, color: "#FFE5D9", decor: "#FFF", delay: "0.6s" },
    { x: 155, y: 23, color: "#D4A373", decor: "#FFF", delay: "0.2s" },
    { x: 195, y: 16, color: "#E8D7F1", decor: "#9F86C0", delay: "0.8s" },
    { x: 235, y: 22, color: "#F4ACB7", decor: "#FFF", delay: "0.4s" },
    { x: 275, y: 17, color: "#D8E2DC", decor: "#588157", delay: "0.7s" },
    { x: 315, y: 24, color: "#D4A373", decor: "#FFF", delay: "0.1s" },
    { x: 355, y: 18, color: "#E8D7F1", decor: "#FFF", delay: "0.5s" },
    { x: 390, y: 22, color: "#FFE5D9", decor: "#D4A373", delay: "0.9s" },
  ];

  return (
    <div
      aria-hidden="true"
      className="w-full overflow-hidden pointer-events-none select-none -mt-1 sm:-mt-2 mb-2 sm:mb-4"
    >
      <svg
        viewBox="0 0 420 36"
        className="w-full h-9 sm:h-12 drop-shadow-[0_4px_12px_rgba(212,163,115,0.35)]"
        preserveAspectRatio="none"
      >
        <defs>
          <filter id={`easter-glow-${uniqueId}`} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="1.8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Raminho de folhas e fita delicada suspensa */}
        <path
          d="M 0,8 Q 50,24 100,10 Q 150,24 200,10 Q 250,24 300,10 Q 350,24 420,8"
          fill="none"
          stroke="#7A4C3A"
          strokeWidth="1.4"
          strokeOpacity="0.8"
        />

        {/* Folhinhas decorativas nos nós */}
        {[50, 100, 150, 200, 250, 300, 350].map((nx) => (
          <g key={nx} fill="#A3B18A" opacity="0.85">
            <ellipse cx={nx - 4} cy={16} rx="3" ry="1.5" transform={`rotate(-25 ${nx - 4} 16)`} />
            <ellipse cx={nx + 4} cy={16} rx="3" ry="1.5" transform={`rotate(25 ${nx + 4} 16)`} />
          </g>
        ))}

        {/* Pequenos ovinhos de Páscoa em tons pastel pendurados */}
        {items.map((it, i) => (
          <g key={i} className="animate-pulse" style={{ animationDelay: it.delay, animationDuration: "2.4s" }}>
            {/* Lacinho do topo */}
            <path
              d={`M ${it.x - 2} ${it.y - 4} Q ${it.x} ${it.y - 6} ${it.x + 2} ${it.y - 4}`}
              stroke="#D4A373"
              strokeWidth="1"
              fill="none"
            />
            {/* Ovinho estilizado */}
            <ellipse
              cx={it.x}
              cy={it.y + 2}
              rx="3.5"
              ry="5"
              fill={it.color}
              filter={`url(#easter-glow-${uniqueId})`}
            />
            {/* Detalhe/Faixa delicada no ovo */}
            <path
              d={`M ${it.x - 3} ${it.y + 2} Q ${it.x} ${it.y + 4} ${it.x + 3} ${it.y + 2}`}
              stroke={it.decor}
              strokeWidth="0.8"
              fill="none"
              opacity="0.85"
            />
          </g>
        ))}
      </svg>
    </div>
  );
}
