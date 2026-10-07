"use client";

import { useState, useMemo, useRef, useEffect, type ChangeEvent } from "react";
import type { Receita } from "@/lib/receitas";
import type { Insumo } from "@/lib/insumos";
import {
  salvarReceitaAction,
  excluirReceitaAction,
  publicarReceitaAction,
  despublicarReceitaAction,
} from "@/app/admin/actions-receitas";
import {
  ChefHat,
  Plus,
  Search,
  Trash2,
  Edit3,
  Calculator,
  Sparkles,
  Package,
  Flame,
  Percent,
  Scale,
  ChevronDown,
  ChevronUp,
  Check,
  X,
  Upload,
  ImageIcon,
  Globe,
  EyeOff,
  ShoppingBag,
} from "lucide-react";

const inputClass =
  "w-full rounded-lg border border-rose-light bg-warm-white px-3 py-2 text-sm text-chocolate focus:border-rose-pastel focus:outline-none focus:ring-2 focus:ring-rose-pastel/30";

const labelClass = "block text-xs font-semibold text-chocolate mb-1";

function formatarMoeda(valor: number): string {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function normalizarTexto(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

const MAX_DIMENSAO = 1000;
const JPEG_QUALIDADE = 0.82;

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
        (blob) => (blob ? resolve(blob) : reject(new Error("Falha ao processar imagem."))),
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

/* ==========================================================
   COMBOBOX DE INSUMO PARA INGREDIENTE NA RECEITA
   ========================================================== */

function InsumoItemCombobox({
  insumos,
  selectedId,
  onSelect,
}: {
  insumos: Insumo[];
  selectedId: string;
  onSelect: (insumo: Insumo | null) => void;
}) {
  const [aberto, setAberto] = useState(false);
  const [busca, setBusca] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const itemSelecionado = useMemo(
    () => insumos.find((i) => i.id === selectedId),
    [insumos, selectedId]
  );

  useEffect(() => {
    function handleClickFora(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setAberto(false);
      }
    }
    document.addEventListener("mousedown", handleClickFora);
    return () => document.removeEventListener("mousedown", handleClickFora);
  }, []);

  const itensFiltrados = useMemo(() => {
    const termo = normalizarTexto(busca);
    if (!termo) return insumos;
    return insumos.filter((i) => {
      const nomeNorm = normalizarTexto(i.nome);
      const medidaNorm = normalizarTexto(i.tipo_medida);
      return nomeNorm.includes(termo) || medidaNorm.includes(termo);
    });
  }, [insumos, busca]);

  const textoDisplay = itemSelecionado ? itemSelecionado.nome : "";

  return (
    <div ref={containerRef} className="relative flex-1">
      <div className="relative flex items-center">
        <input
          type="text"
          value={aberto ? busca : (busca || textoDisplay)}
          onFocus={() => {
            setAberto(true);
            if (!busca && itemSelecionado) setBusca(itemSelecionado.nome);
          }}
          onChange={(e) => {
            setBusca(e.target.value);
            if (!aberto) setAberto(true);
          }}
          placeholder="Pesquisar insumo/ingrediente..."
          className={`${inputClass} pr-14 bg-white text-xs`}
        />
        <div className="absolute right-1.5 flex items-center gap-1">
          {(busca || itemSelecionado) && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setBusca("");
                onSelect(null);
              }}
              title="Limpar seleção"
              className="p-1 rounded-full text-chocolate-muted hover:text-chocolate hover:bg-rose-light/50 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          )}
          <button
            type="button"
            onClick={() => setAberto((v) => !v)}
            title="Abrir/Fechar lista"
            className="p-1 rounded text-chocolate-muted hover:text-chocolate hover:bg-rose-light transition-colors"
          >
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform duration-200 ${
                aberto ? "rotate-180 text-rose-pastel" : ""
              }`}
            />
          </button>
        </div>
      </div>

      {aberto && (
        <div className="absolute left-0 right-0 top-full mt-1 z-50 rounded-xl border border-rose-light bg-white shadow-xl max-h-52 overflow-y-auto overscroll-contain">
          {itensFiltrados.length === 0 ? (
            <div className="p-3 text-center text-xs text-chocolate-muted">
              Nenhum insumo encontrado com "{busca}".
            </div>
          ) : (
            <div className="divide-y divide-rose-light/30">
              {itensFiltrados.map((i) => {
                const selecionado = i.id === selectedId;
                const sufixo =
                  i.tipo_medida === "GRAMA"
                    ? "g"
                    : i.tipo_medida === "MILILITRO"
                    ? "ml"
                    : "un";

                return (
                  <button
                    key={i.id}
                    type="button"
                    onClick={() => {
                      onSelect(i);
                      setBusca("");
                      setAberto(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs hover:bg-cream/60 transition-colors flex items-center justify-between gap-2 ${
                      selecionado
                        ? "bg-cream/80 font-semibold text-chocolate border-l-4 border-rose-pastel"
                        : "text-chocolate"
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-chocolate truncate">{i.nome}</div>
                      <div className="text-[11px] text-chocolate-muted truncate">
                        Custo: {formatarMoeda(i.custo_por_unidade_base)} / 1{sufixo}
                      </div>
                    </div>
                    {selecionado && (
                      <Check className="w-3.5 h-3.5 text-rose-pastel shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ==========================================================
   FORMULÁRIO DE FICHA TÉCNICA (COM IMAGEM)
   ========================================================== */

interface ItemLinhaIngrediente {
  tempId: string;
  insumoId: string;
  quantidade: number;
}

function ReceitaForm({
  receita,
  insumos,
  onDone,
}: {
  receita?: Receita;
  insumos: Insumo[];
  onDone: () => void;
}) {
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const [nome, setNome] = useState(receita?.nome ?? "");
  const [rendimento, setRendimento] = useState<number>(receita?.rendimento ?? 1);
  const [custoEmbalagem, setCustoEmbalagem] = useState<number>(
    receita?.custo_embalagem ?? 0
  );
  const [taxaInvisiveis, setTaxaInvisiveis] = useState<number>(
    receita?.taxa_custos_invisiveis ?? 20
  );
  const [margemLucro, setMargemLucro] = useState<number>(
    receita?.margem_lucro_desejada ?? 150
  );

  // Estados de Imagem
  const [imagemBlob, setImagemBlob] = useState<Blob | null>(null);
  const [preview, setPreview] = useState<string | null>(receita?.url_imagem ?? null);
  const [removerImagem, setRemoverImagem] = useState(false);

  // Inicializar linhas de ingredientes
  const [linhas, setLinhas] = useState<ItemLinhaIngrediente[]>(() => {
    if (receita && receita.ingredientes && receita.ingredientes.length > 0) {
      return receita.ingredientes.map((ing) => ({
        tempId: ing.id,
        insumoId: ing.insumo_id,
        quantidade: ing.quantidade_utilizada,
      }));
    }
    return [{ tempId: "row-1", insumoId: "", quantidade: 0 }];
  });

  const adicionarLinha = () => {
    setLinhas((prev) => [
      ...prev,
      { tempId: `row-${Date.now()}-${Math.random()}`, insumoId: "", quantidade: 0 },
    ]);
  };

  const removerLinha = (tempId: string) => {
    setLinhas((prev) => prev.filter((l) => l.tempId !== tempId));
  };

  const atualizarLinhaInsumo = (tempId: string, insumo: Insumo | null) => {
    setLinhas((prev) =>
      prev.map((l) =>
        l.tempId === tempId ? { ...l, insumoId: insumo ? insumo.id : "" } : l
      )
    );
  };

  const atualizarLinhaQtd = (tempId: string, qtd: number) => {
    setLinhas((prev) =>
      prev.map((l) => (l.tempId === tempId ? { ...l, quantidade: qtd } : l))
    );
  };

  const handleArquivoImagem = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const blob = await redimensionarImagem(file);
      setImagemBlob(blob);
      setPreview(URL.createObjectURL(blob));
      setRemoverImagem(false);
    } catch {
      setErro("Falha ao processar imagem selecionada.");
    }
  };

  const insumosMap = useMemo(() => {
    const map = new Map<string, Insumo>();
    insumos.forEach((i) => map.set(i.id, i));
    return map;
  }, [insumos]);

  const calculos = useMemo(() => {
    let custoIngredientes = 0;

    linhas.forEach((linha) => {
      const insumo = insumosMap.get(linha.insumoId);
      if (insumo && linha.quantidade > 0) {
        custoIngredientes += linha.quantidade * insumo.custo_por_unidade_base;
      }
    });

    const valorInvisiveis = custoIngredientes * (taxaInvisiveis / 100);
    const custoProducaoTotal = custoIngredientes + valorInvisiveis + custoEmbalagem;
    const rend = Math.max(1, rendimento);
    const custoPorPorcao = custoProducaoTotal / rend;

    const precoSugeridoTotal = custoProducaoTotal * (1 + margemLucro / 100);
    const precoSugeridoPorcao = precoSugeridoTotal / rend;
    const lucroTotal = precoSugeridoTotal - custoProducaoTotal;
    const lucroPorPorcao = lucroTotal / rend;

    return {
      custoIngredientes,
      valorInvisiveis,
      custoProducaoTotal,
      custoPorPorcao,
      precoSugeridoTotal,
      precoSugeridoPorcao,
      lucroTotal,
      lucroPorPorcao,
    };
  }, [linhas, insumosMap, taxaInvisiveis, custoEmbalagem, rendimento, margemLucro]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);

    const ingredientesValidos = linhas
      .filter((l) => l.insumoId && l.quantidade > 0)
      .map((l) => ({
        insumo_id: l.insumoId,
        quantidade_utilizada: l.quantidade,
      }));

    if (ingredientesValidos.length === 0) {
      setErro("Adicione pelo menos um ingrediente com quantidade válida à receita.");
      return;
    }

    const formData = new FormData();
    if (receita) formData.append("id", receita.id);
    formData.append("nome", nome);
    formData.append("rendimento", String(rendimento));
    formData.append("custo_embalagem", String(custoEmbalagem));
    formData.append("taxa_custos_invisiveis", String(taxaInvisiveis));
    formData.append("margem_lucro_desejada", String(margemLucro));
    formData.append("ingredientes_json", JSON.stringify(ingredientesValidos));

    if (removerImagem) {
      formData.append("remover_imagem", "on");
    } else if (imagemBlob) {
      formData.append("imagem", imagemBlob, "imagem.jpg");
    }

    setEnviando(true);
    try {
      await salvarReceitaAction(formData);
      onDone();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao salvar receita.";
      setErro(msg);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {erro && (
        <div className="rounded-xl bg-badge-red border border-badge-red-text/30 p-3 text-xs font-semibold text-badge-red-text">
          {erro}
        </div>
      )}

      {/* DADOS GERAIS + UPLOAD DE FOTO */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* FOTO DA RECEITA */}
        <div className="md:col-span-1 flex flex-col items-center justify-center p-3 rounded-2xl border-2 border-dashed border-rose-light bg-cream/20 text-center">
          <label className="block text-xs font-semibold text-chocolate mb-2">
            Foto do Doce / Receita
          </label>
          <div className="relative w-28 h-28 rounded-xl overflow-hidden bg-warm-white border border-rose-light flex items-center justify-center mb-2 shadow-xs">
            {preview && !removerImagem ? (
              <img
                src={preview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center p-2 text-chocolate-muted">
                <ImageIcon className="w-8 h-8 mx-auto text-rose-pastel/60 mb-1" />
                <span className="text-[10px] block">Sem imagem</span>
              </div>
            )}
          </div>

          <label className="cursor-pointer inline-flex items-center gap-1 rounded-full bg-white border border-rose-light px-3 py-1 text-xs font-semibold text-chocolate hover:bg-rose-light transition-colors shadow-xs">
            <Upload className="w-3.5 h-3.5 text-rose-pastel" />
            <span>{preview ? "Alterar foto" : "Subir foto"}</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleArquivoImagem}
            />
          </label>

          {preview && !removerImagem && (
            <button
              type="button"
              onClick={() => {
                setRemoverImagem(true);
                setImagemBlob(null);
              }}
              className="mt-1 text-[11px] text-badge-red-text hover:underline"
            >
              Remover foto
            </button>
          )}
        </div>

        {/* CAMPOS DA RECEITA */}
        <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className={labelClass}>Nome da Receita / Doce</label>
            <input
              required
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className={inputClass}
              placeholder="Ex: Bolo de Cenoura com Brigadeiro Gourmet"
            />
          </div>

          <div>
            <label className={labelClass}>Rendimento (Porções / Fatias / Doces)</label>
            <input
              type="number"
              min="1"
              step="1"
              required
              value={rendimento}
              onChange={(e) => setRendimento(parseInt(e.target.value) || 1)}
              className={inputClass}
              placeholder="Ex: 1 (bolo) ou 12 (fatias)"
            />
          </div>

          <div>
            <label className={labelClass}>
              <span className="flex items-center gap-1">
                <Package className="w-3.5 h-3.5 text-chocolate-muted" />
                Custo da Embalagem (R$)
              </span>
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={custoEmbalagem}
              onChange={(e) => setCustoEmbalagem(parseFloat(e.target.value) || 0)}
              className={inputClass}
              placeholder="Ex: 3.50 (caixa, fita)"
            />
          </div>

          <div>
            <label className={labelClass}>
              <span className="flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                Custos Invisíveis: Gás/Luz (%)
              </span>
            </label>
            <input
              type="number"
              step="1"
              min="0"
              value={taxaInvisiveis}
              onChange={(e) => setTaxaInvisiveis(parseFloat(e.target.value) || 0)}
              className={inputClass}
              placeholder="Ex: 20 (recomendado 20% a 25%)"
            />
          </div>

          <div>
            <label className={labelClass}>
              <span className="flex items-center gap-1">
                <Percent className="w-3.5 h-3.5 text-rose-pastel" />
                Margem de Lucro Desejada (%)
              </span>
            </label>
            <input
              type="number"
              step="1"
              min="0"
              value={margemLucro}
              onChange={(e) => setMargemLucro(parseFloat(e.target.value) || 0)}
              className={inputClass}
              placeholder="Ex: 150 (para 150% de lucro)"
            />
          </div>
        </div>
      </div>

      {/* SEÇÃO DE INGREDIENTES */}
      <div className="rounded-2xl border border-rose-light bg-cream/30 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-bold text-chocolate text-sm flex items-center gap-1.5">
              <ChefHat className="w-4 h-4 text-rose-pastel" />
              Ingredientes da Ficha Técnica
            </h4>
            <p className="text-[11px] text-chocolate-muted">
              Selecione o insumo do estoque e digite a quantidade usada (em gramas, ml ou unidades).
            </p>
          </div>

          <button
            type="button"
            onClick={adicionarLinha}
            className="flex items-center gap-1 rounded-full bg-white border border-rose-light px-3 py-1 text-xs font-semibold text-chocolate hover:bg-rose-light transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5 text-rose-pastel" />
            Adicionar Ingrediente
          </button>
        </div>

        <div className="space-y-2.5 pt-1">
          {linhas.map((linha, idx) => {
            const insumoAtual = insumosMap.get(linha.insumoId);
            const sufixo =
              insumoAtual?.tipo_medida === "GRAMA"
                ? "g"
                : insumoAtual?.tipo_medida === "MILILITRO"
                ? "ml"
                : "un";

            const subtotal =
              insumoAtual && linha.quantidade > 0
                ? linha.quantidade * insumoAtual.custo_por_unidade_base
                : 0;

            return (
              <div
                key={linha.tempId}
                className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 rounded-xl bg-white p-2.5 border border-rose-light/60 shadow-xs"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className="text-xs font-bold text-chocolate-muted w-5 shrink-0 text-center">
                    {idx + 1}.
                  </span>
                  <InsumoItemCombobox
                    insumos={insumos}
                    selectedId={linha.insumoId}
                    onSelect={(insumo) => atualizarLinhaInsumo(linha.tempId, insumo)}
                  />
                </div>

                <div className="flex items-center justify-between sm:justify-start gap-2 pt-1 sm:pt-0">
                  <div className="relative flex-1 sm:flex-initial sm:w-32">
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={linha.quantidade || ""}
                      onChange={(e) =>
                        atualizarLinhaQtd(linha.tempId, parseFloat(e.target.value) || 0)
                      }
                      placeholder="Qtd usada"
                      className={`${inputClass} pr-7 text-xs`}
                    />
                    <span className="absolute right-2.5 top-2 text-[11px] font-semibold text-chocolate-muted uppercase">
                      {insumoAtual ? sufixo : "-"}
                    </span>
                  </div>

                  <div className="w-24 text-right shrink-0">
                    <span className="text-[10px] text-chocolate-muted block">Subtotal:</span>
                    <strong className="text-xs font-bold text-chocolate">
                      {formatarMoeda(subtotal)}
                    </strong>
                  </div>

                  <button
                    type="button"
                    onClick={() => removerLinha(linha.tempId)}
                    title="Remover ingrediente"
                    disabled={linhas.length === 1}
                    className="p-1.5 rounded-lg text-chocolate-muted hover:text-badge-red-text hover:bg-badge-red transition-colors disabled:opacity-30 shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* PAINEL DE PRECIFICAÇÃO E LUCRO EM TEMPO REAL */}
      <div className="rounded-2xl border-2 border-rose-pastel/60 bg-warm-white p-5 space-y-3 shadow-sm">
        <div className="flex items-center justify-between pb-2 border-b border-rose-light/60">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-rose-pastel" />
            <h4 className="font-bold text-chocolate text-base">
              Painel Financeiro & Precificação Sugerida
            </h4>
          </div>
          <span className="text-xs font-semibold rounded-full bg-rose-light px-2.5 py-0.5 text-chocolate">
            Rendimento: {rendimento} {rendimento === 1 ? "porção" : "porções"}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="rounded-xl bg-cream/70 p-3">
            <span className="text-chocolate-muted block text-[11px]">Custo dos Ingredientes:</span>
            <strong className="text-sm text-chocolate font-bold">
              {formatarMoeda(calculos.custoIngredientes)}
            </strong>
          </div>

          <div className="rounded-xl bg-cream/70 p-3">
            <span className="text-chocolate-muted block text-[11px]">Custos Invisíveis ({taxaInvisiveis}%):</span>
            <strong className="text-sm text-chocolate font-bold">
              {formatarMoeda(calculos.valorInvisiveis)}
            </strong>
          </div>

          <div className="rounded-xl bg-cream/70 p-3">
            <span className="text-chocolate-muted block text-[11px]">Embalagem:</span>
            <strong className="text-sm text-chocolate font-bold">
              {formatarMoeda(custoEmbalagem)}
            </strong>
          </div>

          <div className="rounded-xl bg-rose-light/60 border border-rose-light p-3">
            <span className="text-chocolate-muted block text-[11px]">CUSTO DE PRODUÇÃO:</span>
            <strong className="text-base text-chocolate font-extrabold block">
              {formatarMoeda(calculos.custoProducaoTotal)}
            </strong>
            {rendimento > 1 && (
              <span className="text-[11px] text-chocolate-muted">
                ({formatarMoeda(calculos.custoPorPorcao)} / porção)
              </span>
            )}
          </div>
        </div>

        <div className="rounded-xl bg-gradient-to-r from-cream via-rose-light/40 to-cream border border-rose-light/80 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-0.5 text-center sm:text-left">
            <span className="text-xs font-semibold text-rose-pastel uppercase tracking-wider flex items-center gap-1 justify-center sm:justify-start">
              <Sparkles className="w-3.5 h-3.5" />
              Preço de Venda Sugerido ({margemLucro}% de margem)
            </span>
            <div className="text-2xl font-black text-chocolate tracking-tight">
              {formatarMoeda(calculos.precoSugeridoTotal)}
            </div>
            {rendimento > 1 && (
              <div className="text-xs font-bold text-chocolate-light">
                👉 {formatarMoeda(calculos.precoSugeridoPorcao)} por cada porção/fatia
              </div>
            )}
          </div>

          <div className="flex items-center gap-4 bg-white/80 rounded-xl px-4 py-2.5 border border-rose-light/60 text-center sm:text-right">
            <div>
              <span className="text-[11px] text-chocolate-muted block">Lucro Líquido Estimado:</span>
              <strong className="text-lg font-bold text-badge-green-text">
                +{formatarMoeda(calculos.lucroTotal)}
              </strong>
              {rendimento > 1 && (
                <span className="text-[11px] text-chocolate-muted block">
                  (+{formatarMoeda(calculos.lucroPorPorcao)} / porção)
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          disabled={enviando}
          className="rounded-full bg-rose-pastel px-6 py-2.5 text-sm font-semibold text-white hover:bg-chocolate-light transition-colors disabled:opacity-60 shadow-sm"
        >
          {enviando ? "Salvando…" : receita ? "Salvar Alterações" : "Criar Ficha Técnica"}
        </button>
        <button
          type="button"
          onClick={onDone}
          className="rounded-full border border-rose-light px-5 py-2.5 text-sm font-medium text-chocolate-muted hover:bg-rose-light transition-colors"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}

/* ==========================================================
   MODAL DE CONFIRMAÇÃO & PUBLICAÇÃO DO PRODUTO NA LOJA
   ========================================================== */

function ModalPublicarReceita({
  receita,
  modo = "publicar",
  onClose,
}: {
  receita: Receita;
  modo?: "publicar" | "editar_loja";
  onClose: () => void;
}) {
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const [nome, setNome] = useState(receita.nome);
  const [categoria, setCategoria] = useState(receita.categoria || "doces");
  const [descricao, setDescricao] = useState(receita.descricao || "");

  // Preço inicial: pode ser o total ou o por fatia dependendo do rendimento
  const [preco, setPreco] = useState<number>(() => {
    if (receita.produto_preco && receita.produto_preco > 0) {
      return receita.produto_preco;
    }
    return receita.rendimento > 1
      ? Math.round(receita.preco_sugerido_porcao * 100) / 100
      : Math.round(receita.preco_sugerido_total * 100) / 100;
  });

  const estoqueAtualSite =
    receita.produto_estoque !== null && receita.produto_estoque !== undefined
      ? receita.produto_estoque
      : 0;

  const jaPublicado = Boolean(receita.publicado || receita.produto_id);

  // Se o modo for publicar e já existe produto na loja, por padrão somamos ao estoque!
  const [somarAoEstoque, setSomarAoEstoque] = useState<boolean>(
    modo === "publicar" && jaPublicado
  );

  // Quantidade a publicar para venda:
  // Campo sempre VAZIO por padrão para o admin preencher sem o "0" atrapalhar
  const [estoque, setEstoque] = useState<string>("");
  const [subtrairInsumos, setSubtrairInsumos] = useState<boolean>(true);

  // Imagem
  const [imagemBlob, setImagemBlob] = useState<Blob | null>(null);
  const [preview, setPreview] = useState<string | null>(receita.url_imagem ?? null);

  const qtdNumerica = Math.max(0, parseInt(estoque, 10) || 0);
  const rendimentoReceita = Math.max(1, receita.rendimento);
  const fatorLote = qtdNumerica / rendimentoReceita;

  const handleArquivoImagem = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const blob = await redimensionarImagem(file);
      setImagemBlob(blob);
      setPreview(URL.createObjectURL(blob));
    } catch {
      setErro("Falha ao processar nova imagem.");
    }
  };

  const handleConfirmar = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);

    const qtdNum = parseInt(estoque, 10);
    if (isNaN(qtdNum) || qtdNum <= 0) {
      setErro("Por favor, digite a quantidade a ser publicada no site.");
      return;
    }

    const formData = new FormData();
    formData.append("receita_id", receita.id);
    formData.append("nome", nome);
    formData.append("categoria", categoria);
    formData.append("descricao", descricao);
    formData.append("preco", String(preco));
    formData.append("estoque_atual", String(qtdNum));
    formData.append("somar_ao_estoque", somarAoEstoque ? "true" : "false");
    formData.append("subtrair_insumos_estoque", subtrairInsumos ? "true" : "false");

    if (imagemBlob) {
      formData.append("imagem", imagemBlob, "imagem.jpg");
    }

    setEnviando(true);
    try {
      await publicarReceitaAction(formData);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao publicar produto.";
      setErro(msg);
    } finally {
      setEnviando(false);
    }
  };

  const tituloModal =
    modo === "editar_loja"
      ? "Editar Produto na Loja"
      : jaPublicado
      ? "Publicar Lote no Site (Somar ao Estoque)"
      : "Publicar Produto no Site";

  const subtituloModal =
    modo === "editar_loja"
      ? "Ajuste os dados de exibição, preço de venda e estoque direto no cardápio online."
      : jaPublicado
      ? "Adicione mais unidades recém-produzidas ao cardápio online (o novo lote será somado ao estoque atual)."
      : "Disponibilize este doce da ficha técnica no cardápio de vendas para os clientes.";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-chocolate/50 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-xl rounded-3xl bg-white border border-rose-light p-4 sm:p-6 shadow-2xl space-y-4 sm:space-y-5 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-rose-light/60">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                modo === "editar_loja"
                  ? "bg-badge-green text-badge-green-text"
                  : "bg-rose-pastel/20 text-rose-pastel"
              }`}
            >
              {modo === "editar_loja" ? (
                <ShoppingBag className="w-5 h-5 text-badge-green-text" />
              ) : (
                <Globe className="w-5 h-5 text-rose-pastel" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-bold text-chocolate">{tituloModal}</h3>
              <p className="text-xs text-chocolate-muted">{subtituloModal}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-chocolate-muted hover:bg-rose-light transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {erro && (
          <div className="rounded-xl bg-badge-red border border-badge-red-text/30 p-3 text-xs font-semibold text-badge-red-text">
            {erro}
          </div>
        )}

        {/* ALERTA DE ESTOQUE EXISTENTE QUANDO FOR PUBLICAR NOVO LOTE */}
        {modo === "publicar" && jaPublicado && (
          <div className="rounded-2xl bg-cream/80 border border-rose-light p-3.5 flex items-start gap-3 shadow-xs">
            <div className="p-2 rounded-xl bg-badge-green text-badge-green-text shrink-0">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div className="text-xs text-chocolate space-y-1">
              <p className="font-bold text-chocolate">
                Produto já ativo no site:{" "}
                <span className="text-badge-green-text bg-badge-green/60 px-2 py-0.5 rounded-md font-extrabold">
                  {estoqueAtualSite} {estoqueAtualSite === 1 ? "unidade" : "unidades"} em estoque
                </span>
              </p>
              <p className="text-chocolate-muted text-[11px] leading-relaxed">
                Ao publicar novamente, a quantidade informada será{" "}
                <strong className="text-chocolate font-bold">somada automaticamente</strong> ao estoque existente na loja (ex: {estoqueAtualSite} + {qtdNumerica} = {estoqueAtualSite + qtdNumerica} un).
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleConfirmar} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* PREVIEW E UPLOAD DE IMAGEM */}
            <div className="sm:col-span-1 flex flex-col items-center justify-center p-3 rounded-2xl bg-cream/40 border border-rose-light/70 text-center">
              <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-white border border-rose-light flex items-center justify-center mb-2 shadow-xs">
                {preview ? (
                  <img src={preview} alt="Foto" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-8 h-8 text-rose-pastel/60" />
                )}
              </div>
              <label className="cursor-pointer inline-flex items-center gap-1 rounded-full bg-white border border-rose-light px-2.5 py-1 text-[11px] font-semibold text-chocolate hover:bg-rose-light transition-colors shadow-xs">
                <Upload className="w-3 h-3 text-rose-pastel" />
                <span>{preview ? "Alterar foto" : "Adicionar foto"}</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleArquivoImagem}
                />
              </label>
              {receita.url_imagem && !imagemBlob && (
                <span className="text-[10px] text-chocolate-muted mt-1">
                  Foto da Ficha Técnica
                </span>
              )}
            </div>

            {/* DADOS PRINCIPAIS */}
            <div className="sm:col-span-2 space-y-3">
              <div>
                <label className={labelClass}>Nome do Produto no Cardápio</label>
                <input
                  required
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Categoria na Loja</label>
                <select
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value)}
                  className={inputClass}
                >
                  <option value="doces">Doces & Bolos</option>
                  <option value="sobremesas">Sobremesas</option>
                  <option value="salgados">Salgados</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className={labelClass}>Descrição para os Clientes (opcional)</label>
            <textarea
              rows={2}
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              className={inputClass}
              placeholder="Ex: Massa fofinha de cenoura com cobertura aveludada de brigadeiro gourmet tradicional."
            />
          </div>

          {/* PREÇO E QUANTIDADE A PUBLICAR COM DISTRIBUIÇÃO BALANCEADA */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-2xl bg-cream/40 border border-rose-light/80 p-4">
            {/* COLUNA ESQUERDA: PREÇO DE VENDA + RESUMO DE ESTOQUE DA LOJA */}
            <div className="flex flex-col justify-between space-y-3">
              <div>
                <label className={labelClass}>Preço de Venda ao Cliente (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={preco}
                  onChange={(e) => setPreco(parseFloat(e.target.value) || 0)}
                  className={inputClass}
                />
                <div className="mt-1 flex gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setPreco(Math.round(receita.preco_sugerido_total * 100) / 100)
                    }
                    className="text-[10px] text-chocolate-light hover:underline"
                  >
                    Usar Total ({formatarMoeda(receita.preco_sugerido_total)})
                  </button>
                  {receita.rendimento > 1 && (
                    <button
                      type="button"
                      onClick={() =>
                        setPreco(Math.round(receita.preco_sugerido_porcao * 100) / 100)
                      }
                      className="text-[10px] text-chocolate-light hover:underline"
                    >
                      Usar p/ Fatia ({formatarMoeda(receita.preco_sugerido_porcao)})
                    </button>
                  )}
                </div>
              </div>

              {/* CARD DE SOMA DO ESTOQUE NA LATERAL ESQUERDA */}
              <div className="rounded-xl bg-white border border-badge-green-text/30 p-3 space-y-2 shadow-2xs">
                <span className="text-[11px] font-bold text-chocolate uppercase tracking-wider flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-rose-pastel" />
                  Estoque no Cardápio Online
                </span>

                {somarAoEstoque && jaPublicado ? (
                  <>
                    <div className="rounded-lg bg-badge-green/35 border border-badge-green-text/25 p-2 flex items-center justify-between text-xs text-badge-green-text font-medium">
                      <span>
                        No site: <strong>{estoqueAtualSite} un</strong>
                      </span>
                      <span className="font-bold text-sm">+</span>
                      <span>
                        Novo: <strong>{qtdNumerica} un</strong>
                      </span>
                      <span className="font-bold text-sm">=</span>
                      <span className="font-extrabold text-xs bg-badge-green text-badge-green-text px-2 py-0.5 rounded-md border border-badge-green-text/20 shadow-2xs">
                        Total: {estoqueAtualSite + qtdNumerica} un
                      </span>
                    </div>

                    {modo === "publicar" && (
                      <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-chocolate font-medium pt-0.5">
                        <input
                          type="checkbox"
                          checked={somarAoEstoque}
                          onChange={(e) => setSomarAoEstoque(e.target.checked)}
                          className="rounded border-rose-light text-rose-pastel focus:ring-rose-pastel"
                        />
                        <span>
                          Somar com o estoque já publicado ({estoqueAtualSite} + {qtdNumerica} = {estoqueAtualSite + qtdNumerica} un)
                        </span>
                      </label>
                    )}

                    <p className="text-[11px] text-chocolate-muted leading-tight">
                      {qtdNumerica > 0
                        ? `Serão somadas ${qtdNumerica} unidades às ${estoqueAtualSite} unidades que já estão no site.`
                        : "Digite a quantidade ao lado para calcular o novo total."}
                    </p>
                  </>
                ) : (
                  <div className="space-y-1">
                    <p className="text-xs text-chocolate font-semibold">
                      {modo === "editar_loja"
                        ? `Estoque gravado no site: ${estoqueAtualSite} un`
                        : `Definirá o estoque do site para ${qtdNumerica} un`}
                    </p>
                    {jaPublicado && modo === "publicar" && (
                      <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-chocolate font-medium pt-1">
                        <input
                          type="checkbox"
                          checked={somarAoEstoque}
                          onChange={(e) => setSomarAoEstoque(e.target.checked)}
                          className="rounded border-rose-light text-rose-pastel focus:ring-rose-pastel"
                        />
                        <span>Ativar soma ao estoque atual ({estoqueAtualSite} un)</span>
                      </label>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* COLUNA DIREITA: QUANTIDADE (CAMPO VAZIO SEM O 0) + BAIXA DE INSUMOS */}
            <div className="flex flex-col justify-between space-y-3">
              <div>
                <label className={labelClass}>
                  {modo === "editar_loja"
                    ? "Estoque Atual na Loja"
                    : somarAoEstoque
                    ? "Quantidade a Adicionar / Somar (+)"
                    : "Quantidade a Publicar (Estoque)"}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    step="1"
                    required
                    value={estoque}
                    onChange={(e) => setEstoque(e.target.value)}
                    className={`${inputClass} font-semibold`}
                    placeholder="Digite a quantidade (ex: 10)"
                    autoFocus
                  />
                  <span className="text-xs font-bold text-chocolate-muted uppercase">
                    un
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-chocolate-muted">
                  {receita.rendimento > 1
                    ? `Rendimento da receita: ${receita.rendimento} porções por fornada.`
                    : "Quantidade de unidades prontas para venda."}
                </p>
              </div>

              {/* CARD DE BAIXA AUTOMÁTICA NO ESTOQUE DE INSUMOS */}
              <div className="rounded-xl bg-white border border-amber-300/70 p-3 space-y-2 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Scale className="w-3.5 h-3.5 text-amber-700" />
                    Baixa no Estoque de Insumos
                  </span>
                  {modo === "publicar" && (
                    <label className="flex items-center gap-1.5 cursor-pointer select-none text-[11px] font-medium text-chocolate">
                      <input
                        type="checkbox"
                        checked={subtrairInsumos}
                        onChange={(e) => setSubtrairInsumos(e.target.checked)}
                        className="rounded border-rose-light text-rose-pastel focus:ring-rose-pastel"
                      />
                      <span>Subtrair insumos</span>
                    </label>
                  )}
                </div>

                {subtrairInsumos ? (
                  qtdNumerica > 0 ? (
                    <div className="space-y-1.5">
                      <div className="text-[11px] text-chocolate-muted font-medium">
                        Será deduzido do estoque ({fatorLote.toFixed(1).replace(".0", "")}x da receita):
                      </div>
                      <div className="max-h-24 overflow-y-auto space-y-1 pr-1 divide-y divide-amber-100">
                        {receita.ingredientes.map((ing) => {
                          const gasto = Math.round(ing.quantidade_utilizada * fatorLote * 100) / 100;
                          const sufixo =
                            ing.insumo_tipo_medida === "GRAMA"
                              ? "g"
                              : ing.insumo_tipo_medida === "MILILITRO"
                              ? "ml"
                              : "un";
                          return (
                            <div
                              key={ing.id}
                              className="flex items-center justify-between text-xs pt-1 text-chocolate"
                            >
                              <span className="truncate pr-2 font-medium">{ing.insumo_nome}</span>
                              <span className="font-bold text-badge-red-text shrink-0">
                                -{gasto.toLocaleString("pt-BR")} {sufixo}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <p className="text-[11px] text-chocolate-muted italic">
                      Digite a quantidade acima para ver os insumos que serão abatidos do estoque.
                    </p>
                  )
                ) : (
                  <p className="text-[11px] text-chocolate-muted">
                    Subtração de insumos desmarcada. O estoque de insumos não será alterado.
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-rose-light/60">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-rose-light px-5 py-2 text-xs font-semibold text-chocolate-muted hover:bg-rose-light transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={enviando}
              className="rounded-full bg-rose-pastel px-6 py-2 text-xs font-bold text-white hover:bg-chocolate-light transition-colors disabled:opacity-60 shadow-sm"
            >
              {enviando
                ? "Processando…"
                : modo === "editar_loja"
                ? "Salvar Alterações na Loja"
                : somarAoEstoque
                ? qtdNumerica > 0
                  ? `Confirmar e Publicar (+${qtdNumerica} un)`
                  : "Confirmar e Publicar"
                : "Confirmar e Publicar no Site"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ==========================================================
   COMPONENTE PRINCIPAL: ADMIN RECEITAS
   ========================================================== */

export default function AdminReceitas({
  receitas,
  insumos,
}: {
  receitas: Receita[];
  insumos: Insumo[];
}) {
  const [criando, setCriando] = useState(false);
  const [editandoReceita, setEditandoReceita] = useState<Receita | null>(null);
  const [receitaPublicando, setReceitaPublicando] = useState<Receita | null>(null);
  const [modoPublicacao, setModoPublicacao] = useState<"publicar" | "editar_loja">("publicar");
  const [busca, setBusca] = useState("");
  const [expandidos, setExpandidos] = useState<Record<string, boolean>>({});

  const toggleExpandir = (id: string) => {
    setExpandidos((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const receitasFiltradas = useMemo(() => {
    const termo = normalizarTexto(busca);
    if (!termo) return receitas;
    return receitas.filter((r) => normalizarTexto(r.nome).includes(termo));
  }, [receitas, busca]);

  return (
    <div className="space-y-6">
      {/* CABEÇALHO */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-rose-light/70 pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-chocolate tracking-tight flex items-center gap-2">
            <ChefHat className="w-6 h-6 text-rose-pastel shrink-0" />
            <span>Fichas Técnicas & Precificação</span>
          </h2>
          <p className="text-xs text-chocolate-muted mt-0.5">
            Calcule custos exatos, margem de lucro e publique diretamente no cardápio online para seus clientes
          </p>
        </div>

        <button
          onClick={() => {
            setEditandoReceita(null);
            setCriando((v) => !v);
          }}
          className="flex items-center justify-center gap-2 rounded-full bg-rose-pastel px-5 py-2.5 text-sm font-semibold text-white hover:bg-chocolate-light transition-colors shadow-sm w-full sm:w-auto shrink-0"
        >
          <Plus className="w-4 h-4" />
          {criando ? "Fechar formulário" : "Nova Ficha Técnica"}
        </button>
      </div>

      {/* FORMULÁRIO DE CRIAÇÃO / EDIÇÃO */}
      {(criando || editandoReceita) && (
        <div className="rounded-2xl border border-rose-light bg-white p-4 sm:p-6 shadow-sm">
          <h3 className="font-bold text-chocolate mb-4 pb-2 border-b border-rose-light/50 flex items-center gap-2">
            <ChefHat className="w-5 h-5 text-rose-pastel" />
            {editandoReceita ? `Editar Ficha Técnica: ${editandoReceita.nome}` : "Criar Nova Ficha Técnica"}
          </h3>
          <ReceitaForm
            receita={editandoReceita ?? undefined}
            insumos={insumos}
            onDone={() => {
              setCriando(false);
              setEditandoReceita(null);
            }}
          />
        </div>
      )}

      {/* MODAL DE PUBLICAÇÃO */}
      {receitaPublicando && (
        <ModalPublicarReceita
          receita={receitaPublicando}
          modo={modoPublicacao}
          onClose={() => setReceitaPublicando(null)}
        />
      )}

      {/* BARRA DE PESQUISA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-3 text-chocolate-muted" />
          <input
            type="text"
            placeholder="Pesquisar ficha técnica por nome..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className={`${inputClass} pl-9`}
          />
        </div>
        <span className="text-xs font-semibold text-chocolate-muted">
          {receitasFiltradas.length} {receitasFiltradas.length === 1 ? "receita encontrada" : "receitas encontradas"}
        </span>
      </div>

      {/* LISTA DE RECEITAS */}
      {receitasFiltradas.length === 0 ? (
        <div className="rounded-2xl border border-rose-light bg-white p-12 text-center text-chocolate-muted space-y-3">
          <ChefHat className="w-10 h-10 text-rose-light mx-auto" />
          <p className="text-sm font-medium">Nenhuma ficha técnica cadastrada ainda.</p>
          <button
            onClick={() => setCriando(true)}
            className="rounded-full bg-rose-pastel px-4 py-2 text-xs font-semibold text-white hover:bg-chocolate-light transition-colors shadow-xs"
          >
            Cadastrar primeira receita
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {receitasFiltradas.map((r) => {
            const expandido = !!expandidos[r.id];
            const estaPublicado = r.publicado && r.produto_ativo;

            return (
              <div
                key={r.id}
                className="rounded-2xl border border-rose-light bg-white shadow-xs overflow-hidden transition-all hover:shadow-md"
              >
                {/* SEÇÃO 1: CABEÇALHO DO CARD (FOTO, NOME, BADGES E AÇÕES) */}
                <div className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-rose-light/50">
                  <div className="flex items-start sm:items-center gap-3 sm:gap-4 min-w-0 flex-1">
                    {/* MINIATURA DA FOTO DA RECEITA */}
                    <div className="relative w-14 h-14 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-cream border border-rose-light shrink-0 flex items-center justify-center shadow-xs">
                      {r.url_imagem ? (
                        <img
                          src={r.url_imagem}
                          alt={r.nome}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ChefHat className="w-8 h-8 text-rose-pastel/70" />
                      )}
                    </div>

                    <div className="space-y-1.5 min-w-0 flex-1">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h3 className="text-lg sm:text-xl font-bold text-chocolate tracking-tight">
                          {r.nome}
                        </h3>

                        {/* BADGE DE PUBLICAÇÃO */}
                        {estaPublicado ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-badge-green px-2.5 py-0.5 text-xs font-bold text-badge-green-text border border-badge-green-text/20">
                            <Globe className="w-3.5 h-3.5" />
                            Publicado no Site ({r.produto_estoque ?? 0} em estoque)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-warm-white px-2.5 py-0.5 text-xs font-medium text-chocolate-muted border border-rose-light">
                            <EyeOff className="w-3.5 h-3.5 text-chocolate-muted" />
                            Apenas Ficha Técnica
                          </span>
                        )}
                      </div>

                      {/* METADADOS EM TAGS HORIZONTAIS */}
                      <div className="flex items-center gap-2 text-xs text-chocolate-muted flex-wrap">
                        <span className="rounded-full bg-cream px-2.5 py-0.5 font-medium text-chocolate border border-rose-light/40">
                          Rendimento: {r.rendimento} {r.rendimento === 1 ? "porção" : "porções"}
                        </span>
                        <span className="rounded-full bg-warm-white px-2.5 py-0.5 border border-rose-light/50">
                          {r.ingredientes.length} ingredientes
                        </span>
                        <span className="rounded-full bg-warm-white px-2.5 py-0.5 border border-rose-light/50">
                          Custos invisíveis: {r.taxa_custos_invisiveis}%
                        </span>
                        {r.custo_embalagem > 0 && (
                          <span className="rounded-full bg-warm-white px-2.5 py-0.5 border border-rose-light/50">
                            Embalagem: {formatarMoeda(r.custo_embalagem)}
                          </span>
                        )}
                        {estaPublicado && r.produto_preco && (
                          <span className="rounded-full bg-badge-green/60 px-2.5 py-0.5 font-bold text-badge-green-text border border-badge-green-text/20">
                            Preço na Loja: {formatarMoeda(r.produto_preco)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* BOTÕES DE AÇÃO ALINHADOS À DIREITA */}
                  <div className="flex items-center gap-2 shrink-0 self-start md:self-center flex-wrap">
                    {/* BOTÃO PUBLICAR NO SITE - SEMPRE FIXO */}
                    <button
                      onClick={() => {
                        setModoPublicacao("publicar");
                        setReceitaPublicando(r);
                      }}
                      className="flex items-center gap-1.5 rounded-full bg-rose-pastel text-white px-4 py-2 text-xs font-bold transition-all shadow-xs hover:bg-chocolate-light"
                      title={
                        estaPublicado
                          ? "Publicar novo lote no site (soma ao estoque já publicado)"
                          : "Publicar este produto no site"
                      }
                    >
                      <Globe className="w-3.5 h-3.5" />
                      Publicar no Site
                    </button>

                    {/* BOTÃO EDITAR LOJA (quando já publicado) */}
                    {estaPublicado && (
                      <button
                        onClick={() => {
                          setModoPublicacao("editar_loja");
                          setReceitaPublicando(r);
                        }}
                        className="flex items-center gap-1.5 rounded-full bg-badge-green border border-badge-green-text/30 text-badge-green-text px-3.5 py-2 text-xs font-bold transition-all shadow-xs hover:bg-emerald-100"
                        title="Editar dados do produto no cardápio online"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        Editar Loja
                      </button>
                    )}

                    {estaPublicado && (
                      <form
                        action={despublicarReceitaAction}
                        onSubmit={(e) => {
                          if (!confirm(`Despublicar "${r.nome}" do site? O produto deixará de aparecer para os clientes.`)) {
                            e.preventDefault();
                          }
                        }}
                      >
                        <input type="hidden" name="receita_id" value={r.id} />
                        <button
                          type="submit"
                          title="Despublicar da loja"
                          className="rounded-full border border-rose-light px-3 py-2 text-xs font-medium text-chocolate-muted hover:bg-rose-light transition-colors"
                        >
                          Despublicar
                        </button>
                      </form>
                    )}

                    <button
                      onClick={() => {
                        setCriando(false);
                        setEditandoReceita(r);
                      }}
                      className="flex items-center gap-1 rounded-full border border-rose-light px-3.5 py-2 text-xs font-semibold text-chocolate hover:bg-rose-light transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      Editar
                    </button>

                    <form
                      action={excluirReceitaAction}
                      onSubmit={(e) => {
                        if (!confirm(`Excluir a ficha técnica "${r.nome}"?`)) {
                          e.preventDefault();
                        }
                      }}
                    >
                      <input type="hidden" name="id" value={r.id} />
                      <button
                        type="submit"
                        className="rounded-full border border-badge-red px-3 py-2 text-xs font-semibold text-badge-red-text hover:bg-badge-red transition-colors"
                        title="Excluir ficha"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </form>
                  </div>
                </div>

                {/* SEÇÃO 2: MÉTRICAS FINANCEIRAS EM GRID COMPLETO (4 COLUNAS) */}
                <div className="p-3 sm:p-4 bg-cream/20 grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 border-b border-rose-light/40">
                  <div className="rounded-xl bg-white border border-rose-light/60 p-2.5 sm:p-3 shadow-2xs">
                    <span className="text-[10px] sm:text-[11px] font-semibold text-chocolate-muted block mb-0.5 leading-tight">
                      Custo Produção Total
                    </span>
                    <strong className="text-sm sm:text-base font-extrabold text-chocolate block">
                      {formatarMoeda(r.custo_producao_total)}
                    </strong>
                    {r.rendimento > 1 && (
                      <span className="text-[10px] sm:text-[11px] text-chocolate-muted block">
                        {formatarMoeda(r.custo_por_porcao)} por un
                      </span>
                    )}
                  </div>

                  <div className="rounded-xl bg-rose-light/40 border border-rose-light p-2.5 sm:p-3 shadow-2xs">
                    <span className="text-[10px] sm:text-[11px] font-semibold text-chocolate-muted block mb-0.5 leading-tight">
                      Preço Sugerido ({r.margem_lucro_desejada}%)
                    </span>
                    <strong className="text-sm sm:text-base font-black text-chocolate block">
                      {formatarMoeda(r.preco_sugerido_total)}
                    </strong>
                    {r.rendimento > 1 && (
                      <span className="text-[10px] sm:text-[11px] font-bold text-rose-pastel block">
                        {formatarMoeda(r.preco_sugerido_porcao)} por un
                      </span>
                    )}
                  </div>

                  <div className="rounded-xl bg-badge-green border border-badge-green-text/20 p-2.5 sm:p-3 shadow-2xs">
                    <span className="text-[10px] sm:text-[11px] font-semibold text-badge-green-text block mb-0.5 leading-tight">
                      Lucro Estimado
                    </span>
                    <strong className="text-sm sm:text-base font-bold text-badge-green-text block">
                      +{formatarMoeda(r.lucro_total)}
                    </strong>
                    {r.rendimento > 1 && (
                      <span className="text-[10px] sm:text-[11px] text-badge-green-text/80 block">
                        +{formatarMoeda(r.lucro_por_porcao)} por un
                      </span>
                    )}
                  </div>

                  {/* BOTÃO EXPANDIR / VER INGREDIENTES */}
                  <div className="rounded-xl bg-white border border-rose-light/60 p-2.5 sm:p-3 shadow-2xs flex flex-col justify-between">
                    <span className="text-[10px] sm:text-[11px] font-semibold text-chocolate-muted block mb-0.5 leading-tight">
                      Composição
                    </span>
                    <button
                      onClick={() => toggleExpandir(r.id)}
                      className="w-full mt-1 flex items-center justify-center gap-1 rounded-lg border border-rose-light py-1.5 px-1.5 text-xs font-bold text-chocolate hover:bg-cream transition-colors text-center"
                    >
                      {expandido ? (
                        <>
                          <ChevronUp className="w-3.5 h-3.5 text-rose-pastel shrink-0" /> Ocultar
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-3.5 h-3.5 text-rose-pastel shrink-0" /> {r.ingredientes.length} itens
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* DETALHES EXPANDIDOS COM TABELA DE INGREDIENTES */}
                {expandido && (
                  <div className="border-t border-rose-light/60 bg-cream/30 p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <h5 className="text-xs font-bold text-chocolate uppercase tracking-wider">
                        Detalhamento dos Ingredientes:
                      </h5>
                      <span className="sm:hidden text-[10px] text-chocolate-muted">
                        ← Deslize tabela →
                      </span>
                    </div>
                    <div className="overflow-x-auto rounded-xl border border-rose-light/70 bg-white">
                      <table className="w-full text-xs min-w-[460px]">
                        <thead className="bg-cream text-left text-chocolate-muted border-b border-rose-light/60">
                          <tr>
                            <th className="px-3.5 py-2 font-semibold">Ingrediente</th>
                            <th className="px-3.5 py-2 font-semibold">Qtd Utilizada</th>
                            <th className="px-3.5 py-2 font-semibold">Custo Base</th>
                            <th className="px-3.5 py-2 font-semibold text-right">Subtotal</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-rose-light/40">
                          {r.ingredientes.map((ing) => {
                            const sufixo =
                              ing.insumo_tipo_medida === "GRAMA"
                                ? "g"
                                : ing.insumo_tipo_medida === "MILILITRO"
                                ? "ml"
                                : "un";

                            return (
                              <tr key={ing.id} className="hover:bg-cream/20">
                                <td className="px-3.5 py-2 font-medium text-chocolate">
                                  {ing.insumo_nome}
                                </td>
                                <td className="px-3.5 py-2 text-chocolate">
                                  {ing.quantidade_utilizada.toLocaleString("pt-BR")} {sufixo}
                                </td>
                                <td className="px-3.5 py-2 text-chocolate-muted">
                                  {formatarMoeda(ing.insumo_custo_base)} / 1{sufixo}
                                </td>
                                <td className="px-3.5 py-2 font-bold text-chocolate text-right">
                                  {formatarMoeda(ing.custo_total_ingrediente)}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                        <tfoot className="bg-cream/60 font-semibold text-chocolate border-t border-rose-light/60">
                          <tr>
                            <td colSpan={3} className="px-3.5 py-2 text-right">
                              Total em Ingredientes:
                            </td>
                            <td className="px-3.5 py-2 text-right font-bold text-sm">
                              {formatarMoeda(r.custo_ingredientes)}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
