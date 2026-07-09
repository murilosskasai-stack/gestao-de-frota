-- Pátio — Gestão de Frota
-- Core schema: profiles/roles, obras, equipamentos, movimentação, apontamentos,
-- chamados de manutenção, preventiva/OS, ociosidade, logística & remanejamento.

create extension if not exists "pgcrypto";

-- =========================================================================
-- ENUMS
-- =========================================================================

create type user_role as enum (
  'diretor',
  'gestor_frota',
  'engenheiro',
  'mecanico',
  'encarregado'
);

create type obra_status as enum (
  'ativa',
  'encerrada',
  'mobilizacao',
  'desmobilizacao'
);

create type equipamento_status as enum (
  'operando',
  'em_manutencao',
  'parado',
  'disponivel',
  'em_deslocamento'
);

create type movimentacao_tipo as enum (
  'entrada_frota',
  'alocacao',
  'remanejamento',
  'baixa'
);

create type prioridade as enum ('alta', 'media', 'baixa');

create type chamado_status as enum (
  'aberto',
  'em_analise',
  'equipe_deslocada',
  'em_manutencao',
  'concluido'
);

create type midia_tipo as enum ('foto', 'video');

create type os_tipo as enum ('preventiva', 'corretiva');

create type os_status as enum ('programada', 'em_andamento', 'concluida');

create type motivo_parada as enum (
  'sem_frente_servico',
  'aguardando_transporte',
  'falta_operador',
  'em_manutencao',
  'reserva_operacional',
  'outros'
);

create type solicitacao_status as enum (
  'pendente',
  'em_analise',
  'aprovada',
  'rejeitada'
);

create type remanejamento_status as enum (
  'solicitado',
  'em_analise',
  'aprovacao_diretoria',
  'em_transporte',
  'recebido'
);

-- =========================================================================
-- PROFILES (1:1 with auth.users)
-- =========================================================================

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  role user_role not null,
  created_at timestamptz not null default now()
);

comment on table public.profiles is 'App-level user profile & role, one row per auth.users.';

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'encarregado')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.current_role()
returns user_role
language sql
stable
security definer set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_role(roles user_role[])
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select coalesce((select role from public.profiles where id = auth.uid()) = any(roles), false);
$$;

-- =========================================================================
-- OBRAS
-- =========================================================================

