import { createClient } from "@/lib/supabase/server";
import { findRemanejoSuggestions } from "@/lib/queries/matching";
import { MOTIVO_PARADA_LABEL } from "@/lib/status";
import type { EquipamentoStatus } from "@/lib/supabase/database.types";

const MONTH_LABELS = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez",
];

export async function getDashboardData(idleThresholdDays: number) {
  const supabase = await createClient();

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  const sixMonthsAgoStr = sixMonthsAgo.toISOString().slice(0, 10);

  const [
    { data: equipamentos },
    { data: apontamentos },
    { data: ociosos },
    { data: preventivas },
    { data: chamadosAbertos },
    { data: solicitacoesPendentes },
    { data: solicitacaoItens },
    { data: obras },
  ] = await Promise.all([
    supabase.from("equipamentos").select("id, codigo_interno, tipo, status, obra_atual_id"),
    supabase
      .from("apontamentos_diarios")
      .select("data, horas_trabalhadas, horas_ociosas")
      .gte("data", sixMonthsAgoStr),
    supabase
      .from("v_ociosidade")
      .select("*")
      .not("motivo", "is", null)
      .order("dias_parado", { ascending: false }),
    supabase
      .from("v_preventivas_pendentes")
      .select("*")
      .gt("horimetro_ultima_execucao", 0)
      .order("horas_restantes", { ascending: true })
      .limit(1),
    supabase
      .from("chamados")
      .select("numero, descricao, prioridade, created_at, equipamento_id")
      .eq("status", "aberto")
      .order("created_at", { ascending: true })
      .limit(1),
    supabase
      .from("solicitacoes")
      .select("id, obra_id, created_at")
      .eq("status", "pendente")
      .order("created_at", { ascending: false })
      .limit(1),
    supabase.from("solicitacao_itens").select("solicitacao_id, tipo_equipamento, quantidade"),
    supabase.from("obras").select("id, nome, status"),
  ]);

  const equip = equipamentos ?? [];
  const total = equip.length;
  const countBy = (status: EquipamentoStatus) => equip.filter((e) => e.status === status).length;
  const operando = countBy("operando");
  const emManutencao = countBy("em_manutencao");
  const parado = countBy("parado");
  const disponivel = countBy("disponivel");
  const emDeslocamento = countBy("em_deslocamento");
  const tiposCount = new Set(equip.map((e) => e.tipo)).size;
  const obrasComEquip = new Set(equip.filter((e) => e.obra_atual_id).map((e) => e.obra_atual_id)).size;
  const utilizacaoPct = total ? Math.round((operando / total) * 100) : 0;

  const kpisFrota = [
    { label: "Total de equipamentos", value: String(total), sub: `${tiposCount} tipos · ${obrasComEquip} obras`, accent: "#15181c" },
    { label: "Operando", value: String(operando), sub: total ? `${Math.round((operando / total) * 100)}% da frota` : "—", accent: "#2E9E5B" },
    { label: "Ociosos / parados", value: String(parado + disponivel), sub: `${ociosos?.filter((o) => (o.dias_parado ?? 0) >= idleThresholdDays).length ?? 0} acima de ${idleThresholdDays} dias`, accent: "#D14343" },
    { label: "Em manutenção", value: String(emManutencao), sub: chamadosAbertos?.length ? "há chamados abertos" : "sem chamados abertos", accent: "#E8920C" },
  ];

  const fleetLegend = [
    { label: "Operando", value: operando, color: "#2E9E5B" },
    { label: "Em manutenção", value: emManutencao, color: "#E8920C" },
    { label: "Parado", value: parado, color: "#D14343" },
    { label: "Disponível", value: disponivel, color: "#2F6FB0" },
    { label: "Em deslocamento", value: emDeslocamento, color: "#7A5AC2" },
  ].filter((f) => f.value > 0);

  // donut conic-gradient stops
  let acc = 0;
  const donutStops = fleetLegend.map((f) => {
    const from = total ? (acc / total) * 100 : 0;
    acc += f.value;
    const to = total ? (acc / total) * 100 : 0;
    return `${f.color} ${from}% ${to}%`;
  });

  const monthBuckets = new Map<string, { work: number; idle: number; label: string }>();
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    monthBuckets.set(key, { work: 0, idle: 0, label: MONTH_LABELS[d.getMonth()] });
  }
  for (const a of apontamentos ?? []) {
    const key = a.data.slice(0, 7);
    const bucket = monthBuckets.get(key);
    if (bucket) {
      bucket.work += Number(a.horas_trabalhadas);
      bucket.idle += Number(a.horas_ociosas);
    }
  }
  const maxTot = Math.max(1, ...[...monthBuckets.values()].map((b) => b.work + b.idle));
  const utilBars = [...monthBuckets.values()].map((b) => ({
    m: b.label,
    workH: ((b.work / maxTot) * 140).toFixed(0) + "px",
    idleH: ((b.idle / maxTot) * 140).toFixed(0) + "px",
  }));

  const equipById = new Map(equip.map((e) => [e.id, e]));
  const obraById = new Map((obras ?? []).map((o) => [o.id, o]));
  const itensBySolicitacao = new Map<string, { tipo_equipamento: string; quantidade: number }[]>();
  for (const item of solicitacaoItens ?? []) {
    const list = itensBySolicitacao.get(item.solicitacao_id) ?? [];
    list.push(item);
    itensBySolicitacao.set(item.solicitacao_id, list);
  }

  const alerts: { color: string; title: string; meta: string }[] = [];
  const topOcioso = ociosos?.[0];
  if (topOcioso) {
    alerts.push({
      color: "#D14343",
      title: `${topOcioso.tipo} ${topOcioso.modelo} parada há ${topOcioso.dias_parado} dias`,
      meta: `${topOcioso.obra_nome ?? "sem obra"} · ${topOcioso.motivo ? MOTIVO_PARADA_LABEL[topOcioso.motivo] : ""}`,
    });
  }
  const topPreventiva = preventivas?.[0];
  if (topPreventiva && topPreventiva.horas_restantes < 50) {
    alerts.push({
      color: "#E8920C",
      title: `Preventiva ${topPreventiva.intervalo_horas}h vencendo — ${topPreventiva.servico}`,
      meta: `${topPreventiva.codigo_interno} · faltam ${topPreventiva.horas_restantes.toFixed(0)}h de operação`,
    });
  }
  const topSolicitacao = solicitacoesPendentes?.[0];
  if (topSolicitacao) {
    const obraNome = obraById.get(topSolicitacao.obra_id)?.nome ?? "Obra";
    const itens = itensBySolicitacao.get(topSolicitacao.id) ?? [];
    alerts.push({
      color: "#2F6FB0",
      title: `${obraNome} solicitou ${itens.length} tipo${itens.length === 1 ? "" : "s"} de equipamento`,
      meta: itens.map((i) => `${i.quantidade} ${i.tipo_equipamento}`).join(" + "),
    });
  }
  const topChamado = chamadosAbertos?.[0];
  if (topChamado && topChamado.prioridade === "alta") {
    const eq = equipById.get(topChamado.equipamento_id);
    const hoursAgo = Math.round((Date.now() - new Date(topChamado.created_at).getTime()) / 3_600_000);
    alerts.push({
      color: "#E8920C",
      title: "Chamado de alta prioridade sem resolução",
      meta: `${eq?.codigo_interno ?? ""} · ${topChamado.descricao.slice(0, 40)}… · ${hoursAgo}h em aberto`,
    });
  }

  const obraCounts = new Map<string, number>();
  for (const e of equip) {
    if (!e.obra_atual_id) continue;
    obraCounts.set(e.obra_atual_id, (obraCounts.get(e.obra_atual_id) ?? 0) + 1);
  }
  const pinLayout = [
    { left: "14%", top: "22%" },
    { left: "58%", top: "16%" },
    { left: "34%", top: "52%" },
    { left: "66%", top: "60%" },
    { left: "18%", top: "74%" },
    { left: "48%", top: "36%" },
  ];
  const mapPins = (obras ?? [])
    .map((o) => ({ nome: o.nome, count: obraCounts.get(o.id) ?? 0 }))
    .filter((o) => o.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 6)
    .map((o, i) => ({ label: o.nome, count: o.count, pos: pinLayout[i % pinLayout.length], color: "#2E9E5B" }));

  const remanejo = await findRemanejoSuggestions(supabase, 3);

  return {
    kpisFrota,
    fleetLegend,
    donutStops: donutStops.join(", "),
    utilizacaoPct,
    utilBars,
    alerts,
    mapPins,
    remanejo,
    obrasAtivas: (obras ?? []).filter((o) => o.status === "ativa").length,
  };
}
