# Pátio — Gestão de Frota

Sistema de gestão de equipamentos, manutenção e logística para terraplanagem.
Implementação em produção do protótipo de design `Pátio - Gestão de Frota.dc.html`
(ver `../chats` e `../README.md` para o contexto original do handoff).

Stack: Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 ·
Supabase (Postgres + Auth) · Server Actions.

## Módulos implementados

Dashboard Executivo, Obras, Equipamentos (com ficha/histórico), Apontamento
Diário, Chamados de Manutenção (kanban + timeline), Manutenção Preventiva,
Detecção de Ociosidade, Logística & Remanejamento (com sugestão automática
de match ocioso↔solicitação e fluxo de aprovação), IA & Automação (roadmap),
App de Campo (hub mobile). Login com 5 perfis (Diretor, Gestor de Frota,
Engenheiro, Mecânico, Encarregado), cada um com permissões de navegação e
de escrita (RLS) diferentes — ver `src/lib/roles.ts` e
`supabase/migrations/0002_rls.sql`.

## Rodando localmente

Requer [Docker](https://www.docker.com/) e a [Supabase CLI](https://supabase.com/docs/guides/cli).

```bash
npm install
npx supabase start      # sobe Postgres + Auth + a API REST locais
npx supabase db reset    # aplica supabase/migrations + supabase/seed.sql
```

`supabase start` imprime a `API URL` e a `anon key` locais. Copie
`.env.local.example` para `.env.local` e cole esses valores:

```bash
cp .env.local.example .env.local
# edite NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY
```

```bash
npm run dev
```

Abra http://localhost:3000 — você será redirecionado para `/login`.

### Contas de demonstração

O `seed.sql` cria 5 usuários demo (senha `demo12345` para todos), com os
mesmos nomes/perfis do protótipo original. A tela de login tem um botão de
entrada rápida para cada um:

| Perfil          | E-mail                    |
| --------------- | ------------------------- |
| Diretor         | ricardo.alves@patio.demo  |
| Gestor de Frota | fernanda.dias@patio.demo  |
| Engenheiro      | paulo.tavares@patio.demo  |
| Mecânico        | joao.silva@patio.demo     |
| Encarregado     | marcos.lima@patio.demo    |

### Conectando a um projeto Supabase real (produção)

1. Crie um projeto em [supabase.com](https://supabase.com).
2. `npx supabase link --project-ref <seu-projeto>`
3. `npx supabase db push` para aplicar as migrations (schema + RLS).
4. Rode `supabase/seed.sql` manualmente pelo SQL Editor do painel **apenas
   em ambiente de demonstração** — ele cria usuários com senha conhecida.
   Em produção real, crie os usuários pelo fluxo de convite/cadastro normal.
5. Preencha `.env.local` com a URL e a anon key do projeto (Project
   Settings → API).

## Notas de implementação

- **RLS por perfil**: toda tabela é legível por qualquer usuário autenticado
  (é um sistema interno de uma empresa); a escrita é restrita por papel
  conforme o módulo (ex.: apontamento diário só pode ser lançado por
  Encarregado/Gestor/Diretor; aprovação de remanejamento só por
  Gestor/Diretor). Ver `supabase/migrations/0002_rls.sql`.
- **Ociosidade** (`v_ociosidade`) e **preventivas pendentes**
  (`v_preventivas_pendentes`) são _views_ Postgres com `security_invoker`,
  calculadas a partir de `equipamento_paradas`, `apontamentos_diarios` e
  `ordens_servico` — não há job/cron; o cálculo é sempre em tempo real.
- **Sugestão de remanejamento**: `src/lib/queries/matching.ts` cruza
  equipamentos ociosos com itens de solicitações pendentes do mesmo tipo.
  Usada tanto no card do Dashboard quanto no módulo de Logística.
- **IA & Automação**: página informativa (arquitetura/roadmap), como no
  protótipo original — nenhuma chamada de modelo é feita hoje.
- Este projeto foi verificado com `next build`, `tsc --noEmit` e `eslint`
  (todos limpos), e a camada de dados (migrations + RLS + seed + as queries
  reais do app) foi testada de ponta a ponta contra um Postgres + PostgREST
  locais antes da entrega. Não foi possível clicar a UI num navegador dentro
  do ambiente de sandbox usado para gerar este projeto (sem acesso de rede
  para baixar as imagens Docker do Supabase) — vale um teste manual rápido
  do fluxo de login → módulos antes de considerar isso "pronto para uso".
