import { listarPedidosPendentes } from "@/lib/pedidos";
import PedidoCard from "@/app/admin/PedidoCard";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Pedidos | Admin Ana Cake",
  robots: { index: false, follow: false },
};

export default async function PedidosPage() {
  const pedidos = await listarPedidosPendentes();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-chocolate">
          Pedidos{" "}
          <span className="text-sm font-normal text-chocolate-muted">
            ({pedidos.length} pendente{pedidos.length === 1 ? "" : "s"})
          </span>
        </h2>
        <p className="text-sm text-chocolate-muted">
          Pedidos enviados pelo site aguardando sua confirmação. Ao confirmar,
          viram venda e baixam o estoque.
        </p>
      </div>

      {pedidos.length === 0 ? (
        <div className="rounded-2xl border border-rose-light bg-white p-10 text-center text-sm text-chocolate-muted">
          Nenhum pedido pendente no momento. 🎉
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pedidos.map((pedido) => (
            <PedidoCard key={pedido.id} pedido={pedido} />
          ))}
        </div>
      )}
    </div>
  );
}
