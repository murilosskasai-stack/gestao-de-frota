"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import type { ChamadoStatus, Prioridade } from "@/lib/supabase/database.types";

export async function createChamado(formData: FormData) {
  const { id: userId } = await requireUser();
  const supabase = await createClient();

  const equipamentoId = String(formData.get("equipamento_id") ?? "");
  const { data: equipamento } = await supabase
    .from("equipamentos")
    .select("obra_atual_id")
    .eq("id", equipamentoId)
    .single();

  const { data: chamado, error } = await supabase
    .from("chamados")
    .insert({
      equipamento_id: equipamentoId,
      obra_id: equipamento?.obra_atual_id ?? null,
      descricao: String(formData.get("descricao") ?? ""),
      prioridade: String(formData.get("prioridade") ?? "media") as Prioridade,
      status: "aberto",
      aberto_por: userId,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/chamados");
  redirect(`/chamados/${chamado.id}`);
}

const STATUS_FLOW: ChamadoStatus[] = [
  "aberto",
  "em_analise",
  "equipe_deslocada",
  "em_manutencao",
  "concluido",
];

export async function advanceChamadoStatus(chamadoId: string, currentStatus: ChamadoStatus) {
  const supabase = await createClient();
  const idx = STATUS_FLOW.indexOf(currentStatus);
  const next = STATUS_FLOW[Math.min(idx + 1, STATUS_FLOW.length - 1)];

  const { error } = await supabase.from("chamados").update({ status: next }).eq("id", chamadoId);
  if (error) throw new Error(error.message);

  revalidatePath("/chamados");
  revalidatePath(`/chamados/${chamadoId}`);
}
