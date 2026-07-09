// Hand-written types mirroring supabase/migrations/0001_schema.sql.
// Regenerate with `supabase gen types typescript` once linked to a live project.

export type UserRole =
  | "diretor"
  | "gestor_frota"
  | "engenheiro"
  | "mecanico"
  | "encarregado";

export type ObraStatus = "ativa" | "encerrada" | "mobilizacao" | "desmobilizacao";

export type EquipamentoStatus =
  | "operando"
  | "em_manutencao"
  | "parado"
  | "disponivel"
  | "em_deslocamento";

export type MovimentacaoTipo = "entrada_frota" | "alocacao" | "remanejamento" | "baixa";

export type Prioridade = "alta" | "media" | "baixa";

export type ChamadoStatus =
  | "aberto"
  | "em_analise"
  | "equipe_deslocada"
  | "em_manutencao"
  | "concluido";

export type MidiaTipo = "foto" | "video";

export type OsTipo = "preventiva" | "corretiva";

export type OsStatus = "programada" | "em_andamento" | "concluida";

export type MotivoParada =
  | "sem_frente_servico"
  | "aguardando_transporte"
  | "falta_operador"
  | "em_manutencao"
  | "reserva_operacional"
  | "outros";

export type SolicitacaoStatus = "pendente" | "em_analise" | "aprovada" | "rejeitada";

export type RemanejamentoStatus =
  | "solicitado"
  | "em_analise"
  | "aprovacao_diretoria"
  | "em_transporte"
  | "recebido";

export type Profile = {
  id: string;
  full_name: string;
  role: UserRole;
  created_at: string;
}

export type Obra = {
  id: string;
  nome: string;
  cliente: string;
  cidade: string;
  estado: string;
  responsavel: string;
  data_inicio: string;
  data_fim_prevista: string | null;
  status: ObraStatus;
  created_at: string;
  updated_at: string;
}

export type Equipamento = {
  id: string;
  codigo_interno: string;
  patrimonio: string;
  tipo: string;
  fabricante: string;
  modelo: string;
  ano: number;
  unidade_medida: string;
  horimetro_atual: number;
  status: EquipamentoStatus;
  obra_atual_id: string | null;
  observacoes: string | null;
  created_at: string;
  updated_at: string;
}

export type EquipamentoMovimentacao = {
  id: string;
  equipamento_id: string;
  obra_id: string | null;
  tipo: MovimentacaoTipo;
  descricao: string;
  data: string;
  created_by: string | null;
}

export type EquipamentoParada = {
  id: string;
  equipamento_id: string;
  motivo: MotivoParada;
  data_inicio: string;
  data_fim: string | null;
  observacao: string | null;
  created_by: string | null;
  created_at: string;
}

export type ApontamentoDiario = {
  id: string;
  equipamento_id: string;
  obra_id: string | null;
  data: string;
  horimetro_inicial: number;
  horimetro_final: number;
  jornada_horas: number;
  horas_trabalhadas: number;
  horas_ociosas: number;
  encarregado_id: string | null;
  created_at: string;
}

export type Chamado = {
  id: string;
  numero: string;
  equipamento_id: string;
  obra_id: string | null;
  descricao: string;
  prioridade: Prioridade;
  status: ChamadoStatus;
  aberto_por: string | null;
  created_at: string;
  updated_at: string;
}

export type ChamadoMidia = {
  id: string;
  chamado_id: string;
  tipo: MidiaTipo;
  storage_path: string;
  created_at: string;
}

export type ChamadoEvento = {
  id: string;
  chamado_id: string;
  status: ChamadoStatus;
  nota: string | null;
  actor_id: string | null;
  created_at: string;
}

export type PlanoPreventivo = {
  id: string;
  servico: string;
  intervalo_horas: number;
  tipo_equipamento: string | null;
  created_at: string;
}

export type OrdemServico = {
  id: string;
  numero: string;
  equipamento_id: string;
  plano_id: string | null;
  chamado_id: string | null;
  tipo: OsTipo;
  descricao: string;
  status: OsStatus;
  horimetro_execucao: number | null;
  data_programada: string | null;
  data_conclusao: string | null;
  created_at: string;
}

export type Solicitacao = {
  id: string;
  obra_id: string;
  solicitante_id: string | null;
  status: SolicitacaoStatus;
  observacao: string | null;
  created_at: string;
  updated_at: string;
}

export type SolicitacaoItem = {
  id: string;
  solicitacao_id: string;
  tipo_equipamento: string;
  quantidade: number;
}

export type Remanejamento = {
  id: string;
  numero: string;
  equipamento_id: string;
  obra_origem_id: string | null;
  obra_destino_id: string;
  solicitacao_id: string | null;
  status: RemanejamentoStatus;
  aprovado_por: string | null;
  created_at: string;
  updated_at: string;
}

