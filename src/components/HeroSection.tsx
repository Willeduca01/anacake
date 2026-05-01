"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-cream">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <span className="inline-block mb-4 rounded-full bg-rose-light px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-chocolate-light">
              Confeitaria Artesanal
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight text-chocolate">
              Cada doce conta uma{" "}
              <span className="text-rose-pastel">história</span>
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-chocolate-muted max-w-lg">
              Na Ana Cake, cada receita é preparada com ingredientes selecionados e o carinho de
              quem faz confeitaria há mais de 10 anos. Dos clássicos brigadeiros aos bolos
              personalizados para festas, transformamos momentos em memórias doces.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Link
                href="/cardapio"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-rose-pastel px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-rose-pastel/30 hover:bg-chocolate-light transition-colors"
              >
                Ver Cardápio
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="https://wa.me/5511999999999"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-rose-pastel px-7 py-3 text-sm font-semibold text-chocolate hover:bg-rose-light transition-colors"
              >
                Fazer Encomenda
              </a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative"
          >
            <div className="relative aspect-square max-w-lg mx-auto rounded-3xl overflow-hidden shadow-2xl">
              <Image
                src="https://images.unsplash.com/photo-1558301211-0d8c8ddee6ec?w=600&h=600&fit=crop"
                alt="Doces artesanais da Ana Cake"
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
            <div className="absolute -bottom-4 -left-4 h-24 w-24 rounded-full bg-rose-light/60 blur-xl" />
            <div className="absolute -top-4 -right-4 h-32 w-32 rounded-full bg-cream-dark/60 blur-xl" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
