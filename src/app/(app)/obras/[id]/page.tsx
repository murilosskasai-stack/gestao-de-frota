import { notFound } from "next/navigation";
import { requireModule } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { BackLink } from "@/components/shared/page-header";
import { ObraForm } from "@/components/obras/obra-form";

export default async function EditarObraPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireModule("obras");
  const { id } = await params;

  const supabase = await createClient();
  const { data: obra } = await supabase.from("obras").select("*").eq("id", id).single();
  if (!obra) notFound();

  return (
    <div>
      <BackLink href="/obras" label="Obras" />
      <h1 className="mb-5 font-display text-[27px] font-extrabold tracking-[-0.3px]">Editar obra</h1>
      <ObraForm obra={obra} />
    </div>
  );
}
