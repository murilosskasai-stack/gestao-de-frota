import { signOut } from "@/lib/actions/auth";
import { ROLE_LABELS, initials } from "@/lib/roles";
import type { UserRole } from "@/lib/supabase/database.types";

export function Topbar({
  userName,
  role,
  alertCount,
}: {
  userName: string;
  role: UserRole;
  alertCount: number;
}) {
  return (
    <header className="flex h-[60px] flex-none items-center gap-3 border-b border-ink-border bg-ink px-3 text-white sm:gap-5 sm:px-[22px]">
      <div className="flex items-center gap-[11px]">
        <div className="flex h-[34px] w-[34px] flex-none items-center justify-center rounded-lg bg-amber font-display text-[19px] font-extrabold text-ink">
          P
        </div>
        <div className="hidden flex-col leading-none sm:flex">
          <span className="font-display text-[17px] font-extrabold tracking-[1.5px]">PÁTIO</span>
          <span className="mt-[3px] text-[10px] tracking-[1px] text-ink-muted">
            GESTÃO DE FROTA
          </span>
        </div>
      </div>

      <div className="ml-[18px] hidden max-w-[420px] flex-1 items-center gap-[9px] rounded-[9px] border border-ink-border bg-ink-3 px-[13px] py-2 md:flex">
        <div className="h-3.5 w-3.5 flex-none rounded-full border-2 border-[#6b7178]" />
        <span className="text-[13px] text-[#7d838b]">Buscar equipamento, obra, chamado…</span>
      </div>

      <div className="ml-auto flex items-center gap-3 sm:gap-4">
        <div className="relative h-[18px] w-[18px] flex-none rounded-[4px_4px_7px_7px] border-2 border-[#9aa0a8]">
          {alertCount > 0 ? (
            <span className="absolute -right-[7px] -top-[7px] flex h-4 min-w-[16px] items-center justify-center rounded-lg bg-amber px-1 text-[10px] font-bold text-ink">
              {alertCount}
            </span>
          ) : null}
        </div>
        <div className="flex items-center gap-[10px] border-l border-ink-border pl-3 sm:pl-4">
          <div className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-[#3a4049] text-[13px] font-bold text-[#dfe3e8]">
            {initials(userName)}
          </div>
          <div className="hidden flex-col leading-tight sm:flex">
            <span className="text-[13px] font-semibold">{userName}</span>
            <span className="text-[11px] text-ink-muted">{ROLE_LABELS[role]}</span>
          </div>
          <form action={signOut}>
            <button
              type="submit"
              title="Sair"
              className="ml-1 flex h-[30px] w-[30px] flex-none cursor-pointer items-center justify-center rounded-lg border border-ink-border bg-transparent text-sm text-[#9aa0a8] sm:ml-2"
            >
              ⎋
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
