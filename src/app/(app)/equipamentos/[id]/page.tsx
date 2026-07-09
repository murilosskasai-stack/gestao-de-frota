import Link from "next/link";
import { notFound } from "next/navigation";
import { requireModule } from "@/lib/auth";
import { getEquipamentoDetail } from "@/lib/queries/equipamento";
import { BackLink } from "@/components/shared/page-header";
import { Chip } from "@/components/shared/chip";
import {
  EQUIPAMENTO_STATUS_CHIP,
  EQUIPAMENTO_STATUS_LABEL,
  MOVIMENTACAO_TIPO_LABEL,
  OS_STATUS_CHIP,
  OS_STATUS_LABEL,
} from "@/lib/status";
import { formatDateLong, formatNumber } from "@/lib/format";

export default async function EquipamentoFichaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireModule("equip");
  const { id } = await params;
  const { equipamento: eq, obraNome, movimentacoes, ordensServico } = await getEquipamentoDetail(id);
  if (!eq) notFound();

  const specs = [
    { k: "Código interno", v: eq.codigo_interno },
    { k: "Patrimônio", v: eq.patrimonio },
    { k: "Tipo", v: eq.tipo },
    { k: "Fabricante / Modelo", v: `${eq.fabricante} · ${eq.modelo}` },
    { k: "Ano de fabricação", v: String(eq.ano) },
    { k: "Horímetro atual", v: `${formatNumber(eq.horimetro_atual, 1)} ${eq.unidade_medida}` },
    { k: "Obra atual", v: eq.obra_atual_id ? obraNome.get(eq.obra_atual_id) ?? "—" : "Pátio / oficina" },
  ];

  return (
    <div>
      <BackLink href="/equipamentos" label="Equipamentos" />

      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="rounded-lg bg-[#ece9e3] px-[10px] py-[3px] font-mono text-sm font-semibold text-text-muted">
              {eq.codigo_interno}
            </span>
            <Chip label={EQUIPAMENTO_STATUS_LABEL[eq.status]} tone={EQUIPAMENTO_STATUS_CHIP[eq.status]} />
          </div>
          <h1 className="mb-[3px] mt-[11px] font-display text-[27px] font-extrabold tracking-[-0.3px]">
            {eq.tipo}
          </h1>
          <p className="text-sm text-text-muted">
            {eq.fabricante} · {eq.modelo}
          </p>
        </div>
        <div className="flex gap-[9px]">
          <Link
            href={`/equipamentos/${eq.id}/editar`}
            className="rounded-lg border border-input-border bg-white px-[15px] py-[9px] font-sans text-[13px] font-semibold text-[#3a3f47]"
          >
            Editar
          </Link>
          <Link
            href="/logistica"
            className="rounded-lg border border-input-border bg-white px-[15px] py-[9px] font-sans text-[13px] font-semibold text-[#3a3f47]"
          >
            Remanejar
          </Link>
          <Link
            href={`/chamados/novo?equipamento=${eq.id}`}
            className="rounded-lg border-none bg-amber px-[15px] py-[9px] font-sans text-[13px] font-bold text-ink"
          >
            + Abrir chamado
          </Link>
        </div>
      </div>

      <div className="mb-4 rounded-[13px] border border-card-border bg-white px-1 py-1.5">
        <div className="grid grid-cols-2 sm:grid-cols-4">
          {specs.map((s) => (
            <div key={s.k} className="px-[18px] py-[14px]">
              <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-[.4px] text-text-muted-2">
                {s.k}
              </div>
              <div className="text-sm font-semibold">{s.v}</div>
            </div>
          ))}
        </div>
      </div>

      {eq.observacoes ? (
        <div className="mb-4 rounded-[13px] border border-card-border bg-white p-[18px] text-sm text-text-soft">
          {eq.observacoes}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-[13px] border border-card-border bg-white p-[18px]">
          <div className="mb-4 text-sm font-bold">Histórico de movimentação</div>
          <div className="flex flex-col">
            {movimentacoes.length === 0 ? (
              <p className="text-[12.5px] text-text-muted-2">Sem histórico registrado.</p>
            ) : (
              movimentacoes.map((m, i) => (
                <div key={m.id} className="flex gap-[13px]">
                  <div className="flex flex-none flex-col items-center">
                    <span className="mt-1 h-[11px] w-[11px] rounded-full bg-[#9aa0a8]" />
                    {i < movimentacoes.length - 1 ? (
                      <span className="min-h-[26px] w-[2px] flex-1 bg-card-border-2" />
                    ) : null}
                  </div>
                  <div className="pb-[18px]">
                    <div className="mb-0.5 font-mono text-[11.5px] text-text-faint">
                      {formatDateLong(m.data)}
                    </div>
                    <div className="text-[13.5px] font-semibold">
                      {MOVIMENTACAO_TIPO_LABEL[m.tipo]}
                      {m.obraNome ? ` · ${m.obraNome}` : ""}
                    </div>
                    <div className="mt-0.5 text-[12.5px] text-text-muted-2">{m.descricao}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-[13px] border border-card-border bg-white p-[18px]">
          <div className="mb-4 text-sm font-bold">Manutenção recente</div>
          <div className="flex flex-col gap-3">
            {ordensServico.length === 0 ? (
              <p className="text-[12.5px] text-text-muted-2">Sem ordens de serviço registradas.</p>
            ) : (
              ordensServico.map((os) => (
                <div key={os.id} className="flex items-start gap-[13px] border-b border-row-border pb-3 last:border-b-0">
                  <div className="flex-1">
                    <div className="flex items-center gap-[9px]">
                      <span className="font-mono text-xs font-bold text-[#3a3f47]">{os.numero}</span>
                      <span className="font-mono text-[11.5px] text-text-faint">
                        {os.data_conclusao ? formatDateLong(os.data_conclusao) : os.data_programada ? `Prog. ${formatDateLong(os.data_programada)}` : "—"}
                      </span>
                    </div>
                    <div className="mt-1 text-[13px] text-text-soft">{os.descricao}</div>
                  </div>
                  <Chip label={OS_STATUS_LABEL[os.status]} tone={OS_STATUS_CHIP[os.status]} />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
