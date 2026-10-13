"use client";

import { useState, useMemo, type ChangeEvent } from "react";
import {
  criarProdutoAction,
  atualizarProdutoAction,
  excluirProdutoAction,
} from "@/app/admin/actions";
import { salvarPromocaoAction } from "@/app/admin/actions-promocao";
import type { ProdutoAdmin } from "@/lib/produtos";
import type { PromocaoConfig } from "@/types/promocao";
import { Tag, X, Gift, Sparkles, ArrowRight, CheckCircle2 } from "lucide-react";

const inputClass =
  "w-full rounded-lg border border-rose-light bg-warm-white px-3 py-2 text-sm text-chocolate focus:border-rose-pastel focus:outline-none focus:ring-2 focus:ring-rose-pastel/30";

const labelClass = "block text-xs font-medium text-chocolate-muted mb-1";

const MAX_DIMENSAO = 1000;
const JPEG_QUALIDADE = 0.82;

function formatarPreco(valor: number): string {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// Reduz a imagem no navegador antes de enviar (sem dependencia): redesenha
// num canvas limitado a MAX_DIMENSAO e exporta JPEG, mantendo o banco leve.
function redimensionarImagem(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const escala = Math.min(1, MAX_DIMENSAO / Math.max(img.width, img.height));
      const w = Math.round(img.width * escala);
      const h = Math.round(img.height * escala);
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Canvas indisponível."));
      ctx.drawImage(img, 0, 0, w, h);
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error("Falha ao processar."))),
        "image/jpeg",
        JPEG_QUALIDADE
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Arquivo de imagem inválido."));
    };
    img.src = url;
  });
}

