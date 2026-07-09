import Link from "next/link";
import { requireModule } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { BackLink } from "@/components/shared/page-header";
import { createSolicitacao } from "@/lib/actions/logistica";

export default async function NovaSolicitacaoPage() {
  await requireModule("logistica");
  const supabase = await createClient();
  const { data: obras } = await supabase.from("obras").select("id, nome").order("nome");

  return (
    <div>
      <BackLink href="/logistica" label="Solicitações & Remanejamento" />
      <h1 className="mb-5 font-display text-[27px] font-extrabold tracking-[-0.3px]">Nova solicitação</h1>

      <form action={createSolicitacao} className="max-w-[620px] rounded-[13px] border border-card-border bg-white p-6">
        <div className="flex flex-col gap-4">
          <div>
            <div className="mb-1.5 text-[11.5px] font-semibold text-text-muted">OBRA SOLICITANTE</div>
            <select
              name="obra_id"
              required
              className="w-full rounded-[9px] border border-input-border-2 bg-input-bg px-[13px] py-3 text-sm outline-none focus:border-ink"
            >
              <option value="">Selecionar obra…</option>
              {(obras ?? []).map((o) => (
                <option key={o.id} value={o.id}>
                  {o.nome}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="mb-2 text-[11.5px] font-semibold text-text-muted">EQUIPAMENTOS SOLICITADOS</div>
            <div className="flex flex-col gap-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="grid grid-cols-[2fr_1fr] gap-2">
                  <input
                    type="text"
                    name={`tipo_equipamento_${i}`}
                    placeholder="Ex.: Escavadeira Hidráulica"
                    className="rounded-[9px] border border-input-border-2 bg-input-bg px-[13px] py-2.5 text-sm outline-none focus:border-ink"
                  />
                  <input
                    type="number"
                    name={`quantidade_${i}`}
                    min={1}
                    placeholder="Qtd."
                    className="rounded-[9px] border border-input-border-2 bg-input-bg px-[13px] py-2.5 text-sm outline-none focus:border-ink"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-[10px] border-t border-row-border pt-5">
          <Link
            href="/logistica"
            className="rounded-[9px] border border-input-border bg-white px-5 py-[11px] font-sans text-[13.5px] font-semibold text-[#3a3f47]"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            className="rounded-[9px] border-none bg-amber px-[22px] py-[11px] font-sans text-[13.5px] font-bold text-ink"
          >
            Enviar solicitação
          </button>
        </div>
      </form>
    </div>
  );
}
