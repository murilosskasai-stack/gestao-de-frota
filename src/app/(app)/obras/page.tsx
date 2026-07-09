import Link from "next/link";
import { requireModule } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/shared/page-header";
import { TableShell, TableHead, TableRow } from "@/components/shared/data-table";
import { Chip } from "@/components/shared/chip";
import { OBRA_STATUS_CHIP, OBRA_STATUS_LABEL } from "@/lib/status";
import { formatPeriodo } from "@/lib/format";
import type { ObraStatus } from "@/lib/supabase/database.types";
import { cn } from "@/lib/utils";

const COLUMNS = "2.4fr 1.6fr 1.3fr 1fr 1fr";

const FILTERS: { key: string; label: string; status?: ObraStatus }[] = [
  { key: "todas", label: "Todas" },
  { key: "ativa", label: "Ativas", status: "ativa" },
  { key: "mobilizacao", label: "Mobilização", status: "mobilizacao" },
  { key: "encerrada", label: "Encerradas", status: "encerrada" },
];

export default async function ObrasPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireModule("obras");
  const { status } = await searchParams;
  const activeFilter = FILTERS.find((f) => f.key === status) ?? FILTERS[0];

  const supabase = await createClient();
  let query = supabase.from("obras").select("*").order("data_inicio", { ascending: false });
  if (activeFilter.status) query = query.eq("status", activeFilter.status);
  const [{ data: obras }, { data: equipamentos }] = await Promise.all([
    query,
    supabase.from("equipamentos").select("obra_atual_id"),
  ]);

  const equipCounts = new Map<string, number>();
  for (const e of equipamentos ?? []) {
    if (!e.obra_atual_id) continue;
    equipCounts.set(e.obra_atual_id, (equipCounts.get(e.obra_atual_id) ?? 0) + 1);
  }

  const ativas = (obras ?? []).filter((o) => o.status === "ativa").length;
  const mobilizacao = (obras ?? []).filter((o) => o.status === "mobilizacao").length;

  return (
    <div>
      <PageHeader
        title="Obras"
        subtitle={`${obras?.length ?? 0} obras · ${ativas} ativas · ${mobilizacao} em mobilização`}
        actions={
          <Link
            href="/obras/novo"
            className="rounded-lg bg-ink px-4 py-[9px] font-sans text-[13px] font-semibold text-white"
          >
            + Nova obra
          </Link>
        }
      />

      <div className="mb-4 flex gap-[9px]">
        {FILTERS.map((f) => (
          <Link
            key={f.key}
            href={f.key === "todas" ? "/obras" : `/obras?status=${f.key}`}
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
        <TableHead columns={COLUMNS} labels={["Obra / Cliente", "Local · Responsável", "Período", "Equip.", "Status"]} />
        {(obras ?? []).map((o) => (
          <TableRow columns={COLUMNS} key={o.id} href={`/obras/${o.id}`}>
            <div>
              <div className="text-[13.5px] font-semibold">{o.nome}</div>
              <div className="mt-0.5 text-xs text-text-muted-2">{o.cliente}</div>
            </div>
            <div>
              <div className="text-[13px]">
                {o.cidade} / {o.estado}
              </div>
              <div className="mt-0.5 text-xs text-text-muted-2">{o.responsavel}</div>
            </div>
            <div className="font-mono text-[12.5px] text-text-soft">
              {formatPeriodo(o.data_inicio, o.data_fim_prevista)}
            </div>
            <div className="font-display text-base font-bold">{equipCounts.get(o.id) ?? 0}</div>
            <div>
              <Chip label={OBRA_STATUS_LABEL[o.status]} tone={OBRA_STATUS_CHIP[o.status]} />
            </div>
          </TableRow>
        ))}
        {(obras ?? []).length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-text-muted-2">Nenhuma obra encontrada.</div>
        ) : null}
      </TableShell>
    </div>
  );
}
