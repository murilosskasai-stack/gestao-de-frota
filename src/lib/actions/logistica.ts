"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import { REMANEJAMENTO_STAGES } from "@/lib/status";
import type { RemanejamentoStatus } from "@/lib/supabase/database.types";

export async function createSolicitacao(formData: FormData) {
  const { id: userId } = await requireUser();
  const supabase = await createClient();

  const obraId = String(formData.get("obra_id") ?? "");
  const { data: solicitacao, error } = await supabase
    .from("solicitacoes")
    .insert({ obra_id: obraId, solicitante_id: userId, status: "pendente" })
    .select("id")
    .single();
  if (error) throw new Error(error.message);

  const itens = [1, 2, 3]
    .map((i) => ({
      tipo_equipamento: String(formData.get(`tipo_equipamento_${i}`) ?? "").trim(),
      quantidade: Number(formData.get(`quantidade_${i}`) ?? 0),
    }))
    .filter((it) => it.tipo_equipamento && it.quantidade > 0);

  if (itens.length > 0) {
    const { error: itensError } = await supabase
      .from("solicitacao_itens")
      .insert(itens.map((it) => ({ ...it, solicitacao_id: solicitacao.id })));
    if (itensError) throw new Error(itensError.message);
  }

  revalidatePath("/logistica");
  redirect("/logistica");
}

export async function createRemanejamento(
  equipamentoId: string,
  obraOrigemId: string | null,
  obraDestinoId: string,
  solicitacaoId: string
) {
  const supabase = await createClient();
  const { error } = await supabase.from("remanejamentos").insert({
    equipamento_id: equipamentoId,
    obra_origem_id: obraOrigemId,
    obra_destino_id: obraDestinoId,
    solicitacao_id: solicitacaoId,
    status: "solicitado",
  });
  if (error) throw new Error(error.message);

  await supabase.from("solicitacoes").update({ status: "em_analise" }).eq("id", solicitacaoId);

  revalidatePath("/logistica");
}

export async function advanceRemanejamento(id: string, currentStatus: RemanejamentoStatus) {
  const supabase = await createClient();
  const idx = REMANEJAMENTO_STAGES.indexOf(currentStatus);
  const next = REMANEJAMENTO_STAGES[Math.min(idx + 1, REMANEJAMENTO_STAGES.length - 1)];

  const { error } = await supabase.from("remanejamentos").update({ status: next }).eq("id", id);
  if (error) throw new Error(error.message);

  if (next === "recebido") {
    const { data: rem } = await supabase
      .from("remanejamentos")
      .select("equipamento_id, obra_destino_id")
      .eq("id", id)
      .single();
    if (rem) {
      await supabase
        .from("equipamentos")
        .update({ obra_atual_id: rem.obra_destino_id, status: "disponivel" })
        .eq("id", rem.equipamento_id);
    }
  }

  revalidatePath("/logistica");
}
