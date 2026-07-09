import Link from "next/link";
import { requireModule } from "@/lib/auth";
import { getDashboardData } from "@/lib/queries/dashboard";
import { PageHeader } from "@/components/shared/page-header";
import { KpiCard } from "@/components/shared/kpi-card";

const IDLE_THRESHOLD_DAYS = 7;

export default async function DashboardPage() {
  await requireModule("dashboard");
  const data = await getDashboardData(IDLE_THRESHOLD_DAYS);

  return (
    <div>
      <PageHeader
        title="Dashboard Executivo"
        subtitle={`Visão consolidada da frota · ${data.obrasAtivas} obras ativas`}
        actions={
          <button className="rounded-lg border border-input-border bg-white px-[15px] py-[9px] font-sans text-[13px] font-semibold text-[#3a3f47]">
            Exportar relatório
          </button>
        }
      />

      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {data.kpisFrota.map((k) => (
          <KpiCard key={k.label} label={k.label} value={k.value} sub={k.sub} accent={k.accent} />
        ))}
      </div>

      <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-[1.1fr_1.4fr_1fr]">
        {/* Donut */}
        <div className="rounded-[13px] border border-card-border bg-white p-[18px]">
          <div className="mb-[2px] text-sm font-bold">Status da frota</div>
          <div className="mb-4 text-xs text-text-muted-2">
            {data.kpisFrota[0].value} equipamentos
          </div>
          <div className="flex items-center gap-[18px]">
            <div
              className="flex h-32 w-32 flex-none items-center justify-center rounded-full"
              style={{ background: `conic-gradient(${data.donutStops})` }}
            >
              <div className="flex h-20 w-20 flex-col items-center justify-center rounded-full bg-white">
                <span className="font-display text-2xl font-extrabold leading-none">
                  {data.utilizacaoPct}%
                </span>
                <span className="text-[10px] text-text-muted-2">utilização</span>
              </div>
            </div>
            <div className="flex flex-1 flex-col gap-[10px]">
              {data.fleetLegend.map((f) => (
                <div key={f.label} className="flex items-center gap-[9px] text-[12.5px]">
                  <span
                    className="h-[10px] w-[10px] flex-none rounded-[3px]"
                    style={{ background: f.color }}
                  />
                  <span className="flex-1 text-text-soft">{f.label}</span>
                  <span className="font-mono font-bold">{f.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bars */}
        <div className="rounded-[13px] border border-card-border bg-white p-[18px]">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-sm font-bold">Horas trabalhadas × paradas</div>
              <div className="mt-0.5 text-xs text-text-muted-2">Últimos 6 meses</div>
            </div>
            <div className="flex gap-[14px] text-[11.5px] text-text-muted">
              <span className="flex items-center gap-1.5">
                <span className="h-[9px] w-[9px] rounded-[2px]" style={{ background: "#2E9E5B" }} />
                Trabalhadas
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-[9px] w-[9px] rounded-[2px]" style={{ background: "#e3ddd2" }} />
                Paradas
              </span>
            </div>
          </div>
          <div className="mt-5 flex h-[150px] items-end gap-[14px] px-1">
            {data.utilBars.map((b) => (
              <div
                key={b.m}
                className="flex h-full flex-1 flex-col items-center justify-end gap-2"
              >
                <div className="flex h-full w-full max-w-[34px] flex-col justify-end gap-[3px]">
                  <div className="rounded-t-[3px]" style={{ background: "#e3ddd2", height: b.idleH }} />
                  <div className="rounded-[3px]" style={{ background: "#2E9E5B", height: b.workH }} />
                </div>
                <span className="text-[11px] font-semibold text-text-muted-2">{b.m}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Alerts */}
        <div className="flex flex-col rounded-[13px] border border-card-border bg-white p-[18px]">
          <div className="mb-[14px] flex items-center justify-between">
            <div className="text-sm font-bold">Alertas & oportunidades</div>
            <span className="rounded-md bg-amber-bg px-2 py-0.5 text-[11px] font-bold text-amber-fg">
              {data.alerts.length} ativos
            </span>
          </div>
          <div className="flex flex-col gap-[11px]">
            {data.alerts.length === 0 ? (
              <p className="text-[12.5px] text-text-muted-2">Nenhum alerta no momento.</p>
            ) : (
              data.alerts.map((a, i) => (
                <div key={i} className="flex items-start gap-[11px]">
                  <span
                    className="mt-[5px] h-2 w-2 flex-none rounded-full"
                    style={{ background: a.color }}
                  />
                  <div className="min-w-0">
                    <div className="text-[12.5px] font-semibold leading-snug">{a.title}</div>
                    <div className="mt-0.5 text-[11.5px] text-text-muted-2">{a.meta}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.5fr_1fr]">
        <div className="rounded-[13px] border border-card-border bg-white p-[18px]">
          <div className="mb-[14px] flex items-center justify-between">
            <div className="text-sm font-bold">Distribuição por obra</div>
            <span className="text-xs text-text-muted-2">Equipamentos alocados</span>
          </div>
          <div
            className="relative h-[230px] overflow-hidden rounded-[10px] border border-dashed"
            style={{
              borderColor: "#d4cfc6",
              background:
                "repeating-linear-gradient(135deg,#f0ede7,#f0ede7 9px,#ebe7e0 9px,#ebe7e0 18px)",
            }}
          >
            {data.mapPins.map((p) => (
              <div key={p.label} className="absolute" style={{ left: p.pos.left, top: p.pos.top }}>
                <div className="flex items-center gap-1.5 whitespace-nowrap rounded-lg bg-ink px-[9px] py-[5px] text-white shadow-lg">
                  <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
                  <span className="text-[11.5px] font-semibold">{p.label}</span>
                  <span className="font-mono text-[11px] text-ink-muted-2">{p.count}</span>
                </div>
              </div>
            ))}
            <span className="absolute bottom-[10px] left-3 rounded-md bg-white/70 px-[7px] py-[3px] font-mono text-[10.5px] text-[#9a958c]">
              mapa-interativo · placeholder
            </span>
          </div>
        </div>

        <div className="flex flex-col rounded-[13px] border border-ink bg-ink p-[18px] text-white">
          <div className="mb-[3px] text-sm font-bold">Oportunidades de remanejamento</div>
          <div className="mb-4 text-xs text-ink-muted">Sugestões automáticas do sistema</div>
          <div className="flex flex-1 flex-col gap-[13px]">
            {data.remanejo.length === 0 ? (
              <p className="text-[12.5px] text-ink-muted">Nenhuma sugestão no momento.</p>
            ) : (
              data.remanejo.map((r) => (
                <div key={r.equipamentoId} className="rounded-[10px] border border-ink-border bg-ink-3 p-[13px]">
                  <div className="text-[13px] font-semibold leading-snug">{r.text}</div>
                  <div className="mt-[11px] flex gap-2">
                    <Link
                      href="/logistica"
                      className="flex-1 rounded-[7px] bg-amber py-[7px] text-center text-xs font-bold text-ink"
                    >
                      Analisar
                    </Link>
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
