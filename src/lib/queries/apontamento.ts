import { createClient } from "@/lib/supabase/server";

export async function getApontamentoData(filterDate?: string) {
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
  const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().slice(0, 10);

  let listQuery = supabase.from("apontamentos_diarios").select("*").order("data", { ascending: false });
  listQuery = filterDate ? listQuery.eq("data", filterDate) : listQuery.gte("data", thirtyDaysAgoStr);

  const [{ data: lista }, { data: hoje }, { data: equipamentos }, { data: obras }, { data: profiles }] =
    await Promise.all([
      listQuery,
      supabase.from("apontamentos_diarios").select("equipamento_id").eq("data", today),
      supabase.from("equipamentos").select("id, codigo_interno, tipo, modelo, fabricante, status, obra_atual_id"),
      supabase.from("obras").select("id, nome"),
      supabase.from("profiles").select("id, full_name"),
    ]);

  const obraNome = new Map((obras ?? []).map((o) => [o.id, o.nome]));
  const profileNome = new Map((profiles ?? []).map((p) => [p.id, p.full_name]));

  const trabalhadas = (lista ?? []).reduce((s, a) => s + Number(a.horas_trabalhadas), 0);
  const ociosas = (lista ?? []).reduce((s, a) => s + Number(a.horas_ociosas), 0);
  const produtividade = trabalhadas + ociosas > 0 ? Math.round((trabalhadas / (trabalhadas + ociosas)) * 100) : 0;

  const apontadosHojeIds = new Set((hoje ?? []).map((a) => a.equipamento_id));
  const emOperacao = (equipamentos ?? []).filter((e) => e.status === "operando" || e.status === "em_deslocamento");
  const pendentesHoje = emOperacao.filter((e) => !apontadosHojeIds.has(e.id)).length;

  const entries = (lista ?? []).map((a) => {
    const eq = (equipamentos ?? []).find((e) => e.id === a.equipamento_id);
    return {
      ...a,
      codigo: eq?.codigo_interno ?? "—",
      modelo: eq ? `${eq.tipo} ${eq.fabricante}` : "—",
      obraNome: a.obra_id ? obraNome.get(a.obra_id) ?? "—" : "—",
      encarregadoNome: a.encarregado_id ? profileNome.get(a.encarregado_id) ?? "—" : "—",
    };
  });

  return {
    kpis: {
      trabalhadas,
      ociosas,
      pendentesHoje,
      produtividade,
      totalApontados: lista?.length ?? 0,
    },
    entries,
    equipamentos: equipamentos ?? [],
    isToday: !filterDate || filterDate === today,
    today,
  };
}

export async function getApontamentosByEquipamento(equipamentoId: string, limit = 10) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("apontamentos_diarios")
    .select("*")
    .eq("equipamento_id", equipamentoId)
    .order("data", { ascending: false })
    .limit(limit);

  const encarregadoIds = [...new Set((data ?? []).map((a) => a.encarregado_id).filter(Boolean))] as string[];
  const { data: profiles } = encarregadoIds.length
    ? await supabase.from("profiles").select("id, full_name").in("id", encarregadoIds)
    : { data: [] as { id: string; full_name: string }[] };
  const profileNome = new Map((profiles ?? []).map((p) => [p.id, p.full_name]));

  return (data ?? []).map((a) => ({
    ...a,
    encarregadoNome: a.encarregado_id ? profileNome.get(a.encarregado_id) ?? "—" : "—",
  }));
}
