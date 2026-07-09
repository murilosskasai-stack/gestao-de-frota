import Link from "next/link";
import { requireModule } from "@/lib/auth";
import { getLogisticaData } from "@/lib/queries/logistica";
import { createRemanejamento, advanceRemanejamento } from "@/lib/actions/logistica";
import { PageHeader } from "@/components/shared/page-header";
import { Chip } from "@/components/shared/chip";
import { SOLICITACAO_STATUS_CHIP, SOLICITACAO_STATUS_LABEL, REMANEJAMENTO_STATUS_LABEL } from "@/lib/status";

export default async function LogisticaPage() {
  await requireModule("logistica");
  const { solicitacoes, activeRem, stages } = await getLogisticaData();

  const currentIdx = activeRem ? stages.indexOf(activeRem.status) : -1;
  const isFinal = activeRem ? currentIdx === stages.length - 1 : true;
  const advance = activeRem ? advanceRemanejamento.bind(null, activeRem.id, activeRem.status) : null;

  return (
    <div>
      <PageHeader
        title="Solicitações & Remanejamento"
        subtitle="Obras solicitam equipamentos · o sistema sugere remanejamentos a partir da ociosidade"
        actions={
          <Link
            href="/logistica/novo"
            className="rounded-lg border-none bg-amber px-4 py-[9px] font-sans text-[13px] font-bold text-ink"
          >
            + Nova solicitação
          </Link>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="flex flex-col gap-[14px]">
          {solicitacoes.length === 0 ? (
            <div className="rounded-[13px] border border-card-border bg-white p-[18px] text-sm text-text-muted-2">
              Nenhuma solicitação pendente.
            </div>
          ) : (
            solicitacoes.map((s) => (
              <div key={s.id} className="rounded-[13px] border border-card-border bg-white p-[18px]">
                <div className="mb-[13px] flex items-start justify-between">
                  <div>
                    <div className="text-[15px] font-bold">{s.obraNome}</div>
                    <div className="mt-0.5 text-xs text-text-muted-2">
                      {s.solicitanteNome} · há {s.ageLabel}
                    </div>
                  </div>
                  <Chip label={SOLICITACAO_STATUS_LABEL[s.status]} tone={SOLICITACAO_STATUS_CHIP[s.status]} />
                </div>
                <div className="mb-[13px] flex flex-wrap gap-2">
                  {s.itens.map((it, i) => (
                    <span
                      key={i}
                      className="rounded-lg border border-card-border bg-[#f3f0ea] px-[11px] py-1.5 text-[12.5px] font-semibold text-[#3a3f47]"
                    >
                      {it.quantidade} × {it.tipo_equipamento}
                    </span>
                  ))}
                  {s.itens.length === 0 ? (
                    <span className="text-xs text-text-muted-2">Sem itens detalhados.</span>
                  ) : null}
                </div>
                {s.match ? (
                  <div className="flex items-start gap-[11px] rounded-[10px] border border-amber-border bg-amber-bg-3 p-[13px]">
                    <span className="mt-px flex-none rounded-md bg-amber-bg-2 px-[7px] py-[3px] text-[10px] font-extrabold tracking-[.5px] text-amber-fg">
                      IA
                    </span>
                    <div className="flex-1">
                      <span className="text-[12.5px] leading-relaxed text-[#5a4a30]">{s.match.text}</span>
                      <form
                        action={createRemanejamento.bind(
                          null,
                          s.match.equipamentoId,
                          s.match.obraOrigemId,
                          s.obra_id,
                          s.id
                        )}
                        className="mt-2"
                      >
                        <button
                          type="submit"
                          className="rounded-md bg-amber px-3 py-1.5 text-xs font-bold text-ink"
                        >
                          Analisar remanejamento
                        </button>
                      </form>
                    </div>
                  </div>
                ) : null}
              </div>
            ))
          )}
        </div>

        <div className="rounded-[13px] border border-ink bg-ink p-5 text-white">
          <div className="mb-0.5 text-sm font-bold">Fluxo de aprovação</div>
          {activeRem ? (
            <>
              <div className="mb-5 text-xs text-ink-muted">
                Remanejamento {activeRem.numero} · {activeRem.equipamento?.tipo ?? "Equipamento"}{" "}
                {activeRem.equipamento?.modelo ?? ""} → {activeRem.obraDestinoNome}
              </div>
              <div className="flex flex-col">
                {stages.map((stage, i) => {
                  const done = i < currentIdx || (i === currentIdx && activeRem.status === "recebido");
                  const active = i === currentIdx && activeRem.status !== "recebido";
                  return (
                    <div key={stage} className="flex items-start gap-[13px]">
                      <div className="flex flex-none flex-col items-center">
                        <span
                          className="flex h-[26px] w-[26px] items-center justify-center rounded-full text-xs font-bold"
                          style={{
                            background: done ? "#2E9E5B" : active ? "#E8920C" : "#e3ddd2",
                            color: done ? "#fff" : active ? "#15181c" : "#9a958c",
                          }}
                        >
                          {done ? "✓" : ""}
                        </span>
                        {i < stages.length - 1 ? <span className="min-h-[22px] w-[2px] flex-1 bg-ink-border" /> : null}
                      </div>
                      <div className="pb-[18px]">
                        <div className={`text-[13.5px] font-bold ${!done && !active ? "text-ink-muted-2" : ""}`}>
                          {REMANEJAMENTO_STATUS_LABEL[stage]}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              {!isFinal && advance ? (
                <form action={advance}>
                  <button
                    type="submit"
                    className="mt-1 w-full rounded-[9px] border-none bg-amber py-[11px] font-sans text-[13px] font-bold text-ink"
                  >
                    Avançar para &ldquo;{REMANEJAMENTO_STATUS_LABEL[stages[currentIdx + 1]]}&rdquo;
                  </button>
                </form>
              ) : null}
            </>
          ) : (
            <p className="text-[13px] text-ink-muted">Nenhum remanejamento em andamento.</p>
          )}
        </div>
      </div>
    </div>
  );
}
