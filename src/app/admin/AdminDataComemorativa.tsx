"use client";

import { useState, useMemo, useTransition } from "react";
import Image from "next/image";
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Search,
  Check,
  Calendar,
  Layers,
  HelpCircle,
  Type,
  Maximize2,
  Eye,
} from "lucide-react";
import type { ProdutoAdmin } from "@/lib/produtos";
import {
  type DataComemorativaConfig,
  TEMAS_DISPONIVEIS,
  iconePorTema,
} from "@/types/data-comemorativa";
import {
  FONTES_DISPONIVEIS,
  TAMANHOS_DISPONIVEIS,
  getFontClass,
  getTamanhoClass,
} from "@/lib/fonts-comemorativa";
import { salvarDataComemorativaAction } from "@/app/admin/actions-data-comemorativa";
import ChristmasLights from "@/components/themes/ChristmasLights";
import EasterEggsHeader from "@/components/themes/EasterEggsHeader";
import EasterBunnyIllustration from "@/components/themes/EasterBunnyIllustration";
import CarnivalBannerMask from "@/components/themes/CarnivalBannerMask";
import MothersDayFloralHeader from "@/components/themes/MothersDayFloralHeader";

interface AdminDataComemorativaProps {
  produtos: ProdutoAdmin[];
  initialConfig: DataComemorativaConfig;
}

