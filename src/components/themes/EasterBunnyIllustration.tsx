"use client";

interface EasterBunnyIllustrationProps {
  side?: "left" | "right";
  className?: string;
}

export default function EasterBunnyIllustration({
  side = "left",
  className = "w-10 h-10 sm:w-14 sm:h-14 text-[#06B6D4]",
}: EasterBunnyIllustrationProps) {
  const isRight = side === "right";

  return (
    <div
      aria-hidden="true"
      className={`inline-flex items-center justify-center select-none pointer-events-none transition-transform duration-300 hover:scale-105 ${
        isRight ? "scale-x-[-1]" : ""
      } ${className}`}
    >
      <svg
        viewBox="0 0 80 80"
        fill="currentColor"
        className="w-full h-full drop-shadow-xs"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Rabinho fofo de pompom */}
        <circle cx="12" cy="56" r="8" fill="currentColor" opacity="0.95" />
        <circle cx="11" cy="55" r="5" fill="#FFFFFF" opacity="0.4" />

        {/* Corpo gordinho e fofo do coelho sentado */}
        <path
          d="M 16 54 C 14 42, 24 36, 36 38 C 42 39, 48 42, 50 48 C 53 55, 49 68, 36 70 C 23 72, 17 64, 16 54 Z"
          fill="currentColor"
        />

        {/* Patinha traseira de apoio */}
        <ellipse cx="28" cy="67" rx="14" ry="7" fill="currentColor" />
        <ellipse cx="28" cy="67" rx="10" ry="4" fill="#FFFFFF" opacity="0.25" />

        {/* Patinha dianteira apoiada */}
        <ellipse cx="50" cy="65" rx="7" ry="5" fill="currentColor" transform="rotate(-15 50 65)" />

        {/* Cabeça arredondada com focinho empinado */}
        <path
          d="M 37 38 C 34 30, 40 20, 50 20 C 58 20, 68 25, 68 33 C 68 39, 60 45, 50 44 C 44 44, 39 42, 37 38 Z"
          fill="currentColor"
        />

        {/* Orelhas compridas erguidas em formato clássico de coelho */}
        {/* Orelha traseira */}
        <path
          d="M 44 23 C 43 14, 45 4, 51 2 C 55 1, 56 8, 52 19 Z"
          fill="currentColor"
          opacity="0.85"
        />
        {/* Orelha frontal mais destacada */}
        <path
          d="M 50 22 C 51 12, 55 3, 62 1 C 67 0, 68 7, 60 19 Z"
          fill="currentColor"
        />
        {/* Miolo rosado/suave da orelha frontal */}
        <path
          d="M 53 19 C 54 12, 57 5, 62 4 C 65 3, 65 8, 59 17 Z"
          fill="#FFFFFF"
          opacity="0.45"
        />

        {/* Detalhe de olhinho e bochecha delicada */}
        <circle cx="58" cy="28" r="2.2" fill="#FFFFFF" />
        <circle cx="58.5" cy="27.5" r="0.9" fill="#2A1B16" />
        <circle cx="66" cy="33" r="1.5" fill="#FFA5AB" opacity="0.8" />
      </svg>
    </div>
  );
}
