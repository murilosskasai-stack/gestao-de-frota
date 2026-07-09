import Link from "next/link";
import { cn } from "@/lib/utils";

export function TableShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-[13px] border border-card-border bg-white">
      {children}
    </div>
  );
}

export function TableHead({
  columns,
  labels,
}: {
  columns: string;
  labels: string[];
}) {
  return (
    <div
      className="grid gap-3.5 border-b border-card-border-2 bg-table-head px-5 py-[13px] text-[11.5px] font-bold uppercase tracking-[.5px] text-text-muted-2"
      style={{ gridTemplateColumns: columns }}
    >
      {labels.map((l) => (
        <span key={l}>{l}</span>
      ))}
    </div>
  );
}

export function TableRow({
  columns,
  href,
  className,
  children,
}: {
  columns: string;
  href?: string;
  className?: string;
  children: React.ReactNode;
}) {
  const content = (
    <div
      className={cn(
        "grid items-center gap-3.5 border-b border-row-border px-5 py-[14px] last:border-b-0",
        href && "cursor-pointer hover:bg-table-head",
        className
      )}
      style={{ gridTemplateColumns: columns }}
    >
      {children}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        {content}
      </Link>
    );
  }
  return content;
}
