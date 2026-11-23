"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, AtSign, Phone, ShoppingBag, Mail } from "lucide-react";
import { useCart } from "@/contexts/CartContext";

const navLinks = [
  { href: "/inicio", label: "Início" },
  { href: "/inicio#servicos", label: "Serviços" },
  { href: "/inicio#localizacao", label: "Localização" },
  { href: "/cardapio", label: "Cardápio" },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const [activeHash, setActiveHash] = useState("");
  const { totalItens, toggleSacola } = useCart();

  useEffect(() => {
    setActiveHash(window.location.hash || "");
    const updateHash = () => {
      setActiveHash(window.location.hash || "");
    };
    window.addEventListener("hashchange", updateHash);
    return () => window.removeEventListener("hashchange", updateHash);
  }, [pathname]);

  // Observer para quando o usuário rolar a página em /inicio
  useEffect(() => {
    if (pathname !== "/inicio") return;

    const sections = ["inicio", "servicos", "localizacao"];
    const elements = sections
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((entry) => entry.isIntersecting);
        if (visible) {
          const id = visible.target.id;
          setActiveHash(id === "inicio" ? "" : "#" + id);
        }
      },
      {
        rootMargin: "-20% 0px -60% 0px",
        threshold: 0,
      }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [pathname]);

  const isLinkActive = (href: string) => {
    if (href === "/cardapio") {
      return pathname === "/cardapio";
    }
    if (pathname !== "/inicio") {
      return false;
    }
    if (href === "/inicio#servicos") {
      return activeHash === "#servicos";
    }
    if (href === "/inicio#localizacao") {
      return activeHash === "#localizacao";
    }
    if (href === "/inicio") {
      return !activeHash || activeHash === "#inicio";
    }
    return false;
  };

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith("/inicio#")) {
      const hash = href.split("#")[1];
      if (pathname === "/inicio") {
        const el = document.getElementById(hash);
        if (el) {
          e.preventDefault();
          el.scrollIntoView({ behavior: "smooth" });
          window.history.pushState(null, "", href);
          setActiveHash("#" + hash);
        }
      }
    } else if (href === "/inicio" && pathname === "/inicio") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
      window.history.pushState(null, "", "/inicio");
      setActiveHash("");
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-warm-white/95 backdrop-blur-md border-b border-rose-light/70 shadow-xs">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 sm:h-16 items-center justify-between">
          <Link href="/cardapio" className="flex items-center gap-2 group">
            <Image
              src="/logo.png"
              alt="Ana Cake"
              width={38}
              height={38}
              className="rounded-full transition-transform group-hover:scale-105"
            />
            <span className="text-base sm:text-lg font-bold tracking-tight text-chocolate">
              Ana Cake
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const active = isLinkActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={(e) => handleLinkClick(e, link.href)}
                  className={`text-sm font-medium transition-colors relative py-1 ${
                    active
                      ? "text-rose-pastel font-semibold"
                      : "text-chocolate-light hover:text-rose-pastel"
                  }`}
                >
                  {link.label}
                  {active && (
                    <motion.span
                      layoutId="activeNavIndicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-rose-pastel rounded-full"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-1.5 sm:gap-3">
            {/* Ícone sutil de mensagens/contato */}
            <a
              href="https://wa.me/5519978293375"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-chocolate-muted hover:text-rose-pastel transition-colors rounded-full hover:bg-rose-light/30"
              aria-label="Fale conosco no WhatsApp"
              title="Fale Conosco"
            >
              <Mail className="h-5 w-5" />
            </a>

            <button
              onClick={toggleSacola}
              className="relative p-2 text-chocolate-light hover:text-rose-pastel transition-colors rounded-full hover:bg-rose-light/30"
              aria-label="Abrir sacola"
            >
              <ShoppingBag className="h-5 w-5" />
              {totalItens > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-0.5 -right-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-pastel px-1 text-[10px] font-bold text-white shadow-xs"
                >
                  {totalItens}
                </motion.span>
              )}
            </button>

            <div className="hidden md:flex items-center gap-3">
              <a
                href="https://www.instagram.com/confeitaria_ana_cake"
                target="_blank"
                rel="noopener noreferrer"
                className="text-chocolate-muted hover:text-rose-pastel transition-colors"
              >
                <AtSign className="h-5 w-5" />
              </a>
              <a
                href="https://wa.me/5519978293375"
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
            <nav className="flex flex-col px-6 py-4 gap-2">
              {navLinks.map((link) => {
                const active = isLinkActive(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={(e) => {
                      setMobileOpen(false);
                      handleLinkClick(e, link.href);
                    }}
                    className={`text-sm font-medium rounded-xl px-3 py-2 transition-colors ${
                      active
                        ? "bg-rose-light/40 text-rose-pastel font-semibold"
                        : "text-chocolate-light hover:text-rose-pastel hover:bg-rose-light/20"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
              <a
                href="https://wa.me/5519978293375"
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
