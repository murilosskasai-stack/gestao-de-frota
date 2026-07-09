"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import type { EquipamentoStatus } from "@/lib/supabase/database.types";

export async function saveEquipamento(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const obraAtualId = String(formData.get("obra_atual_id") ?? "");

  const payload = {
    codigo_interno: String(formData.get("codigo_interno") ?? ""),
    patrimonio: String(formData.get("patrimonio") ?? ""),
    tipo: String(formData.get("tipo") ?? ""),
    fabricante: String(formData.get("fabricante") ?? ""),
    modelo: String(formData.get("modelo") ?? ""),
    ano: Number(formData.get("ano") ?? new Date().getFullYear()),
    unidade_medida: String(formData.get("unidade_medida") ?? "h"),
    horimetro_atual: Number(formData.get("horimetro_atual") ?? 0),
    status: String(formData.get("status") ?? "disponivel") as EquipamentoStatus,
    obra_atual_id: obraAtualId || null,
    observacoes: String(formData.get("observacoes") ?? "") || null,
  };

  const supabase = await createClient();

  if (id) {
    const { error } = await supabase.from("equipamentos").update(payload).eq("id", id);
    if (error) throw new Error(error.message);
  } else {
    const { profile } = await requireUser();
    const { error } = await supabase
      .from("equipamentos")
      .insert({ ...payload, empresa_id: profile.empresa_id });
    if (error) throw new Error(error.message);
  }

  revalidatePath("/equipamentos");
  redirect(id ? `/equipamentos/${id}` : "/equipamentos");
}
