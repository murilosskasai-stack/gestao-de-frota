import Link from "next/link";
import { requireModule } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { BackLink } from "@/components/shared/page-header";
import { savePlanoPreventivo } from "@/lib/actions/preventiva";

export default async function NovoPlanoPage() {
  await requireModule("preventiva");
  const supabase = await createClient();
  const { data: equipamentos } = await supabase.from("equipamentos").select("tipo");
  const tipos = [...new Set((equipamentos ?? []).map((e) => e.tipo))].sort();

  return (
    <div>
      <BackLink href="/preventiva" label="Preventiva" />
      <h1 className="mb-5 font-display text-[27px] font-extrabold tracking-[-0.3px]">Novo plano preventivo</h1>

      <form action={savePlanoPreventivo} className="max-w-[560px] rounded-[13px] border border-card-border bg-white p-6">
        <div className="flex flex-col gap-4">
          <div>
            <div className="mb-1.5 text-[11.5px] font-semibold text-text-muted">SERVIÇO</div>
            <input
              type="text"
              name="servico"
              required
              placeholder="Ex.: Troca de óleo do motor"
              className="w-full rounded-[9px] border border-input-border-2 bg-input-bg px-[13px] py-3 text-sm outline-none focus:border-ink"
            />
          </div>
          <div>
            <div className="mb-1.5 text-[11.5px] font-semibold text-text-muted">INTERVALO (HORAS)</div>
            <input
              type="number"
              name="intervalo_horas"
              step="1"
              required
              placeholder="500"
              className="w-full rounded-[9px] border border-input-border-2 bg-input-bg px-[13px] py-3 font-mono text-sm outline-none focus:border-ink"
            />
          </div>
          <div>
            <div className="mb-1.5 text-[11.5px] font-semibold text-text-muted">TIPO DE EQUIPAMENTO (OPCIONAL)</div>
            <select
              name="tipo_equipamento"
              defaultValue=""
              className="w-full rounded-[9px] border border-input-border-2 bg-input-bg px-[13px] py-3 text-sm outline-none focus:border-ink"
            >
              <option value="">Todos os tipos</option>
              {tipos.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-[10px] border-t border-row-border pt-5">
          <Link
            href="/preventiva"
            className="rounded-[9px] border border-input-border bg-white px-5 py-[11px] font-sans text-[13.5px] font-semibold text-[#3a3f47]"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            className="rounded-[9px] border-none bg-ink px-[22px] py-[11px] font-sans text-[13.5px] font-bold text-white"
          >
            Salvar plano
          </button>
        </div>
      </form>
    </div>
  );
}
