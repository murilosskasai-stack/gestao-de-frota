"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MODULE_PATH, navForRole, type ModuleKey } from "@/lib/roles";
import type { UserRole } from "@/lib/supabase/database.types";
import { cn } from "@/lib/utils";

export function MobileNav({
  role,
  badges,
}: {
  role: UserRole;
  badges?: Partial<Record<ModuleKey, number>>;
}) {
  const pathname = usePathname();
  const items = navForRole(role).flatMap((g) => g.items);

  return (
    <nav className="flex flex-none gap-2 overflow-x-auto border-b border-card-border bg-white px-3 py-2.5 lg:hidden">
      {items.map((item) => {
        const isActive = pathname.startsWith(MODULE_PATH[item.key]);
        const badge = badges?.[item.key];
        return (
          <Link
            key={item.key}
            href={MODULE_PATH[item.key]}
            className={cn(
              "flex flex-none items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-[12.5px] font-semibold",
              isActive ? "bg-ink text-white" : "bg-app-bg text-text-soft"
            )}
          >
            {item.label}
            {badge ? (
              <span
                className={cn(
                  "rounded-md px-1.5 py-px font-mono text-[10px] font-bold",
                  isActive ? "bg-amber text-ink" : "bg-white text-text-muted-2"
                )}
              >
                {badge}
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
