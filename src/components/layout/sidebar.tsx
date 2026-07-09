"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MODULE_PATH, navForRole, type ModuleKey } from "@/lib/roles";
import type { UserRole } from "@/lib/supabase/database.types";
import { cn } from "@/lib/utils";

export function Sidebar({
  role,
  badges,
}: {
  role: UserRole;
  badges?: Partial<Record<ModuleKey, number>>;
}) {
  const pathname = usePathname();
  const groups = navForRole(role);

  return (
    <aside className="hidden w-64 flex-none overflow-y-auto bg-ink-2 px-3 py-4 pb-7 text-[#cdd2d8] lg:block">
      {groups.map((group) => (
        <div key={group.label} className="mb-[18px]">
          <div className="px-3 pb-2 text-[10.5px] font-bold uppercase tracking-[1.4px] text-ink-dim">
            {group.label}
          </div>
          {group.items.map((item) => {
            const isActive = pathname.startsWith(MODULE_PATH[item.key]);
            const badge = badges?.[item.key];
            return (
              <Link
                key={item.key}
                href={MODULE_PATH[item.key]}
                className={cn(
                  "mb-0.5 flex w-full items-center gap-0 rounded-lg py-[9px] pl-0 pr-3 text-[13px]",
                  isActive ? "bg-amber/[0.13] font-semibold text-white" : "font-medium text-ink-soft"
                )}
              >
                <span
                  className="ml-[1px] mr-[11px] h-4 w-[3px] flex-none rounded-[3px]"
                  style={{ background: isActive ? "#E8920C" : "transparent" }}
                />
                <span className="flex-1 text-left">{item.label}</span>
                {badge ? (
                  <span
                    className={cn(
                      "rounded-[7px] px-[7px] py-px font-mono text-[10.5px] font-bold",
                      isActive ? "bg-amber text-ink" : "bg-ink-3 text-ink-muted-2"
                    )}
                  >
                    {badge}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </div>
      ))}
    </aside>
  );
}
