"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, AtSign, Phone, ShoppingBag } from "lucide-react";
import { useCart } from "@/contexts/CartContext";

const navLinks = [
  { href: "/", label: "Início" },
  { href: "/#servicos", label: "Serviços" },
  { href: "/#localizacao", label: "Localização" },
  { href: "/cardapio", label: "Cardápio" },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { totalItens, toggleSacola } = useCart();

  return (
    <header className="sticky top-0 z-50 bg-warm-white/90 backdrop-blur-md border-b border-rose-light">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <Image
              src="/logo.png"
              alt="Ana Cake"
              width={44}
              height={44}
              className="rounded-full transition-transform group-hover:scale-105"
            />
            <span className="text-lg font-bold tracking-tight text-chocolate">
              Ana Cake
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-chocolate-light hover:text-rose-pastel transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleSacola}
              className="relative p-2 text-chocolate-light hover:text-rose-pastel transition-colors"
              aria-label="Abrir sacola"
            >
              <ShoppingBag className="h-5 w-5" />
              {totalItens > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-0.5 -right-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-pastel px-1 text-[10px] font-bold text-white"
                >
                  {totalItens}
                </motion.span>
              )}
            </button>

            <div className="hidden md:flex items-center gap-3">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-chocolate-muted hover:text-rose-pastel transition-colors"
              >
                <AtSign className="h-5 w-5" />
              </a>
              <a
                href="https://wa.me/5511999999999"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-rose-pastel px-5 py-2 text-sm font-medium text-white hover:bg-chocolate-light transition-colors"
              >
                <Phone className="h-4 w-4" />
                Pedir Agora
              </a>
            </div>

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 text-chocolate-light"
              aria-label="Abrir menu"
            >
              {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden overflow-hidden bg-warm-white border-t border-rose-light"
          >
            <nav className="flex flex-col px-6 py-4 gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="text-sm font-medium text-chocolate-light hover:text-rose-pastel transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <a
                href="https://wa.me/5511999999999"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-rose-pastel px-5 py-2.5 text-sm font-medium text-white hover:bg-chocolate-light transition-colors"
              >
                <Phone className="h-4 w-4" />
                Pedir Agora
              </a>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