create table public.obras (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  cliente text not null,
  cidade text not null,
  estado text not null,
  responsavel text not null,
  data_inicio date not null,
  data_fim_prevista date,
  status obra_status not null default 'mobilizacao',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index obras_status_idx on public.obras (status);

-- =========================================================================
-- EQUIPAMENTOS
-- =========================================================================

create table public.equipamentos (
  id uuid primary key default gen_random_uuid(),
  codigo_interno text not null unique,
  patrimonio text not null,
  tipo text not null,
  fabricante text not null,
  modelo text not null,
  ano int not null,
  unidade_medida text not null default 'h',
  horimetro_atual numeric(12, 1) not null default 0,
  status equipamento_status not null default 'disponivel',
  obra_atual_id uuid references public.obras (id) on delete set null,
  observacoes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index equipamentos_status_idx on public.equipamentos (status);
create index equipamentos_obra_idx on public.equipamentos (obra_atual_id);

create table public.equipamento_movimentacoes (
  id uuid primary key default gen_random_uuid(),
  equipamento_id uuid not null references public.equipamentos (id) on delete cascade,
  obra_id uuid references public.obras (id) on delete set null,
  tipo movimentacao_tipo not null,
  descricao text not null,
  data timestamptz not null default now(),
  created_by uuid references public.profiles (id) on delete set null
);

create index equipamento_movimentacoes_equip_idx on public.equipamento_movimentacoes (equipamento_id, data desc);

-- Registro de paradas (para ociosidade e motivo)
create table public.equipamento_paradas (
  id uuid primary key default gen_random_uuid(),
  equipamento_id uuid not null references public.equipamentos (id) on delete cascade,
  motivo motivo_parada not null,
  data_inicio timestamptz not null default now(),
  data_fim timestamptz,
  observacao text,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create index equipamento_paradas_aberta_idx on public.equipamento_paradas (equipamento_id) where data_fim is null;

-- =========================================================================
-- APONTAMENTO DIÁRIO
-- =========================================================================

create table public.apontamentos_diarios (
  id uuid primary key default gen_random_uuid(),
  equipamento_id uuid not null references public.equipamentos (id) on delete cascade,
  obra_id uuid references public.obras (id) on delete set null,
  data date not null default current_date,
  horimetro_inicial numeric(12, 1) not null,
  horimetro_final numeric(12, 1) not null,
  jornada_horas numeric(4, 1) not null default 10,
  horas_trabalhadas numeric(6, 1) generated always as (horimetro_final - horimetro_inicial) stored,
  horas_ociosas numeric(6, 1) generated always as (
    greatest(jornada_horas - (horimetro_final - horimetro_inicial), 0)
  ) stored,
  encarregado_id uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  constraint apontamentos_horimetro_check check (horimetro_final >= horimetro_inicial)
);

create index apontamentos_equip_idx on public.apontamentos_diarios (equipamento_id, data desc);
create index apontamentos_data_idx on public.apontamentos_diarios (data desc);

-- =========================================================================
-- CHAMADOS DE MANUTENÇÃO
-- =========================================================================

create sequence public.chamados_numero_seq start 3092;

create table public.chamados (
  id uuid primary key default gen_random_uuid(),
  numero text not null unique default ('CH-' || nextval('public.chamados_numero_seq')::text),
  equipamento_id uuid not null references public.equipamentos (id) on delete cascade,
  obra_id uuid references public.obras (id) on delete set null,
  descricao text not null,
  prioridade prioridade not null default 'media',
  status chamado_status not null default 'aberto',
  aberto_por uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index chamados_status_idx on public.chamados (status);
create index chamados_equip_idx on public.chamados (equipamento_id);

create table public.chamado_midias (
  id uuid primary key default gen_random_uuid(),
  chamado_id uuid not null references public.chamados (id) on delete cascade,
  tipo midia_tipo not null,
  storage_path text not null,
  created_at timestamptz not null default now()
);

create table public.chamado_eventos (
  id uuid primary key default gen_random_uuid(),
  chamado_id uuid not null references public.chamados (id) on delete cascade,
  status chamado_status not null,
  nota text,
  actor_id uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create index chamado_eventos_chamado_idx on public.chamado_eventos (chamado_id, created_at);

create or replace function public.log_chamado_evento()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if (tg_op = 'INSERT') then
    insert into public.chamado_eventos (chamado_id, status, nota, actor_id)
    values (new.id, new.status, 'Chamado criado', new.aberto_por);
  elsif (new.status is distinct from old.status) then
    insert into public.chamado_eventos (chamado_id, status, actor_id)
    values (new.id, new.status, auth.uid());
  end if;
  return new;
end;
$$;

create trigger chamados_log_evento
  after insert or update on public.chamados
  for each row execute function public.log_chamado_evento();

-- =========================================================================
-- MANUTENÇÃO PREVENTIVA
-- =========================================================================

create table public.planos_preventivos (
  id uuid primary key default gen_random_uuid(),
  servico text not null,
  intervalo_horas numeric(10, 1) not null,
  tipo_equipamento text,
  created_at timestamptz not null default now()
);

create sequence public.os_numero_seq start 1210;

create table public.ordens_servico (
  id uuid primary key default gen_random_uuid(),
  numero text not null unique default ('OS-' || nextval('public.os_numero_seq')::text),
  equipamento_id uuid not null references public.equipamentos (id) on delete cascade,
  plano_id uuid references public.planos_preventivos (id) on delete set null,
  chamado_id uuid references public.chamados (id) on delete set null,
  tipo os_tipo not null,
  descricao text not null,
  status os_status not null default 'programada',
  horimetro_execucao numeric(12, 1),
  data_programada date,
  data_conclusao date,
  created_at timestamptz not null default now(),
  constraint ordens_servico_tipo_check check (
    (tipo = 'preventiva' and plano_id is not null) or
    (tipo = 'corretiva' and chamado_id is not null)
  )
);

create index ordens_servico_equip_idx on public.ordens_servico (equipamento_id);
create index ordens_servico_status_idx on public.ordens_servico (status);

-- =========================================================================
-- LOGÍSTICA: SOLICITAÇÕES & REMANEJAMENTO
-- =========================================================================

create table public.solicitacoes (
  id uuid primary key default gen_random_uuid(),
  obra_id uuid not null references public.obras (id) on delete cascade,
  solicitante_id uuid references public.profiles (id) on delete set null,
  status solicitacao_status not null default 'pendente',
  observacao text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.solicitacao_itens (
  id uuid primary key default gen_random_uuid(),
  solicitacao_id uuid not null references public.solicitacoes (id) on delete cascade,
  tipo_equipamento text not null,
  quantidade int not null default 1
);

create sequence public.remanejamento_numero_seq start 219;

create table public.remanejamentos (
  id uuid primary key default gen_random_uuid(),
  numero text not null unique default ('RM-' || nextval('public.remanejamento_numero_seq')::text),
  equipamento_id uuid not null references public.equipamentos (id) on delete cascade,
  obra_origem_id uuid references public.obras (id) on delete set null,
  obra_destino_id uuid not null references public.obras (id) on delete cascade,
  solicitacao_id uuid references public.solicitacoes (id) on delete set null,
  status remanejamento_status not null default 'solicitado',
  aprovado_por uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.remanejamento_eventos (
  id uuid primary key default gen_random_uuid(),
  remanejamento_id uuid not null references public.remanejamentos (id) on delete cascade,
  status remanejamento_status not null,
  nota text,
  actor_id uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create or replace function public.log_remanejamento_evento()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if (tg_op = 'INSERT') then
    insert into public.remanejamento_eventos (remanejamento_id, status, nota, actor_id)
    values (new.id, new.status, 'Solicitação registrada', auth.uid());
  elsif (new.status is distinct from old.status) then
    insert into public.remanejamento_eventos (remanejamento_id, status, actor_id)
    values (new.id, new.status, auth.uid());
  end if;
  return new;
end;
$$;

create trigger remanejamentos_log_evento
  after insert or update on public.remanejamentos
  for each row execute function public.log_remanejamento_evento();

-- =========================================================================
-- updated_at helper
-- =========================================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger obras_set_updated_at before update on public.obras
  for each row execute function public.set_updated_at();
create trigger equipamentos_set_updated_at before update on public.equipamentos
  for each row execute function public.set_updated_at();
create trigger chamados_set_updated_at before update on public.chamados
  for each row execute function public.set_updated_at();
create trigger solicitacoes_set_updated_at before update on public.solicitacoes
  for each row execute function public.set_updated_at();
create trigger remanejamentos_set_updated_at before update on public.remanejamentos
  for each row execute function public.set_updated_at();

-- =========================================================================
-- VIEWS
-- =========================================================================

-- Equipamentos parados/disponíveis com motivo e dias desde o início da parada.
create or replace view public.v_ociosidade
with (security_invoker = true) as
select
  e.id as equipamento_id,
  e.codigo_interno,
  e.tipo,
  e.modelo,
  e.status,
  e.obra_atual_id,
  o.nome as obra_nome,
  p.motivo,
  p.data_inicio as parada_desde,
  extract(day from now() - p.data_inicio)::int as dias_parado
from public.equipamentos e
left join public.obras o on o.id = e.obra_atual_id
left join lateral (
  select motivo, data_inicio
  from public.equipamento_paradas ep
  where ep.equipamento_id = e.id and ep.data_fim is null
  order by ep.data_inicio desc
  limit 1
) p on true
where e.status in ('parado', 'disponivel');

-- Próxima preventiva por equipamento/plano: última OS preventiva concluída
-- + intervalo do plano, comparado ao horímetro atual.
create or replace view public.v_preventivas_pendentes
with (security_invoker = true) as
select
  e.id as equipamento_id,
  e.codigo_interno,
  e.horimetro_atual,
  pl.id as plano_id,
  pl.servico,
  pl.intervalo_horas,
  coalesce(ult.horimetro_execucao, 0) as horimetro_ultima_execucao,
  coalesce(ult.horimetro_execucao, 0) + pl.intervalo_horas as horimetro_alvo,
  (coalesce(ult.horimetro_execucao, 0) + pl.intervalo_horas) - e.horimetro_atual as horas_restantes
from public.equipamentos e
cross join public.planos_preventivos pl
left join lateral (
  select os.horimetro_execucao
  from public.ordens_servico os
  where os.equipamento_id = e.id
    and os.plano_id = pl.id
    and os.status = 'concluida'
  order by os.data_conclusao desc nulls last, os.horimetro_execucao desc
  limit 1
) ult on true
where pl.tipo_equipamento is null or pl.tipo_equipamento = e.tipo;
