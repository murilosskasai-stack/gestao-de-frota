import { createClient } from "@/lib/supabase/server";

export async function getEquipamentoDetail(id: string) {
  const supabase = await createClient();

  const [{ data: equipamento }, { data: movimentacoes }, { data: ordens }, { data: obras }] =
    await Promise.all([
      supabase.from("equipamentos").select("*").eq("id", id).single(),
      supabase
        .from("equipamento_movimentacoes")
        .select("*")
        .eq("equipamento_id", id)
        .order("data", { ascending: false }),
      supabase
        .from("ordens_servico")
        .select("*")
        .eq("equipamento_id", id)
        .order("created_at", { ascending: false })
        .limit(6),
      supabase.from("obras").select("id, nome"),
    ]);

  const obraNome = new Map((obras ?? []).map((o) => [o.id, o.nome]));

  return {
    equipamento,
    obraNome,
    movimentacoes: (movimentacoes ?? []).map((m) => ({
      ...m,
      obraNome: m.obra_id ? obraNome.get(m.obra_id) ?? null : null,
    })),
    ordensServico: ordens ?? [],
  };
}
