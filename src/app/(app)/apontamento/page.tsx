import Link from "next/link";
import { requireModule } from "@/lib/auth";
import { getApontamentoData } from "@/lib/queries/apontamento";
import { PageHeader } from "@/components/shared/page-header";
import { MiniKpiCard } from "@/components/shared/kpi-card";
import { TableShell, TableHead, TableRow } from "@/components/shared/data-table";
import { formatNumber } from "@/lib/format";

const COLUMNS = "1fr 1.8fr 1fr 1fr 0.9fr 0.9fr 1.4fr 1fr";

export default async function ApontamentoPage() {
  await requireModule("apont");
  const { kpis, entries } = await getApontamentoData();

  const hoje = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <div>
      <PageHeader
        title="Apontamento Diário"
        subtitle={`${hoje.charAt(0).toUpperCase()}${hoje.slice(1)} · horas trabalhadas e ociosas calculadas automaticamente`}
        actions={
          <Link
            href="/apontamento/novo"
            className="rounded-lg border-none bg-amber px-4 py-[9px] font-sans text-[13px] font-bold text-ink"
          >
            + Lançar apontamento
          </Link>
        }
      />

      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MiniKpiCard
          label="Horas trabalhadas hoje"
          value={`${formatNumber(kpis.trabalhadas, 1)} h`}
          sub={`${kpis.totalApontados} equip. apontados`}
          accent="#2E9E5B"
        />
        <MiniKpiCard
          label="Horas ociosas hoje"
          value={`${formatNumber(kpis.ociosas, 1)} h`}
          sub={
            kpis.trabalhadas + kpis.ociosas > 0
              ? `${Math.round((kpis.ociosas / (kpis.trabalhadas + kpis.ociosas)) * 100)}% do tempo disponível`
              : "—"
          }
          accent="#E8920C"
        />
        <MiniKpiCard
          label="Apontamentos pendentes"
          value={String(kpis.pendentes)}
          sub="aguardando encarregado"
          accent="#D14343"
        />
        <MiniKpiCard label="Produtividade média" value={`${kpis.produtividade}%`} sub="trabalhadas ÷ tempo total" accent="#15181c" />
      </div>

      <TableShell>
        <TableHead
          columns={COLUMNS}
          labels={["Código", "Equipamento", "Horím. inicial", "Horím. final", "Trabalhadas", "Ociosas", "Obra", "Encarregado"]}
        />
        {entries.map((a) => (
          <TableRow columns={COLUMNS} key={a.id}>
            <span className="font-mono text-[12.5px] font-semibold text-[#3a3f47]">{a.codigo}</span>
            <span className="text-[13px]">{a.modelo}</span>
            <span className="font-mono text-[12.5px] text-text-muted">{formatNumber(a.horimetro_inicial, 1)}</span>
            <span className="font-mono text-[12.5px] text-text-muted">{formatNumber(a.horimetro_final, 1)}</span>
            <span className="font-mono text-[13px] font-bold text-green-fg">{formatNumber(a.horas_trabalhadas, 1)} h</span>
            <span className="font-mono text-[13px] font-bold text-amber-fg">{formatNumber(a.horas_ociosas, 1)} h</span>
            <span className="text-[12.5px] text-text-soft">{a.obraNome}</span>
            <span className="text-[12.5px] text-text-soft">{a.encarregadoNome}</span>
          </TableRow>
        ))}
        {entries.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-text-muted-2">
            Nenhum apontamento lançado hoje.
          </div>
        ) : null}
      </TableShell>
    </div>
  );
}
