import {
  listarInsumos,
  listarInsumosBase,
  listarComprasInsumos,
  getHistoricoPrecosInsumos,
} from "@/lib/insumos";
import AdminInsumos from "@/app/admin/AdminInsumos";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Insumos & Estoque | Admin Ana Cake",
  robots: { index: false, follow: false },
};

export default async function InsumosPage() {
  const [insumos, insumosBase, compras, historicoPrecos] = await Promise.all([
    listarInsumos(),
    listarInsumosBase(),
    listarComprasInsumos(undefined, 100),
    getHistoricoPrecosInsumos(),
  ]);

  return (
    <AdminInsumos
      insumos={insumos}
      insumosBase={insumosBase}
      compras={compras}
      historicoPrecos={historicoPrecos}
    />
  );
}
