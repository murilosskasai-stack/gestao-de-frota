-- Demo/seed data — realistic Brazilian earthmoving-company dataset mirroring
-- the approved design prototype. Local/dev only.
--
-- Demo login accounts (password for all: "demo12345"):
--   ricardo.alves@patio.demo    Diretor
--   fernanda.dias@patio.demo    Gestora de Frota
--   paulo.tavares@patio.demo    Engenheiro
--   joao.silva@patio.demo       Mecânico
--   marcos.lima@patio.demo      Encarregado

-- =========================================================================
-- DEMO USERS (auth.users + auth.identities + profiles via trigger)
-- =========================================================================

do $$
declare
  demo_password text := crypt('demo12345', gen_salt('bf'));
  users jsonb := '[
    ["11111111-1111-1111-1111-111111111111","ricardo.alves@patio.demo","Ricardo Alves","diretor"],
    ["22222222-2222-2222-2222-222222222222","fernanda.dias@patio.demo","Fernanda Dias","gestor_frota"],
    ["33333333-3333-3333-3333-333333333333","paulo.tavares@patio.demo","Paulo Tavares","engenheiro"],
    ["44444444-4444-4444-4444-444444444444","joao.silva@patio.demo","João Silva","mecanico"],
    ["55555555-5555-5555-5555-555555555555","marcos.lima@patio.demo","Marcos Lima","encarregado"],
    ["66666666-6666-6666-6666-666666666666","ana.souza@patio.demo","Ana Souza","encarregado"],
    ["77777777-7777-7777-7777-777777777777","jose.pereira@patio.demo","José Pereira","encarregado"],
    ["88888888-8888-8888-8888-888888888888","carla.mendes@patio.demo","Carla Mendes","engenheiro"],
    ["99999999-9999-9999-9999-999999999999","diego.rocha@patio.demo","Diego Rocha","engenheiro"]
  ]'::jsonb;
  u jsonb;
  uid uuid;
begin
  for u in select * from jsonb_array_elements(users) loop
    uid := (u->>0)::uuid;
    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at, confirmation_token, recovery_token,
      email_change_token_new, email_change
    ) values (
      '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
      u->>1, demo_password,
      now(), '{"provider":"email","providers":["email"]}',
      jsonb_build_object('full_name', u->>2, 'role', u->>3),
      now(), now(), '', '', '', ''
    )
    on conflict (id) do nothing;

    insert into auth.identities (
      id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at
    ) values (
      gen_random_uuid(), uid, uid::text,
      jsonb_build_object('sub', uid::text, 'email', u->>1),
      'email', now(), now(), now()
    )
    on conflict do nothing;
  end loop;
end $$;

-- =========================================================================
-- OBRAS
-- =========================================================================

insert into public.obras (id, nome, cliente, cidade, estado, responsavel, data_inicio, data_fim_prevista, status) values
  ('a0000000-0000-0000-0000-000000000001', 'Duplicação BR-262 — Lote 3', 'DNIT', 'Marabá', 'PA', 'Eng. Paulo Tavares', '2025-03-01', '2026-12-31', 'ativa'),
  ('a0000000-0000-0000-0000-000000000002', 'Terraplanagem Galpão Logístico', 'Mercúrio Log', 'Uberlândia', 'MG', 'Eng. Carla Mendes', '2026-01-01', '2026-08-31', 'ativa'),
  ('a0000000-0000-0000-0000-000000000003', 'Mina Serra Azul — Acessos', 'Vale Verde Mineração', 'Itabira', 'MG', 'Eng. Diego Rocha', '2026-05-01', null, 'mobilizacao'),
  ('a0000000-0000-0000-0000-000000000004', 'Loteamento Vale do Sol', 'Construtora Horizonte', 'Goiânia', 'GO', 'Enc. Marcos Lima', '2025-10-01', '2026-11-30', 'ativa'),
  ('a0000000-0000-0000-0000-000000000005', 'Barragem Rio Claro', 'Energia Sul', 'Caçapava', 'SP', 'Eng. Paulo Tavares', '2024-02-01', '2026-07-31', 'desmobilizacao'),
  ('a0000000-0000-0000-0000-000000000006', 'Aeroporto Regional — Pátio', 'Governo do Estado', 'Sinop', 'MT', 'Eng. Carla Mendes', '2024-01-01', '2026-04-30', 'encerrada');

-- =========================================================================
-- EQUIPAMENTOS
-- =========================================================================

