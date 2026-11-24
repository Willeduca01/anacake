"use client";

import { useReducedMotion } from "framer-motion";

export default function EasterParticles() {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return null;
  }

  // Partículas leves com cores vivas e delicadas para o fundo claro de Páscoa
  const particles = [
    { left: "4%", delay: "0s", dur: "7.5s", type: "egg", color: "#FF5D8F" },
    { left: "12%", delay: "2.5s", dur: "8.5s", type: "sparkle", color: "#FFB703" },
    { left: "21%", delay: "1.2s", dur: "7.8s", type: "flower", color: "#FF758F" },
    { left: "29%", delay: "3.5s", dur: "9.2s", type: "egg", color: "#00A8E8" },
    { left: "38%", delay: "0.8s", dur: "6.8s", type: "sparkle", color: "#D4A373" },
    { left: "47%", delay: "4.2s", dur: "8.2s", type: "flower", color: "#9D4EDD" },
    { left: "56%", delay: "1.8s", dur: "7.4s", type: "egg", color: "#2EC4B6" },
    { left: "65%", delay: "3.1s", dur: "8.8s", type: "sparkle", color: "#FFB703" },
    { left: "74%", delay: "0.4s", dur: "7.1s", type: "flower", color: "#FF5D8F" },
    { left: "82%", delay: "2.9s", dur: "8.3s", type: "egg", color: "#FFB703" },
    { left: "91%", delay: "1.5s", dur: "7.6s", type: "carrot", color: "#FB8500" },
    { left: "96%", delay: "3.8s", dur: "9.0s", type: "sparkle", color: "#2EC4B6" },
  ];

  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 overflow-hidden pointer-events-none z-10 select-none"
    >
      {particles.map((p, idx) => (
        <div
          key={idx}
          className="absolute top-[-24px] opacity-75 animate-[floatDown_linear_infinite]"
          style={{
            left: p.left,
            animationDelay: p.delay,
            animationDuration: p.dur,
          }}
        >
          {p.type === "egg" ? (
            <svg viewBox="0 0 16 22" className="w-3.5 sm:w-4 h-auto drop-shadow-xs">
              <ellipse cx="8" cy="11" rx="6.5" ry="9" fill={p.color} />
              <path
                d="M 2.5 11 Q 8 14 13.5 11"
                stroke="#FFFFFF"
                strokeWidth="1.2"
                fill="none"
                opacity="0.85"
              />
            </svg>
          ) : p.type === "flower" ? (
            <span className="text-xs sm:text-sm opacity-85 select-none">🌸</span>
          ) : p.type === "carrot" ? (
            <span className="text-[11px] sm:text-xs opacity-85 select-none">🥕</span>
          ) : (
            <span className="text-[10px] sm:text-xs text-[#E68A00] font-bold opacity-80 select-none">
              ✦
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
