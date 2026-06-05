import { AtSign, Phone, Mail } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-chocolate text-cream-dark">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Image
                src="/logo.png"
                alt="Ana Cake"
                width={40}
                height={40}
                className="rounded-full"
              />
              <span className="text-lg font-bold text-white">Ana Cake</span>
            </div>
            <p className="text-sm leading-relaxed text-cream-dark/80">
              Doces artesanais feitos com amor e ingredientes selecionados. Cada receita carrega a
              tradição e o cuidado da confeitaria fina.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-rose-pastel mb-4">
              Navegação
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-rose-light transition-colors">
                  Início
                </Link>
              </li>
              <li>
                <Link href="/#servicos" className="hover:text-rose-light transition-colors">
                  Serviços
                </Link>
              </li>
              <li>
                <Link href="/#localizacao" className="hover:text-rose-light transition-colors">
                  Localização
                </Link>
              </li>
              <li>
                <Link href="/cardapio" className="hover:text-rose-light transition-colors">
                  Cardápio
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-rose-pastel mb-4">
              Contato
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-rose-soft" />
                <a
                  href="https://wa.me/5519978293375"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-rose-light transition-colors"
                >
                  (19) 97829-3375
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-rose-soft" />
                <span>contato@anacake.com.br</span>
              </li>
              <li className="flex items-center gap-2">
                <AtSign className="h-4 w-4 text-rose-soft" />
                <a
                  href="https://www.instagram.com/confeitaria_ana_cake"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-rose-light transition-colors"
                >
                  @confeitaria_ana_cake
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-chocolate-light text-center text-xs text-cream-dark/60">
          &copy; {new Date().getFullYear()} Ana Cake. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
}