insert into public.equipamentos (id, codigo_interno, patrimonio, tipo, fabricante, modelo, ano, unidade_medida, horimetro_atual, status, obra_atual_id, observacoes) values
  ('e0000000-0000-0000-0000-000000000142', 'EQ-0142', 'PAT-0142', 'Escavadeira Hidráulica', 'Caterpillar', 'CAT 320 GC', 2021, 'h', 4812.0, 'parado', 'a0000000-0000-0000-0000-000000000005', 'Superaquecimento do motor reportado — aguardando frente de serviço.'),
  ('e0000000-0000-0000-0000-000000000118', 'EQ-0118', 'PAT-0118', 'Motoniveladora', 'Komatsu', 'GD555', 2021, 'h', 6190.7, 'operando', 'a0000000-0000-0000-0000-000000000001', null),
  ('e0000000-0000-0000-0000-000000000087', 'EQ-0087', 'PAT-0087', 'Trator de Esteira', 'Caterpillar', 'D6', 2020, 'h', 9340.0, 'operando', 'a0000000-0000-0000-0000-000000000001', null),
  ('e0000000-0000-0000-0000-000000000203', 'EQ-0203', 'PAT-0203', 'Pá Carregadeira', 'Volvo', 'L120', 2022, 'h', 3275.0, 'operando', 'a0000000-0000-0000-0000-000000000002', null),
  ('e0000000-0000-0000-0000-000000000156', 'EQ-0156', 'PAT-0156', 'Caminhão Basculante', 'Mercedes-Benz', 'Axor 3344', 2019, 'km', 88420.0, 'disponivel', 'a0000000-0000-0000-0000-000000000002', 'Em reserva operacional.'),
  ('e0000000-0000-0000-0000-000000000061', 'EQ-0061', 'PAT-0061', 'Rolo Compactador', 'Hamm', '3411', 2020, 'h', 5108.0, 'operando', 'a0000000-0000-0000-0000-000000000004', null),
  ('e0000000-0000-0000-0000-000000000179', 'EQ-0179', 'PAT-0179', 'Retroescavadeira', 'JCB', '3CX', 2018, 'h', 7622.0, 'parado', 'a0000000-0000-0000-0000-000000000004', 'Sem operador disponível.'),
  ('e0000000-0000-0000-0000-000000000044', 'EQ-0044', 'PAT-0044', 'Escavadeira Hidráulica', 'Komatsu', 'PC210', 2017, 'h', 11205.0, 'parado', 'a0000000-0000-0000-0000-000000000005', 'Aguardando transporte para remanejamento.'),
  ('e0000000-0000-0000-0000-000000000231', 'EQ-0231', 'PAT-0231', 'Caminhão Pipa', 'Mercedes-Benz', 'Atego 2426', 2020, 'km', 54310.0, 'em_manutencao', 'a0000000-0000-0000-0000-000000000003', null);

-- Histórico de movimentação (detalhado para EQ-0142, a "ficha" de exemplo)
insert into public.equipamento_movimentacoes (equipamento_id, obra_id, tipo, descricao, data, created_by) values
  ('e0000000-0000-0000-0000-000000000142', null, 'entrada_frota', 'Cadastro e registro de patrimônio', '2026-01-15', '22222222-2222-2222-2222-222222222222'),
  ('e0000000-0000-0000-0000-000000000142', 'a0000000-0000-0000-0000-000000000002', 'remanejamento', 'Remanejado do Galpão Logístico · aprovado pela diretoria (RM-201)', '2026-04-28', '11111111-1111-1111-1111-111111111111'),
  ('e0000000-0000-0000-0000-000000000142', 'a0000000-0000-0000-0000-000000000005', 'alocacao', 'Alocado na Barragem Rio Claro · transporte concluído, conferido pelo encarregado', '2026-06-12', '55555555-5555-5555-5555-555555555555'),
  ('e0000000-0000-0000-0000-000000000044', 'a0000000-0000-0000-0000-000000000005', 'alocacao', 'Alocado na Barragem Rio Claro', '2026-02-10', '22222222-2222-2222-2222-222222222222'),
  ('e0000000-0000-0000-0000-000000000231', 'a0000000-0000-0000-0000-000000000003', 'remanejamento', 'Remanejado para Mina Serra Azul — Acessos', '2026-05-20', '33333333-3333-3333-3333-333333333333');