export type RemanejamentoEvento = {
  id: string;
  remanejamento_id: string;
  status: RemanejamentoStatus;
  nota: string | null;
  actor_id: string | null;
  created_at: string;
}

export type VOciosidade = {
  equipamento_id: string;
  codigo_interno: string;
  tipo: string;
  modelo: string;
  status: EquipamentoStatus;
  obra_atual_id: string | null;
  obra_nome: string | null;
  motivo: MotivoParada | null;
  parada_desde: string | null;
  dias_parado: number | null;
}

export type VPreventivaPendente = {
  equipamento_id: string;
  codigo_interno: string;
  horimetro_atual: number;
  plano_id: string;
  servico: string;
  intervalo_horas: number;
  horimetro_ultima_execucao: number;
  horimetro_alvo: number;
  horas_restantes: number;
}

// supabase-js's GenericTable/GenericView require a `Relationships` array;
// left empty since we don't rely on PostgREST embedded-resource typing here.
type Rel = { Relationships: [] };

export type Database = {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: never; Update: Partial<Profile> } & Rel;
      obras: {
        Row: Obra;
        Insert: Omit<Obra, "id" | "created_at" | "updated_at"> & { id?: string };
        Update: Partial<Omit<Obra, "id">>;
      } & Rel;
      equipamentos: {
        Row: Equipamento;
        Insert: Omit<Equipamento, "id" | "created_at" | "updated_at"> & { id?: string };
        Update: Partial<Omit<Equipamento, "id">>;
      } & Rel;
      equipamento_movimentacoes: {
        Row: EquipamentoMovimentacao;
        Insert: Omit<EquipamentoMovimentacao, "id"> & { id?: string };
        Update: Partial<Omit<EquipamentoMovimentacao, "id">>;
      } & Rel;
      equipamento_paradas: {
        Row: EquipamentoParada;
        Insert: Omit<EquipamentoParada, "id" | "created_at"> & { id?: string };
        Update: Partial<Omit<EquipamentoParada, "id">>;
      } & Rel;
      apontamentos_diarios: {
        Row: ApontamentoDiario;
        Insert: Omit<
          ApontamentoDiario,
          "id" | "created_at" | "horas_trabalhadas" | "horas_ociosas"
        > & { id?: string };
        Update: Partial<Omit<ApontamentoDiario, "id">>;
      } & Rel;
      chamados: {
        Row: Chamado;
        Insert: Omit<Chamado, "id" | "numero" | "created_at" | "updated_at"> & {
          id?: string;
          numero?: string;
        };
        Update: Partial<Omit<Chamado, "id">>;
      } & Rel;
      chamado_midias: {
        Row: ChamadoMidia;
        Insert: Omit<ChamadoMidia, "id" | "created_at"> & { id?: string };
        Update: Partial<Omit<ChamadoMidia, "id">>;
      } & Rel;
      chamado_eventos: { Row: ChamadoEvento; Insert: never; Update: never } & Rel;
      planos_preventivos: {
        Row: PlanoPreventivo;
        Insert: Omit<PlanoPreventivo, "id" | "created_at"> & { id?: string };
        Update: Partial<Omit<PlanoPreventivo, "id">>;
      } & Rel;
      ordens_servico: {
        Row: OrdemServico;
        Insert: Omit<OrdemServico, "id" | "numero" | "created_at"> & {
          id?: string;
          numero?: string;
        };
        Update: Partial<Omit<OrdemServico, "id">>;
      } & Rel;
      solicitacoes: {
        Row: Solicitacao;
        Insert: Omit<Solicitacao, "id" | "created_at" | "updated_at" | "observacao"> & {
          id?: string;
          observacao?: string | null;
        };
        Update: Partial<Omit<Solicitacao, "id">>;
      } & Rel;
      solicitacao_itens: {
        Row: SolicitacaoItem;
        Insert: Omit<SolicitacaoItem, "id"> & { id?: string };
        Update: Partial<Omit<SolicitacaoItem, "id">>;
      } & Rel;
      remanejamentos: {
        Row: Remanejamento;
        Insert: Omit<Remanejamento, "id" | "numero" | "created_at" | "updated_at" | "aprovado_por"> & {
          id?: string;
          numero?: string;
          aprovado_por?: string | null;
        };
        Update: Partial<Omit<Remanejamento, "id">>;
      } & Rel;
      remanejamento_eventos: { Row: RemanejamentoEvento; Insert: never; Update: never } & Rel;
    };
    Views: {
      v_ociosidade: { Row: VOciosidade } & Rel;
      v_preventivas_pendentes: { Row: VPreventivaPendente } & Rel;
    };
    Functions: Record<string, never>;
  };
}
