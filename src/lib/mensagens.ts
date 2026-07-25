export type FilaMensagem =
  | "novas"
  | "em_atendimento"
  | "aguardando"
  | "resolvidas";

export type MensagemWhatsapp = {
  id: string;
  de: "cliente" | "loja";
  texto: string;
  horario: string;
};

export type ConversaWhatsapp = {
  id: number;
  cliente: string;
  telefone: string;
  fila: FilaMensagem;
  ultimaMensagem: string;
  atualizadoEm: string;
  naoLidas: number;
  mensagens: MensagemWhatsapp[];
};

export const FILAS_CRM: {
  id: FilaMensagem;
  label: string;
  descricao: string;
}[] = [
  {
    id: "novas",
    label: "Novas",
    descricao: "Primeiro contato ou mensagem sem resposta",
  },
  {
    id: "em_atendimento",
    label: "Em atendimento",
    descricao: "Conversas que você está respondendo agora",
  },
  {
    id: "aguardando",
    label: "Aguardando cliente",
    descricao: "Você respondeu e aguarda retorno",
  },
  {
    id: "resolvidas",
    label: "Resolvidas",
    descricao: "Pedidos fechados ou dúvidas encerradas",
  },
];

/** Dados fictícios para o demonstrativo do mini CRM. */
export function listarConversasDemo(): ConversaWhatsapp[] {
  return [
    {
      id: 1,
      cliente: "Maria Silva",
      telefone: "(19) 99876-5432",
      fila: "novas",
      ultimaMensagem: "Vocês fazem bolo de red velvet para 20 pessoas?",
      atualizadoEm: "2026-07-25T12:45:00",
      naoLidas: 2,
      mensagens: [
        {
          id: "1-1",
          de: "cliente",
          texto: "Oi, boa tarde! 😊",
          horario: "12:42",
        },
        {
          id: "1-2",
          de: "cliente",
          texto: "Vocês fazem bolo de red velvet para 20 pessoas?",
          horario: "12:45",
        },
      ],
    },
    {
      id: 2,
      cliente: "João Santos",
      telefone: "(19) 99123-4567",
      fila: "em_atendimento",
      ultimaMensagem: "Pode ser retirada no sábado às 10h?",
      atualizadoEm: "2026-07-25T11:20:00",
      naoLidas: 1,
      mensagens: [
        {
          id: "2-1",
          de: "cliente",
          texto: "Quero fechar o pedido de 50 brigadeiros gourmet.",
          horario: "10:55",
        },
        {
          id: "2-2",
          de: "loja",
          texto: "Olá João! Temos disponível para sábado. O total fica R$ 175,00.",
          horario: "11:05",
        },
        {
          id: "2-3",
          de: "cliente",
          texto: "Pode ser retirada no sábado às 10h?",
          horario: "11:20",
        },
      ],
    },
    {
      id: 3,
      cliente: "Ana Paula",
      telefone: "(19) 98765-1122",
      fila: "aguardando",
      ultimaMensagem: "Perfeito, vou buscar amanhã às 15h.",
      atualizadoEm: "2026-07-25T09:30:00",
      naoLidas: 0,
      mensagens: [
        {
          id: "3-1",
          de: "cliente",
          texto: "O kit festa para 15 pessoas ainda está disponível?",
          horario: "09:10",
        },
        {
          id: "3-2",
          de: "loja",
          texto: "Sim! Separamos docinhos variados + bolo de 1,5 kg. Valor R$ 289,00.",
          horario: "09:18",
        },
        {
          id: "3-3",
          de: "cliente",
          texto: "Perfeito, vou buscar amanhã às 15h.",
          horario: "09:30",
        },
      ],
    },
    {
      id: 4,
      cliente: "Carlos Mendes",
      telefone: "(19) 97654-8899",
      fila: "novas",
      ultimaMensagem: "Tem brownie sem glúten no cardápio?",
      atualizadoEm: "2026-07-25T13:02:00",
      naoLidas: 1,
      mensagens: [
        {
          id: "4-1",
          de: "cliente",
          texto: "Tem brownie sem glúten no cardápio?",
          horario: "13:02",
        },
      ],
    },
    {
      id: 5,
      cliente: "Fernanda Lima",
      telefone: "(19) 96543-2211",
      fila: "resolvidas",
      ultimaMensagem: "Obrigada pelo atendimento! Ficou tudo lindo. 💕",
      atualizadoEm: "2026-07-24T18:40:00",
      naoLidas: 0,
      mensagens: [
        {
          id: "5-1",
          de: "cliente",
          texto: "Queria encomendar 2 tortas de limão para domingo.",
          horario: "16:20",
        },
        {
          id: "5-2",
          de: "loja",
          texto: "Fernanda, confirmado! Retirada domingo das 14h às 16h.",
          horario: "16:35",
        },
        {
          id: "5-3",
          de: "cliente",
          texto: "Obrigada pelo atendimento! Ficou tudo lindo. 💕",
          horario: "18:40",
        },
      ],
    },
  ];
}

export function contarNovasDemo(conversas: ConversaWhatsapp[]): number {
  return conversas.filter((c) => c.fila === "novas").length;
}