-- Paradas em aberto (alimentam a view de ociosidade)
insert into public.equipamento_paradas (equipamento_id, motivo, data_inicio, observacao, created_by) values
  ('e0000000-0000-0000-0000-000000000142', 'sem_frente_servico', now() - interval '8 days', 'Sem frente de serviço liberada na obra.', '55555555-5555-5555-5555-555555555555'),
  ('e0000000-0000-0000-0000-000000000044', 'aguardando_transporte', now() - interval '5 days', 'Aguardando carreta para remanejamento (RM-218).', '22222222-2222-2222-2222-222222222222'),
  ('e0000000-0000-0000-0000-000000000179', 'falta_operador', now() - interval '4 days', 'Sem operador disponível na Vale do Sol.', '55555555-5555-5555-5555-555555555555'),
  ('e0000000-0000-0000-0000-000000000156', 'reserva_operacional', now() - interval '3 days', 'Mantido em reserva operacional no Galpão.', '22222222-2222-2222-2222-222222222222');

-- =========================================================================
-- APONTAMENTO DIÁRIO
-- =========================================================================

insert into public.apontamentos_diarios (equipamento_id, obra_id, data, horimetro_inicial, horimetro_final, jornada_horas, encarregado_id) values
  ('e0000000-0000-0000-0000-000000000118', 'a0000000-0000-0000-0000-000000000001', current_date, 6181.2, 6190.7, 10, '55555555-5555-5555-5555-555555555555'),
  ('e0000000-0000-0000-0000-000000000087', 'a0000000-0000-0000-0000-000000000001', current_date, 9330.0, 9340.0, 10, '55555555-5555-5555-5555-555555555555'),
  ('e0000000-0000-0000-0000-000000000203', 'a0000000-0000-0000-0000-000000000002', current_date, 3267.5, 3275.0, 10, '66666666-6666-6666-6666-666666666666'),
  ('e0000000-0000-0000-0000-000000000061', 'a0000000-0000-0000-0000-000000000004', current_date, 5099.0, 5108.0, 10, '77777777-7777-7777-7777-777777777777');

-- =========================================================================
-- CHAMADOS DE MANUTENÇÃO (+ eventos via trigger)
-- =========================================================================

insert into public.chamados (numero, equipamento_id, obra_id, descricao, prioridade, status, aberto_por, created_at) values
  ('CH-3091', 'e0000000-0000-0000-0000-000000000142', 'a0000000-0000-0000-0000-000000000005', 'Superaquecimento do motor durante operação. Temperatura no vermelho após 2h.', 'alta', 'aberto', '55555555-5555-5555-5555-555555555555', now() - interval '3 hours'),
  ('CH-3090', 'e0000000-0000-0000-0000-000000000179', 'a0000000-0000-0000-0000-000000000004', 'Vazamento hidráulico no braço da retroescavadeira.', 'media', 'aberto', '66666666-6666-6666-6666-666666666666', now() - interval '5 hours'),
  ('CH-3088', 'e0000000-0000-0000-0000-000000000044', 'a0000000-0000-0000-0000-000000000005', 'Não dá partida — suspeita de falha elétrica.', 'alta', 'em_analise', '99999999-9999-9999-9999-999999999999', now() - interval '1 day'),
  ('CH-3085', 'e0000000-0000-0000-0000-000000000118', 'a0000000-0000-0000-0000-000000000001', 'Ruído anormal na transmissão.', 'media', 'equipe_deslocada', '33333333-3333-3333-3333-333333333333', now() - interval '1 day'),
  ('CH-3081', 'e0000000-0000-0000-0000-000000000231', 'a0000000-0000-0000-0000-000000000003', 'Troca de bomba d''água + revisão geral.', 'alta', 'em_manutencao', '88888888-8888-8888-8888-888888888888', now() - interval '2 days'),
  ('CH-3074', 'e0000000-0000-0000-0000-000000000203', 'a0000000-0000-0000-0000-000000000002', 'Substituição de filtros — preventiva.', 'baixa', 'concluido', '88888888-8888-8888-8888-888888888888', now() - interval '1 day'),
  ('CH-3012', 'e0000000-0000-0000-0000-000000000142', 'a0000000-0000-0000-0000-000000000002', 'Vazamento no sistema hidráulico.', 'media', 'concluido', '55555555-5555-5555-5555-555555555555', '2026-05-16');

