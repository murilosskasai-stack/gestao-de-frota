import Link from "next/link";
import { saveApontamento } from "@/lib/actions/apontamentos";
import { formatNumber } from "@/lib/format";
import type { Equipamento } from "@/lib/supabase/database.types";

export function ApontamentoForm({ equipamentos }: { equipamentos: Pick<Equipamento, "id" | "codigo_interno" | "tipo" | "modelo" | "horimetro_atual" | "unidade_medida">[] }) {
  const today = new Date().toISOString().slice(0, 10);

  return (
    <form action={saveApontamento} className="max-w-[640px] rounded-[13px] border border-card-border bg-white p-6">
      <div className="flex flex-col gap-4">
        <div>
          <div className="mb-1.5 text-[11.5px] font-semibold text-text-muted">EQUIPAMENTO</div>
          <select
            name="equipamento_id"
            required
            className="w-full rounded-[9px] border border-input-border-2 bg-input-bg px-[13px] py-3 text-sm text-text outline-none focus:border-ink"
          >
            <option value="">Selecionar equipamento…</option>
            {equipamentos.map((e) => (
              <option key={e.id} value={e.id}>
                {e.codigo_interno} · {e.tipo} {e.modelo} (atual: {formatNumber(e.horimetro_atual, 1)}
                {e.unidade_medida})
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-[14px]">
          <div>
            <div className="mb-1.5 text-[11.5px] font-semibold text-text-muted">HORÍM. INICIAL</div>
            <input
              type="number"
              step="0.1"
              name="horimetro_inicial"
              required
              className="w-full rounded-[9px] border border-input-border-2 bg-input-bg px-[13px] py-3 font-mono text-sm outline-none focus:border-ink"
            />
          </div>
          <div>
            <div className="mb-1.5 text-[11.5px] font-semibold text-amber-fg">HORÍM. FINAL</div>
            <input
              type="number"
              step="0.1"
              name="horimetro_final"
              required
              className="w-full rounded-[9px] border-2 border-amber bg-white px-[13px] py-3 font-mono text-sm font-semibold outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-[14px]">
          <div>
            <div className="mb-1.5 text-[11.5px] font-semibold text-text-muted">DATA</div>
            <input
              type="date"
              name="data"
              defaultValue={today}
              required
              className="w-full rounded-[9px] border border-input-border-2 bg-input-bg px-[13px] py-3 text-sm outline-none focus:border-ink"
            />
          </div>
          <div>
            <div className="mb-1.5 text-[11.5px] font-semibold text-text-muted">JORNADA (H)</div>
            <input
              type="number"
              step="0.5"
              name="jornada_horas"
              defaultValue={10}
              required
              className="w-full rounded-[9px] border border-input-border-2 bg-input-bg px-[13px] py-3 text-sm outline-none focus:border-ink"
            />
          </div>
        </div>

        <p className="text-xs text-text-muted-2">
          Horas trabalhadas e ociosas são calculadas automaticamente a partir do horímetro e da
          jornada informada.
        </p>
      </div>

      <div className="mt-6 flex justify-end gap-[10px] border-t border-row-border pt-5">
        <Link
          href="/apontamento"
          className="rounded-[9px] border border-input-border bg-white px-5 py-[11px] font-sans text-[13.5px] font-semibold text-[#3a3f47]"
        >
          Cancelar
        </Link>
        <button
          type="submit"
          className="rounded-[9px] border-none bg-amber px-[22px] py-[11px] font-sans text-[13.5px] font-bold text-ink"
        >
          Confirmar apontamento
        </button>
      </div>
    </form>
  );
}
