import Link from "next/link";
import {
  getDashboardFinanceiro,
  type PeriodoFiltro,
} from "@/lib/dashboard";
import { ComparativoFluxoChart } from "@/app/admin/DashboardCharts";
import {
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
  Receipt,
  ShoppingCart,
  Calendar,
  PackagePlus,
  ArrowRight,
} from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Dashboard Financeiro | Admin Ana Cake",
  robots: { index: false, follow: false },
};

const brl = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function formatarDataHora(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ periodo?: string }>;
}) {
  const { periodo: rawPeriodo } = await searchParams;
  const periodo: PeriodoFiltro =
    rawPeriodo === "7d" || rawPeriodo === "mes" ? rawPeriodo : "30d";

  const dados = await getDashboardFinanceiro(periodo);

  const isPositivo = dados.resultado_operacional >= 0;

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header com Filtros de Período */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-chocolate tracking-tight">
            Dashboard Financeiro
          </h2>
          <p className="text-xs sm:text-sm text-chocolate-muted">
            Fluxo de caixa, rentabilidade operacional e controle de estoque
          </p>
        </div>

        {/* Filtro de Período Temporal */}
        <div className="flex items-center rounded-xl bg-cream/70 p-1 border border-rose-light self-start sm:self-auto shadow-2xs">
          <Link
            href="/admin?periodo=7d"
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              periodo === "7d"
                ? "bg-rose-pastel text-white shadow-xs"
                : "text-chocolate-muted hover:text-chocolate"
            }`}
          >
            Últimos 7 dias
          </Link>
          <Link
            href="/admin?periodo=mes"
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              periodo === "mes"
                ? "bg-rose-pastel text-white shadow-xs"
                : "text-chocolate-muted hover:text-chocolate"
            }`}
          >
            Mês atual
          </Link>
          <Link
            href="/admin?periodo=30d"
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              periodo === "30d"
                ? "bg-rose-pastel text-white shadow-xs"
                : "text-chocolate-muted hover:text-chocolate"
            }`}
          >
            Últimos 30 dias
          </Link>
        </div>
      </div>

      {/* 4 Cards Principais de KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* 1. Receita Total */}
        <div className="rounded-2xl border border-rose-light bg-white p-4 sm:p-5 shadow-2xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-chocolate-muted uppercase tracking-wider">
              Receita Total
            </span>
            <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <p className="text-xl sm:text-2xl font-black text-chocolate truncate">
              {brl(dados.receita_total)}
            </p>
          </div>
          <p className="mt-1.5 text-[11px] text-chocolate-muted font-medium flex items-center gap-1">
            <ShoppingCart className="w-3 h-3 text-rose-pastel" />
            {dados.total_vendas} vendas concluídas
          </p>
        </div>

        {/* 2. Gastos com Insumos */}
        <div className="rounded-2xl border border-rose-light bg-white p-4 sm:p-5 shadow-2xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-chocolate-muted uppercase tracking-wider">
              Gastos com Insumos
            </span>
            <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-700 flex items-center justify-center">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <p className="text-xl sm:text-2xl font-black text-rose-700 truncate">
              {brl(dados.gastos_insumos)}
            </p>
          </div>
          <p className="mt-1.5 text-[11px] text-chocolate-muted font-medium flex items-center gap-1">
            <Receipt className="w-3 h-3 text-rose-pastel" />
            {dados.total_compras_insumos} compras registradas
          </p>
        </div>

        {/* 3. Resultado Operacional */}
        <div
          className={`rounded-2xl border p-4 sm:p-5 shadow-2xs relative overflow-hidden ${
            isPositivo
              ? "border-emerald-200 bg-emerald-50/30"
              : "border-rose-200 bg-rose-50/30"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-chocolate-muted uppercase tracking-wider">
              Resultado Operacional
            </span>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                isPositivo
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-rose-100 text-rose-800"
              }`}
            >
              {isPositivo ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <p
              className={`text-xl sm:text-2xl font-black truncate ${
                isPositivo ? "text-emerald-800" : "text-rose-800"
              }`}
            >
              {brl(dados.resultado_operacional)}
            </p>
          </div>
          <div className="mt-1.5 flex items-center gap-1.5">
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                isPositivo
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-rose-100 text-rose-800"
              }`}
            >
              {isPositivo ? `+${dados.margem_bruta_pct}%` : `${dados.margem_bruta_pct}%`} margem bruta
            </span>
          </div>
        </div>

        {/* 4. Ticket Médio */}
        <div className="rounded-2xl border border-rose-light bg-white p-4 sm:p-5 shadow-2xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-chocolate-muted uppercase tracking-wider">
              Ticket Médio
            </span>
            <div className="w-8 h-8 rounded-full bg-cream text-chocolate flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <p className="text-xl sm:text-2xl font-black text-chocolate truncate">
              {brl(dados.ticket_medio)}
            </p>
          </div>
          <p className="mt-1.5 text-[11px] text-chocolate-muted font-medium">
            Média por pedido / cliente
          </p>
        </div>
      </div>

      {/* Gráfico Comparativo: Entradas vs Saídas */}
      <div>
        <ComparativoFluxoChart dados={dados.pontos_fluxo} />
      </div>

      {/* Seção Enxuta: 2 Cards (Últimas 5 Movimentações & Insumos com Estoque Baixo) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Últimas 5 Movimentações */}
        <div className="rounded-2xl border border-rose-light bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-rose-light/50">
            <h3 className="text-sm font-bold text-chocolate flex items-center gap-2">
              <Receipt className="w-4 h-4 text-rose-pastel" />
              Últimas 5 Movimentações
            </h3>
            <Link
              href="/admin/vendas"
              className="text-xs font-semibold text-rose-pastel hover:text-chocolate transition-colors flex items-center gap-0.5"
            >
              Ver vendas <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {dados.ultimas_movimentacoes.length === 0 ? (
            <p className="py-8 text-center text-xs text-chocolate-muted">
              Nenhuma movimentação registrada recentemente.
            </p>
          ) : (
            <ul className="divide-y divide-rose-light/40">
              {dados.ultimas_movimentacoes.map((mov) => {
                const isEntrada = mov.tipo === "ENTRADA";
                return (
                  <li
                    key={mov.id}
                    className="flex items-center justify-between py-3 text-xs hover:bg-cream/30 px-2 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                          isEntrada
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-rose-50 text-rose-700"
                        }`}
                      >
                        {isEntrada ? (
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        ) : (
                          <ArrowDownRight className="w-3.5 h-3.5" />
                        )}
                      </div>
                      <div className="min-w-0 truncate">
                        <p className="font-bold text-chocolate truncate">
                          {mov.titulo}
                        </p>
                        <p className="text-[11px] text-chocolate-muted truncate">
                          {mov.detalhe} • {formatarDataHora(mov.data)}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0 ml-3">
                      <span
                        className={`font-black text-sm block ${
                          isEntrada ? "text-emerald-700" : "text-rose-700"
                        }`}
                      >
                        {isEntrada ? `+${brl(mov.valor)}` : `-${brl(mov.valor)}`}
                      </span>
                      {mov.metodo_ou_local && (
                        <span className="text-[10px] text-chocolate-muted block">
                          {mov.metodo_ou_local}
                        </span>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Card 2: Insumos com Estoque Baixo */}
        <div className="rounded-2xl border border-rose-light bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-rose-light/50">
            <h3 className="text-sm font-bold text-chocolate flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Insumos com Estoque Baixo
            </h3>
            <Link
              href="/admin/insumos"
              className="text-xs font-semibold text-rose-pastel hover:text-chocolate transition-colors flex items-center gap-0.5"
            >
              Comprar / Repor <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {dados.insumos_estoque_baixo.length === 0 ? (
            <div className="py-8 text-center text-xs text-chocolate-muted">
              <p className="font-semibold text-emerald-700">Tudo abastecido! 🎉</p>
              <p className="mt-0.5">Nenhum insumo está abaixo do nível mínimo de segurança.</p>
            </div>
          ) : (
            <ul className="divide-y divide-rose-light/40">
              {dados.insumos_estoque_baixo.map((insumo) => (
                <li
                  key={insumo.id}
                  className="flex items-center justify-between py-3 text-xs hover:bg-cream/30 px-2 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-7 h-7 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                      <AlertTriangle className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0 truncate">
                      <p className="font-bold text-chocolate truncate">{insumo.nome}</p>
                      <p className="text-[11px] text-chocolate-muted">
                        Mínimo recomendado: {insumo.estoque_minimo} un/emb
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    <span className="rounded-full bg-badge-red px-2.5 py-0.5 text-xs font-bold text-badge-red-text">
                      {insumo.estoque_atual} restantes
                    </span>
                    <Link
                      href="/admin/insumos"
                      className="rounded-lg bg-rose-pastel/10 hover:bg-rose-pastel px-2 py-1 text-[11px] font-semibold text-chocolate hover:text-white transition-all flex items-center gap-1"
                    >
                      <PackagePlus className="w-3 h-3" />
                      Entrada
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
