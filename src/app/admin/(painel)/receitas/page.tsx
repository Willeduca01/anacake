import { listarReceitas } from "@/lib/receitas";
import { listarInsumos } from "@/lib/insumos";
import AdminReceitas from "@/app/admin/AdminReceitas";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Fichas Técnicas & Precificação | Admin Ana Cake",
  robots: { index: false, follow: false },
};

export default async function ReceitasPage() {
  const [receitas, insumos] = await Promise.all([
    listarReceitas(),
    listarInsumos(),
  ]);

  return <AdminReceitas receitas={receitas} insumos={insumos} />;
}