-- Extra timeline detail for the "hero" ticket CH-3091 (beyond the auto-logged creation event)
insert into public.chamado_eventos (chamado_id, status, nota, actor_id, created_at)
select id, 'em_analise', 'Prioridade confirmada: Alta', '22222222-2222-2222-2222-222222222222', now() - interval '2 hours 30 minutes'
from public.chamados where numero = 'CH-3091';
insert into public.chamado_eventos (chamado_id, status, nota, actor_id, created_at)
select id, 'equipe_deslocada', 'Saída da oficina · ETA 1h10', '44444444-4444-4444-4444-444444444444', now() - interval '2 hours'
from public.chamados where numero = 'CH-3091';

-- =========================================================================
-- MANUTENÇÃO PREVENTIVA
-- =========================================================================

insert into public.planos_preventivos (id, servico, intervalo_horas) values
  ('b0000000-0000-0000-0000-000000000001', 'Troca de óleo do motor', 500),
  ('b0000000-0000-0000-0000-000000000002', 'Substituição de filtros', 250),
  ('b0000000-0000-0000-0000-000000000003', 'Lubrificação geral', 100),
  ('b0000000-0000-0000-0000-000000000004', 'Revisão sistema hidráulico', 1000);

-- Últimas execuções concluídas (definem a base para o cálculo de "próxima preventiva")
insert into public.ordens_servico (numero, equipamento_id, plano_id, tipo, descricao, status, horimetro_execucao, data_programada, data_conclusao) values
  ('OS-1150', 'e0000000-0000-0000-0000-000000000087', 'b0000000-0000-0000-0000-000000000002', 'preventiva', 'Substituição de filtros — 250h', 'concluida', 9100.0, '2026-06-01', '2026-06-01'),
  ('OS-1151', 'e0000000-0000-0000-0000-000000000118', 'b0000000-0000-0000-0000-000000000001', 'preventiva', 'Troca de óleo do motor — 500h', 'concluida', 5712.7, '2026-05-20', '2026-05-20'),
  ('OS-1152', 'e0000000-0000-0000-0000-000000000061', 'b0000000-0000-0000-0000-000000000004', 'preventiva', 'Revisão sistema hidráulico — 1000h', 'concluida', 4198.0, '2026-04-15', '2026-04-15'),
  ('OS-1153', 'e0000000-0000-0000-0000-000000000203', 'b0000000-0000-0000-0000-000000000003', 'preventiva', 'Lubrificação geral — 100h', 'concluida', 3205.0, '2026-06-10', '2026-06-10'),
  ('OS-1182', 'e0000000-0000-0000-0000-000000000142', 'b0000000-0000-0000-0000-000000000001', 'preventiva', 'Preventiva 500h — troca de óleo do motor', 'concluida', 4700.0, '2026-06-02', '2026-06-02'),
  ('OS-1209', 'e0000000-0000-0000-0000-000000000142', 'b0000000-0000-0000-0000-000000000001', 'preventiva', 'Próxima preventiva — troca de óleo do motor', 'programada', null, '2026-07-25', null);

insert into public.ordens_servico (numero, equipamento_id, chamado_id, tipo, descricao, status, data_conclusao)
select 'OS-3012', 'e0000000-0000-0000-0000-000000000142', id, 'corretiva', 'Correção do sistema hidráulico', 'concluida', '2026-05-18'
from public.chamados where numero = 'CH-3012';

-- =========================================================================
-- LOGÍSTICA: SOLICITAÇÕES & REMANEJAMENTO
-- =========================================================================

insert into public.solicitacoes (id, obra_id, solicitante_id, status, created_at) values
  ('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000003', '99999999-9999-9999-9999-999999999999', 'pendente', now() - interval '6 hours'),
  ('c0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000004', '55555555-5555-5555-5555-555555555555', 'em_analise', now() - interval '1 day');

insert into public.solicitacao_itens (solicitacao_id, tipo_equipamento, quantidade) values
  ('c0000000-0000-0000-0000-000000000001', 'Escavadeira Hidráulica', 1),
  ('c0000000-0000-0000-0000-000000000001', 'Caminhão Basculante', 1),
  ('c0000000-0000-0000-0000-000000000002', 'Rolo Compactador', 1);

insert into public.remanejamentos (numero, equipamento_id, obra_origem_id, obra_destino_id, solicitacao_id, status, created_at) values
  ('RM-218', 'e0000000-0000-0000-0000-000000000044', 'a0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000001', 'solicitado', now() - interval '2 days');

update public.remanejamentos set status = 'em_analise' where numero = 'RM-218';
update public.remanejamentos set status = 'aprovacao_diretoria' where numero = 'RM-218';
