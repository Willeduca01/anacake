import {
  getResumoVendas,
  getResumoEstoque,
  getFaturamento30Dias,
  getTopProdutos,
  getFaturamentoPorCategoria,
  getEstoqueBaixo,
} from "@/lib/dashboard";
import { listarVendas } from "@/lib/vendas";
import {
  FaturamentoChart,
  TopProdutosChart,
  CategoriaChart,
} from "@/app/admin/DashboardCharts";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Dashboard | Admin Ana Cake",
  robots: { index: false, follow: false },
};

const brl = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function Kpi({
  label,
  valor,
  destaque,
}: {
  label: string;
  valor: string;
  destaque?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-5 ${
        destaque
          ? "border-rose-pastel bg-rose-light/40"
          : "border-rose-light bg-white"
      }`}
    >
      <p className="text-xs font-medium uppercase tracking-wide text-chocolate-muted">
        {label}
      </p>
      <p className="mt-2 text-2xl font-bold text-chocolate">{valor}</p>
    </div>
  );
}

export default async function DashboardPage() {
  const [vendas, estoque, fat30, top, categoria, estoqueBaixo, recentes] =
    await Promise.all([
      getResumoVendas(),
      getResumoEstoque(),
      getFaturamento30Dias(),
      getTopProdutos(5),
      getFaturamentoPorCategoria(),
      getEstoqueBaixo(),
      listarVendas(6),
    ]);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-chocolate">Visão geral</h2>
        <p className="text-sm text-chocolate-muted">
          Indicadores de vendas e estoque da Ana Cake
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Kpi label="Faturamento do mês" valor={brl(vendas.faturamento_mes)} destaque />
        <Kpi label="Faturamento total" valor={brl(vendas.faturamento_total)} />
        <Kpi label="Vendas (total)" valor={String(vendas.total_vendas)} />
        <Kpi label="Ticket médio" valor={brl(vendas.ticket_medio)} />
        <Kpi label="Itens vendidos" valor={String(vendas.itens_vendidos)} />
        <Kpi label="Itens em estoque" valor={String(estoque.itens_estoque)} />
        <Kpi label="Valor do estoque" valor={brl(estoque.valor_estoque)} />
        <Kpi
          label="Produtos ativos"
          valor={`${estoque.produtos_ativos}/${estoque.total_produtos}`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="lg:col-span-2">
          <FaturamentoChart dados={fat30} />
        </div>
        <TopProdutosChart dados={top} />
        <CategoriaChart dados={categoria} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-rose-light bg-white p-5">
          <h3 className="mb-4 text-sm font-semibold text-chocolate">
            Estoque baixo (≤ 5 unidades)
          </h3>
          {estoqueBaixo.length === 0 ? (
            <p className="py-6 text-center text-sm text-chocolate-muted">
              Nenhum produto com estoque baixo. 🎉
            </p>
          ) : (
            <ul className="divide-y divide-rose-light/60">
              {estoqueBaixo.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center justify-between py-2.5 text-sm"
                >
                  <span className="text-chocolate">{p.nome}</span>
                  <span className="rounded-full bg-badge-red px-2.5 py-0.5 text-xs font-medium text-badge-red-text">
                    {p.estoque_atual} un.
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-2xl border border-rose-light bg-white p-5">
          <h3 className="mb-4 text-sm font-semibold text-chocolate">
            Vendas recentes
          </h3>
          {recentes.length === 0 ? (
            <p className="py-6 text-center text-sm text-chocolate-muted">
              Nenhuma venda registrada ainda.
            </p>
          ) : (
            <ul className="divide-y divide-rose-light/60">
              {recentes.map((v) => (
                <li
                  key={v.id}
                  className="flex items-center justify-between py-2.5 text-sm"
                >
                  <span className="text-chocolate">
                    {v.quantidade}× {v.produto_nome ?? "—"}
                  </span>
                  <span className="font-medium text-chocolate">
                    {brl(v.valor_total)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
