import { createClient } from "@/lib/supabase/server";

export async function getApontamentoData() {
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);

  const [{ data: hoje }, { data: equipamentos }, { data: obras }, { data: profiles }] =
    await Promise.all([
      supabase.from("apontamentos_diarios").select("*").eq("data", today),
      supabase.from("equipamentos").select("id, codigo_interno, tipo, modelo, fabricante, status, obra_atual_id"),
      supabase.from("obras").select("id, nome"),
      supabase.from("profiles").select("id, full_name"),
    ]);

  const obraNome = new Map((obras ?? []).map((o) => [o.id, o.nome]));
  const profileNome = new Map((profiles ?? []).map((p) => [p.id, p.full_name]));

  const trabalhadas = (hoje ?? []).reduce((s, a) => s + Number(a.horas_trabalhadas), 0);
  const ociosas = (hoje ?? []).reduce((s, a) => s + Number(a.horas_ociosas), 0);
  const produtividade = trabalhadas + ociosas > 0 ? Math.round((trabalhadas / (trabalhadas + ociosas)) * 100) : 0;

  const apontadosHojeIds = new Set((hoje ?? []).map((a) => a.equipamento_id));
  const emOperacao = (equipamentos ?? []).filter((e) => e.status === "operando" || e.status === "em_deslocamento");
  const pendentes = emOperacao.filter((e) => !apontadosHojeIds.has(e.id)).length;

  const entries = (hoje ?? [])
    .sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
    .map((a) => {
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
      pendentes,
      produtividade,
      totalApontados: hoje?.length ?? 0,
    },
    entries,
    equipamentos: equipamentos ?? [],
  };
}
