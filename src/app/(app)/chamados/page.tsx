import Link from "next/link";
import { requireModule } from "@/lib/auth";
import { getKanbanData } from "@/lib/queries/chamados";
import { PageHeader } from "@/components/shared/page-header";
import { Chip } from "@/components/shared/chip";
import { PRIORIDADE_CHIP, PRIORIDADE_LABEL } from "@/lib/status";

export default async function ChamadosPage() {
  await requireModule("chamados");
  const { columns, total } = await getKanbanData();
  const abertos = columns.find((c) => c.status === "aberto")?.items.length ?? 0;

  return (
    <div>
      <PageHeader
        title="Chamados de Manutenção"
        subtitle={`${abertos} abertos de ${total} · adeus WhatsApp · fluxo rastreado de ponta a ponta`}
        actions={
          <Link
            href="/chamados/novo"
            className="rounded-lg border-none bg-amber px-4 py-[9px] font-sans text-[13px] font-bold text-ink"
          >
            + Abrir chamado
          </Link>
        }
      />

      <div className="grid grid-cols-1 gap-[13px] sm:grid-cols-2 lg:grid-cols-5">
        {columns.map((col) => (
          <div key={col.status} className="flex min-h-[420px] flex-col gap-[11px] rounded-xl bg-[#efece6] p-3">
            <div className="flex items-center gap-2 px-1 py-0.5">
              <span className="h-[9px] w-[9px] rounded-full" style={{ background: col.color }} />
              <span className="text-[12.5px] font-bold">{col.label}</span>
              <span className="ml-auto rounded-md bg-white px-2 py-px text-[11.5px] font-bold text-text-muted-2">
                {col.items.length}
              </span>
            </div>
            {col.items.map((c) => (
              <Link
                key={c.id}
                href={`/chamados/${c.id}`}
                className="rounded-[10px] border border-card-border bg-white p-3 hover:border-ink"
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-mono text-[11px] font-semibold text-text-muted-2">{c.numero}</span>
                  <Chip label={PRIORIDADE_LABEL[c.prioridade]} tone={PRIORIDADE_CHIP[c.prioridade]} />
                </div>
                <div className="text-[13px] font-semibold leading-snug">{c.eq}</div>
                <div className="mt-[5px] line-clamp-2 text-xs leading-snug text-[#7a7f87]">{c.desc}</div>
                <div className="mt-[11px] flex items-center gap-[7px] border-t border-row-border pt-[10px]">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#e6e2da] text-[9px] font-bold text-text-muted">
                    {c.avatar}
                  </span>
                  <span className="text-[11px] text-ink-muted-2">{c.obraNome}</span>
                  <span className="ml-auto text-[11px] text-ink-muted-2">{c.age}</span>
                </div>
              </Link>
            ))}
            {col.items.length === 0 ? (
              <p className="px-1 text-[11.5px] text-text-muted-2">Sem chamados.</p>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
