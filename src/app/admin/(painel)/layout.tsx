import AdminNav from "@/app/admin/AdminNav";
import { logoutAction } from "@/app/admin/actions";
import { contarNovasDemo, listarConversasDemo } from "@/lib/mensagens";
import { contarPedidosPendentes } from "@/lib/pedidos";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin | Ana Cake",
  robots: { index: false, follow: false },
};

export default async function PainelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let pendentes = 0;
  let mensagensNovas = 0;
  try {
    pendentes = await contarPedidosPendentes();
  } catch {
    pendentes = 0;
  }
  mensagensNovas = contarNovasDemo(listarConversasDemo());
  return (
    <div className="min-h-screen bg-cream">
      <header className="border-b border-rose-light bg-white sticky top-0 z-40">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:h-16 md:items-center md:justify-between gap-2 md:gap-4 py-2.5 md:py-0">
            {/* Linha superior no mobile: Logo e Sair */}
            <div className="flex items-center justify-between gap-4 w-full md:w-auto">
              <span className="text-lg font-bold text-chocolate whitespace-nowrap">
                Ana Cake Admin
              </span>
              <div className="md:hidden">
                <form action={logoutAction}>
                  <button
                    type="submit"
                    className="rounded-full border border-rose-light px-3 py-1 text-xs font-semibold text-chocolate-muted hover:bg-rose-light transition-colors"
                  >
                    Sair
                  </button>
                </form>
              </div>
            </div>

            {/* Menu de navegação com h-scroll horizontal fluido no mobile */}
            <div className="w-full md:w-auto min-w-0 overflow-x-auto scrollbar-none py-1 -my-1 -mx-4 px-4 md:mx-0 md:px-0">
              <AdminNav
                pedidosPendentes={pendentes}
                mensagensNovas={mensagensNovas}
              />
            </div>

            {/* Botão Sair no Desktop */}
            <div className="hidden md:block">
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="rounded-full border border-rose-light px-4 py-2 text-sm font-medium text-chocolate-muted hover:bg-rose-light transition-colors"
                >
                  Sair
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-5 sm:py-8 min-w-0 overflow-x-clip">
        {children}
      </main>
    </div>
  );
}
