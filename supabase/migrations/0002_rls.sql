-- Row Level Security — every table readable by any authenticated employee
-- (this is an internal company system), writes gated by role per module,
-- matching the permission map in the design (Diretor/Gestor/Engenheiro/
-- Mecânico/Encarregado).

alter table public.profiles enable row level security;
alter table public.obras enable row level security;
alter table public.equipamentos enable row level security;
alter table public.equipamento_movimentacoes enable row level security;
alter table public.equipamento_paradas enable row level security;
alter table public.apontamentos_diarios enable row level security;
alter table public.chamados enable row level security;
alter table public.chamado_midias enable row level security;
alter table public.chamado_eventos enable row level security;
alter table public.planos_preventivos enable row level security;
alter table public.ordens_servico enable row level security;
alter table public.solicitacoes enable row level security;
alter table public.solicitacao_itens enable row level security;
alter table public.remanejamentos enable row level security;
alter table public.remanejamento_eventos enable row level security;

-- ---- profiles ----
create policy "profiles_select_all" on public.profiles
  for select to authenticated using (true);

-- ---- obras ----
create policy "obras_select_all" on public.obras
  for select to authenticated using (true);
create policy "obras_write_gestao" on public.obras
  for insert to authenticated with check (public.is_role(array['diretor','gestor_frota','engenheiro']::user_role[]));
create policy "obras_update_gestao" on public.obras
  for update to authenticated
  using (public.is_role(array['diretor','gestor_frota','engenheiro']::user_role[]))
  with check (public.is_role(array['diretor','gestor_frota','engenheiro']::user_role[]));

-- ---- equipamentos ----
create policy "equipamentos_select_all" on public.equipamentos
  for select to authenticated using (true);
create policy "equipamentos_write_gestao" on public.equipamentos
  for insert to authenticated with check (public.is_role(array['diretor','gestor_frota','engenheiro']::user_role[]));
create policy "equipamentos_update_gestao" on public.equipamentos
  for update to authenticated
  using (public.is_role(array['diretor','gestor_frota','engenheiro','mecanico']::user_role[]))
  with check (public.is_role(array['diretor','gestor_frota','engenheiro','mecanico']::user_role[]));

-- ---- equipamento_movimentacoes ----
create policy "movimentacoes_select_all" on public.equipamento_movimentacoes
  for select to authenticated using (true);
create policy "movimentacoes_insert_gestao" on public.equipamento_movimentacoes
  for insert to authenticated with check (public.is_role(array['diretor','gestor_frota','engenheiro']::user_role[]));

-- ---- equipamento_paradas ----
create policy "paradas_select_all" on public.equipamento_paradas
  for select to authenticated using (true);
create policy "paradas_insert_campo" on public.equipamento_paradas
  for insert to authenticated with check (public.is_role(array['diretor','gestor_frota','engenheiro','encarregado']::user_role[]));
create policy "paradas_update_campo" on public.equipamento_paradas
  for update to authenticated
  using (public.is_role(array['diretor','gestor_frota','engenheiro','encarregado']::user_role[]))
  with check (public.is_role(array['diretor','gestor_frota','engenheiro','encarregado']::user_role[]));

-- ---- apontamentos_diarios ----
create policy "apontamentos_select_all" on public.apontamentos_diarios
  for select to authenticated using (true);
create policy "apontamentos_insert_campo" on public.apontamentos_diarios
  for insert to authenticated with check (public.is_role(array['diretor','gestor_frota','encarregado']::user_role[]));

-- ---- chamados ----
create policy "chamados_select_all" on public.chamados
  for select to authenticated using (true);
create policy "chamados_insert_campo" on public.chamados
  for insert to authenticated with check (
    public.is_role(array['diretor','gestor_frota','engenheiro','mecanico','encarregado']::user_role[])
  );
create policy "chamados_update_manutencao" on public.chamados
  for update to authenticated
  using (public.is_role(array['diretor','gestor_frota','mecanico']::user_role[]))
  with check (public.is_role(array['diretor','gestor_frota','mecanico']::user_role[]));

-- ---- chamado_midias ----
create policy "midias_select_all" on public.chamado_midias
  for select to authenticated using (true);
create policy "midias_insert_campo" on public.chamado_midias
  for insert to authenticated with check (
    public.is_role(array['diretor','gestor_frota','engenheiro','mecanico','encarregado']::user_role[])
  );

-- ---- chamado_eventos (system-generated via trigger only) ----
create policy "chamado_eventos_select_all" on public.chamado_eventos
  for select to authenticated using (true);

-- ---- planos_preventivos ----
create policy "planos_select_all" on public.planos_preventivos
  for select to authenticated using (true);
create policy "planos_write_gestao" on public.planos_preventivos
  for insert to authenticated with check (public.is_role(array['diretor','gestor_frota','engenheiro']::user_role[]));
create policy "planos_update_gestao" on public.planos_preventivos
  for update to authenticated
  using (public.is_role(array['diretor','gestor_frota','engenheiro']::user_role[]))
  with check (public.is_role(array['diretor','gestor_frota','engenheiro']::user_role[]));

-- ---- ordens_servico ----
create policy "os_select_all" on public.ordens_servico
  for select to authenticated using (true);
create policy "os_insert_manutencao" on public.ordens_servico
  for insert to authenticated with check (public.is_role(array['diretor','gestor_frota','engenheiro','mecanico']::user_role[]));
create policy "os_update_manutencao" on public.ordens_servico
  for update to authenticated
  using (public.is_role(array['diretor','gestor_frota','engenheiro','mecanico']::user_role[]))
  with check (public.is_role(array['diretor','gestor_frota','engenheiro','mecanico']::user_role[]));

-- ---- solicitacoes / itens ----
create policy "solicitacoes_select_all" on public.solicitacoes
  for select to authenticated using (true);
create policy "solicitacoes_insert_obra" on public.solicitacoes
  for insert to authenticated with check (
    public.is_role(array['diretor','gestor_frota','engenheiro','encarregado']::user_role[])
  );
create policy "solicitacoes_update_gestao" on public.solicitacoes
  for update to authenticated
  using (public.is_role(array['diretor','gestor_frota']::user_role[]))
  with check (public.is_role(array['diretor','gestor_frota']::user_role[]));

create policy "solicitacao_itens_select_all" on public.solicitacao_itens
  for select to authenticated using (true);
create policy "solicitacao_itens_insert_obra" on public.solicitacao_itens
  for insert to authenticated with check (
    public.is_role(array['diretor','gestor_frota','engenheiro','encarregado']::user_role[])
  );

-- ---- remanejamentos ----
create policy "remanejamentos_select_all" on public.remanejamentos
  for select to authenticated using (true);
create policy "remanejamentos_insert_gestao" on public.remanejamentos
  for insert to authenticated with check (public.is_role(array['diretor','gestor_frota','engenheiro']::user_role[]));
create policy "remanejamentos_update_gestao" on public.remanejamentos
  for update to authenticated
  using (public.is_role(array['diretor','gestor_frota']::user_role[]))
  with check (public.is_role(array['diretor','gestor_frota']::user_role[]));

-- ---- remanejamento_eventos (system-generated via trigger only) ----
create policy "remanejamento_eventos_select_all" on public.remanejamento_eventos
  for select to authenticated using (true);
