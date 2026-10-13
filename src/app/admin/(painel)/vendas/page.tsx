import { listarProdutos } from "@/lib/produtos";
import { listarVendas } from "@/lib/vendas";
import RegistrarVenda from "@/app/admin/RegistrarVenda";
import TabelaVendas from "@/app/admin/TabelaVendas";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Vendas | Admin Ana Cake",
  robots: { index: false, follow: false },
};

export default async function VendasPage() {
  const [produtos, vendas] = await Promise.all([
    listarProdutos(),
    listarVendas(100),
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
          Registre saídas de produtos, vendas avulsas e concilie o estoque
        </p>
      </div>

      <RegistrarVenda produtos={opcoes} />

      <TabelaVendas vendas={vendas} produtos={opcoes} />
    </div>
  );
}
