import { createClient } from "@/lib/supabase/server";
import { CHAMADO_STATUS_DOT, CHAMADO_STATUS_LABEL } from "@/lib/status";
import { timeAgo } from "@/lib/format";
import type { ChamadoStatus } from "@/lib/supabase/database.types";

const KANBAN_ORDER: ChamadoStatus[] = [
  "aberto",
  "em_analise",
  "equipe_deslocada",
  "em_manutencao",
  "concluido",
];

export async function getKanbanData() {
  const supabase = await createClient();
  const [{ data: chamados }, { data: equipamentos }, { data: obras }, { data: profiles }] =
    await Promise.all([
      supabase.from("chamados").select("*").order("created_at", { ascending: false }),
      supabase.from("equipamentos").select("id, codigo_interno, tipo, modelo"),
      supabase.from("obras").select("id, nome"),
      supabase.from("profiles").select("id, full_name"),
    ]);

  const equipById = new Map((equipamentos ?? []).map((e) => [e.id, e]));
  const obraNome = new Map((obras ?? []).map((o) => [o.id, o.nome]));
  const profileNome = new Map((profiles ?? []).map((p) => [p.id, p.full_name]));

  const columns = KANBAN_ORDER.map((status) => {
    const items = (chamados ?? [])
      .filter((c) => c.status === status)
      .map((c) => {
        const eq = equipById.get(c.equipamento_id);
        const autor = c.aberto_por ? profileNome.get(c.aberto_por) : null;
        return {
          id: c.id,
          numero: c.numero,
          prioridade: c.prioridade,
          eq: eq ? `${eq.codigo_interno} · ${eq.tipo}` : "—",
          desc: c.descricao,
          avatar: autor
            ? autor.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()
            : "—",
          obraNome: c.obra_id ? obraNome.get(c.obra_id) ?? "—" : "—",
          age: timeAgo(c.created_at),
        };
      });
    return { status, label: CHAMADO_STATUS_LABEL[status], color: CHAMADO_STATUS_DOT[status], items };
  });

  return { columns, total: chamados?.length ?? 0 };
}

export async function getChamadoDetail(id: string) {
  const supabase = await createClient();
  const [{ data: chamado }, { data: eventos }] = await Promise.all([
    supabase.from("chamados").select("*").eq("id", id).single(),
    supabase.from("chamado_eventos").select("*").eq("chamado_id", id).order("created_at", { ascending: true }),
  ]);

  if (!chamado) return { chamado: null, eventos: [], equipamento: null, obraNome: null };

  const [{ data: equipamento }, { data: obra }, { data: profiles }] = await Promise.all([
    supabase.from("equipamentos").select("*").eq("id", chamado.equipamento_id).single(),
    chamado.obra_id
      ? supabase.from("obras").select("nome").eq("id", chamado.obra_id).single()
      : Promise.resolve({ data: null }),
    supabase.from("profiles").select("id, full_name"),
  ]);

  const profileNome = new Map((profiles ?? []).map((p) => [p.id, p.full_name]));

  return {
    chamado,
    equipamento,
    obraNome: obra?.nome ?? null,
    eventos: (eventos ?? []).map((e) => ({
      ...e,
      actorNome: e.actor_id ? profileNome.get(e.actor_id) ?? "Sistema" : "Sistema",
    })),
  };
}
