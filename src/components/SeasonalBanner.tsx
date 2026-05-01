"use client";

import { motion } from "framer-motion";
import { Gift, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function SeasonalBanner() {
  return (
    <section className="py-16 sm:py-20 bg-warm-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-chocolate to-chocolate-light p-8 sm:p-12 lg:p-16"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-rose-pastel/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-rose-pastel/10 rounded-full translate-y-1/2 -translate-x-1/2" />

          <div className="relative flex flex-col lg:flex-row items-start lg:items-center gap-6 lg:gap-12">
            <div className="flex-shrink-0 h-16 w-16 rounded-2xl bg-rose-pastel/20 flex items-center justify-center">
              <Gift className="h-8 w-8 text-rose-light" />
            </div>

            <div className="flex-1">
              <span className="inline-block mb-2 text-xs font-semibold uppercase tracking-wider text-rose-pastel">
                Novidade da Temporada
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                Coleção Especial de Dia das Mães
              </h2>
              <p className="text-cream-dark/80 max-w-xl">
                Kits exclusivos com brigadeiros, trufas e mini bolos decorados. Encomende até 5 de
                maio e ganhe uma caixa personalizada de presente.
              </p>
            </div>

            <Link
              href="/cardapio"
              className="flex-shrink-0 inline-flex items-center gap-2 rounded-full bg-rose-pastel px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-black/20 hover:bg-rose-soft hover:text-chocolate transition-colors"
            >
              Conferir
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