function formatarPreco(valor: number): string {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export default function AdminDataComemorativa({
  produtos,
  initialConfig,
}: AdminDataComemorativaProps) {
  const [ativo, setAtivo] = useState(initialConfig.ativo);
  const [nomeAba, setNomeAba] = useState(initialConfig.nome_aba);
  const [temaSlug, setTemaSlug] = useState(initialConfig.tema_slug);
  const [badgeTexto, setBadgeTexto] = useState(
    initialConfig.badge_texto || "Especial de Fim de Ano"
  );
  const [subtitulo, setSubtitulo] = useState(
    initialConfig.subtitulo ||
      "Doces artesanais finos e presentes exclusivos preparados com amor para iluminar a sua ceia."
  );
  const [fonteTitulo, setFonteTitulo] = useState(
    initialConfig.fonte_titulo || "great-vibes"
  );
  const [tamanhoTitulo, setTamanhoTitulo] = useState(
    initialConfig.tamanho_titulo || "medio"
  );

  const [selecionados, setSelecionados] = useState<Set<number>>(
    new Set(initialConfig.produto_ids)
  );

  const [busca, setBusca] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState("todas");
  const [feedback, setFeedback] = useState<{
    tipo: "sucesso" | "erro";
    texto: string;
  } | null>(null);

  const [isPending, startTransition] = useTransition();

  const categorias = useMemo(() => {
    const set = new Set<string>();
    for (const p of produtos) {
      if (p.categoria) set.add(p.categoria);
    }
    return Array.from(set).sort();
  }, [produtos]);

  const produtosFiltrados = useMemo(() => {
    return produtos.filter((p) => {
      const matchBusca =
        !busca.trim() ||
        p.nome.toLowerCase().includes(busca.toLowerCase().trim()) ||
        (p.descricao &&
          p.descricao.toLowerCase().includes(busca.toLowerCase().trim()));
      const matchCat =
        categoriaFiltro === "todas" || p.categoria === categoriaFiltro;
      return matchBusca && matchCat;
    });
  }, [produtos, busca, categoriaFiltro]);

  const alternarProduto = (id: number) => {
    setSelecionados((prev) => {
      const novo = new Set(prev);
      if (novo.has(id)) {
        novo.delete(id);
      } else {
        novo.add(id);
      }
      return novo;
    });
  };

  const selecionarTodosVisiveis = () => {
    setSelecionados((prev) => {
      const novo = new Set(prev);
      for (const p of produtosFiltrados) {
        novo.add(p.id);
      }
      return novo;
    });
  };

  const desmarcarTodosVisiveis = () => {
    setSelecionados((prev) => {
      const novo = new Set(prev);
      for (const p of produtosFiltrados) {
        novo.delete(p.id);
      }
      return novo;
    });
  };

  const handleSalvar = () => {
    setFeedback(null);
    startTransition(async () => {
      try {
        const res = await salvarDataComemorativaAction({
          ativo,
          nome_aba: nomeAba,
          tema_slug: temaSlug,
          badge_texto: badgeTexto,
          subtitulo,
          fonte_titulo: fonteTitulo,
          tamanho_titulo: tamanhoTitulo,
          produto_ids: Array.from(selecionados),
        });

        if (res.ok) {
          setFeedback({
            tipo: "sucesso",
            texto: res.mensagem || "Configurações salvas com sucesso!",
          });
        }
      } catch (err: unknown) {
        const msg =
          err instanceof Error ? err.message : "Erro desconhecido ao salvar.";
        setFeedback({
          tipo: "erro",
          texto: msg,
        });
      }
    });
  };

  const classeFonteAtual = getFontClass(fonteTitulo);
  const classeTamanhoAtual = getTamanhoClass(tamanhoTitulo);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-rose-light/60 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{iconePorTema(temaSlug)}</span>
            <h1 className="text-2xl font-bold tracking-tight text-chocolate">
              Data Comemorativa & Sazonal
            </h1>
          </div>
          <p className="mt-1 text-sm text-chocolate-muted">
            Personalize os textos, fontes, tamanhos e produtos da aba
            comemorativa no cardápio público.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSalvar}
          disabled={isPending}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-pastel px-5 py-2.5 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-rose-dark disabled:opacity-50 cursor-pointer"
        >
          {isPending ? (
            <span className="inline-block animate-spin">⏳</span>
          ) : (
            <Check className="h-4 w-4" />
          )}
          <span>{isPending ? "Salvando..." : "Salvar Alterações"}</span>
        </button>
      </div>

      {/* Alerta de Feedback */}
      {feedback && (
        <div
          className={`flex items-start gap-3 rounded-xl p-4 text-sm font-medium ${
            feedback.tipo === "sucesso"
              ? "bg-emerald-50 text-emerald-900 border border-emerald-200"
              : "bg-rose-50 text-rose-900 border border-rose-200"
          }`}
        >
          {feedback.tipo === "sucesso" ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
          )}
          <div className="flex-1">{feedback.texto}</div>
        </div>
      )}

      {/* Bloco 1: Configuração Básica da Aba */}
      <div className="bg-white rounded-2xl border border-rose-light/80 p-5 sm:p-6 shadow-xs space-y-6">
        <div className="flex items-center gap-2 border-b border-rose-light/40 pb-3">
          <Calendar className="h-5 w-5 text-rose-pastel" />
          <h2 className="text-base font-bold text-chocolate">
            Controle & Visibilidade
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Switch de Ativação */}
          <div className="flex flex-col justify-between bg-warm-white rounded-xl p-4 border border-rose-light/60">
            <div>
              <span className="text-xs font-semibold text-chocolate-muted uppercase tracking-wider">
                Visibilidade Pública
              </span>
              <p className="text-sm font-bold text-chocolate mt-1">
                {ativo ? "Aba Ativa no Cardápio" : "Aba Oculta no Cardápio"}
              </p>
              <p className="text-xs text-chocolate-muted mt-1">
                {ativo
                  ? "A aba comemorativa e as animações estão visíveis para os clientes."
                  : "Nenhuma aba ou efeito especial é exibido no menu."}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-rose-light/40 flex items-center justify-between">
              <span className="text-xs font-medium text-chocolate">
                Exibir aba comemorativa:
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={ativo}
                onClick={() => setAtivo(!ativo)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-rose-pastel/40 ${
                  ativo ? "bg-emerald-600" : "bg-gray-300"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                    ativo ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Nome da Aba no Menu */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-chocolate-muted">
              Nome da Aba no Cardápio (Título Principal)
            </label>
            <input
              type="text"
              value={nomeAba}
              onChange={(e) => setNomeAba(e.target.value)}
              placeholder="Ex: Natal, Páscoa, Dia das Mães..."
              className="w-full rounded-xl border border-rose-light bg-warm-white px-3.5 py-2.5 text-sm font-semibold text-chocolate focus:border-rose-pastel focus:outline-none focus:ring-2 focus:ring-rose-pastel/30"
            />
            <p className="text-[11px] text-chocolate-muted flex items-center gap-1">
              <HelpCircle className="h-3 w-3" />
              Rótulo do botão no menu e título que brilha no banner temático.
            </p>
          </div>

          {/* Tema Visual & Efeitos */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-chocolate-muted">
              Tema Visual & Efeitos
            </label>
            <select
              value={temaSlug}
              onChange={(e) => setTemaSlug(e.target.value)}
              className="w-full rounded-xl border border-rose-light bg-warm-white px-3.5 py-2.5 text-sm font-semibold text-chocolate focus:border-rose-pastel focus:outline-none focus:ring-2 focus:ring-rose-pastel/30"
            >
              {TEMAS_DISPONIVEIS.map((t) => (
                <option key={t.slug} value={t.slug}>
                  {t.icone} {t.label} ({t.slug})
                </option>
              ))}
            </select>
            <p className="text-[11px] text-chocolate-muted flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              Define as animações de fundo, neve, trenó e luzes comemorativas.
            </p>
          </div>
        </div>
      </div>

      {/* Bloco 2: Personalização Tipográfica & Textos do Banner */}
      <div className="bg-white rounded-2xl border border-rose-light/80 p-5 sm:p-6 shadow-xs space-y-6">
        <div className="flex items-center gap-2 border-b border-rose-light/40 pb-3">
          <Type className="h-5 w-5 text-rose-pastel" />
          <h2 className="text-base font-bold text-chocolate">
            Personalização do Banner (Fontes, Tamanhos & Textos)
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Texto do Badge Superior */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-chocolate-muted">
              Texto da Etiqueta Superior (Badge)
            </label>
            <input
              type="text"
              value={badgeTexto}
              onChange={(e) => setBadgeTexto(e.target.value)}
              placeholder="Ex: Especial de Fim de Ano, Edição Limitada..."
              className="w-full rounded-xl border border-rose-light bg-warm-white px-3.5 py-2.5 text-sm font-semibold text-chocolate focus:border-rose-pastel focus:outline-none focus:ring-2 focus:ring-rose-pastel/30"
            />
            <p className="text-[11px] text-chocolate-muted">
              Pequena tag em destaque dourado com emojis que aparece acima do título.
            </p>
          </div>

          {/* Subtítulo / Descrição */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-chocolate-muted">
              Subtítulo / Mensagem Comemorativa
            </label>
            <input
              type="text"
              value={subtitulo}
              onChange={(e) => setSubtitulo(e.target.value)}
              placeholder="Ex: Doces finos e presentes para celebrar momentos inesquecíveis..."
              className="w-full rounded-xl border border-rose-light bg-warm-white px-3.5 py-2.5 text-sm font-semibold text-chocolate focus:border-rose-pastel focus:outline-none focus:ring-2 focus:ring-rose-pastel/30"
            />
            <p className="text-[11px] text-chocolate-muted">
              Frase explicativa que dá o tom acolhedor da data festiva.
            </p>
          </div>

          {/* Seletor de Fonte */}
          <div className="space-y-2">
            <label className="block text-xs font-medium text-chocolate-muted flex items-center justify-between">
              <span>Fonte do Título</span>
              <span className="text-[11px] text-rose-pastel font-semibold">
                {FONTES_DISPONIVEIS.find((f) => f.id === fonteTitulo)?.estilo}
              </span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {FONTES_DISPONIVEIS.map((fonte) => {
                const selecionada = fonteTitulo === fonte.id;
                return (
                  <button
                    key={fonte.id}
                    type="button"
                    onClick={() => setFonteTitulo(fonte.id)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      selecionada
                        ? "border-rose-pastel bg-rose-50/60 ring-2 ring-rose-pastel/40 shadow-xs"
                        : "border-rose-light/70 bg-warm-white hover:bg-white hover:border-rose-pastel/60"
                    }`}
                  >
                    <span
                      className={`${fonte.className} text-xl text-chocolate font-normal truncate`}
                    >
                      {nomeAba || "Natal"}
                    </span>
                    <span className="text-[11px] text-chocolate-muted mt-1 font-medium">
                      {fonte.nome} • {fonte.estilo}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Seletor de Tamanho */}
          <div className="space-y-2">
            <label className="block text-xs font-medium text-chocolate-muted">
              Tamanho do Título
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {TAMANHOS_DISPONIVEIS.map((tam) => {
                const selecionado = tamanhoTitulo === tam.id;
                return (
                  <button
                    key={tam.id}
                    type="button"
                    onClick={() => setTamanhoTitulo(tam.id)}
                    className={`py-3 px-2 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                      selecionado
                        ? "border-rose-pastel bg-rose-pastel text-white font-bold shadow-xs"
                        : "border-rose-light/70 bg-warm-white text-chocolate hover:bg-white hover:border-rose-pastel/60"
                    }`}
                  >
                    <Maximize2 className="h-4 w-4 opacity-70" />
                    <span className="text-xs">{tam.label}</span>
                  </button>
                );
              })}
            </div>

            <p className="text-[11px] text-chocolate-muted pt-1">
              Ajusta o impacto visual do nome no banner principal tanto no desktop quanto no celular.
            </p>
          </div>
        </div>

        {/* DEMONSTRAÇÃO AO VIVO (LIVE PREVIEW) */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-chocolate uppercase tracking-wider flex items-center gap-1.5">
              <Eye className="h-4 w-4 text-rose-pastel" />
              Demonstração ao Vivo (como aparecerá no cardápio)
            </span>
            <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 font-semibold flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
              Atualização em tempo real
            </span>
          </div>

          <div
            className={`relative rounded-2xl overflow-hidden p-6 sm:p-8 text-center select-none transition-colors duration-500 shadow-xl ${
              temaSlug === "pascoa"
                ? "bg-gradient-to-b from-[#FFFDF9] via-[#FAF4EE] to-[#F5ECE5] text-[#4A2B20] border border-[#E8D8CF]"
                : temaSlug === "carnaval"
                  ? "bg-gradient-to-r from-[#280436] via-[#4D0A58] to-[#20032B] text-white border border-amber-400/50 shadow-2xl"
                  : temaSlug === "dia-das-maes"
                    ? "bg-gradient-to-b from-[#FFF7F4] via-[#FAF0EC] to-[#F5E6E1] text-[#4A202A] border border-[#F0D5CD]"
                    : "bg-gradient-to-b from-[#380A0E] via-[#240507] to-[#150204] text-white border border-amber-500/30"
            }`}
          >
            {/* Barra dourada e iluminação festiva estilo banner de Carnaval */}
            {temaSlug === "carnaval" && (
              <>
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-[#FFE066] to-amber-500 shadow-[0_0_12px_rgba(255,215,0,0.6)]" />
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-[#FFE066] to-amber-500 shadow-[0_0_12px_rgba(255,215,0,0.6)]" />
                <div className="absolute -top-6 -left-6 w-32 h-32 rounded-full bg-[#00F0FF]/15 blur-xl pointer-events-none" />
                <div className="absolute top-1/4 -right-6 w-40 h-40 rounded-full bg-[#FF007F]/20 blur-2xl pointer-events-none" />
              </>
            )}

            {/* Elemento de topo específico do tema */}
            {temaSlug === "pascoa" ? (
              <EasterEggsHeader />
            ) : temaSlug === "carnaval" ? (
              <div className="flex items-center justify-center gap-1.5 text-amber-300 text-xs sm:text-sm select-none drop-shadow-xs pb-1">
                <span>✦</span>
                <span className="text-base sm:text-lg">✦</span>
                <span>✦</span>
              </div>
            ) : temaSlug === "dia-das-maes" ? (
              <MothersDayFloralHeader />
            ) : (
              <ChristmasLights />
            )}

            {/* Badge */}
            <div
              className={`inline-flex items-center gap-2 rounded-full px-3.5 py-0.5 text-[11px] font-semibold shadow-xs mb-2 transition-colors ${
                temaSlug === "pascoa"
                  ? "bg-[#FFF2E2] border border-[#F2D4B6] text-[#8C4F27]"
                  : temaSlug === "carnaval"
                    ? "bg-gradient-to-r from-[#D90368]/30 via-[#FFD166]/20 to-[#00F0FF]/30 border border-amber-400/50 text-[#FFD166]"
                    : temaSlug === "dia-das-maes"
                      ? "bg-[#FCECE8] border border-[#F5CAC3] text-[#8C3446]"
                      : "bg-amber-400/15 border border-amber-300/30 text-amber-200"
              }`}
            >
              <span>{temaSlug === "pascoa" ? "🌸" : temaSlug === "carnaval" ? "🎭" : temaSlug === "dia-das-maes" ? "💖" : "🎄"}</span>
              <span className="tracking-wide uppercase font-bold">
                {badgeTexto ||
                  (temaSlug === "pascoa"
                    ? "Especial de Páscoa"
                    : temaSlug === "carnaval"
                      ? "Folia de Carnaval"
                      : temaSlug === "dia-das-maes"
                        ? "Especial Dia das Mães"
                        : "Especial de Fim de Ano")}
              </span>
              <span>{temaSlug === "pascoa" || temaSlug === "dia-das-maes" ? "🌸" : temaSlug === "carnaval" ? "🎊" : "✨"}</span>
            </div>

            {/* Título com estilo específico de cada tema */}
            {temaSlug === "pascoa" ? (
              <div className="flex items-center justify-center gap-2 sm:gap-4 my-1">
                <EasterBunnyIllustration
                  side="left"
                  className="w-7 h-7 sm:w-11 sm:h-11 text-[#06D6A0] shrink-0 drop-shadow-xs"
                />
                <div
                  className={`${classeFonteAtual} ${classeTamanhoAtual} font-normal text-transparent bg-clip-text bg-gradient-to-r from-[#4A2418] via-[#633324] to-[#8C4A32] drop-shadow-[0_2px_4px_rgba(74,36,24,0.12)] leading-tight`}
                >
                  {nomeAba || "Páscoa"}
                </div>
                <EasterBunnyIllustration
                  side="right"
                  className="w-7 h-7 sm:w-11 sm:h-11 text-[#06D6A0] shrink-0 drop-shadow-xs"
                />
              </div>
            ) : temaSlug === "carnaval" ? (
              <div className="flex items-center justify-center gap-2 sm:gap-4 my-1">
                <CarnivalBannerMask
                  variant="magenta"
                  side="left"
                  className="w-8 sm:w-14 lg:w-18 shrink-0 transform -rotate-6"
                />
                <div
                  className={`${classeFonteAtual} ${classeTamanhoAtual} font-normal text-transparent bg-clip-text bg-gradient-to-r from-[#FFF48D] via-[#FFD166] to-[#FFAA00] drop-shadow-[0_4px_20px_rgba(255,209,102,0.55)] leading-tight text-center px-1`}
                >
                  {nomeAba || "Carnaval"}
                </div>
                <CarnivalBannerMask
                  variant="turquoise"
                  side="right"
                  className="w-8 sm:w-14 lg:w-18 shrink-0 transform rotate-6"
                />
              </div>
            ) : temaSlug === "dia-das-maes" ? (
              <div
                className={`${classeFonteAtual} ${classeTamanhoAtual} font-normal text-transparent bg-clip-text bg-gradient-to-r from-[#4A1E28] via-[#6B2A38] to-[#8C3446] drop-shadow-[0_2px_6px_rgba(74,30,40,0.12)] leading-tight my-1`}
              >
                {nomeAba || "Dia das Mães"}
              </div>
            ) : (
              <div
                className={`${classeFonteAtual} ${classeTamanhoAtual} font-normal text-transparent bg-clip-text bg-gradient-to-r from-[#FFF6CC] via-[#FFD770] to-[#FFAA00] drop-shadow-[0_4px_16px_rgba(255,215,0,0.45)] leading-tight my-1`}
              >
                {nomeAba || "Natal"}
              </div>
            )}

            {/* Subtítulo */}
            <p
              className={`text-xs sm:text-sm max-w-md mx-auto font-normal leading-relaxed mt-1 ${
                temaSlug === "pascoa"
                  ? "text-[#6E4E42]"
                  : temaSlug === "carnaval"
                    ? "text-amber-100/90 font-light"
                    : temaSlug === "dia-das-maes"
                      ? "text-[#7A4B56]"
                      : "text-amber-100/80 font-light"
              }`}
            >
              {subtitulo ||
                (temaSlug === "pascoa"
                  ? "Ovos artesanais recheados, bombons e chocolates nobres para celebrar momentos doces."
                  : temaSlug === "carnaval"
                    ? "Doces temáticos, kits festa e delícias artesanais para encher seus dias de alegria e muito sabor."
                    : temaSlug === "dia-das-maes"
                      ? "Doces afetivos, caixas especiais e presentes criados com todo amor para homenagear quem sempre cuidou de você."
                      : "Doces artesanais finos e presentes exclusivos preparados com amor para iluminar a sua ceia.")}
            </p>

            {/* Divisor temático */}
            <div className="flex items-center justify-center gap-3 pt-3">
              <div
                className={`h-px w-16 sm:w-24 ${
                  temaSlug === "pascoa"
                    ? "bg-gradient-to-r from-transparent via-[#D4A373]/60 to-[#D4A373]"
                    : temaSlug === "carnaval"
                      ? "bg-gradient-to-r from-transparent via-amber-400/70 to-amber-300"
                      : temaSlug === "dia-das-maes"
                        ? "bg-gradient-to-r from-transparent via-[#E5989B]/50 to-transparent"
                        : "bg-gradient-to-r from-transparent via-amber-400/50 to-amber-300"
                }`}
              />
              <span
                className={`text-xs ${
                  temaSlug === "pascoa"
                    ? "text-[#D4A373]"
                    : temaSlug === "carnaval"
                      ? "text-[#FFD166]"
                      : temaSlug === "dia-das-maes"
                        ? "text-[#E5989B]"
                        : "text-amber-300"
                }`}
              >
                {temaSlug === "dia-das-maes" ? "🌸" : "✦"}
              </span>
              <div
                className={`h-px w-16 sm:w-24 ${
                  temaSlug === "pascoa"
                    ? "bg-gradient-to-l from-transparent via-[#D4A373]/60 to-[#D4A373]"
                    : temaSlug === "carnaval"
                      ? "bg-gradient-to-l from-transparent via-amber-400/70 to-amber-300"
                      : temaSlug === "dia-das-maes"
                        ? "bg-gradient-to-l from-transparent via-[#E5989B]/50 to-transparent"
                        : "bg-gradient-to-l from-transparent via-amber-400/50 to-amber-300"
                }`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bloco 3: Seleção de Produtos Vinculados */}
      <div className="bg-white rounded-2xl border border-rose-light/80 p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-rose-light/40 pb-4">
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-rose-pastel" />
            <div>
              <h2 className="text-base font-bold text-chocolate">
                Produtos da Data Comemorativa
              </h2>
              <p className="text-xs text-chocolate-muted">
                Marque os produtos que devem aparecer quando o cliente abrir a
                aba &ldquo;{nomeAba || "Comemorativa"}&rdquo;.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={selecionarTodosVisiveis}
              className="rounded-lg border border-rose-light bg-warm-white px-3 py-1.5 text-xs font-semibold text-chocolate hover:bg-rose-light transition-colors cursor-pointer"
            >
              Selecionar visíveis
            </button>
            <button
              type="button"
              onClick={desmarcarTodosVisiveis}
              className="rounded-lg border border-rose-light bg-warm-white px-3 py-1.5 text-xs font-semibold text-chocolate-muted hover:bg-rose-light transition-colors cursor-pointer"
            >
              Desmarcar visíveis
            </button>
          </div>
        </div>

        {/* Filtros da lista */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-chocolate-muted" />
            <input
              type="text"
              placeholder="Buscar produtos cadastrados..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full rounded-xl border border-rose-light bg-warm-white pl-9 pr-3.5 py-2 text-xs sm:text-sm text-chocolate focus:border-rose-pastel focus:outline-none focus:ring-2 focus:ring-rose-pastel/30"
            />
          </div>

          <select
            value={categoriaFiltro}
            onChange={(e) => setCategoriaFiltro(e.target.value)}
            className="rounded-xl border border-rose-light bg-warm-white px-3 py-2 text-xs sm:text-sm text-chocolate focus:border-rose-pastel focus:outline-none focus:ring-2 focus:ring-rose-pastel/30"
          >
            <option value="todas">Todas as categorias</option>
            {categorias.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Grid de seleção */}
        {produtosFiltrados.length === 0 ? (
          <p className="py-12 text-center text-sm text-chocolate-muted">
            Nenhum produto encontrado com os filtros atuais.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[500px] overflow-y-auto pr-1">
            {produtosFiltrados.map((prod) => {
              const selecionado = selecionados.has(prod.id);
              const imagemUrl = prod.url_imagem;

              return (
                <div
                  key={prod.id}
                  onClick={() => alternarProduto(prod.id)}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer select-none ${
                    selecionado
                      ? "border-rose-pastel bg-rose-50/50 shadow-xs ring-1 ring-rose-pastel"
                      : "border-rose-light/60 bg-warm-white/60 hover:bg-white hover:border-rose-light"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selecionado}
                    onChange={() => {}}
                    className="h-4 w-4 rounded border-rose-light text-rose-pastel focus:ring-rose-pastel/40 cursor-pointer"
                  />

                  {imagemUrl ? (
                    <div className="relative h-12 w-12 rounded-lg overflow-hidden shrink-0 bg-cream">
                      <Image
                        src={imagemUrl}
                        alt={prod.nome}
                        fill
                        unoptimized={imagemUrl.startsWith("/api/")}
                        className="object-cover"
                        sizes="48px"
                      />
                    </div>
                  ) : (
                    <div className="h-12 w-12 rounded-lg bg-rose-light/40 flex items-center justify-center shrink-0 text-xs font-bold text-chocolate-muted">
                      🍰
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-semibold text-chocolate truncate">
                      {prod.nome}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-chocolate-muted">
                      <span className="capitalize">
                        {prod.categoria || "Geral"}
                      </span>
                      <span>•</span>
                      <span className="font-semibold text-chocolate">
                        {formatarPreco(prod.preco)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Botão de Salvar Rodapé */}
      <div className="flex justify-end pt-2">
        <button
          type="button"
          onClick={handleSalvar}
          disabled={isPending}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-pastel px-6 py-3 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-rose-dark disabled:opacity-50 cursor-pointer"
        >
          {isPending ? (
            <span className="inline-block animate-spin">⏳</span>
          ) : (
            <Check className="h-4 w-4" />
          )}
          <span>{isPending ? "Salvando..." : "Salvar Alterações"}</span>
        </button>
      </div>
    </div>
  );
}
