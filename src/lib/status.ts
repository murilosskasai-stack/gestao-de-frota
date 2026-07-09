import type {
  ChamadoStatus,
  EquipamentoStatus,
  MotivoParada,
  ObraStatus,
  OsStatus,
  Prioridade,
  RemanejamentoStatus,
  SolicitacaoStatus,
} from "@/lib/supabase/database.types";

// Literal Tailwind classes (never built dynamically) so the JIT compiler
// picks them up. Colors mirror the chip()/st()/prio() helpers in the
// original design file.
export const CHIP_CLASSES = {
  green: "bg-green-bg text-green-fg",
  amber: "bg-amber-bg text-amber-fg",
  red: "bg-red-bg text-red-fg",
  blue: "bg-blue-bg text-blue-fg",
  purple: "bg-purple-bg text-purple-fg",
  neutral: "bg-neutral-chip-bg text-neutral-chip-fg",
} as const;

export const EQUIPAMENTO_STATUS_LABEL: Record<EquipamentoStatus, string> = {
  operando: "Operando",
  em_manutencao: "Em manutenção",
  parado: "Parado",
  disponivel: "Disponível",
  em_deslocamento: "Em deslocamento",
};

export const EQUIPAMENTO_STATUS_CHIP: Record<EquipamentoStatus, keyof typeof CHIP_CLASSES> = {
  operando: "green",
  em_manutencao: "amber",
  parado: "red",
  disponivel: "blue",
  em_deslocamento: "purple",
};

export const OBRA_STATUS_LABEL: Record<ObraStatus, string> = {
  ativa: "Ativa",
  encerrada: "Encerrada",
  mobilizacao: "Mobilização",
  desmobilizacao: "Desmobilização",
};

export const OBRA_STATUS_CHIP: Record<ObraStatus, keyof typeof CHIP_CLASSES> = {
  ativa: "green",
  encerrada: "neutral",
  mobilizacao: "blue",
  desmobilizacao: "amber",
};

export const PRIORIDADE_LABEL: Record<Prioridade, string> = {
  alta: "Alta",
  media: "Média",
  baixa: "Baixa",
};

export const PRIORIDADE_CHIP: Record<Prioridade, keyof typeof CHIP_CLASSES> = {
  alta: "red",
  media: "amber",
  baixa: "blue",
};

export const CHAMADO_STATUS_LABEL: Record<ChamadoStatus, string> = {
  aberto: "Aberto",
  em_analise: "Em análise",
  equipe_deslocada: "Equipe deslocada",
  em_manutencao: "Em manutenção",
  concluido: "Concluído",
};

export const CHAMADO_STATUS_DOT: Record<ChamadoStatus, string> = {
  aberto: "#6b7078",
  em_analise: "#2F6FB0",
  equipe_deslocada: "#7A5AC2",
  em_manutencao: "#E8920C",
  concluido: "#2E9E5B",
};

export const OS_STATUS_LABEL: Record<OsStatus, string> = {
  programada: "Programada",
  em_andamento: "Em andamento",
  concluida: "Concluída",
};

export const OS_STATUS_CHIP: Record<OsStatus, keyof typeof CHIP_CLASSES> = {
  programada: "amber",
  em_andamento: "blue",
  concluida: "green",
};

export const MOVIMENTACAO_TIPO_LABEL: Record<string, string> = {
  entrada_frota: "Entrada na frota",
  alocacao: "Alocação",
  remanejamento: "Remanejamento",
  baixa: "Baixa",
};

export const OS_TIPO_LABEL: Record<string, string> = {
  preventiva: "Preventiva",
  corretiva: "Corretiva",
};

export const MOTIVO_PARADA_LABEL: Record<MotivoParada, string> = {
  sem_frente_servico: "Sem frente de serviço",
  aguardando_transporte: "Aguardando transporte",
  falta_operador: "Falta de operador",
  em_manutencao: "Em manutenção",
  reserva_operacional: "Reserva operacional",
  outros: "Outros",
};

export const SOLICITACAO_STATUS_LABEL: Record<SolicitacaoStatus, string> = {
  pendente: "Pendente",
  em_analise: "Em análise",
  aprovada: "Aprovada",
  rejeitada: "Rejeitada",
};

export const SOLICITACAO_STATUS_CHIP: Record<SolicitacaoStatus, keyof typeof CHIP_CLASSES> = {
  pendente: "red",
  em_analise: "amber",
  aprovada: "green",
  rejeitada: "neutral",
};

export const REMANEJAMENTO_STATUS_LABEL: Record<RemanejamentoStatus, string> = {
  solicitado: "Solicitação",
  em_analise: "Análise",
  aprovacao_diretoria: "Aprovação Diretoria",
  em_transporte: "Em transporte",
  recebido: "Recebido na obra",
};

export const REMANEJAMENTO_STAGES: RemanejamentoStatus[] = [
  "solicitado",
  "em_analise",
  "aprovacao_diretoria",
  "em_transporte",
  "recebido",
];

export const IDLE_DIAS_COLOR = (dias: number, limite: number) =>
  dias >= limite ? "#D14343" : dias >= Math.ceil(limite * 0.6) ? "#E8920C" : "#2F6FB0";
