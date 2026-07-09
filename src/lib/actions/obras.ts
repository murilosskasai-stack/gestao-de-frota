"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ObraStatus } from "@/lib/supabase/database.types";

function monthToDate(value: string): string {
  // <input type="month"> gives "YYYY-MM"
  return `${value}-01`;
}

export async function saveObra(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const payload = {
    nome: String(formData.get("nome") ?? ""),
    cliente: String(formData.get("cliente") ?? ""),
    cidade: String(formData.get("cidade") ?? ""),
    estado: String(formData.get("estado") ?? "").toUpperCase(),
    responsavel: String(formData.get("responsavel") ?? ""),
    data_inicio: monthToDate(String(formData.get("data_inicio") ?? "")),
    data_fim_prevista: formData.get("data_fim_prevista")
      ? monthToDate(String(formData.get("data_fim_prevista")))
      : null,
    status: String(formData.get("status") ?? "mobilizacao") as ObraStatus,
  };

  const supabase = await createClient();

  if (id) {
    const { error } = await supabase.from("obras").update(payload).eq("id", id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase.from("obras").insert(payload);
    if (error) throw new Error(error.message);
  }

  revalidatePath("/obras");
  redirect("/obras");
}
