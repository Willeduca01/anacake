"use client";

import { useState, type ChangeEvent } from "react";
import {
  criarProdutoAction,
  atualizarProdutoAction,
  excluirProdutoAction,
} from "@/app/admin/actions";
import type { ProdutoAdmin } from "@/lib/produtos";

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
  onDone,
  submitLabel,
}: {
  produto?: ProdutoAdmin;
  action: (formData: FormData) => Promise<void>;
  onDone?: () => void;
  submitLabel: string;
}) {
  const [imagemBlob, setImagemBlob] = useState<Blob | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [remover, setRemover] = useState(false);
  const [erroImagem, setErroImagem] = useState("");
  const [enviando, setEnviando] = useState(false);

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
        />
      </div>

      <div>
        <label className={labelClass}>Estoque</label>
        <input
          name="estoque_atual"
          type="number"
          min="0"
          required
          defaultValue={produto?.estoque_atual ?? 0}
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass}>Categoria</label>
        <input
          name="categoria"
          defaultValue={produto?.categoria ?? ""}
          className={inputClass}
        />
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

      <div className="flex gap-2 sm:col-span-2">
        <button
          type="submit"
          disabled={enviando}
          className="rounded-full bg-rose-pastel px-5 py-2 text-sm font-semibold text-white hover:bg-chocolate-light transition-colors disabled:opacity-60"
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

export default function AdminProdutos({
  produtos,
}: {
  produtos: ProdutoAdmin[];
}) {
  const [criando, setCriando] = useState(false);
  const [editandoId, setEditandoId] = useState<number | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-chocolate">
          Produtos{" "}
          <span className="text-sm font-normal text-chocolate-muted">
            ({produtos.length})
          </span>
        </h2>
        <button
          onClick={() => setCriando((v) => !v)}
          className="rounded-full bg-rose-pastel px-5 py-2 text-sm font-semibold text-white hover:bg-chocolate-light transition-colors"
        >
          {criando ? "Fechar" : "+ Novo produto"}
        </button>
      </div>

      {criando && (
        <div className="rounded-2xl border border-rose-light bg-white p-6">
          <h3 className="mb-4 font-semibold text-chocolate">Novo produto</h3>
          <ProdutoForm
            action={criarProdutoAction}
            submitLabel="Criar"
            onDone={() => setCriando(false)}
          />
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-rose-light bg-white">
        <table className="w-full text-sm">
          <thead className="bg-cream text-left text-chocolate-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Nome</th>
              <th className="px-4 py-3 font-medium">Categoria</th>
              <th className="px-4 py-3 font-medium">Preço</th>
              <th className="px-4 py-3 font-medium">Estoque</th>
              <th className="px-4 py-3 font-medium">Ativo</th>
              <th className="px-4 py-3 font-medium text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {produtos.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-8 text-center text-chocolate-muted"
                >
                  Nenhum produto cadastrado.
                </td>
              </tr>
            )}
            {produtos.map((produto) => (
              <FragmentRow
                key={produto.id}
                produto={produto}
                editando={editandoId === produto.id}
                onEditar={() => setEditandoId(produto.id)}
                onCancelar={() => setEditandoId(null)}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FragmentRow({
  produto,
  editando,
  onEditar,
  onCancelar,
}: {
  produto: ProdutoAdmin;
  editando: boolean;
  onEditar: () => void;
  onCancelar: () => void;
}) {
  return (
    <>
      <tr className="border-t border-rose-light/60">
        <td className="px-4 py-3 font-medium text-chocolate">{produto.nome}</td>
        <td className="px-4 py-3 text-chocolate-muted">
          {produto.categoria ?? "—"}
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
