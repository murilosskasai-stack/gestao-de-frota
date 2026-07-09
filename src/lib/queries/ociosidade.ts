import { createClient } from "@/lib/supabase/server";
import { MOTIVO_PARADA_LABEL } from "@/lib/status";
import { IDLE_DIAS_COLOR } from "@/lib/status";
import type { MotivoParada } from "@/lib/supabase/database.types";

const REASON_COLORS: Record<MotivoParada, string> = {
  sem_frente_servico: "#D14343",
  aguardando_transporte: "#E8920C",
  falta_operador: "#E8920C",
  reserva_operacional: "#2F6FB0",
  em_manutencao: "#7A5AC2",
  outros: "#9aa0a8",
};

export async function getOciosidadeData(idleThresholdDays: number) {
  const supabase = await createClient();
  const monthStart = new Date();
  monthStart.setDate(1);
  const monthStartStr = monthStart.toISOString().slice(0, 10);

  const [{ data: ociosos }, { data: apontamentosMes }] = await Promise.all([
    supabase.from("v_ociosidade").select("*").not("motivo", "is", null).order("dias_parado", { ascending: false }),
    supabase.from("apontamentos_diarios").select("horas_ociosas").gte("data", monthStartStr),
  ]);

  const list = (ociosos ?? []).map((o) => ({
    ...o,
    motivoLabel: o.motivo ? MOTIVO_PARADA_LABEL[o.motivo] : "—",
    color: IDLE_DIAS_COLOR(o.dias_parado ?? 0, idleThresholdDays),
  }));

  const acimaLimite = list.filter((o) => (o.dias_parado ?? 0) >= idleThresholdDays).length;
  const horasParadasMes = (apontamentosMes ?? []).reduce((s, a) => s + Number(a.horas_ociosas), 0);
  const mediaDias = list.length
    ? Math.round(list.reduce((s, o) => s + (o.dias_parado ?? 0), 0) / list.length)
    : 0;

  const reasonCounts = new Map<MotivoParada, number>();
  for (const o of list) {
    if (!o.motivo) continue;
    reasonCounts.set(o.motivo, (reasonCounts.get(o.motivo) ?? 0) + 1);
  }
  const totalReasons = list.length;
  const reasons = [...reasonCounts.entries()]
    .map(([motivo, count]) => ({
      motivo: MOTIVO_PARADA_LABEL[motivo],
      pct: totalReasons ? Math.round((count / totalReasons) * 100) : 0,
      color: REASON_COLORS[motivo],
    }))
    .sort((a, b) => b.pct - a.pct);

  return {
    kpis: {
      total: list.length,
      acimaLimite,
      horasParadasMes,
      mediaDias,
    },
    list,
    reasons,
  };
}
