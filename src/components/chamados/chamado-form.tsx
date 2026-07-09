import Link from "next/link";
import { createChamado } from "@/lib/actions/chamados";
import type { Equipamento } from "@/lib/supabase/database.types";

export function ChamadoForm({
  equipamentos,
  defaultEquipamentoId,
}: {
  equipamentos: Pick<Equipamento, "id" | "codigo_interno" | "tipo" | "modelo">[];
  defaultEquipamentoId?: string;
}) {
  return (
    <form action={createChamado} className="max-w-[640px] rounded-[13px] border border-card-border bg-white p-6">
      <div className="flex flex-col gap-4">
        <div>
          <div className="mb-1.5 text-[11.5px] font-semibold text-text-muted">EQUIPAMENTO</div>
          <select
            name="equipamento_id"
            required
            defaultValue={defaultEquipamentoId}
            className="w-full rounded-[9px] border border-input-border-2 bg-input-bg px-[13px] py-3 text-sm text-text outline-none focus:border-ink"
          >
            <option value="">Selecionar equipamento…</option>
            {equipamentos.map((e) => (
              <option key={e.id} value={e.id}>
                {e.codigo_interno} · {e.tipo} {e.modelo}
              </option>
            ))}
          </select>
        </div>

        <div>
          <div className="mb-1.5 text-[11.5px] font-semibold text-text-muted">DESCRIÇÃO</div>
          <textarea
            name="descricao"
            required
            rows={4}
            placeholder="Descreva o problema observado…"
            className="w-full rounded-[9px] border border-input-border-2 bg-input-bg px-[13px] py-3 text-sm text-text outline-none focus:border-ink"
          />
        </div>

        <div className="flex gap-[9px]">
          <div className="flex h-[62px] flex-1 items-center justify-center rounded-[11px] border border-dashed border-[#cfc9bf] text-[11px] text-[#9a958c]">
            + Foto
          </div>
          <div className="flex h-[62px] flex-1 items-center justify-center rounded-[11px] border border-dashed border-[#cfc9bf] text-[11px] text-[#9a958c]">
            + Vídeo
          </div>
        </div>

        <div>
          <div className="mb-[7px] text-[11.5px] font-semibold text-text-muted">PRIORIDADE</div>
          <div className="flex gap-2">
            {(["alta", "media", "baixa"] as const).map((p, i) => (
              <label key={p} className="flex-1">
                <input type="radio" name="prioridade" value={p} defaultChecked={i === 1} className="peer sr-only" />
                <span className="block cursor-pointer rounded-lg border border-input-border bg-white py-[9px] text-center text-[12.5px] font-semibold text-text-muted-2 peer-checked:border-2 peer-checked:border-red-fg peer-checked:bg-red-bg peer-checked:text-red-fg">
                  {p === "alta" ? "Alta" : p === "media" ? "Média" : "Baixa"}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-[10px] border-t border-row-border pt-5">
        <Link
          href="/chamados"
          className="rounded-[9px] border border-input-border bg-white px-5 py-[11px] font-sans text-[13.5px] font-semibold text-[#3a3f47]"
        >
          Cancelar
        </Link>
        <button
          type="submit"
          className="rounded-[9px] border-none bg-amber px-[22px] py-[11px] font-sans text-[13.5px] font-bold text-ink"
        >
          Enviar chamado
        </button>
      </div>
    </form>
  );
}
