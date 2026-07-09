import { requireModule } from "@/lib/auth";
import { getOciosidadeData } from "@/lib/queries/ociosidade";
import { PageHeader } from "@/components/shared/page-header";
import { MiniKpiCard } from "@/components/shared/kpi-card";
import { formatNumber } from "@/lib/format";

const IDLE_THRESHOLD_DAYS = 7;

export default async function OciosidadePage() {
  await requireModule("ociosidade");
  const { kpis, list, reasons } = await getOciosidadeData(IDLE_THRESHOLD_DAYS);

  return (
    <div>
      <PageHeader
        title="Detecção de Ociosidade"
        subtitle={`Alerta automático quando o equipamento fica sem movimentação além do limite configurado (${IDLE_THRESHOLD_DAYS} dias)`}
      />

      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MiniKpiCard label="Equipamentos ociosos" value={String(kpis.total)} sub="parados ou disponíveis" accent="#E8920C" />
        <MiniKpiCard
          label={`Acima de ${IDLE_THRESHOLD_DAYS} dias`}
          value={String(kpis.acimaLimite)}
          sub="alerta crítico"
          accent="#D14343"
        />
        <MiniKpiCard
          label="Horas paradas no mês"
          value={`${formatNumber(kpis.horasParadasMes, 0)} h`}
          sub="apontadas como ociosas"
          accent="#15181c"
        />
        <MiniKpiCard label="Dias parado (média)" value={String(kpis.mediaDias)} sub="entre os ociosos atuais" accent="#2F6FB0" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.5fr_1fr]">
        <div className="overflow-hidden rounded-[13px] border border-card-border bg-white">
          <div className="px-5 pt-[18px] text-sm font-bold">Equipamentos ociosos</div>
          <div className="grid grid-cols-[1fr_1.7fr_0.9fr_1.7fr_1.5fr] gap-3 px-5 py-[14px] pb-[11px] text-[11px] font-bold uppercase tracking-[.4px] text-text-muted-2">
            <span>Código</span>
            <span>Equipamento</span>
            <span>Dias</span>
            <span>Motivo</span>
            <span>Obra</span>
          </div>
          {list.map((o) => (
            <div
              key={o.equipamento_id}
              className="grid grid-cols-[1fr_1.7fr_0.9fr_1.7fr_1.5fr] items-center gap-3 border-t border-row-border px-5 py-[14px]"
            >
              <span className="font-mono text-[12.5px] font-semibold text-[#3a3f47]">{o.codigo_interno}</span>
              <span className="text-[13px]">{o.modelo}</span>
              <span
                className="inline-flex h-6 w-[34px] items-center justify-center rounded-[7px] font-mono text-[12.5px] font-bold text-white"
                style={{ background: o.color }}
              >
                {o.dias_parado}
              </span>
              <span className="text-[12.5px] text-text-soft">{o.motivoLabel}</span>
              <span className="text-[12.5px] text-text-muted-2">{o.obra_nome ?? "—"}</span>
            </div>
          ))}
          {list.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm text-text-muted-2">Nenhum equipamento ocioso no momento.</div>
          ) : null}
        </div>

        <div className="rounded-[13px] border border-card-border bg-white p-[18px]">
          <div className="mb-[3px] text-sm font-bold">Motivos da parada</div>
          <div className="mb-4 text-xs text-text-muted-2">Distribuição atual</div>
          <div className="flex flex-col gap-[13px]">
            {reasons.length === 0 ? (
              <p className="text-[12.5px] text-text-muted-2">Sem dados suficientes.</p>
            ) : (
              reasons.map((r) => (
                <div key={r.motivo}>
                  <div className="mb-[5px] flex justify-between text-[12.5px]">
                    <span className="text-text-soft">{r.motivo}</span>
                    <span className="font-mono font-bold">{r.pct}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-[5px] bg-[#efece6]">
                    <div className="h-full rounded-[5px]" style={{ width: `${r.pct}%`, background: r.color }} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
