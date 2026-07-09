import { cn } from "@/lib/utils";

export function KpiCard({
  label,
  value,
  sub,
  accent,
  delta,
  deltaTone,
}: {
  label: string;
  value: string;
  sub?: string;
  accent: string;
  delta?: string;
  deltaTone?: "green" | "red";
}) {
  return (
    <div className="relative overflow-hidden rounded-[13px] border border-card-border bg-white px-[18px] pb-4 pt-[18px]">
      <span
        className="absolute left-0 top-0 bottom-0 w-1"
        style={{ background: accent }}
      />
      <div className="mb-[10px] text-[12.5px] font-semibold text-text-muted">{label}</div>
      <div className="flex items-baseline gap-2">
        <span className="font-display text-[34px] font-extrabold leading-none tracking-[-1px]">
          {value}
        </span>
        {delta ? (
          <span
            className={cn(
              "text-xs font-bold",
              deltaTone === "red" ? "text-red-fg" : "text-green-fg"
            )}
          >
            {delta}
          </span>
        ) : null}
      </div>
      {sub ? <div className="mt-[9px] text-xs text-text-muted-2">{sub}</div> : null}
    </div>
  );
}

export function MiniKpiCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  accent: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-[13px] border border-card-border bg-white px-[18px] pb-4 pt-[18px]">
      <span className="absolute left-0 top-0 bottom-0 w-1" style={{ background: accent }} />
      <div className="mb-[10px] text-[12.5px] font-semibold text-text-muted">{label}</div>
      <div className="font-display text-[30px] font-extrabold leading-none tracking-[-0.5px]">
        {value}
      </div>
      {sub ? <div className="mt-[9px] text-xs text-text-muted-2">{sub}</div> : null}
    </div>
  );
}
