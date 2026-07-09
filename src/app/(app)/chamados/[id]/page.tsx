import { notFound } from "next/navigation";
import { requireModule } from "@/lib/auth";
import { getChamadoDetail } from "@/lib/queries/chamados";
import { advanceChamadoStatus } from "@/lib/actions/chamados";
import { BackLink } from "@/components/shared/page-header";
import { Chip } from "@/components/shared/chip";
import { CHAMADO_STATUS_LABEL, PRIORIDADE_CHIP, PRIORIDADE_LABEL } from "@/lib/status";
import { formatDateTimeShort, timeAgo } from "@/lib/format";
import type { ChamadoStatus } from "@/lib/supabase/database.types";

const STATUS_FLOW: ChamadoStatus[] = [
  "aberto",
  "em_analise",
  "equipe_deslocada",
  "em_manutencao",
  "concluido",
];

export default async function ChamadoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireModule("chamados");
  const { id } = await params;
  const { chamado, equipamento, obraNome, eventos } = await getChamadoDetail(id);
  if (!chamado) notFound();

  const idx = STATUS_FLOW.indexOf(chamado.status);
  const isFinal = idx === STATUS_FLOW.length - 1;
  const advance = advanceChamadoStatus.bind(null, chamado.id, chamado.status);

  return (
    <div>
      <BackLink href="/chamados" label="Chamados" />

      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="rounded-lg bg-[#ece9e3] px-[10px] py-[3px] font-mono text-sm font-semibold text-text-muted">
              {chamado.numero}
            </span>
            <Chip label={PRIORIDADE_LABEL[chamado.prioridade]} tone={PRIORIDADE_CHIP[chamado.prioridade]} />
          </div>
          <h1 className="mb-[3px] mt-[11px] font-display text-2xl font-extrabold tracking-[-0.3px]">
            {equipamento ? `${equipamento.codigo_interno} · ${equipamento.tipo}` : "—"}
          </h1>
          <p className="text-sm text-text-muted">
            {obraNome ?? "Sem obra"} · aberto há {timeAgo(chamado.created_at)}
          </p>
        </div>
        {!isFinal ? (
          <form action={advance}>
            <button
              type="submit"
              className="rounded-lg border-none bg-ink px-[15px] py-[9px] font-sans text-[13px] font-semibold text-white"
            >
              Avançar para &ldquo;{CHAMADO_STATUS_LABEL[STATUS_FLOW[idx + 1]]}&rdquo;
            </button>
          </form>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1.2fr]">
        <div className="rounded-[13px] border border-card-border bg-white p-[18px]">
          <div className="mb-[11px] text-sm font-bold">Descrição relatada</div>
          <p className="mb-4 text-[13.5px] leading-relaxed text-text-soft">{chamado.descricao}</p>
        </div>

        <div className="rounded-[13px] border border-card-border bg-white p-[18px]">
          <div className="mb-4 text-sm font-bold">Linha do tempo da ocorrência</div>
          <div className="flex flex-col">
            {eventos.map((ev, i) => (
              <div key={ev.id} className="flex gap-[13px]">
                <div className="flex flex-none flex-col items-center">
                  <span className="flex h-[26px] w-[26px] items-center justify-center rounded-full bg-green text-xs font-bold text-white">
                    ✓
                  </span>
                  {i < eventos.length - 1 ? (
                    <span className="min-h-[20px] w-[2px] flex-1 bg-card-border-2" />
                  ) : null}
                </div>
                <div className="pb-4">
                  <div className="flex items-baseline gap-[10px]">
                    <span className="text-sm font-bold">{CHAMADO_STATUS_LABEL[ev.status]}</span>
                    <span className="font-mono text-[11.5px] text-text-faint">
                      {formatDateTimeShort(ev.created_at)}
                    </span>
                  </div>
                  <div className="mt-0.5 text-[12.5px] text-text-muted-2">
                    {ev.nota ?? "—"} · {ev.actorNome}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