function ProdutoForm({
  produto,
  action,
  categorias = ["doces", "sobremesas", "salgados"],
  onDone,
  submitLabel,
}: {
  produto?: ProdutoAdmin;
  action: (formData: FormData) => Promise<void>;
  categorias?: string[];
  onDone?: () => void;
  submitLabel: string;
}) {
  const [imagemBlob, setImagemBlob] = useState<Blob | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [remover, setRemover] = useState(false);
  const [erroImagem, setErroImagem] = useState("");
  const [enviando, setEnviando] = useState(false);

  const opcoesCategorias = useMemo(() => {
    const set = new Set<string>();
    categorias.forEach((c) => {
      if (c && c.trim()) set.add(c.trim());
    });
    if (produto?.categoria && produto.categoria.trim()) {
      set.add(produto.categoria.trim());
    }
    return Array.from(set);
  }, [categorias, produto]);

  const [modoNovaCategoria, setModoNovaCategoria] = useState(false);
  const [categoria, setCategoria] = useState<string>(() => {
    if (produto?.categoria && produto.categoria.trim()) {
      return produto.categoria.trim();
    }
    return opcoesCategorias[0] ?? "doces";
  });
  const [novaCategoria, setNovaCategoria] = useState("");

  const temImagemAtual = !!produto?.tem_imagem;
  const previewAtual =
    temImagemAtual && produto?.url_imagem ? produto.url_imagem : null;

  const handleArquivo = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setErroImagem("");
    try {
      const blob = await redimensionarImagem(file);
      setImagemBlob(blob);
      setPreview(URL.createObjectURL(blob));
      setRemover(false);
    } catch {
      setErroImagem("Não foi possível ler essa imagem.");
    }
  };

  return (
    <form
      action={async (formData) => {
        setEnviando(true);
        try {
          if (remover) {
            formData.set("remover_imagem", "on");
          } else if (imagemBlob) {
            formData.set("imagem", imagemBlob, "imagem.jpg");
          }
          await action(formData);
          onDone?.();
        } finally {
          setEnviando(false);
        }
      }}
      className="grid grid-cols-1 sm:grid-cols-2 gap-4"
    >
      {produto && <input type="hidden" name="id" value={produto.id} />}

      <div className="sm:col-span-2">
        <label className={labelClass}>Nome</label>
        <input
          name="nome"
          required
          defaultValue={produto?.nome ?? ""}
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass}>Preço (R$)</label>
        <input
          name="preco"
          type="number"
          step="0.01"
          min="0"
          required
          defaultValue={produto?.preco ?? ""}
          className={inputClass}
          placeholder="Ex: 25.00"
        />
      </div>

      <div>
        <label className={labelClass}>Estoque</label>
        <input
          name="estoque_atual"
          type="number"
          min="0"
          required
          defaultValue={produto ? produto.estoque_atual : ""}
          className={inputClass}
          placeholder="Ex: 10"
        />
      </div>

      <div>
        <label className={labelClass}>
          <span className="flex items-center justify-between">
            <span className="flex items-center gap-1 font-semibold text-chocolate">
              <Tag className="w-3.5 h-3.5 text-rose-pastel" />
              Categoria
            </span>
            {!modoNovaCategoria && (
              <button
                type="button"
                onClick={() => {
                  setModoNovaCategoria(true);
                  setNovaCategoria("");
                }}
                className="text-[11px] font-medium text-rose-pastel hover:text-chocolate-light hover:underline"
              >
                + Nova
              </button>
            )}
          </span>
        </label>

        <input
          type="hidden"
          name="categoria"
          value={(modoNovaCategoria ? novaCategoria.trim() : categoria.trim()) || "doces"}
        />

        {modoNovaCategoria ? (
          <div className="relative flex items-center">
            <input
              type="text"
              autoFocus
              required
              value={novaCategoria}
              onChange={(e) => setNovaCategoria(e.target.value)}
              placeholder="Nome da categoria..."
              className={`${inputClass} pr-8`}
            />
            <button
              type="button"
              onClick={() => {
                setModoNovaCategoria(false);
                setNovaCategoria("");
              }}
              title="Voltar para categorias existentes"
              className="absolute right-2 p-1 text-chocolate-muted hover:text-chocolate hover:bg-rose-light/50 rounded-full transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <select
            value={categoria}
            onChange={(e) => {
              if (e.target.value === "__nova__") {
                setModoNovaCategoria(true);
                setNovaCategoria("");
              } else {
                setCategoria(e.target.value);
              }
            }}
            className={inputClass}
          >
            {opcoesCategorias.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
            <option value="__nova__">+ Outra categoria...</option>
          </select>
        )}
      </div>

      <div className="sm:col-span-2">
        <label className={labelClass}>Imagem do produto</label>
        <div className="flex items-center gap-4">
          <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border border-rose-light bg-cream">
            {!remover && (preview || previewAtual) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={preview ?? previewAtual ?? ""}
                alt="Pré-visualização"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-[10px] text-chocolate-muted">
                sem imagem
              </div>
            )}
          </div>
          <div className="flex-1 space-y-2">
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleArquivo}
              className="block w-full text-sm text-chocolate-muted file:mr-3 file:rounded-full file:border-0 file:bg-rose-light file:px-4 file:py-1.5 file:text-sm file:font-medium file:text-chocolate hover:file:bg-rose-pastel/30"
            />
            <p className="text-[11px] text-chocolate-muted">
              JPG, PNG ou WebP. A imagem é otimizada automaticamente.
            </p>
            {erroImagem && (
              <p className="text-[11px] text-badge-red-text">{erroImagem}</p>
            )}
            {temImagemAtual && (
              <label className="flex items-center gap-2 text-xs text-chocolate-muted">
                <input
                  type="checkbox"
                  checked={remover}
                  onChange={(e) => {
                    setRemover(e.target.checked);
                    if (e.target.checked) {
                      setImagemBlob(null);
                      setPreview(null);
                    }
                  }}
                  className="h-3.5 w-3.5 rounded border-rose-light text-rose-pastel"
                />
                Remover imagem atual
              </label>
            )}
          </div>
        </div>
      </div>

      <div className="sm:col-span-2">
        <label className={labelClass}>Descrição</label>
        <textarea
          name="descricao"
          rows={2}
          defaultValue={produto?.descricao ?? ""}
          className={inputClass}
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-chocolate sm:col-span-2">
        <input
          type="checkbox"
          name="ativo"
          defaultChecked={produto?.ativo ?? true}
          className="h-4 w-4 rounded border-rose-light text-rose-pastel"
        />
        Produto ativo (visível no cardápio)
      </label>

      <div className="flex flex-col sm:flex-row gap-2 sm:col-span-2">
        <button
          type="submit"
          disabled={enviando}
          className="w-full sm:w-auto rounded-full bg-rose-pastel px-6 py-2.5 text-sm font-semibold text-white hover:bg-chocolate-light transition-colors disabled:opacity-60 text-center"
        >
          {enviando ? "Salvando…" : submitLabel}
        </button>
        {onDone && (
          <button
            type="button"
            onClick={onDone}
            className="w-full sm:w-auto rounded-full border border-rose-light px-5 py-2.5 text-sm font-medium text-chocolate-muted hover:bg-rose-light transition-colors text-center"
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}

/* ==========================================================
   SEÇÃO ESPECÍFICA: PROMOÇÃO EM ESPECÍFICO (BANNER SAZONAL)
   ========================================================== */

function SecaoPromocao({
  promocaoInicial,
  categorias,
}: {
  promocaoInicial?: PromocaoConfig;
  categorias: string[];
}) {
  const [aberto, setAberto] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [mensagemSucesso, setMensagemSucesso] = useState("");
  const [mensagemErro, setMensagemErro] = useState("");

  const [titulo, setTitulo] = useState(
    promocaoInicial?.titulo || "Coleção Especial de Dia das Mães"
  );
  const [subtitulo, setSubtitulo] = useState(
    promocaoInicial?.subtitulo || "Novidade da Temporada"
  );
  const [descricao, setDescricao] = useState(
    promocaoInicial?.descricao ||
      "Kits exclusivos com brigadeiros, trufas e mini bolos decorados. Encomende até 5 de maio e ganhe uma caixa personalizada de presente."
  );
  const [categoria, setCategoria] = useState(
    promocaoInicial?.categoria || "promocoes"
  );
  const [ativo, setAtivo] = useState(promocaoInicial?.ativo ?? true);

  const [modoNovaCategoria, setModoNovaCategoria] = useState(false);
  const [novaCategoria, setNovaCategoria] = useState("");

  const categoriaFinal =
    (modoNovaCategoria ? novaCategoria.trim() : categoria.trim()) || "promocoes";

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();
    setSalvando(true);
    setMensagemSucesso("");
    setMensagemErro("");

    const formData = new FormData();
    formData.append("titulo", titulo);
    formData.append("subtitulo", subtitulo);
    formData.append("descricao", descricao);
    formData.append("categoria", categoriaFinal);
    formData.append("ativo", ativo ? "true" : "false");

    try {
      await salvarPromocaoAction(formData);
      setMensagemSucesso("Promoção atualizada com sucesso no site!");
      setTimeout(() => setMensagemSucesso(""), 4000);
    } catch (err: unknown) {
      setMensagemErro(
        err instanceof Error ? err.message : "Erro ao salvar promoção."
      );
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="rounded-2xl border border-rose-light bg-white shadow-sm overflow-hidden">
      <div className="p-4 sm:p-5 flex items-center justify-between border-b border-rose-light/50 bg-cream/30">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-pastel to-chocolate-light flex items-center justify-center text-white shadow-xs shrink-0">
            <Gift className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-chocolate text-base sm:text-lg">
                Promoção em específico
              </h3>
              {ativo ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-badge-green px-2 py-0.5 text-[11px] font-bold text-badge-green-text border border-badge-green-text/20">
                  Banner ativo no site
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-badge-red px-2 py-0.5 text-[11px] font-medium text-badge-red-text border border-badge-red-text/20">
                  Banner pausado
                </span>
              )}
            </div>
            <p className="text-xs text-chocolate-muted">
              Configure as informações da promoção na página inicial e o direcionamento do botão &quot;Conferir&quot;.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setAberto((v) => !v)}
          className="text-xs font-semibold text-chocolate-muted hover:text-chocolate px-3 py-1.5 rounded-lg border border-rose-light hover:bg-rose-light transition-colors shrink-0"
        >
          {aberto ? "Ocultar" : "Editar"}
        </button>
      </div>

      {aberto && (
        <form onSubmit={handleSalvar} className="p-4 sm:p-6 space-y-5">
          {mensagemSucesso && (
            <div className="rounded-xl bg-badge-green border border-badge-green-text/20 p-3 text-xs font-semibold text-badge-green-text flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{mensagemSucesso}</span>
            </div>
          )}

          {mensagemErro && (
            <div className="rounded-xl bg-badge-red border border-badge-red-text/30 p-3 text-xs font-semibold text-badge-red-text">
              {mensagemErro}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Título da Promoção</label>
              <input
                required
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                className={inputClass}
                placeholder="Ex: Coleção Especial de Dia das Mães"
              />
            </div>

            <div>
              <label className={labelClass}>Selo / Destaque</label>
              <input
                value={subtitulo}
                onChange={(e) => setSubtitulo(e.target.value)}
                className={inputClass}
                placeholder="Ex: Novidade da Temporada"
              />
            </div>

            <div>
              <label className={labelClass}>
                <span className="flex items-center justify-between">
                  <span className="flex items-center gap-1 font-semibold text-chocolate">
                    <Tag className="w-3.5 h-3.5 text-rose-pastel" />
                    Categoria de Destino (Botão Conferir)
                  </span>
                  {!modoNovaCategoria && (
                    <button
                      type="button"
                      onClick={() => {
                        setModoNovaCategoria(true);
                        setNovaCategoria("");
                      }}
                      className="text-[11px] font-medium text-rose-pastel hover:text-chocolate-light hover:underline"
                    >
                      + Nova
                    </button>
                  )}
                </span>
              </label>

              {modoNovaCategoria ? (
                <div className="relative flex items-center">
                  <input
                    type="text"
                    autoFocus
                    required
                    value={novaCategoria}
                    onChange={(e) => setNovaCategoria(e.target.value)}
                    placeholder="Nome da categoria..."
                    className={`${inputClass} pr-8`}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setModoNovaCategoria(false);
                      setNovaCategoria("");
                    }}
                    title="Voltar para categorias existentes"
                    className="absolute right-2 p-1 text-chocolate-muted hover:text-chocolate hover:bg-rose-light/50 rounded-full transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <select
                  value={categoria}
                  onChange={(e) => {
                    if (e.target.value === "__nova__") {
                      setModoNovaCategoria(true);
                      setNovaCategoria("");
                    } else {
                      setCategoria(e.target.value);
                    }
                  }}
                  className={inputClass}
                >
                  {categorias.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                  <option value="__nova__">+ Outra categoria...</option>
                </select>
              )}
              <p className="mt-1 text-[11px] text-chocolate-muted">
                Ao clicar em &quot;Conferir&quot; na Home, os clientes verão todos os produtos cadastrados com a categoria <strong>{categoriaFinal}</strong>.
              </p>
            </div>

            <div>
              <label className={labelClass}>Status do Banner na Home</label>
              <div className="h-10 flex items-center">
                <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-chocolate">
                  <input
                    type="checkbox"
                    checked={ativo}
                    onChange={(e) => setAtivo(e.target.checked)}
                    className="h-4 w-4 rounded border-rose-light text-rose-pastel focus:ring-rose-pastel"
                  />
                  <span>Exibir banner promocional ativo na página inicial</span>
                </label>
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className={labelClass}>Descrição da Promoção</label>
              <textarea
                rows={2}
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                className={inputClass}
                placeholder="Ex: Kits exclusivos com brigadeiros, trufas e mini bolos decorados..."
              />
            </div>
          </div>

          {/* PRÉVIA VISUAL DO BANNER */}
          <div className="space-y-2 pt-2">
            <span className="text-[11px] font-bold text-chocolate-muted uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-rose-pastel" />
              Prévia do Banner na Página Inicial
            </span>
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-chocolate to-chocolate-light p-5 sm:p-6 text-white shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="h-12 w-12 rounded-xl bg-rose-pastel/20 flex items-center justify-center shrink-0">
                    <Gift className="h-6 w-6 text-rose-light" />
                  </div>
                  <div>
                    <span className="block text-[10px] font-semibold uppercase tracking-wider text-rose-pastel">
                      {subtitulo || "Novidade da Temporada"}
                    </span>
                    <h4 className="text-lg font-bold text-white leading-tight">
                      {titulo || "Título da Promoção"}
                    </h4>
                    <p className="text-xs text-cream-dark/80 mt-1 max-w-lg leading-relaxed line-clamp-2">
                      {descricao || "Descrição da promoção..."}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 flex flex-col items-start sm:items-end gap-1">
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-rose-pastel px-4 py-2 text-xs font-semibold text-white shadow-sm opacity-95">
                    <span>Conferir</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-[10px] text-cream/70">
                    → Vai abrir: /cardapio?categoria={categoriaFinal}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={salvando}
              className="rounded-full bg-rose-pastel px-6 py-2.5 text-sm font-bold text-white hover:bg-chocolate-light transition-colors disabled:opacity-60 shadow-sm"
            >
              {salvando ? "Salvando promoção…" : "Salvar Promoção"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default function AdminProdutos({
  produtos,
  categorias = ["doces", "sobremesas", "salgados"],
  promocao,
}: {
  produtos: ProdutoAdmin[];
  categorias?: string[];
  promocao?: PromocaoConfig;
}) {
  const [criando, setCriando] = useState(false);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [filtroCategoria, setFiltroCategoria] = useState("");

  const todasCategoriasDisponiveis = useMemo(() => {
    const set = new Set<string>();
    categorias.forEach((c) => {
      if (c && c.trim()) set.add(c.trim());
    });
    produtos.forEach((p) => {
      if (p.categoria && p.categoria.trim()) set.add(p.categoria.trim());
    });
    if (promocao?.categoria && promocao.categoria.trim()) {
      set.add(promocao.categoria.trim());
    }
    return Array.from(set);
  }, [categorias, produtos, promocao]);

  const produtosFiltrados = useMemo(() => {
    if (!filtroCategoria) return produtos;
    return produtos.filter(
      (p) => p.categoria && p.categoria.toLowerCase() === filtroCategoria.toLowerCase()
    );
  }, [produtos, filtroCategoria]);

  return (
    <div className="space-y-6">
      {/* SEÇÃO ESPECÍFICA DA PROMOÇÃO */}
      <SecaoPromocao
        promocaoInicial={promocao}
        categorias={todasCategoriasDisponiveis}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-xl font-bold text-chocolate">
            Produtos{" "}
            <span className="text-sm font-normal text-chocolate-muted">
              ({produtosFiltrados.length})
            </span>
          </h2>

          <select
            value={filtroCategoria}
            onChange={(e) => setFiltroCategoria(e.target.value)}
            className="rounded-lg border border-rose-light bg-warm-white px-3 py-1.5 text-xs font-medium text-chocolate focus:border-rose-pastel focus:outline-none"
          >
            <option value="">Todas as categorias</option>
            {todasCategoriasDisponiveis.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={() => setCriando((v) => !v)}
          className="rounded-full bg-rose-pastel px-5 py-2.5 text-sm font-semibold text-white hover:bg-chocolate-light transition-colors w-full sm:w-auto text-center"
        >
          {criando ? "Fechar formulário" : "+ Novo produto"}
        </button>
      </div>

      {criando && (
        <div className="rounded-2xl border border-rose-light bg-white p-4 sm:p-6 shadow-sm">
          <h3 className="mb-4 font-semibold text-chocolate">Novo produto</h3>
          <ProdutoForm
            action={criarProdutoAction}
            categorias={todasCategoriasDisponiveis}
            submitLabel="Criar"
            onDone={() => setCriando(false)}
          />
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-rose-light bg-white shadow-sm">
        <div className="sm:hidden px-4 py-2 bg-cream/60 border-b border-rose-light/50 text-[11px] text-chocolate-muted flex items-center justify-between">
          <span>← Deslize para ver todas as colunas →</span>
          <span className="font-semibold">{produtosFiltrados.length} produtos</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[560px]">
            <thead className="bg-cream text-left text-chocolate-muted border-b border-rose-light/60">
              <tr>
                <th className="px-4 py-3 font-medium whitespace-nowrap">Nome</th>
                <th className="px-4 py-3 font-medium whitespace-nowrap">Categoria</th>
                <th className="px-4 py-3 font-medium whitespace-nowrap">Preço</th>
                <th className="px-4 py-3 font-medium whitespace-nowrap">Estoque</th>
                <th className="px-4 py-3 font-medium whitespace-nowrap">Ativo</th>
                <th className="px-4 py-3 font-medium text-right whitespace-nowrap">Ações</th>
              </tr>
            </thead>
            <tbody>
              {produtosFiltrados.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-chocolate-muted"
                  >
                    Nenhum produto cadastrado nesta categoria.
                  </td>
                </tr>
              )}
              {produtosFiltrados.map((produto) => (
                <FragmentRow
                  key={produto.id}
                  produto={produto}
                  categorias={todasCategoriasDisponiveis}
                  editando={editandoId === produto.id}
                  onEditar={() => setEditandoId(produto.id)}
                  onCancelar={() => setEditandoId(null)}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function FragmentRow({
  produto,
  categorias,
  editando,
  onEditar,
  onCancelar,
}: {
  produto: ProdutoAdmin;
  categorias?: string[];
  editando: boolean;
  onEditar: () => void;
  onCancelar: () => void;
}) {
  return (
    <>
      <tr className="border-t border-rose-light/60">
        <td className="px-4 py-3 font-medium text-chocolate">{produto.nome}</td>
        <td className="px-4 py-3">
          {produto.categoria ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-rose-light/50 px-2.5 py-0.5 text-xs font-medium text-chocolate border border-rose-light">
              <Tag className="w-3 h-3 text-rose-pastel" />
              {produto.categoria}
            </span>
          ) : (
            <span className="text-chocolate-muted text-xs">—</span>
          )}
        </td>
        <td className="px-4 py-3 text-chocolate">
          {formatarPreco(produto.preco)}
        </td>
        <td className="px-4 py-3 text-chocolate">{produto.estoque_atual}</td>
        <td className="px-4 py-3">
          {produto.ativo ? (
            <span className="rounded-full bg-badge-green px-2 py-0.5 text-xs text-badge-green-text">
              Ativo
            </span>
          ) : (
            <span className="rounded-full bg-badge-red px-2 py-0.5 text-xs text-badge-red-text">
              Inativo
            </span>
          )}
        </td>
        <td className="px-4 py-3">
          <div className="flex justify-end gap-2">
            <button
              onClick={editando ? onCancelar : onEditar}
              className="rounded-lg border border-rose-light px-3 py-1.5 text-xs font-medium text-chocolate hover:bg-rose-light transition-colors"
            >
              {editando ? "Fechar" : "Editar"}
            </button>
            <form
              action={excluirProdutoAction}
              onSubmit={(e) => {
                if (!confirm(`Excluir "${produto.nome}"?`)) e.preventDefault();
              }}
            >
              <input type="hidden" name="id" value={produto.id} />
              <button
                type="submit"
                className="rounded-lg border border-badge-red px-3 py-1.5 text-xs font-medium text-badge-red-text hover:bg-badge-red transition-colors"
              >
                Excluir
              </button>
            </form>
          </div>
        </td>
      </tr>
      {editando && (
        <tr className="border-t border-rose-light/60 bg-cream/40">
          <td colSpan={6} className="px-4 py-5">
            <ProdutoForm
              produto={produto}
              categorias={categorias}
              action={atualizarProdutoAction}
              submitLabel="Salvar"
              onDone={onCancelar}
            />
          </td>
        </tr>
      )}
    </>
  );
}
