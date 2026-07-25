"use client";

import { useMemo, useState } from "react";
import {
  FILAS_CRM,
  type ConversaWhatsapp,
  type FilaMensagem,
} from "@/lib/mensagens";

const badgePorFila: Record<
  FilaMensagem,
  { bg: string; text: string; label: string }
> = {
  novas: {
    bg: "bg-badge-red",
    text: "text-badge-red-text",
    label: "Nova",
  },
  em_atendimento: {
    bg: "bg-badge-yellow",
    text: "text-badge-yellow-text",
    label: "Em atendimento",
  },
  aguardando: {
    bg: "bg-badge-green",
    text: "text-badge-green-text",
    label: "Aguardando",
  },
  resolvidas: {
    bg: "bg-rose-light",
    text: "text-chocolate-muted",
    label: "Resolvida",
  },
};

function formatarData(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function MensagensCrm({
  conversasIniciais,
}: {
  conversasIniciais: ConversaWhatsapp[];
}) {
  const [conversas, setConversas] = useState(conversasIniciais);
  const [filaAtiva, setFilaAtiva] = useState<FilaMensagem | "todas">("todas");
  const [selecionadaId, setSelecionadaId] = useState<number | null>(
    conversasIniciais[0]?.id ?? null,
  );
  const [rascunho, setRascunho] = useState("");

  const conversasFiltradas = useMemo(
    () =>
      filaAtiva === "todas"
        ? conversas
        : conversas.filter((c) => c.fila === filaAtiva),
    [conversas, filaAtiva],
  );

  const selecionada =
    conversas.find((c) => c.id === selecionadaId) ?? conversasFiltradas[0];

  const contagemPorFila = useMemo(() => {
    const mapa: Record<FilaMensagem, number> = {
      novas: 0,
      em_atendimento: 0,
      aguardando: 0,
      resolvidas: 0,
    };
    for (const c of conversas) mapa[c.fila] += 1;
    return mapa;
  }, [conversas]);

  const moverParaFila = (id: number, fila: FilaMensagem) => {
    setConversas((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, fila, naoLidas: fila === "novas" ? c.naoLidas : 0 } : c,
      ),
    );
  };

  const enviarRespostaDemo = () => {
    if (!selecionada || !rascunho.trim()) return;

    const texto = rascunho.trim();
    const horario = new Date().toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });

    setConversas((prev) =>
      prev.map((c) =>
        c.id === selecionada.id
          ? {
              ...c,
              fila: "aguardando",
              naoLidas: 0,
              ultimaMensagem: texto,
              atualizadoEm: new Date().toISOString(),
              mensagens: [
                ...c.mensagens,
                {
                  id: `${c.id}-${c.mensagens.length + 1}`,
                  de: "loja",
                  texto,
                  horario,
                },
              ],
            }
          : c,
      ),
    );
    setRascunho("");
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-rose-pastel/40 bg-rose-light/30 px-4 py-3 text-sm text-chocolate">
        <span className="font-semibold">Demonstração</span> — conversas
        fictícias para validar o fluxo do mini CRM. A integração real com
        WhatsApp virá na próxima etapa.
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setFilaAtiva("todas")}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            filaAtiva === "todas"
              ? "bg-rose-pastel text-white"
              : "border border-rose-light bg-white text-chocolate-muted hover:bg-rose-light"
          }`}
        >
          Todas ({conversas.length})
        </button>
        {FILAS_CRM.map((fila) => (
          <button
            key={fila.id}
            type="button"
            onClick={() => setFilaAtiva(fila.id)}
            title={fila.descricao}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              filaAtiva === fila.id
                ? "bg-rose-pastel text-white"
                : "border border-rose-light bg-white text-chocolate-muted hover:bg-rose-light"
            }`}
          >
            {fila.label} ({contagemPorFila[fila.id]})
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <div className="lg:col-span-2 rounded-2xl border border-rose-light bg-white overflow-hidden">
          <div className="border-b border-rose-light px-4 py-3">
            <p className="text-sm font-semibold text-chocolate">Conversas</p>
            <p className="text-xs text-chocolate-muted">
              {conversasFiltradas.length} na fila selecionada
            </p>
          </div>
          <ul className="max-h-[520px] divide-y divide-rose-light/60 overflow-y-auto">
            {conversasFiltradas.length === 0 ? (
              <li className="p-6 text-center text-sm text-chocolate-muted">
                Nenhuma conversa nesta fila.
              </li>
            ) : (
              conversasFiltradas.map((conversa) => {
                const ativa = selecionada?.id === conversa.id;
                const badge = badgePorFila[conversa.fila];
                return (
                  <li key={conversa.id}>
                    <button
                      type="button"
                      onClick={() => setSelecionadaId(conversa.id)}
                      className={`w-full px-4 py-3 text-left transition-colors ${
                        ativa ? "bg-rose-light/50" : "hover:bg-rose-light/30"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate font-medium text-chocolate">
                            {conversa.cliente}
                          </p>
                          <p className="truncate text-xs text-chocolate-muted">
                            {conversa.telefone}
                          </p>
                        </div>
                        {conversa.naoLidas > 0 && (
                          <span className="inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-badge-red px-1.5 text-xs font-bold text-badge-red-text">
                            {conversa.naoLidas}
                          </span>
                        )}
                      </div>
                      <p className="mt-1 truncate text-sm text-chocolate-muted">
                        {conversa.ultimaMensagem}
                      </p>
                      <div className="mt-2 flex items-center justify-between gap-2">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${badge.bg} ${badge.text}`}
                        >
                          {badge.label}
                        </span>
                        <span className="text-[10px] text-chocolate-muted">
                          {formatarData(conversa.atualizadoEm)}
                        </span>
                      </div>
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>

        <div className="lg:col-span-3 flex flex-col rounded-2xl border border-rose-light bg-white overflow-hidden min-h-[520px]">
          {selecionada ? (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-rose-light px-4 py-3">
                <div>
                  <p className="font-semibold text-chocolate">
                    {selecionada.cliente}
                  </p>
                  <p className="text-xs text-chocolate-muted">
                    {selecionada.telefone}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {FILAS_CRM.filter((f) => f.id !== selecionada.fila).map(
                    (fila) => (
                      <button
                        key={fila.id}
                        type="button"
                        onClick={() => moverParaFila(selecionada.id, fila.id)}
                        className="rounded-full border border-rose-light px-3 py-1 text-xs font-medium text-chocolate-muted hover:bg-rose-light"
                      >
                        → {fila.label}
                      </button>
                    ),
                  )}
                  <a
                    href={`https://wa.me/55${selecionada.telefone.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full bg-rose-pastel px-3 py-1 text-xs font-medium text-white hover:bg-chocolate-light"
                  >
                    Abrir no WhatsApp
                  </a>
                </div>
              </div>

              <div className="flex-1 space-y-3 overflow-y-auto bg-cream/40 p-4">
                {selecionada.mensagens.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.de === "loja" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                        msg.de === "loja"
                          ? "rounded-br-md bg-rose-pastel text-white"
                          : "rounded-bl-md border border-rose-light bg-white text-chocolate"
                      }`}
                    >
                      <p>{msg.texto}</p>
                      <p
                        className={`mt-1 text-[10px] ${
                          msg.de === "loja"
                            ? "text-white/80"
                            : "text-chocolate-muted"
                        }`}
                      >
                        {msg.horario}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-rose-light p-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={rascunho}
                    onChange={(e) => setRascunho(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") enviarRespostaDemo();
                    }}
                    placeholder="Digite uma resposta (demonstração)..."
                    className="flex-1 rounded-lg border border-rose-light bg-warm-white px-3 py-2 text-sm text-chocolate placeholder:text-chocolate-muted/60 focus:border-rose-pastel focus:outline-none focus:ring-2 focus:ring-rose-pastel/30"
                  />
                  <button
                    type="button"
                    onClick={enviarRespostaDemo}
                    disabled={!rascunho.trim()}
                    className="rounded-full bg-rose-pastel px-5 py-2 text-sm font-medium text-white hover:bg-chocolate-light disabled:opacity-50"
                  >
                    Enviar
                  </button>
                </div>
                <p className="mt-2 text-[11px] text-chocolate-muted">
                  No produto final, a resposta sairá pelo WhatsApp conectado.
                </p>
              </div>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center p-8 text-sm text-chocolate-muted">
              Selecione uma conversa para visualizar.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
