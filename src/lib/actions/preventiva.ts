"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function savePlanoPreventivo(formData: FormData) {
  const supabase = await createClient();
  const tipoEquipamento = String(formData.get("tipo_equipamento") ?? "");

  const { error } = await supabase.from("planos_preventivos").insert({
    servico: String(formData.get("servico") ?? ""),
    intervalo_horas: Number(formData.get("intervalo_horas") ?? 0),
    tipo_equipamento: tipoEquipamento || null,
  });
  if (error) throw new Error(error.message);

  revalidatePath("/preventiva");
  redirect("/preventiva");
}
