import Link from "next/link";
import { requireModule } from "@/lib/auth";
import { getPreventivaData } from "@/lib/queries/preventiva";
import { PageHeader } from "@/components/shared/page-header";
import { MiniKpiCard } from "@/components/shared/kpi-card";
import { formatNumber } from "@/lib/format";

export default async function PreventivaPage() {
  await requireModule("preventiva");
  const { kpis, upcoming, planos } = await getPreventivaData();

  return (
    <div>
      <PageHeader
        title="Manutenção Preventiva"
        subtitle="Planos por horímetro · alertas antecipados · OS geradas automaticamente"
        actions={
          <Link
            href="/preventiva/novo"
            className="rounded-lg bg-ink px-4 py-[9px] font-sans text-[13px] font-semibold text-white"
          >
            + Novo plano
          </Link>
        }
      />

      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MiniKpiCard label="Planos ativos" value={String(kpis.planosAtivos)} sub="por horímetro e calendário" accent="#15181c" />
        <MiniKpiCard label="OS geradas no mês" value={String(kpis.osNoMes)} sub="automáticas pelo sistema" accent="#2F6FB0" />
        <MiniKpiCard label="Preventivas pendentes" value={String(kpis.pendentes)} sub="vencendo em breve" accent="#E8920C" />
        <MiniKpiCard
          label="Aderência ao plano"
          value={kpis.aderencia !== null ? `${kpis.aderencia}%` : "—"}
          sub="realizadas no prazo"
          accent="#2E9E5B"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.15fr_1fr]">
        <div className="rounded-[13px] border border-card-border bg-white p-[18px]">
          <div className="mb-[14px] text-sm font-bold">Próximas manutenções (alerta antecipado)</div>
          <div className="flex flex-col gap-[15px]">
            {upcoming.length === 0 ? (
              <p className="text-[12.5px] text-text-muted-2">Nenhuma preventiva com histórico registrado ainda.</p>
            ) : (
              upcoming.map((u) => (
                <div key={`${u.equipamento_id}-${u.plano_id}`}>
                  <div className="mb-[7px] flex items-center justify-between">
                    <div className="flex items-center gap-[9px]">
                      <span className="font-mono text-xs font-bold text-[#3a3f47]">{u.codigo_interno}</span>
                      <span className="text-[13px] text-text-soft">{u.servico}</span>
                    </div>
                    <span className="text-xs font-bold" style={{ color: u.color }}>
                      faltam {formatNumber(Math.max(u.horas_restantes, 0), 0)}h
                    </span>
                  </div>
                  <div className="flex items-center gap-[10px]">
                    <div className="h-2 flex-1 overflow-hidden rounded-[5px] bg-[#efece6]">
                      <div className="h-full rounded-[5px]" style={{ width: `${u.pct}%`, background: u.color }} />
                    </div>
                    <span className="w-[90px] text-right font-mono text-[11.5px] text-text-muted-2">
                      {formatNumber(u.horimetro_ultima_execucao, 0)} / {formatNumber(u.horimetro_alvo, 0)} h
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="overflow-hidden rounded-[13px] border border-card-border bg-white">
          <div className="px-[18px] pt-[18px] text-sm font-bold">Planos cadastrados</div>
          <div className="grid grid-cols-[2fr_1fr_1fr] gap-[10px] px-[18px] py-[14px] pb-[11px] text-[11px] font-bold uppercase tracking-[.4px] text-text-muted-2">
            <span>Serviço</span>
            <span>Intervalo</span>
            <span>Alvo</span>
          </div>
          {planos.map((p) => (
            <div
              key={p.id}
              className="grid grid-cols-[2fr_1fr_1fr] items-center gap-[10px] border-t border-row-border px-[18px] py-3"
            >
              <span className="text-[13px] font-semibold">{p.servico}</span>
              <span className="font-mono text-[12.5px] text-text-soft">{formatNumber(p.intervalo_horas, 0)} h</span>
              <span className="text-[12.5px] text-text-muted-2">{p.alvo} equip.</span>
            </div>
          ))}
          {planos.length === 0 ? (
            <div className="px-[18px] py-8 text-center text-sm text-text-muted-2">Nenhum plano cadastrado.</div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
