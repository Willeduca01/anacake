"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  LineChart,
  Line,
} from "recharts";
import type { PontoFluxoTemporal } from "@/lib/dashboard";
import { ArrowUpRight, ArrowDownRight, TrendingUp } from "lucide-react";

const VERDE_ENTRADA = "#2e7d32";
const VERMELHO_SAIDA = "#c62828";
const CHOCOLATE = "#4a2c2a";

const brl = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export function ComparativoFluxoChart({
  dados,
}: {
  dados: PontoFluxoTemporal[];
}) {
  return (
    <div className="rounded-2xl border border-rose-light bg-white p-4 sm:p-5 min-w-0 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-chocolate flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-rose-pastel" />
            Fluxo Financeiro: Entradas vs. Saídas
          </h3>
          <p className="text-xs text-chocolate-muted mt-0.5">
            Comparativo diário de vendas e compras de insumos
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs font-semibold">
          <span className="flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            <ArrowUpRight className="w-3.5 h-3.5" />
            Entradas (Vendas)
          </span>
          <span className="flex items-center gap-1 text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
            <ArrowDownRight className="w-3.5 h-3.5" />
            Saídas (Insumos)
          </span>
        </div>
      </div>

      {dados.length === 0 ? (
        <p className="py-16 text-center text-sm text-chocolate-muted">
          Sem movimentações registradas neste período.
        </p>
      ) : (
        <ResponsiveContainer width="100%" height={290}>
          <AreaChart data={dados} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="entradasGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={VERDE_ENTRADA} stopOpacity={0.4} />
                <stop offset="95%" stopColor={VERDE_ENTRADA} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="saidasGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={VERMELHO_SAIDA} stopOpacity={0.4} />
                <stop offset="95%" stopColor={VERMELHO_SAIDA} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0d6d6" vertical={false} />
            <XAxis
              dataKey="dia"
              tickFormatter={(d: string) => d.slice(8, 10) + "/" + d.slice(5, 7)}
              tick={{ fontSize: 11, fill: "#8b6f6f" }}
              interval="preserveStartEnd"
              minTickGap={18}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#8b6f6f" }}
              width={52}
              tickFormatter={(v: number) => "R$" + v}
            />
            <Tooltip
              formatter={(v, name) => {
                const label = name === "entradas" ? "Entradas (Vendas)" : "Saídas (Insumos)";
                return [brl(Number(v)), label];
              }}
              labelFormatter={(d) => {
                const s = String(d);
                return `Dia ${s.slice(8, 10)}/${s.slice(5, 7)}`;
              }}
            />
            <Legend
              formatter={(value) =>
                value === "entradas" ? "Entradas (Vendas)" : "Saídas (Insumos)"
              }
              wrapperStyle={{ fontSize: 12, color: CHOCOLATE, paddingTop: 10 }}
            />
            <Area
              type="monotone"
              dataKey="entradas"
              stroke={VERDE_ENTRADA}
              strokeWidth={2.5}
              fill="url(#entradasGrad)"
            />
            <Area
              type="monotone"
              dataKey="saidas"
              stroke={VERMELHO_SAIDA}
              strokeWidth={2.5}
              fill="url(#saidasGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export function GraficoHistoricoPrecosInsumo({
  dados,
}: {
  dados: {
    data_compra: string;
    preco_unitario: number;
    preco_total: number;
    quantidade: number;
    estabelecimento: string | null;
  }[];
}) {
  if (dados.length === 0) {
    return (
      <div className="py-10 text-center text-xs text-chocolate-muted">
        Nenhuma compra registrada para exibir gráfico de flutuação de preço.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={dados} margin={{ top: 10, right: 15, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0d6d6" vertical={false} />
        <XAxis
          dataKey="data_compra"
          tickFormatter={(d: string) => d.slice(8, 10) + "/" + d.slice(5, 7)}
          tick={{ fontSize: 11, fill: "#8b6f6f" }}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "#8b6f6f" }}
          width={50}
          tickFormatter={(v: number) => "R$" + v.toFixed(2)}
        />
        <Tooltip
          formatter={(v, _, item) => {
            const p = item.payload;
            return [
              `${brl(Number(v))} (${p.quantidade} un. no ${p.estabelecimento || "mercado"})`,
              "Preço Unitário",
            ];
          }}
          labelFormatter={(d) => `Compra em ${d}`}
        />
        <Line
          type="monotone"
          dataKey="preco_unitario"
          stroke="#d4a0a0"
          strokeWidth={3}
          dot={{ r: 4, fill: "#4a2c2a" }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
