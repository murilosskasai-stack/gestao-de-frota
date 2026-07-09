import { requireModule } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { BackLink } from "@/components/shared/page-header";
import { EquipamentoForm } from "@/components/equipamentos/equipamento-form";

export default async function NovoEquipamentoPage() {
  await requireModule("equip");
  const supabase = await createClient();
  const { data: obras } = await supabase.from("obras").select("id, nome").order("nome");

  return (
    <div>
      <BackLink href="/equipamentos" label="Equipamentos" />
      <h1 className="mb-5 font-display text-[27px] font-extrabold tracking-[-0.3px]">
        Cadastrar equipamento
      </h1>
      <EquipamentoForm obras={obras ?? []} />
    </div>
  );
}
