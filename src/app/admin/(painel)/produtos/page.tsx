import { listarProdutos } from "@/lib/produtos";
import AdminProdutos from "@/app/admin/AdminProdutos";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Produtos | Admin Ana Cake",
  robots: { index: false, follow: false },
};

export default async function ProdutosPage() {
  const produtos = await listarProdutos();
  return <AdminProdutos produtos={produtos} />;
}
