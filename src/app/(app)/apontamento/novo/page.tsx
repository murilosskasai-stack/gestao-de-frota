import { requireModule } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { BackLink } from "@/components/shared/page-header";
import { ApontamentoForm } from "@/components/apontamento/apontamento-form";

export default async function NovoApontamentoPage() {
  await requireModule("apont");
  const supabase = await createClient();
  const { data: equipamentos } = await supabase
    .from("equipamentos")
    .select("id, codigo_interno, tipo, modelo, horimetro_atual, unidade_medida")
    .order("codigo_interno");

  return (
    <div>
      <BackLink href="/apontamento" label="Apontamento Diário" />
      <h1 className="mb-5 font-display text-[27px] font-extrabold tracking-[-0.3px]">
        Lançar apontamento
      </h1>
      <ApontamentoForm equipamentos={equipamentos ?? []} />
    </div>
  );
}
