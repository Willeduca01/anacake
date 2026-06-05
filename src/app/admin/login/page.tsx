import { loginAction } from "@/app/admin/actions";

export const metadata = {
  title: "Admin | Ana Cake",
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  const mensagemErro =
    error === "config"
      ? "Credenciais de admin não configuradas no servidor."
      : error
        ? "Usuário ou senha inválidos."
        : null;

  return (
    <main className="min-h-screen flex items-center justify-center bg-cream px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white border border-rose-light p-8 shadow-sm">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-chocolate">Painel Ana Cake</h1>
          <p className="mt-1 text-sm text-chocolate-muted">
            Acesso restrito ao administrador
          </p>
        </div>

        {mensagemErro && (
          <p className="mb-4 rounded-lg bg-badge-red px-4 py-2 text-sm text-badge-red-text">
            {mensagemErro}
          </p>
        )}

        <form action={loginAction} className="space-y-4">
          <div>
            <label
              htmlFor="usuario"
              className="block text-sm font-medium text-chocolate mb-1"
            >
              Usuário
            </label>
            <input
              id="usuario"
              name="usuario"
              type="text"
              required
              autoComplete="username"
              className="w-full rounded-lg border border-rose-light bg-warm-white px-3 py-2 text-sm text-chocolate focus:border-rose-pastel focus:outline-none focus:ring-2 focus:ring-rose-pastel/30"
            />
          </div>

          <div>
            <label
              htmlFor="senha"
              className="block text-sm font-medium text-chocolate mb-1"
            >
              Senha
            </label>
            <input
              id="senha"
              name="senha"
              type="password"
              required
              autoComplete="current-password"
              className="w-full rounded-lg border border-rose-light bg-warm-white px-3 py-2 text-sm text-chocolate focus:border-rose-pastel focus:outline-none focus:ring-2 focus:ring-rose-pastel/30"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-full bg-rose-pastel py-2.5 text-sm font-semibold text-white shadow-md shadow-rose-pastel/20 hover:bg-chocolate-light transition-colors"
          >
            Entrar
          </button>
        </form>
      </div>
    </main>
  );
}
