import Link from "next/link";
import { saveObra } from "@/lib/actions/obras";
import { OBRA_STATUS_LABEL } from "@/lib/status";
import type { Obra, ObraStatus } from "@/lib/supabase/database.types";

const STATUS_OPTIONS: ObraStatus[] = ["ativa", "mobilizacao", "desmobilizacao", "encerrada"];

function Field({
  label,
  name,
  defaultValue,
  type = "text",
  placeholder,
  wide,
  required,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  type?: string;
  placeholder?: string;
  wide?: boolean;
  required?: boolean;
}) {
  return (
    <div className={wide ? "col-span-2" : undefined}>
      <div className="mb-1.5 text-[11.5px] font-semibold text-text-muted">{label}</div>
      <input
        type={type}
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-[9px] border border-input-border-2 bg-input-bg px-[13px] py-3 text-sm text-text outline-none focus:border-ink"
      />
    </div>
  );
}

export function ObraForm({ obra }: { obra?: Obra }) {
  return (
    <form action={saveObra} className="max-w-[760px] rounded-[13px] border border-card-border bg-white p-6">
      {obra ? <input type="hidden" name="id" value={obra.id} /> : null}
      <div className="grid grid-cols-2 gap-x-[18px] gap-y-4">
        <Field label="Nome da obra" name="nome" defaultValue={obra?.nome} placeholder="Ex.: Duplicação BR-262 — Lote 3" wide required />
        <Field label="Cliente" name="cliente" defaultValue={obra?.cliente} placeholder="Ex.: DNIT" required />
        <Field label="Cidade" name="cidade" defaultValue={obra?.cidade} placeholder="Ex.: Marabá" required />
        <Field label="Estado (UF)" name="estado" defaultValue={obra?.estado} placeholder="PA" required />
        <Field label="Responsável" name="responsavel" defaultValue={obra?.responsavel} placeholder="Selecionar engenheiro responsável" required />
        <Field
          label="Data de início"
          name="data_inicio"
          type="month"
          defaultValue={obra?.data_inicio?.slice(0, 7)}
          required
        />
        <Field
          label="Data prevista de término"
          name="data_fim_prevista"
          type="month"
          defaultValue={obra?.data_fim_prevista?.slice(0, 7)}
        />
      </div>

      <div className="mt-[18px]">
        <div className="mb-[9px] text-[11.5px] font-semibold text-text-muted">STATUS DA OBRA</div>
        <div className="flex flex-wrap gap-[9px]">
          {STATUS_OPTIONS.map((s) => (
            <label key={s} className="group">
              <input
                type="radio"
                name="status"
                value={s}
                defaultChecked={(obra?.status ?? "mobilizacao") === s}
                className="peer sr-only"
              />
              <span className="cursor-pointer rounded-[9px] border border-input-border px-[14px] py-2 text-[12.5px] font-semibold text-[#5a5f67] peer-checked:border-ink peer-checked:bg-ink peer-checked:text-white">
                {OBRA_STATUS_LABEL[s]}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="mt-[26px] flex justify-end gap-[10px] border-t border-row-border pt-5">
        <Link
          href="/obras"
          className="rounded-[9px] border border-input-border bg-white px-5 py-[11px] font-sans text-[13.5px] font-semibold text-[#3a3f47]"
        >
          Cancelar
        </Link>
        <button
          type="submit"
          className="rounded-[9px] border-none bg-ink px-[22px] py-[11px] font-sans text-[13.5px] font-bold text-white"
        >
          Salvar obra
        </button>
      </div>
    </form>
  );
}
