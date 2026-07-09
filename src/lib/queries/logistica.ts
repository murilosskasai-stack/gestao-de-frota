import { createClient } from "@/lib/supabase/server";
import { findRemanejoSuggestions } from "@/lib/queries/matching";
import { REMANEJAMENTO_STAGES } from "@/lib/status";
import { timeAgo } from "@/lib/format";

export async function getLogisticaData() {
  const supabase = await createClient();

  const [
    { data: solicitacoes },
    { data: itens },
    { data: obras },
    { data: profiles },
    { data: remanejamentos },
    { data: equipamentos },
  ] = await Promise.all([
    supabase.from("solicitacoes").select("*").in("status", ["pendente", "em_analise"]).order("created_at", { ascending: false }),
    supabase.from("solicitacao_itens").select("*"),
    supabase.from("obras").select("id, nome"),
    supabase.from("profiles").select("id, full_name"),
    supabase
      .from("remanejamentos")
      .select("*")
      .neq("status", "recebido")
      .order("created_at", { ascending: false })
      .limit(1),
    supabase.from("equipamentos").select("id, codigo_interno, tipo, modelo"),
  ]);

  const obraNome = new Map((obras ?? []).map((o) => [o.id, o.nome]));
  const profileNome = new Map((profiles ?? []).map((p) => [p.id, p.full_name]));
  const itensBySolicitacao = new Map<string, { tipo_equipamento: string; quantidade: number }[]>();
  for (const item of itens ?? []) {
    const list = itensBySolicitacao.get(item.solicitacao_id) ?? [];
    list.push(item);
    itensBySolicitacao.set(item.solicitacao_id, list);
  }

  const suggestions = await findRemanejoSuggestions(supabase, 20);
  const suggestionsBySolicitacao = new Map<string, (typeof suggestions)[number]>();
  for (const s of suggestions) {
    if (!suggestionsBySolicitacao.has(s.solicitacaoId)) suggestionsBySolicitacao.set(s.solicitacaoId, s);
  }

  const solicitacoesView = (solicitacoes ?? []).map((s) => ({
    ...s,
    obraNome: obraNome.get(s.obra_id) ?? "—",
    solicitanteNome: s.solicitante_id ? profileNome.get(s.solicitante_id) ?? "—" : "—",
    itens: itensBySolicitacao.get(s.id) ?? [],
    match: suggestionsBySolicitacao.get(s.id) ?? null,
    ageLabel: timeAgo(s.created_at),
  }));

  const equipById = new Map((equipamentos ?? []).map((e) => [e.id, e]));
  const activeRem = remanejamentos?.[0]
    ? {
        ...remanejamentos[0],
        equipamento: equipById.get(remanejamentos[0].equipamento_id) ?? null,
        obraDestinoNome: obraNome.get(remanejamentos[0].obra_destino_id) ?? "—",
        obraOrigemNome: remanejamentos[0].obra_origem_id ? obraNome.get(remanejamentos[0].obra_origem_id) ?? "—" : "—",
      }
    : null;

  return {
    solicitacoes: solicitacoesView,
    activeRem,
    stages: REMANEJAMENTO_STAGES,
  };
}
