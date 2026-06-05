"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import type {
  PontoFaturamento,
  TopProduto,
  FaturamentoCategoria,
} from "@/lib/dashboard";

const ROSE = "#d4a0a0";
const CHOCOLATE = "#4a2c2a";
const PIE_COLORS = ["#d4a0a0", "#e8c4c4", "#6b4443", "#f0d6d6", "#8b6f6f", "#4a2c2a"];

const brl = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function Card({
  titulo,
  children,
}: {
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-rose-light bg-white p-5">
      <h3 className="mb-4 text-sm font-semibold text-chocolate">{titulo}</h3>
      {children}
    </div>
  );
}

export function FaturamentoChart({ dados }: { dados: PontoFaturamento[] }) {
  return (
    <Card titulo="Faturamento — últimos 30 dias">
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={dados} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="fatGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={ROSE} stopOpacity={0.6} />
              <stop offset="95%" stopColor={ROSE} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0d6d6" />
          <XAxis
            dataKey="dia"
            tickFormatter={(d: string) => d.slice(8, 10) + "/" + d.slice(5, 7)}
            tick={{ fontSize: 11, fill: "#8b6f6f" }}
            interval="preserveStartEnd"
            minTickGap={20}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#8b6f6f" }}
            width={48}
            tickFormatter={(v: number) => "R$" + v}
          />
          <Tooltip
            formatter={(v) => [brl(Number(v)), "Faturamento"]}
            labelFormatter={(d) => {
              const s = String(d);
              return `Dia ${s.slice(8, 10)}/${s.slice(5, 7)}`;
            }}
          />
          <Area
            type="monotone"
            dataKey="total"
            stroke={ROSE}
            strokeWidth={2}
            fill="url(#fatGrad)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
}

export function TopProdutosChart({ dados }: { dados: TopProduto[] }) {
  return (
    <Card titulo="Top produtos (quantidade vendida)">
      {dados.length === 0 ? (
        <p className="py-16 text-center text-sm text-chocolate-muted">
          Sem vendas registradas ainda.
        </p>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <BarChart
            data={dados}
            layout="vertical"
            margin={{ top: 5, right: 16, left: 10, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0d6d6" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 11, fill: "#8b6f6f" }} allowDecimals={false} />
            <YAxis
              type="category"
              dataKey="nome"
              tick={{ fontSize: 11, fill: "#8b6f6f" }}
              width={110}
            />
            <Tooltip formatter={(v) => [String(v), "Qtd"]} />
            <Bar dataKey="quantidade" fill={ROSE} radius={[0, 6, 6, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
}

export function CategoriaChart({ dados }: { dados: FaturamentoCategoria[] }) {
  return (
    <Card titulo="Faturamento por categoria">
      {dados.length === 0 ? (
        <p className="py-16 text-center text-sm text-chocolate-muted">
          Sem vendas registradas ainda.
        </p>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie
              data={dados}
              dataKey="total"
              nameKey="categoria"
              cx="50%"
              cy="50%"
              outerRadius={90}
              label={(entry) =>
                (entry as unknown as FaturamentoCategoria).categoria
              }
            >
              {dados.map((_, i) => (
                <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(v) => brl(Number(v))} />
            <Legend wrapperStyle={{ fontSize: 12, color: CHOCOLATE }} />
          </PieChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
}
