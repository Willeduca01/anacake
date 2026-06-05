import { listarProdutos } from "@/lib/produtos";
import { logoutAction } from "@/app/admin/actions";
import AdminProdutos from "@/app/admin/AdminProdutos";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin | Ana Cake",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const produtos = await listarProdutos();

  return (
    <div className="min-h-screen bg-cream">
      <header className="border-b border-rose-light bg-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-chocolate">Painel Ana Cake</h1>
            <p className="text-xs text-chocolate-muted">Gerenciamento de cardápio</p>
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              className="rounded-full border border-rose-light px-4 py-2 text-sm font-medium text-chocolate-muted hover:bg-rose-light transition-colors"
            >
              Sair
            </button>
          </form>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
        <AdminProdutos produtos={produtos} />
      </main>
    </div>
  );
}
