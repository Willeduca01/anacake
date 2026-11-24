"use client";

import { useReducedMotion } from "framer-motion";

export default function CarnivalParticles() {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return null;
  }

  // 24 partículas carnavalescas (confetes circulares, papéis picados e serpentinas)
  const confetti = [
    { left: "2%", delay: "0s", dur: "6s", type: "circle", color: "#FFD166" },
    { left: "7%", delay: "2.1s", dur: "7.5s", type: "ribbon", color: "#FF007F" },
    { left: "13%", delay: "1.0s", dur: "6.8s", type: "rect", color: "#00F0FF" },
    { left: "19%", delay: "3.4s", dur: "8.2s", type: "star", color: "#FFD166" },
    { left: "25%", delay: "0.5s", dur: "7s", type: "circle", color: "#06D6A0" },
    { left: "31%", delay: "2.8s", dur: "6.5s", type: "ribbon", color: "#FB8500" },
    { left: "37%", delay: "1.5s", dur: "7.8s", type: "rect", color: "#9B5DE5" },
    { left: "43%", delay: "3.9s", dur: "8.5s", type: "star", color: "#FF007F" },
    { left: "49%", delay: "0.2s", dur: "6.2s", type: "circle", color: "#00F0FF" },
    { left: "55%", delay: "2.5s", dur: "7.4s", type: "ribbon", color: "#FFD166" },
    { left: "61%", delay: "1.2s", dur: "6.9s", type: "rect", color: "#06D6A0" },
    { left: "67%", delay: "3.2s", dur: "8.1s", type: "star", color: "#FB8500" },
    { left: "73%", delay: "0.7s", dur: "6.6s", type: "circle", color: "#FF007F" },
    { left: "79%", delay: "2.3s", dur: "7.2s", type: "ribbon", color: "#00F0FF" },
    { left: "85%", delay: "1.7s", dur: "6.7s", type: "rect", color: "#FFD166" },
    { left: "91%", delay: "3.5s", dur: "8s", type: "star", color: "#9B5DE5" },
    { left: "96%", delay: "0.9s", dur: "6.3s", type: "circle", color: "#06D6A0" },
  ];

  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 overflow-hidden pointer-events-none z-10 select-none"
    >
      {confetti.map((c, idx) => (
        <div
          key={idx}
          className="absolute top-[-25px] opacity-85 animate-[confettiFall_linear_infinite]"
          style={{
            left: c.left,
            animationDelay: c.delay,
            animationDuration: c.dur,
          }}
        >
          {c.type === "circle" ? (
            <div
              className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 rounded-full drop-shadow-[0_2px_6px_rgba(0,0,0,0.3)]"
              style={{ backgroundColor: c.color }}
            />
          ) : c.type === "rect" ? (
            <div
              className="w-2.5 h-4 sm:w-3 sm:h-5 rounded-[1px] drop-shadow-[0_2px_6px_rgba(0,0,0,0.3)]"
              style={{
                backgroundColor: c.color,
                transform: "rotate(35deg)",
              }}
            />
          ) : c.type === "ribbon" ? (
            <svg viewBox="0 0 16 30" className="w-3.5 sm:w-4.5 h-auto drop-shadow-sm">
              <path
                d="M 2 2 C 14 7, 2 15, 14 22 C 2 28, 12 30, 8 30"
                fill="none"
                stroke={c.color}
                strokeWidth="2.8"
                strokeLinecap="round"
              />
            </svg>
          ) : (
            <span
              className="text-xs sm:text-base font-bold drop-shadow-sm select-none"
              style={{ color: c.color }}
            >
              ✦
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
