import { notFound } from "next/navigation";
import { requireModule } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { BackLink } from "@/components/shared/page-header";
import { EquipamentoForm } from "@/components/equipamentos/equipamento-form";

export default async function EditarEquipamentoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireModule("equip");
  const { id } = await params;
  const supabase = await createClient();
  const [{ data: equipamento }, { data: obras }] = await Promise.all([
    supabase.from("equipamentos").select("*").eq("id", id).single(),
    supabase.from("obras").select("id, nome").order("nome"),
  ]);
  if (!equipamento) notFound();

  return (
    <div>
      <BackLink href={`/equipamentos/${id}`} label="Ficha do equipamento" />
      <h1 className="mb-5 font-display text-[27px] font-extrabold tracking-[-0.3px]">
        Editar equipamento
      </h1>
      <EquipamentoForm equipamento={equipamento} obras={obras ?? []} />
    </div>
  );
}
