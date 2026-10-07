"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import {
  criarInsumoAction,
  atualizarInsumoAction,
  excluirInsumoAction,
  criarInsumoBaseAction,
  atualizarInsumoBaseAction,
  excluirInsumoBaseAction,
} from "@/app/admin/actions-insumos";
import type { Insumo, InsumoBase, TipoMedida, FormatoCompra } from "@/lib/insumos";
import {
  Package,
  Scale,
  Droplets,
  Layers,
  Boxes,
  Search,
  Plus,
  Info,
  Sparkles,
  ChevronDown,
  Check,
  X,
} from "lucide-react";

const inputClass =
  "w-full rounded-lg border border-rose-light bg-warm-white px-3 py-2 text-sm text-chocolate focus:border-rose-pastel focus:outline-none focus:ring-2 focus:ring-rose-pastel/30";

const labelClass = "block text-xs font-semibold text-chocolate mb-1";

function formatarMoeda(valor: number): string {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatarCustoBase(valor: number, sufixo: string): string {
  if (valor < 0.01) {
    return `R$ ${valor.toFixed(4).replace(".", ",")} / 1${sufixo}`;
  }
  return `${formatarMoeda(valor)} / 1${sufixo}`;
}

function normalizarTexto(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

/* ==========================================================
   COMBOBOX DE PRODUTO BASE (BUSCA EM TEMPO REAL + DROPDOWN)
   ========================================================== */

function ProdutoBaseCombobox({
  insumosBase,
  selectedId,
  onSelect,
}: {
  insumosBase: InsumoBase[];
  selectedId: string;
  onSelect: (base: InsumoBase | null) => void;
}) {
  const [aberto, setAberto] = useState(false);
  const [busca, setBusca] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const itemSelecionado = useMemo(
    () => insumosBase.find((b) => b.id === selectedId),
    [insumosBase, selectedId]
  );

  // Fechar ao clicar fora
  useEffect(() => {
    function handleClickFora(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setAberto(false);
      }
    }
    document.addEventListener("mousedown", handleClickFora);
    return () => document.removeEventListener("mousedown", handleClickFora);
  }, []);

  // Filtragem inteligente em tempo real (insensível a acentos, maiúsculas e caracteres especiais)
  const itensFiltrados = useMemo(() => {
    const termo = normalizarTexto(busca);
    if (!termo) return insumosBase;
    return insumosBase.filter((b) => {
      const nomeNorm = normalizarTexto(b.nome);
      const unidadeNorm = normalizarTexto(b.unidade_padrao);
      const tipoNorm = normalizarTexto(b.tipo_medida);
      const qtdStr = String(b.quantidade_padrao);
      const qtdBaseStr = String(b.quantidade_base);
      return (
        nomeNorm.includes(termo) ||
        unidadeNorm.includes(termo) ||
        tipoNorm.includes(termo) ||
        qtdStr.includes(termo) ||
        qtdBaseStr.includes(termo)
      );
    });
  }, [insumosBase, busca]);

  const textoDisplay = itemSelecionado
    ? `${itemSelecionado.nome} — ${itemSelecionado.quantidade_padrao} ${itemSelecionado.unidade_padrao} (${itemSelecionado.quantidade_base} ${
        itemSelecionado.tipo_medida === "GRAMA"
          ? "g"
          : itemSelecionado.tipo_medida === "MILILITRO"
          ? "ml"
          : "un"
      })`
    : "";

  return (
    <div ref={containerRef} className="relative">
      <div className="relative flex items-center">
        <Search className="w-4 h-4 absolute left-3 text-chocolate-muted pointer-events-none" />
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
          placeholder="Pesquise por nome ou clique na seta para ver todos..."
          className={`${inputClass} pl-9 pr-16 bg-white`}
        />

        <div className="absolute right-2 flex items-center gap-1">
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
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={() => setAberto((v) => !v)}
            title="Abrir/Fechar lista completa"
            className="p-1.5 rounded-lg text-chocolate-muted hover:text-chocolate hover:bg-rose-light transition-colors"
          >
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${
                aberto ? "rotate-180 text-rose-pastel" : ""
              }`}
            />
          </button>
        </div>
      </div>

      {/* DROPDOWN MENU SUSPENSO */}
      {aberto && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 rounded-xl border border-rose-light bg-white shadow-xl max-h-64 overflow-y-auto">
          {/* Opção para digitar manualmente / limpar */}
          <button
            type="button"
            onClick={() => {
              onSelect(null);
              setBusca("");
              setAberto(false);
            }}
            className="w-full text-left px-3.5 py-2.5 text-xs text-chocolate-muted hover:bg-cream/60 border-b border-rose-light/40 transition-colors flex items-center justify-between"
          >
            <span>-- Nenhum / Digitar manualmente --</span>
            {!itemSelecionado && <Check className="w-3.5 h-3.5 text-rose-pastel" />}
          </button>

          {itensFiltrados.length === 0 ? (
            <div className="p-4 text-center text-xs text-chocolate-muted">
              Nenhum produto base encontrado com "{busca}".
            </div>
          ) : (
            <div className="divide-y divide-rose-light/30">
              {itensFiltrados.map((b) => {
                const selecionado = b.id === selectedId;
                const sufixo =
                  b.tipo_medida === "GRAMA"
                    ? "g"
                    : b.tipo_medida === "MILILITRO"
                    ? "ml"
                    : "un";

                return (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => {
                      onSelect(b);
                      setBusca("");
                      setAberto(false);
                    }}
                    className={`w-full text-left px-3.5 py-2.5 text-xs hover:bg-cream/60 transition-colors flex items-center justify-between gap-2 ${
                      selecionado
                        ? "bg-cream/80 font-semibold text-chocolate border-l-4 border-rose-pastel"
                        : "text-chocolate"
                    }`}
                  >
                    <div>
                      <div className="font-medium text-chocolate">{b.nome}</div>
                      <div className="text-[11px] text-chocolate-muted">
                        Padrão: {b.quantidade_padrao} {b.unidade_padrao} ({b.quantidade_base} {sufixo})
                      </div>
                    </div>
                    {selecionado && (
                      <Check className="w-4 h-4 text-rose-pastel shrink-0" />
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
   FORMULÁRIO DE PRODUTO / ITEM BASE (Aba 2)
   ========================================================== */

function InsumoBaseForm({
  itemBase,
  action,
  onDone,
  submitLabel,
}: {
  itemBase?: InsumoBase;
  action: (formData: FormData) => Promise<void>;
  onDone?: () => void;
  submitLabel: string;
}) {
  const [enviando, setEnviando] = useState(false);
  const [unidade, setUnidade] = useState(itemBase?.unidade_padrao ?? "g");
  const [quantidade, setQuantidade] = useState<number>(
    itemBase?.quantidade_padrao ?? 1000
  );

  const previewConversao = useMemo(() => {
    const q = Number(quantidade) || 0;
    if (unidade === "kg") {
      return `${q} kg = ${(q * 1000).toLocaleString("pt-BR")} gramas (g)`;
    }
    if (unidade === "l") {
      return `${q} L = ${(q * 1000).toLocaleString("pt-BR")} mililitros (ml)`;
    }
    if (unidade === "g") return `${q} gramas (g)`;
    if (unidade === "ml") return `${q} mililitros (ml)`;
    return `${q} unidade(s)`;
  }, [unidade, quantidade]);

  return (
    <form
      action={async (formData) => {
        setEnviando(true);
        try {
          await action(formData);
          onDone?.();
        } finally {
          setEnviando(false);
        }
      }}
      className="grid grid-cols-1 sm:grid-cols-3 gap-4"
    >
      {itemBase && <input type="hidden" name="id" value={itemBase.id} />}

      <div className="sm:col-span-3">
        <label className={labelClass}>Nome do Produto / Item Base</label>
        <input
          name="nome"
          required
          defaultValue={itemBase?.nome ?? ""}
          className={inputClass}
          placeholder="Ex: Leite Integral, Leite Condensado, Farinha de Trigo..."
        />
        <p className="mt-1 text-xs text-chocolate-muted">
          Este item ficará disponível na barra de pesquisa e dropdown da aba de insumos.
        </p>
      </div>

      <div className="sm:col-span-2">
        <label className={labelClass}>Peso / Quantidade Padrão</label>
        <input
          name="quantidade_padrao"
          type="number"
          step="0.01"
          min="0.01"
          required
          value={quantidade}
          onChange={(e) => setQuantidade(parseFloat(e.target.value) || 0)}
          className={inputClass}
          placeholder="Ex: 1 para 1kg, 395 para 395g, 1 para 1L"
        />
      </div>

      <div>
        <label className={labelClass}>Unidade de Medida</label>
        <select
          name="unidade_padrao"
          required
          value={unidade}
          onChange={(e) => setUnidade(e.target.value)}
          className={inputClass}
        >
          <option value="kg">Quilograma (kg)</option>
          <option value="g">Grama (g)</option>
          <option value="l">Litro (L)</option>
          <option value="ml">Mililitro (ml)</option>
          <option value="un">Unidade (un)</option>
        </select>
      </div>

      <div className="sm:col-span-3 rounded-xl bg-cream/70 border border-rose-light/70 p-3 text-xs text-chocolate flex items-center gap-2">
        <Info className="w-4 h-4 text-chocolate-light shrink-0" />
        <span>
          <strong>Conversão automática para o cálculo:</strong> {previewConversao}
        </span>
      </div>

      <div className="flex gap-2 sm:col-span-3 mt-1">
        <button
          type="submit"
          disabled={enviando}
          className="rounded-full bg-rose-pastel px-6 py-2 text-sm font-semibold text-white hover:bg-chocolate-light transition-colors disabled:opacity-60 shadow-sm"
        >
          {enviando ? "Salvando…" : submitLabel}
        </button>
        {onDone && (
          <button
            type="button"
            onClick={onDone}
            className="rounded-full border border-rose-light px-5 py-2 text-sm font-medium text-chocolate-muted hover:bg-rose-light transition-colors"
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}

/* ==========================================================
   FORMULÁRIO DE INSUMO (ESTOQUE) (Aba 1)
   ========================================================== */

function InsumoForm({
  insumo,
  insumosBase,
  action,
  onDone,
  submitLabel,
}: {
  insumo?: Insumo;
  insumosBase: InsumoBase[];
  action: (formData: FormData) => Promise<void>;
  onDone?: () => void;
  submitLabel: string;
}) {
  const [enviando, setEnviando] = useState(false);
  const [baseSelecionadaId, setBaseSelecionadaId] = useState<string>(
    insumo?.insumo_base_id ?? ""
  );

  const [nome, setNome] = useState(insumo?.nome ?? "");
  const [tipoMedida, setTipoMedida] = useState<TipoMedida>(
    insumo?.tipo_medida ?? "GRAMA"
  );
  const [formatoCompra, setFormatoCompra] = useState<FormatoCompra>(
    insumo?.formato_compra ?? "UNIDADE"
  );
  const [unidadesPack, setUnidadesPack] = useState<number>(
    insumo?.unidades_por_pack ?? 12
  );
  const [quantidadeUnidades, setQuantidadeUnidades] = useState<number>(
    insumo && insumo.formato_compra === "UNIDADE"
      ? (insumo.unidades_por_pack || 1)
      : 1
  );
  const [pesoUnitario, setPesoUnitario] = useState<number>(
    insumo?.peso_unitario ?? insumo?.quantidade_embalagem ?? 395
  );
  const [precoTotal, setPrecoTotal] = useState<number>(
    insumo?.preco_embalagem ?? 0
  );
  const [precoUnitario, setPrecoUnitario] = useState<number>(() => {
    if (!insumo) return 0;
    if (insumo.formato_compra === "UNIDADE" && insumo.unidades_por_pack > 1) {
      return (
        Math.round((insumo.preco_embalagem / insumo.unidades_por_pack) * 100) /
        100
      );
    }
    return insumo.preco_embalagem;
  });

  // Manipular seleção do combobox
  const handleSelecionarProdutoBase = (base: InsumoBase | null) => {
    if (!base) {
      setBaseSelecionadaId("");
      return;
    }
    setBaseSelecionadaId(base.id);
    setNome(base.nome);
    setTipoMedida(base.tipo_medida);
    setPesoUnitario(base.quantidade_base);
  };

  // Cálculos automáticos em tempo real
  const unidadesEfetivas =
    formatoCompra === "PACK" ? unidadesPack : quantidadeUnidades;

  const quantidadeTotalCalculada = unidadesEfetivas * pesoUnitario;

  const precoTotalCalculado =
    formatoCompra === "PACK" ? precoTotal : quantidadeUnidades * precoUnitario;

  const precoPorUnidadeExibido =
    formatoCompra === "PACK"
      ? unidadesPack > 0
        ? precoTotal / unidadesPack
        : 0
      : precoUnitario;

  const custoBaseUnitario =
    precoTotalCalculado > 0 && quantidadeTotalCalculada > 0
      ? precoTotalCalculado / quantidadeTotalCalculada
      : 0;

  const sufixoBase =
    tipoMedida === "UNIDADE" ? "un" : tipoMedida === "GRAMA" ? "g" : "ml";

  return (
    <form
      action={async (formData) => {
        setEnviando(true);
        try {
          await action(formData);
          onDone?.();
        } finally {
          setEnviando(false);
        }
      }}
      className="space-y-4"
    >
      {insumo && <input type="hidden" name="id" value={insumo.id} />}
      <input type="hidden" name="insumo_base_id" value={baseSelecionadaId} />

      {/* SELEÇÃO DO PRODUTO BASE COM SEARCH + DROPDOWN */}
      <div className="rounded-xl border border-rose-light/80 bg-cream/40 p-3.5 space-y-3">
        <div>
          <label className={labelClass}>
            <span className="flex items-center gap-1.5 text-chocolate font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-rose-pastel" />
              Selecionar Produto / Item Base Cadastrado (Barra de Pesquisa & Dropdown)
            </span>
          </label>
          <ProdutoBaseCombobox
            insumosBase={insumosBase}
            selectedId={baseSelecionadaId}
            onSelect={handleSelecionarProdutoBase}
          />
          <p className="mt-1 text-xs text-chocolate-muted">
            Você pode <strong>digitar para pesquisar</strong> ou <strong>clicar na seta</strong> para navegar pelo dropdown.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* NOME DO INSUMO */}
        <div className="sm:col-span-2">
          <label className={labelClass}>Nome do Insumo / Estoque</label>
          <input
            name="nome"
            required
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className={inputClass}
            placeholder="Ex: Chocolate Melken Meio Amargo, Leite Integral Piracanjuba..."
          />
        </div>

        {/* TIPO DE MEDIDA */}
        <div>
          <label className={labelClass}>Tipo de Medida Base</label>
          <select
            name="tipo_medida"
            required
            value={tipoMedida}
            onChange={(e) => setTipoMedida(e.target.value as TipoMedida)}
            className={inputClass}
          >
            <option value="GRAMA">Grama (g) - para Kg</option>
            <option value="MILILITRO">Mililitro (ml) - para Litros</option>
            <option value="UNIDADE">Unidade (un)</option>
          </select>
        </div>

        {/* DROP SELECT: PACK OU UNIDADES */}
        <div>
          <label className={labelClass}>Formato da Compra</label>
          <select
            name="formato_compra"
            required
            value={formatoCompra}
            onChange={(e) => setFormatoCompra(e.target.value as FormatoCompra)}
            className={`${inputClass} font-medium`}
          >
            <option value="UNIDADE">📦 Unidade Individual</option>
            <option value="PACK">📦📦 Pack / Fardo / Caixa Fechada</option>
          </select>
        </div>

        {/* SE FOR PACK: QUANTIDADE DE UNIDADES NO PACK */}
        {formatoCompra === "PACK" ? (
          <>
            <div>
              <label className={labelClass}>Unidades no Pack (Fardo)</label>
              <input
                name="unidades_por_pack"
                type="number"
                min="1"
                step="1"
                required
                value={unidadesPack}
                onChange={(e) => setUnidadesPack(parseInt(e.target.value) || 1)}
                className={inputClass}
                placeholder="Ex: 12 (se for fardo com 12)"
              />
            </div>

            <div>
              <label className={labelClass}>
                Peso / Volume de CADA Unidade ({sufixoBase})
              </label>
              <input
                name="peso_unitario"
                type="number"
                step="0.01"
                min="0.01"
                required
                value={pesoUnitario}
                onChange={(e) => setPesoUnitario(parseFloat(e.target.value) || 0)}
                className={inputClass}
                placeholder="Ex: 395 (se cada lata tem 395g) ou 1000"
              />
            </div>

            <div className="sm:col-span-2">
              <label className={labelClass}>Preço TOTAL Pago pelo Pack (R$)</label>
              <input
                name="preco_embalagem"
                type="number"
                step="0.01"
                min="0.01"
                required
                value={precoTotal || ""}
                onChange={(e) => setPrecoTotal(parseFloat(e.target.value) || 0)}
                className={inputClass}
                placeholder="Ex: 72.00 (valor total do fardo)"
              />
            </div>
          </>
        ) : (
          <>
            <div>
              <label className={labelClass}>
                Quantidade de Unidades Compradas
              </label>
              <input
                name="quantidade_unidades"
                type="number"
                min="1"
                step="1"
                required
                value={quantidadeUnidades || ""}
                onChange={(e) =>
                  setQuantidadeUnidades(Math.max(1, parseInt(e.target.value) || 1))
                }
                className={inputClass}
                placeholder="Ex: 6 (se comprou 6 unidades)"
              />
              <span className="text-[11px] text-chocolate-muted mt-0.5 block">
                Quantas unidades/latas/itens foram comprados.
              </span>
            </div>

            <div>
              <label className={labelClass}>
                Peso / Volume de CADA Embalagem ({sufixoBase})
              </label>
              <input
                name="peso_unitario"
                type="number"
                step="0.01"
                min="0.01"
                required
                value={pesoUnitario || ""}
                onChange={(e) => setPesoUnitario(parseFloat(e.target.value) || 0)}
                className={inputClass}
                placeholder="Ex: 395 (se cada lata tem 395g ou 395ml)"
              />
              <span className="text-[11px] text-chocolate-muted mt-0.5 block">
                Conteúdo de 1 unidade individual.
              </span>
            </div>

            <div className="sm:col-span-2">
              <label className={labelClass}>
                Preço por Unidade (R$)
              </label>
              <input
                name="preco_unitario"
                type="number"
                step="0.01"
                min="0.01"
                required
                value={precoUnitario || ""}
                onChange={(e) => setPrecoUnitario(parseFloat(e.target.value) || 0)}
                className={inputClass}
                placeholder="Ex: 7.50 (preço pago por 1 unidade)"
              />
              <span className="text-[11px] text-chocolate-muted mt-0.5 block">
                Valor pago por 1 unidade. A soma total da compra será {formatarMoeda(precoTotalCalculado)} ({quantidadeUnidades} un x {formatarMoeda(precoUnitario)}).
              </span>
            </div>
          </>
        )}
      </div>

      {/* CARD DE RESUMO DO CÁLCULO EM TEMPO REAL */}
      <div className="rounded-xl border border-rose-light bg-warm-white p-4 text-sm text-chocolate space-y-1.5 shadow-sm">
        <div className="font-semibold text-chocolate flex items-center justify-between">
          <span>Resumo Inteligente da Compra:</span>
          <span className="text-xs font-normal text-chocolate-muted">
            {formatoCompra === "PACK" ? "Modalidade Pack" : "Modalidade Unidade"}
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-xs">
          <div className="rounded-lg bg-cream/80 p-2.5">
            <span className="text-chocolate-muted block">Quantidade Total no Estoque:</span>
            <strong className="text-sm text-chocolate">
              {quantidadeTotalCalculada.toLocaleString("pt-BR")} {sufixoBase}
            </strong>
            <span className="text-[11px] text-chocolate-muted block">
              {formatoCompra === "PACK"
                ? `(${unidadesPack} un x ${pesoUnitario} ${sufixoBase})`
                : quantidadeUnidades > 1
                ? `(${quantidadeUnidades} un x ${pesoUnitario} ${sufixoBase})`
                : `(1 un de ${pesoUnitario} ${sufixoBase})`}
            </span>
          </div>

          <div className="rounded-lg bg-cream/80 p-2.5">
            <span className="text-chocolate-muted block">Preço por Unidade:</span>
            <strong className="text-sm text-chocolate">
              {formatarMoeda(precoPorUnidadeExibido)}
            </strong>
            <span className="text-[11px] text-chocolate-muted block">
              Total pago: {formatarMoeda(precoTotalCalculado)}
            </span>
          </div>

          <div className="rounded-lg bg-rose-light/50 border border-rose-light p-2.5">
            <span className="text-chocolate-muted block">Custo Base p/ Receitas:</span>
            <strong className="text-sm text-chocolate font-bold">
              {formatarCustoBase(custoBaseUnitario, sufixoBase)}
            </strong>
          </div>
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          disabled={enviando}
          className="rounded-full bg-rose-pastel px-6 py-2.5 text-sm font-semibold text-white hover:bg-chocolate-light transition-colors disabled:opacity-60 shadow-sm"
        >
          {enviando ? "Salvando…" : submitLabel}
        </button>
        {onDone && (
          <button
            type="button"
            onClick={onDone}
            className="rounded-full border border-rose-light px-5 py-2.5 text-sm font-medium text-chocolate-muted hover:bg-rose-light transition-colors"
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}

/* ==========================================================
   COMPONENTE PRINCIPAL: ADMIN INSUMOS
   ========================================================== */

export default function AdminInsumos({
  insumos,
  insumosBase,
}: {
  insumos: Insumo[];
  insumosBase: InsumoBase[];
}) {
  const [abaAtiva, setAbaAtiva] = useState<"estoque" | "produtos_base">("estoque");

  // Estados da Aba 1 (Estoque)
  const [criandoInsumo, setCriandoInsumo] = useState(false);
  const [editandoInsumoId, setEditandoInsumoId] = useState<string | null>(null);
  const [buscaInsumo, setBuscaInsumo] = useState("");
  const [filtroMedida, setFiltroMedida] = useState<string>("TODOS");

  // Estados da Aba 2 (Produtos Base)
  const [criandoBase, setCriandoBase] = useState(false);
  const [editandoBaseId, setEditandoBaseId] = useState<string | null>(null);
  const [buscaBase, setBuscaBase] = useState("");

  // Insumos filtrados (insensível a acentos)
  const insumosFiltrados = useMemo(() => {
    const termo = normalizarTexto(buscaInsumo);
    return insumos.filter((i) => {
      const matchNome = !termo || normalizarTexto(i.nome).includes(termo);
      const matchMedida = filtroMedida === "TODOS" || i.tipo_medida === filtroMedida;
      return matchNome && matchMedida;
    });
  }, [insumos, buscaInsumo, filtroMedida]);

  // Itens Base filtrados (insensível a acentos)
  const itensBaseFiltrados = useMemo(() => {
    const termo = normalizarTexto(buscaBase);
    if (!termo) return insumosBase;
    return insumosBase.filter((b) =>
      normalizarTexto(b.nome).includes(termo)
    );
  }, [insumosBase, buscaBase]);

  return (
    <div className="space-y-6">
      {/* NAVEGAÇÃO POR ABAS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-rose-light/70 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-chocolate tracking-tight">
            Gestão de Insumos & Estoque
          </h2>
          <p className="text-xs text-chocolate-muted mt-0.5">
            Controle de custos base para ficha técnica e catálogo de produtos/ingredientes
          </p>
        </div>

        <div className="flex items-center gap-1.5 rounded-full bg-cream p-1 border border-rose-light">
          <button
            onClick={() => setAbaAtiva("estoque")}
            className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition-all ${
              abaAtiva === "estoque"
                ? "bg-rose-pastel text-white shadow-sm"
                : "text-chocolate-muted hover:text-chocolate"
            }`}
          >
            <Boxes className="w-4 h-4" />
            Estoque de Insumos
            <span
              className={`rounded-full px-1.5 py-0.5 text-[11px] ${
                abaAtiva === "estoque"
                  ? "bg-white/20 text-white"
                  : "bg-rose-light text-chocolate-muted"
              }`}
            >
              {insumos.length}
            </span>
          </button>

          <button
            onClick={() => setAbaAtiva("produtos_base")}
            className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition-all ${
              abaAtiva === "produtos_base"
                ? "bg-rose-pastel text-white shadow-sm"
                : "text-chocolate-muted hover:text-chocolate"
            }`}
          >
            <Layers className="w-4 h-4" />
            Produtos & Itens Base
            <span
              className={`rounded-full px-1.5 py-0.5 text-[11px] ${
                abaAtiva === "produtos_base"
                  ? "bg-white/20 text-white"
                  : "bg-rose-light text-chocolate-muted"
              }`}
            >
              {insumosBase.length}
            </span>
          </button>
        </div>
      </div>

      {/* ========================================================
          CONTEÚDO DA ABA 1: ESTOQUE DE INSUMOS
          ======================================================== */}
      {abaAtiva === "estoque" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-1 items-center gap-2 max-w-lg">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-chocolate-muted" />
                <input
                  type="text"
                  placeholder="Buscar insumo por nome..."
                  value={buscaInsumo}
                  onChange={(e) => setBuscaInsumo(e.target.value)}
                  className={`${inputClass} pl-9`}
                />
              </div>

              <select
                value={filtroMedida}
                onChange={(e) => setFiltroMedida(e.target.value)}
                className={`${inputClass} w-auto text-xs`}
              >
                <option value="TODOS">Todas as Medidas</option>
                <option value="GRAMA">Gramas (g)</option>
                <option value="MILILITRO">Mililitros (ml)</option>
                <option value="UNIDADE">Unidades (un)</option>
              </select>
            </div>

            <button
              onClick={() => setCriandoInsumo((v) => !v)}
              className="flex items-center gap-2 rounded-full bg-rose-pastel px-5 py-2.5 text-sm font-semibold text-white hover:bg-chocolate-light transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              {criandoInsumo ? "Fechar formulário" : "Novo insumo (Estoque)"}
            </button>
          </div>

          {/* FORMULÁRIO DE NOVO INSUMO */}
          {criandoInsumo && (
            <div className="rounded-2xl border border-rose-light bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-rose-light/50">
                <h3 className="font-bold text-chocolate flex items-center gap-2">
                  <Boxes className="w-4 h-4 text-rose-pastel" />
                  Cadastrar Entrada de Insumo no Estoque
                </h3>
              </div>
              <InsumoForm
                insumosBase={insumosBase}
                action={criarInsumoAction}
                submitLabel="Cadastrar Insumo"
                onDone={() => setCriandoInsumo(false)}
              />
            </div>
          )}

          {/* TABELA DE INSUMOS */}
          <div className="overflow-hidden rounded-2xl border border-rose-light bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-cream text-left text-chocolate-muted border-b border-rose-light/60">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Insumo</th>
                    <th className="px-4 py-3 font-semibold">Formato</th>
                    <th className="px-4 py-3 font-semibold">Total Estoque</th>
                    <th className="px-4 py-3 font-semibold">Preço Pago</th>
                    <th className="px-4 py-3 font-semibold">Custo Base (Receitas)</th>
                    <th className="px-4 py-3 font-semibold text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-rose-light/60">
                  {insumosFiltrados.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-12 text-center text-chocolate-muted"
                      >
                        Nenhum insumo encontrado.
                      </td>
                    </tr>
                  ) : (
                    insumosFiltrados.map((insumo) => (
                      <InsumoRow
                        key={insumo.id}
                        insumo={insumo}
                        insumosBase={insumosBase}
                        editando={editandoInsumoId === insumo.id}
                        onEditar={() => setEditandoInsumoId(insumo.id)}
                        onCancelar={() => setEditandoInsumoId(null)}
                      />
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          CONTEÚDO DA ABA 2: PRODUTOS & ITENS BASE
          ======================================================== */}
      {abaAtiva === "produtos_base" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-rose-light/80 bg-cream/40 p-4 text-xs text-chocolate flex items-start gap-3">
            <Info className="w-5 h-5 text-rose-pastel shrink-0 mt-0.5" />
            <div>
              <strong className="block text-sm font-semibold text-chocolate mb-0.5">
                O que são Produtos / Itens Base?
              </strong>
              São os ingredientes padrão da confeitaria (ex: Caixa de Leite 1L, Leite Condensado 395g, Farinha de Trigo 1kg, Chocolate Melken 1kg).
              Ao cadastrar aqui, eles aparecem automaticamente na <strong>Barra de Pesquisa com Autocomplete</strong> e no <strong>Dropdown</strong> da aba de Estoque, preenchendo o peso e medidas de forma instantânea!
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-chocolate-muted" />
              <input
                type="text"
                placeholder="Buscar produto base..."
                value={buscaBase}
                onChange={(e) => setBuscaBase(e.target.value)}
                className={`${inputClass} pl-9`}
              />
            </div>

            <button
              onClick={() => setCriandoBase((v) => !v)}
              className="flex items-center gap-2 rounded-full bg-rose-pastel px-5 py-2.5 text-sm font-semibold text-white hover:bg-chocolate-light transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              {criandoBase ? "Fechar formulário" : "Novo Produto Base"}
            </button>
          </div>

          {/* FORMULÁRIO DE NOVO ITEM BASE */}
          {criandoBase && (
            <div className="rounded-2xl border border-rose-light bg-white p-6 shadow-sm">
              <h3 className="font-bold text-chocolate mb-4 pb-2 border-b border-rose-light/50 flex items-center gap-2">
                <Layers className="w-4 h-4 text-rose-pastel" />
                Cadastrar Novo Produto / Item Base
              </h3>
              <InsumoBaseForm
                action={criarInsumoBaseAction}
                submitLabel="Salvar Produto Base"
                onDone={() => setCriandoBase(false)}
              />
            </div>
          )}

          {/* TABELA DE ITENS BASE */}
          <div className="overflow-hidden rounded-2xl border border-rose-light bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-cream text-left text-chocolate-muted border-b border-rose-light/60">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Produto / Item Base</th>
                    <th className="px-4 py-3 font-semibold">Medida Padrão</th>
                    <th className="px-4 py-3 font-semibold">Medida Base do Sistema</th>
                    <th className="px-4 py-3 font-semibold">Tipo</th>
                    <th className="px-4 py-3 font-semibold text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-rose-light/60">
                  {itensBaseFiltrados.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 py-12 text-center text-chocolate-muted"
                      >
                        Nenhum produto base cadastrado.
                      </td>
                    </tr>
                  ) : (
                    itensBaseFiltrados.map((item) => (
                      <InsumoBaseRow
                        key={item.id}
                        item={item}
                        editando={editandoBaseId === item.id}
                        onEditar={() => setEditandoBaseId(item.id)}
                        onCancelar={() => setEditandoBaseId(null)}
                      />
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ==========================================================
   LINHA DA TABELA DE INSUMOS (ESTOQUE)
   ========================================================== */

function InsumoRow({
  insumo,
  insumosBase,
  editando,
  onEditar,
  onCancelar,
}: {
  insumo: Insumo;
  insumosBase: InsumoBase[];
  editando: boolean;
  onEditar: () => void;
  onCancelar: () => void;
}) {
  const sufixoBase =
    insumo.tipo_medida === "UNIDADE"
      ? "un"
      : insumo.tipo_medida === "GRAMA"
      ? "g"
      : "ml";

  const isPack = insumo.formato_compra === "PACK";

  return (
    <>
      <tr className="hover:bg-cream/20 transition-colors">
        <td className="px-4 py-3.5">
          <div className="font-semibold text-chocolate">{insumo.nome}</div>
          {insumo.insumo_base_id && (
            <span className="inline-block text-[11px] text-chocolate-muted">
              Vinculado ao catálogo base
            </span>
          )}
        </td>

        <td className="px-4 py-3.5">
          {isPack ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-cream px-2.5 py-1 text-xs font-semibold text-chocolate border border-rose-light/70">
              <Boxes className="w-3.5 h-3.5 text-rose-pastel" />
              Pack ({insumo.unidades_por_pack} un)
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-warm-white px-2.5 py-1 text-xs font-semibold text-chocolate-muted border border-rose-light/70">
              <Package className="w-3.5 h-3.5 text-chocolate-muted" />
              {insumo.unidades_por_pack > 1
                ? `${insumo.unidades_por_pack} unidades`
                : "Unidade individual"}
            </span>
          )}
        </td>

        <td className="px-4 py-3.5 text-chocolate">
          <span className="font-semibold">
            {insumo.quantidade_embalagem.toLocaleString("pt-BR")} {sufixoBase}
          </span>
          {insumo.unidades_por_pack > 1 && insumo.peso_unitario && (
            <span className="block text-[11px] text-chocolate-muted">
              {insumo.unidades_por_pack}x {insumo.peso_unitario} {sufixoBase}
            </span>
          )}
        </td>

        <td className="px-4 py-3.5 text-chocolate">
          <span className="font-semibold">
            {formatarMoeda(insumo.preco_embalagem)}
          </span>
          {insumo.unidades_por_pack > 1 && (
            <span className="block text-[11px] text-chocolate-muted">
              {formatarMoeda(insumo.preco_embalagem / (insumo.unidades_por_pack || 1))} / un
            </span>
          )}
        </td>

        <td className="px-4 py-3.5">
          <span className="font-bold text-chocolate">
            {formatarCustoBase(insumo.custo_por_unidade_base, sufixoBase)}
          </span>
        </td>

        <td className="px-4 py-3.5 text-right">
          <div className="flex justify-end gap-2">
            <button
              onClick={editando ? onCancelar : onEditar}
              className="rounded-lg border border-rose-light px-3 py-1.5 text-xs font-medium text-chocolate hover:bg-rose-light transition-colors"
            >
              {editando ? "Fechar" : "Editar"}
            </button>
            <form
              action={excluirInsumoAction}
              onSubmit={(e) => {
                if (!confirm(`Excluir o insumo "${insumo.nome}"?`)) {
                  e.preventDefault();
                }
              }}
            >
              <input type="hidden" name="id" value={insumo.id} />
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
        <tr className="bg-cream/40">
          <td colSpan={6} className="px-4 py-5">
            <div className="rounded-xl border border-rose-light bg-white p-4">
              <h4 className="font-bold text-chocolate mb-3 text-sm">
                Editar Insumo: {insumo.nome}
              </h4>
              <InsumoForm
                insumo={insumo}
                insumosBase={insumosBase}
                action={atualizarInsumoAction}
                submitLabel="Salvar Alterações"
                onDone={onCancelar}
              />
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

/* ==========================================================
   LINHA DA TABELA DE PRODUTOS / ITENS BASE
   ========================================================== */

function InsumoBaseRow({
  item,
  editando,
  onEditar,
  onCancelar,
}: {
  item: InsumoBase;
  editando: boolean;
  onEditar: () => void;
  onCancelar: () => void;
}) {
  const Icone =
    item.tipo_medida === "UNIDADE"
      ? Package
      : item.tipo_medida === "GRAMA"
      ? Scale
      : Droplets;

  const sufixoBase =
    item.tipo_medida === "UNIDADE"
      ? "un"
      : item.tipo_medida === "GRAMA"
      ? "g"
      : "ml";

  return (
    <>
      <tr className="hover:bg-cream/20 transition-colors">
        <td className="px-4 py-3.5 font-semibold text-chocolate">{item.nome}</td>
        <td className="px-4 py-3.5 text-chocolate">
          {item.quantidade_padrao} {item.unidade_padrao}
        </td>
        <td className="px-4 py-3.5 text-chocolate font-medium">
          {item.quantidade_base.toLocaleString("pt-BR")} {sufixoBase}
        </td>
        <td className="px-4 py-3.5 text-chocolate-muted flex items-center gap-1.5 pt-4">
          <Icone className="w-4 h-4 text-chocolate-light" />
          {item.tipo_medida}
        </td>
        <td className="px-4 py-3.5 text-right">
          <div className="flex justify-end gap-2">
            <button
              onClick={editando ? onCancelar : onEditar}
              className="rounded-lg border border-rose-light px-3 py-1.5 text-xs font-medium text-chocolate hover:bg-rose-light transition-colors"
            >
              {editando ? "Fechar" : "Editar"}
            </button>
            <form
              action={excluirInsumoBaseAction}
              onSubmit={(e) => {
                if (!confirm(`Excluir o item base "${item.nome}"?`)) {
                  e.preventDefault();
                }
              }}
            >
              <input type="hidden" name="id" value={item.id} />
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
        <tr className="bg-cream/40">
          <td colSpan={5} className="px-4 py-5">
            <div className="rounded-xl border border-rose-light bg-white p-4">
              <h4 className="font-bold text-chocolate mb-3 text-sm">
                Editar Produto Base: {item.nome}
              </h4>
              <InsumoBaseForm
                itemBase={item}
                action={atualizarInsumoBaseAction}
                submitLabel="Salvar Alterações"
                onDone={onCancelar}
              />
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
