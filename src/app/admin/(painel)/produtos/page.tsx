import { listarProdutos, listarCategorias } from "@/lib/produtos";
import { obterPromocaoConfig } from "@/lib/promocoes";
import AdminProdutos from "@/app/admin/AdminProdutos";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Produtos | Admin Ana Cake",
  robots: { index: false, follow: false },
};

export default async function ProdutosPage() {
  const [produtos, categorias, promocao] = await Promise.all([
    listarProdutos(),
    listarCategorias(),
    obterPromocaoConfig(),
  ]);
  return (
    <AdminProdutos
      produtos={produtos}
      categorias={categorias}
      promocao={promocao}
    />
  );
}
