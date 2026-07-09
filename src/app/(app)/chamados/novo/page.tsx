import { requireModule } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { BackLink } from "@/components/shared/page-header";
import { ChamadoForm } from "@/components/chamados/chamado-form";

export default async function NovoChamadoPage({
  searchParams,
}: {
  searchParams: Promise<{ equipamento?: string }>;
}) {
  await requireModule("chamados");
  const { equipamento } = await searchParams;
  const supabase = await createClient();
  const { data: equipamentos } = await supabase
    .from("equipamentos")
    .select("id, codigo_interno, tipo, modelo")
    .order("codigo_interno");

  return (
    <div>
      <BackLink href="/chamados" label="Chamados" />
      <h1 className="mb-5 font-display text-[27px] font-extrabold tracking-[-0.3px]">Novo chamado</h1>
      <ChamadoForm equipamentos={equipamentos ?? []} defaultEquipamentoId={equipamento} />
    </div>
  );
}
