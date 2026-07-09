import type { createClient } from "@/lib/supabase/server";
import { MOTIVO_PARADA_LABEL } from "@/lib/status";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

export interface RemanejoSuggestion {
  equipamentoId: string;
  codigo: string;
  tipo: string;
  modelo: string;
  diasParado: number;
  motivo: string;
  obraOrigemNome: string | null;
  obraOrigemId: string | null;
  obraDestinoId: string;
  obraDestinoNome: string;
  solicitacaoId: string;
  text: string;
}

// Módulo 8 (Logística): cruza equipamentos ociosos com solicitações
// pendentes do mesmo tipo — a "sugestão automática de remanejamento".
export async function findRemanejoSuggestions(
  supabase: SupabaseServerClient,
  limit = 5
): Promise<RemanejoSuggestion[]> {
  const [{ data: ociosos }, { data: solicitacoes }, { data: itens }, { data: obras }] =
    await Promise.all([
      supabase
        .from("v_ociosidade")
        .select("*")
        .not("motivo", "is", null)
        .order("dias_parado", { ascending: false }),
      supabase.from("solicitacoes").select("*").in("status", ["pendente", "em_analise"]),
      supabase.from("solicitacao_itens").select("*"),
      supabase.from("obras").select("id, nome"),
    ]);

  if (!ociosos || !solicitacoes || !itens || !obras) return [];

  const obraNome = new Map(obras.map((o) => [o.id, o.nome]));
  const itensBySolicitacao = new Map<string, typeof itens>();
  for (const item of itens) {
    const list = itensBySolicitacao.get(item.solicitacao_id) ?? [];
    list.push(item);
    itensBySolicitacao.set(item.solicitacao_id, list);
  }

  const usedEquip = new Set<string>();
  const suggestions: RemanejoSuggestion[] = [];

  for (const sol of solicitacoes) {
    for (const item of itensBySolicitacao.get(sol.id) ?? []) {
      const match = ociosos.find(
        (o) =>
          !usedEquip.has(o.equipamento_id) &&
          o.tipo === item.tipo_equipamento &&
          o.obra_atual_id !== sol.obra_id
      );
      if (!match) continue;
      usedEquip.add(match.equipamento_id);
      const destino = obraNome.get(sol.obra_id) ?? "obra solicitante";
      suggestions.push({
        equipamentoId: match.equipamento_id,
        codigo: match.codigo_interno,
        tipo: match.tipo,
        modelo: match.modelo,
        diasParado: match.dias_parado ?? 0,
        motivo: match.motivo ? MOTIVO_PARADA_LABEL[match.motivo] : "",
        obraOrigemNome: match.obra_nome,
        obraOrigemId: match.obra_atual_id,
        obraDestinoId: sol.obra_id,
        obraDestinoNome: destino,
        solicitacaoId: sol.id,
        text: `${match.tipo} parada há ${match.dias_parado} dia${match.dias_parado === 1 ? "" : "s"} em ${match.obra_nome ?? "obra de origem"} → solicitação pendente em ${destino}`,
      });
      if (suggestions.length >= limit) return suggestions;
      break;
    }
  }

  return suggestions;
}
