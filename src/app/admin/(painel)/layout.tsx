import AdminNav from "@/app/admin/AdminNav";
import { logoutAction } from "@/app/admin/actions";

export const metadata = {
  title: "Admin | Ana Cake",
  robots: { index: false, follow: false },
};

export default function PainelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-cream">
      <header className="border-b border-rose-light bg-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <span className="text-lg font-bold text-chocolate whitespace-nowrap">
              Ana Cake
            </span>
            <AdminNav />
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
        {children}
      </main>
    </div>
  );
}
