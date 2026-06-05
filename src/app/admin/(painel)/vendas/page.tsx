import { listarProdutos } from "@/lib/produtos";
import { listarVendas } from "@/lib/vendas";
import RegistrarVenda from "@/app/admin/RegistrarVenda";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Vendas | Admin Ana Cake",
  robots: { index: false, follow: false },
};

const brl = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function formatarData(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function VendasPage() {
  const [produtos, vendas] = await Promise.all([
    listarProdutos(),
    listarVendas(50),
  ]);

  const opcoes = produtos
    .filter((p) => p.ativo)
    .map((p) => ({
      id: p.id,
      nome: p.nome,
      preco: p.preco,
      estoque_atual: p.estoque_atual,
      ativo: p.ativo,
    }));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-chocolate">Vendas</h2>
        <p className="text-sm text-chocolate-muted">
          Registre vendas e acompanhe o histórico
        </p>
      </div>

      <RegistrarVenda produtos={opcoes} />

      <div className="overflow-hidden rounded-2xl border border-rose-light bg-white">
        <div className="px-5 py-4 border-b border-rose-light">
          <h3 className="text-sm font-semibold text-chocolate">
            Histórico de vendas{" "}
            <span className="font-normal text-chocolate-muted">
              ({vendas.length})
            </span>
          </h3>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-cream text-left text-chocolate-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Data</th>
              <th className="px-4 py-3 font-medium">Produto</th>
              <th className="px-4 py-3 font-medium">Qtd</th>
              <th className="px-4 py-3 font-medium">Valor</th>
              <th className="px-4 py-3 font-medium">Pagamento</th>
            </tr>
          </thead>
          <tbody>
            {vendas.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-8 text-center text-chocolate-muted"
                >
                  Nenhuma venda registrada ainda.
                </td>
              </tr>
            )}
            {vendas.map((v) => (
              <tr key={v.id} className="border-t border-rose-light/60">
                <td className="px-4 py-3 text-chocolate-muted whitespace-nowrap">
                  {formatarData(v.data_venda)}
                </td>
                <td className="px-4 py-3 font-medium text-chocolate">
                  {v.produto_nome ?? "—"}
                </td>
                <td className="px-4 py-3 text-chocolate">{v.quantidade}</td>
                <td className="px-4 py-3 font-medium text-chocolate">
                  {brl(v.valor_total)}
                </td>
                <td className="px-4 py-3 text-chocolate-muted">
                  {v.metodo_pagamento ?? "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
