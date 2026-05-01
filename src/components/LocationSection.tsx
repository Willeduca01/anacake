"use client";

import { motion } from "framer-motion";
import { MapPin, Clock, ExternalLink } from "lucide-react";

export default function LocationSection() {
  const enderecoGoogle = encodeURI(
    "https://www.google.com/maps/search/Rua+das+Flores,+123+-+Centro,+São+Paulo+-+SP"
  );

  return (
    <section id="localizacao" className="py-20 sm:py-28 bg-cream">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="inline-block mb-3 text-xs font-semibold uppercase tracking-wider text-rose-pastel">
            Visite-nos
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-chocolate">
            Onde Estamos
          </h2>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-2xl rounded-2xl bg-white border border-rose-light p-8 sm:p-10 shadow-sm"
        >
          <div className="flex flex-col sm:flex-row gap-8">
            <div className="flex-1 space-y-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-rose-light flex items-center justify-center text-rose-pastel">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-chocolate mb-1">Endereço</h3>
                  <p className="text-sm text-chocolate-muted leading-relaxed">
                    Rua das Flores, 123 — Centro
                    <br />
                    São Paulo — SP, 01000-000
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-rose-light flex items-center justify-center text-rose-pastel">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-chocolate mb-1">Horário</h3>
                  <p className="text-sm text-chocolate-muted leading-relaxed">
                    Seg a Sex: 9h — 19h
                    <br />
                    Sáb: 9h — 16h
                    <br />
                    Dom: Fechado
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-end sm:items-center">
              <a
                href={enderecoGoogle}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-rose-pastel px-6 py-3 text-sm font-semibold text-white shadow-md shadow-rose-pastel/20 hover:bg-chocolate-light transition-colors w-full sm:w-auto justify-center"
              >
                <ExternalLink className="h-4 w-4" />
                Abrir no Google Maps
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
