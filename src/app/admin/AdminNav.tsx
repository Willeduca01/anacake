"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/produtos", label: "Produtos" },
  { href: "/admin/vendas", label: "Vendas" },
  { href: "/admin/pedidos", label: "Pedidos" },
];

export default function AdminNav({
  pedidosPendentes = 0,
}: {
  pedidosPendentes?: number;
}) {
  const pathname = usePathname();
  const [pendentes, setPendentes] = useState(pedidosPendentes);

  useEffect(() => {
    let ativo = true;
    const buscar = async () => {
      try {
        const res = await fetch("/api/admin/pedidos-count", {
          cache: "no-store",
        });
        if (!res.ok) return;
        const data = await res.json();
        if (ativo && typeof data.count === "number") setPendentes(data.count);
      } catch {
        // silencioso: mantem o ultimo valor conhecido
      }
    };
    const id = setInterval(buscar, 20000);
    buscar();
    return () => {
      ativo = false;
      clearInterval(id);
    };
  }, [pathname]);

  return (
    <nav className="flex gap-1">
      {links.map((link) => {
        const active =
          link.href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(link.href);
        const isPedidos = link.href === "/admin/pedidos";
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`relative rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              active
                ? "bg-rose-pastel text-white"
                : "text-chocolate-muted hover:bg-rose-light"
            }`}
          >
            {link.label}
            {isPedidos && pendentes > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center h-5 min-w-5 rounded-full bg-badge-red px-1.5 text-xs font-bold text-badge-red-text">
                {pendentes}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
