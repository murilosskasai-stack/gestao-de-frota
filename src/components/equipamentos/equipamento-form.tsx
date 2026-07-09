import Link from "next/link";
import { saveEquipamento } from "@/lib/actions/equipamentos";
import { EQUIPAMENTO_STATUS_LABEL } from "@/lib/status";
import type { Equipamento, EquipamentoStatus, Obra } from "@/lib/supabase/database.types";

const STATUS_OPTIONS: EquipamentoStatus[] = [
  "disponivel",
  "operando",
  "em_manutencao",
  "parado",
  "em_deslocamento",
];

function Field({
  label,
  name,
  defaultValue,
  type = "text",
  placeholder,
  wide,
  required,
  step,
}: {
  label: string;
  name: string;
  defaultValue?: string | number;
  type?: string;
  placeholder?: string;
  wide?: boolean;
  required?: boolean;
  step?: string;
}) {
  return (
    <div className={wide ? "col-span-2" : undefined}>
      <div className="mb-1.5 text-[11.5px] font-semibold text-text-muted">{label}</div>
      <input
        type={type}
        name={name}
        step={step}
        defaultValue={defaultValue}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-[9px] border border-input-border-2 bg-input-bg px-[13px] py-3 text-sm text-text outline-none focus:border-ink"
      />
    </div>
  );
}

export function EquipamentoForm({
  equipamento,
  obras,
}: {
  equipamento?: Equipamento;
  obras: Pick<Obra, "id" | "nome">[];
}) {
  return (
    <form
      action={saveEquipamento}
      className="max-w-[760px] rounded-[13px] border border-card-border bg-white p-6"
    >
      {equipamento ? <input type="hidden" name="id" value={equipamento.id} /> : null}
      <div className="grid grid-cols-2 gap-x-[18px] gap-y-4">
        <Field label="Código interno" name="codigo_interno" defaultValue={equipamento?.codigo_interno} placeholder="EQ-0250" required />
        <Field label="Patrimônio" name="patrimonio" defaultValue={equipamento?.patrimonio} placeholder="PAT-0250" required />
        <Field label="Tipo" name="tipo" defaultValue={equipamento?.tipo} placeholder="Escavadeira Hidráulica" required wide />
        <Field label="Fabricante" name="fabricante" defaultValue={equipamento?.fabricante} placeholder="Caterpillar" required />
        <Field label="Modelo" name="modelo" defaultValue={equipamento?.modelo} placeholder="CAT 320 GC" required />
        <Field label="Ano de fabricação" name="ano" type="number" defaultValue={equipamento?.ano} required />
        <div>
          <div className="mb-1.5 text-[11.5px] font-semibold text-text-muted">Unidade</div>
          <select
            name="unidade_medida"
            defaultValue={equipamento?.unidade_medida ?? "h"}
            className="w-full rounded-[9px] border border-input-border-2 bg-input-bg px-[13px] py-3 text-sm text-text outline-none focus:border-ink"
          >
            <option value="h">Horímetro (h)</option>
            <option value="km">Odômetro (km)</option>
          </select>
        </div>
        <Field
          label="Horímetro / odômetro atual"
          name="horimetro_atual"
          type="number"
          step="0.1"
          defaultValue={equipamento?.horimetro_atual}
          required
        />
        <div>
          <div className="mb-1.5 text-[11.5px] font-semibold text-text-muted">Obra atual</div>
          <select
            name="obra_atual_id"
            defaultValue={equipamento?.obra_atual_id ?? ""}
            className="w-full rounded-[9px] border border-input-border-2 bg-input-bg px-[13px] py-3 text-sm text-text outline-none focus:border-ink"
          >
            <option value="">Sem obra (pátio/oficina)</option>
            {obras.map((o) => (
              <option key={o.id} value={o.id}>
                {o.nome}
              </option>
            ))}
          </select>
        </div>
        <div className="col-span-2">
          <div className="mb-1.5 text-[11.5px] font-semibold text-text-muted">Observações</div>
          <textarea
            name="observacoes"
            defaultValue={equipamento?.observacoes ?? ""}
            rows={3}
            className="w-full rounded-[9px] border border-input-border-2 bg-input-bg px-[13px] py-3 text-sm text-text outline-none focus:border-ink"
          />
        </div>
      </div>

      <div className="mt-[18px]">
        <div className="mb-[9px] text-[11.5px] font-semibold text-text-muted">STATUS DO EQUIPAMENTO</div>
        <div className="flex flex-wrap gap-[9px]">
          {STATUS_OPTIONS.map((s) => (
            <label key={s} className="group">
              <input
                type="radio"
                name="status"
                value={s}
                defaultChecked={(equipamento?.status ?? "disponivel") === s}
                className="peer sr-only"
              />
              <span className="cursor-pointer rounded-[9px] border border-input-border px-[14px] py-2 text-[12.5px] font-semibold text-[#5a5f67] peer-checked:border-ink peer-checked:bg-ink peer-checked:text-white">
                {EQUIPAMENTO_STATUS_LABEL[s]}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="mt-[26px] flex justify-end gap-[10px] border-t border-row-border pt-5">
        <Link
          href="/equipamentos"
          className="rounded-[9px] border border-input-border bg-white px-5 py-[11px] font-sans text-[13.5px] font-semibold text-[#3a3f47]"
        >
          Cancelar
        </Link>
        <button
          type="submit"
          className="rounded-[9px] border-none bg-ink px-[22px] py-[11px] font-sans text-[13.5px] font-bold text-white"
        >
          Salvar equipamento
        </button>
      </div>
    </form>
  );
}
