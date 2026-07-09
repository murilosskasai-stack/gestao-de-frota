"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";

export async function saveApontamento(formData: FormData) {
  const { id: userId } = await requireUser();
  const supabase = await createClient();

  const equipamentoId = String(formData.get("equipamento_id") ?? "");
  const { data: equipamento } = await supabase
    .from("equipamentos")
    .select("obra_atual_id")
    .eq("id", equipamentoId)
    .single();

  const payload = {
    equipamento_id: equipamentoId,
    obra_id: equipamento?.obra_atual_id ?? null,
    data: String(formData.get("data") ?? new Date().toISOString().slice(0, 10)),
    horimetro_inicial: Number(formData.get("horimetro_inicial") ?? 0),
    horimetro_final: Number(formData.get("horimetro_final") ?? 0),
    jornada_horas: Number(formData.get("jornada_horas") ?? 10),
    encarregado_id: userId,
  };

  const { error } = await supabase.from("apontamentos_diarios").insert(payload);
  if (error) throw new Error(error.message);

  revalidatePath("/apontamento");
  redirect("/apontamento");
}
