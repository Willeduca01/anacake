"use client";

import { useReducedMotion } from "framer-motion";

export default function MothersDayPetals() {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return null;
  }

  // Pétalas de rosa e corações minimalistas flutuando com balanço lateral
  const items = [
    { left: "4%", delay: "0s", dur: "8.5s", type: "petal", color: "#FFB5A7" },
    { left: "12%", delay: "2.8s", dur: "9.5s", type: "heart", color: "#E5989B" },
    { left: "21%", delay: "1.2s", dur: "8.8s", type: "petal", color: "#FCD5CE" },
    { left: "30%", delay: "3.7s", dur: "10.2s", type: "sparkle", color: "#DDA15E" },
    { left: "39%", delay: "0.6s", dur: "8.2s", type: "petal", color: "#E5989B" },
    { left: "48%", delay: "4.5s", dur: "9.8s", type: "heart", color: "#FFCAD4" },
    { left: "57%", delay: "1.9s", dur: "8.6s", type: "petal", color: "#FFB5A7" },
    { left: "66%", delay: "3.1s", dur: "9.2s", type: "petal", color: "#FCD5CE" },
    { left: "75%", delay: "0.4s", dur: "8.0s", type: "sparkle", color: "#DDA15E" },
    { left: "83%", delay: "2.5s", dur: "9.6s", type: "heart", color: "#E5989B" },
    { left: "91%", delay: "1.4s", dur: "8.4s", type: "petal", color: "#FFB5A7" },
    { left: "96%", delay: "3.9s", dur: "10s", type: "petal", color: "#FCD5CE" },
  ];

  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 overflow-hidden pointer-events-none z-10 select-none"
    >
      {items.map((it, idx) => (
        <div
          key={idx}
          className="absolute top-[-25px] opacity-80 animate-[petalFall_linear_infinite]"
          style={{
            left: it.left,
            animationDelay: it.delay,
            animationDuration: it.dur,
          }}
        >
          {it.type === "petal" ? (
            /* Pétala de rosa suave em SVG */
            <svg viewBox="0 0 16 20" className="w-3 sm:w-4 h-auto drop-shadow-xs">
              <path
                d="M 8 2 C 14 6, 15 14, 8 18 C 1 14, 2 6, 8 2 Z"
                fill={it.color}
                opacity="0.9"
              />
              <path
                d="M 8 5 Q 9 10 8 15"
                stroke="#FFF"
                strokeWidth="0.8"
                fill="none"
                opacity="0.4"
              />
            </svg>
          ) : it.type === "heart" ? (
            /* Coração minimalista */
            <svg viewBox="0 0 16 16" className="w-2.5 sm:w-3.5 h-auto drop-shadow-xs">
              <path
                d="M 8 14 C 8 14, 1.5 9.5, 1.5 5 C 1.5 2.5, 3.5 1.5, 5.5 1.5 C 7 1.5, 7.8 2.5, 8 3 C 8.2 2.5, 9 1.5, 10.5 1.5 C 12.5 1.5, 14.5 2.5, 14.5 5 C 14.5 9.5, 8 14, 8 14 Z"
                fill={it.color}
                opacity="0.85"
              />
            </svg>
          ) : (
            /* Faísca dourada sutil */
            <span
              className="text-[10px] sm:text-xs font-bold drop-shadow-xs select-none"
              style={{ color: it.color }}
            >
              ✦
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
