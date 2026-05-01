"use client";

import { motion } from "framer-motion";
import { Candy, Sandwich, Cake, Heart, PartyPopper } from "lucide-react";
import type { ReactNode } from "react";

interface Servico {
  icon: ReactNode;
  titulo: string;
  descricao: string;
}

const servicos: Servico[] = [
  {
    icon: <Candy className="h-8 w-8" />,
    titulo: "Doces Finos",
    descricao:
      "Brigadeiros gourmet, trufas, beijinhos e muito mais. Perfeitos para qualquer ocasião.",
  },
  {
    icon: <Sandwich className="h-8 w-8" />,
    titulo: "Salgados",
    descricao:
      "Coxinhas, empadinhas, quiches e esfihas feitas com ingredientes frescos e selecionados.",
  },
  {
    icon: <Cake className="h-8 w-8" />,
    titulo: "Bolos para Festas",
    descricao:
      "Bolos decorados e personalizados para aniversários, casamentos e celebrações especiais.",
  },
  {
    icon: <Heart className="h-8 w-8" />,
    titulo: "Brigadeiros Gourmet",
    descricao:
      "Nossa especialidade: brigadeiros com chocolate belga em sabores exclusivos e criativos.",
  },
  {
    icon: <PartyPopper className="h-8 w-8" />,
    titulo: "Docinhos para Eventos",
    descricao:
      "Mesas de doces completas para eventos corporativos, festas e confraternizações.",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function ServicesSection() {
  return (
    <section id="servicos" className="py-20 sm:py-28 bg-warm-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="inline-block mb-3 text-xs font-semibold uppercase tracking-wider text-rose-pastel">
            O que fazemos
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-chocolate">
            Nossos Serviços
          </h2>
          <p className="mt-4 text-chocolate-muted max-w-2xl mx-auto">
            Oferecemos uma variedade de opções artesanais para tornar cada momento ainda mais
            especial e saboroso.
          </p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {servicos.map((servico) => (
            <motion.div
              key={servico.titulo}
              variants={cardVariants}
              className="group rounded-2xl border border-rose-light bg-white p-8 shadow-sm hover:shadow-lg hover:border-rose-pastel transition-all duration-300"
            >
              <div className="mb-5 inline-flex items-center justify-center h-14 w-14 rounded-xl bg-rose-light text-rose-pastel group-hover:bg-rose-pastel group-hover:text-white transition-colors duration-300">
                {servico.icon}
              </div>
              <h3 className="text-lg font-semibold text-chocolate mb-2">{servico.titulo}</h3>
              <p className="text-sm leading-relaxed text-chocolate-muted">{servico.descricao}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
