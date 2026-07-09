import Link from "next/link";
import { requireModule } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/shared/page-header";
import { TableShell, TableHead, TableRow } from "@/components/shared/data-table";
import { Chip } from "@/components/shared/chip";
import { EQUIPAMENTO_STATUS_CHIP, EQUIPAMENTO_STATUS_LABEL } from "@/lib/status";
import { formatNumber } from "@/lib/format";
import type { EquipamentoStatus } from "@/lib/supabase/database.types";
import { cn } from "@/lib/utils";

const COLUMNS = "1fr 2fr 1.3fr 1.2fr 1.6fr 1.1fr";

const FILTERS: { key: string; label: string; status?: EquipamentoStatus }[] = [
  { key: "todos", label: "Todos" },
  { key: "operando", label: "Operando", status: "operando" },
  { key: "ociosos", label: "Ociosos", status: "parado" },
  { key: "manutencao", label: "Manutenção", status: "em_manutencao" },
  { key: "disponiveis", label: "Disponíveis", status: "disponivel" },
];

export default async function EquipamentosPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireModule("equip");
  const { status } = await searchParams;
  const activeFilter = FILTERS.find((f) => f.key === status) ?? FILTERS[0];

  const supabase = await createClient();
  let query = supabase.from("equipamentos").select("*").order("codigo_interno");
  if (activeFilter.status) query = query.eq("status", activeFilter.status);
  const [{ data: equipamentos }, { data: obras }] = await Promise.all([
    query,
    supabase.from("obras").select("id, nome"),
  ]);

  const obraNome = new Map((obras ?? []).map((o) => [o.id, o.nome]));
  const tiposCount = new Set((equipamentos ?? []).map((e) => e.tipo)).size;

  return (
    <div>
      <PageHeader
        title="Equipamentos"
        subtitle={`${equipamentos?.length ?? 0} equipamentos · ${tiposCount} tipos · horímetros sincronizados`}
        actions={
          <Link
            href="/equipamentos/novo"
            className="rounded-lg bg-ink px-4 py-[9px] font-sans text-[13px] font-semibold text-white"
          >
            + Cadastrar equipamento
          </Link>
        }
      />

      <div className="mb-4 flex gap-[9px]">
        {FILTERS.map((f) => (
          <Link
            key={f.key}
            href={f.key === "todos" ? "/equipamentos" : `/equipamentos?status=${f.key}`}
            className={cn(
              "rounded-lg px-[14px] py-[7px] font-sans text-[12.5px] font-semibold",
              f.key === activeFilter.key
                ? "border border-ink bg-ink text-white"
                : "border border-input-border bg-white text-[#5a5f67]"
            )}
          >
            {f.label}
          </Link>
        ))}
      </div>

      <TableShell>
        <TableHead
          columns={COLUMNS}
          labels={["Código", "Tipo / Modelo", "Fabricante", "Horímetro", "Obra atual", "Status"]}
        />
        {(equipamentos ?? []).map((e) => (
          <TableRow columns={COLUMNS} key={e.id} href={`/equipamentos/${e.id}`}>
            <span className="font-mono text-[12.5px] font-semibold text-[#3a3f47]">{e.codigo_interno}</span>
            <div>
              <div className="text-[13.5px] font-semibold">{e.tipo}</div>
              <div className="mt-0.5 text-xs text-text-muted-2">{e.modelo}</div>
            </div>
            <span className="text-[13px] text-text-soft">{e.fabricante}</span>
            <span className="font-mono text-[13px] font-semibold">
              {formatNumber(e.horimetro_atual, 1)} {e.unidade_medida}
            </span>
            <span className="text-[13px] text-text-soft">
              {e.obra_atual_id ? obraNome.get(e.obra_atual_id) ?? "—" : "Pátio / oficina"}
            </span>
            <span>
              <Chip label={EQUIPAMENTO_STATUS_LABEL[e.status]} tone={EQUIPAMENTO_STATUS_CHIP[e.status]} />
            </span>
          </TableRow>
        ))}
        {(equipamentos ?? []).length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-text-muted-2">Nenhum equipamento encontrado.</div>
        ) : null}
      </TableShell>
    </div>
  );
}
