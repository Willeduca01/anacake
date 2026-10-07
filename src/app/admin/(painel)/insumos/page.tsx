import { listarInsumos, listarInsumosBase } from "@/lib/insumos";
import AdminInsumos from "@/app/admin/AdminInsumos";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Insumos & Estoque | Admin Ana Cake",
  robots: { index: false, follow: false },
};

export default async function InsumosPage() {
  const [insumos, insumosBase] = await Promise.all([
    listarInsumos(),
    listarInsumosBase(),
  ]);

  return <AdminInsumos insumos={insumos} insumosBase={insumosBase} />;
}
