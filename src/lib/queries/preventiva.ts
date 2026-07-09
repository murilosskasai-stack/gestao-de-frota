import { createClient } from "@/lib/supabase/server";

export async function getPreventivaData() {
  const supabase = await createClient();
  const monthStart = new Date();
  monthStart.setDate(1);
  const monthStartStr = monthStart.toISOString().slice(0, 10);

  const [{ data: planos }, { data: osDoMes }, { data: upcoming }, { data: concluidas }, { data: equipamentos }] =
    await Promise.all([
      supabase.from("planos_preventivos").select("*").order("intervalo_horas"),
      supabase
        .from("ordens_servico")
        .select("id")
        .eq("tipo", "preventiva")
        .gte("created_at", monthStartStr),
      supabase
        .from("v_preventivas_pendentes")
        .select("*")
        .gt("horimetro_ultima_execucao", 0)
        .order("horas_restantes", { ascending: true })
        .limit(4),
      supabase
        .from("ordens_servico")
        .select("data_programada, data_conclusao")
        .eq("tipo", "preventiva")
        .eq("status", "concluida"),
      supabase.from("equipamentos").select("id, tipo"),
    ]);

  const noPrazo = (concluidas ?? []).filter(
    (o) => !o.data_programada || !o.data_conclusao || o.data_conclusao <= o.data_programada
  ).length;
  const aderencia = concluidas?.length ? Math.round((noPrazo / concluidas.length) * 100) : null;

  const pendentesCount = (upcoming ?? []).filter((u) => u.horas_restantes < 100).length;

  const planosComAlvo = (planos ?? []).map((p) => ({
    ...p,
    alvo: p.tipo_equipamento
      ? (equipamentos ?? []).filter((e) => e.tipo === p.tipo_equipamento).length
      : (equipamentos ?? []).length,
  }));

  const upcomingWithBar = (upcoming ?? []).map((u) => {
    const pct = Math.max(0, Math.min(100, (u.horimetro_ultima_execucao / u.horimetro_alvo) * 100));
    const color = u.horas_restantes <= 15 ? "#D14343" : u.horas_restantes <= 40 ? "#E8920C" : "#2E9E5B";
    return { ...u, pct: pct.toFixed(0), color };
  });

  return {
    kpis: {
      planosAtivos: planos?.length ?? 0,
      osNoMes: osDoMes?.length ?? 0,
      pendentes: pendentesCount,
      aderencia,
    },
    upcoming: upcomingWithBar,
    planos: planosComAlvo,
  };
}
