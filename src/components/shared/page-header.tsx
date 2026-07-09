import Link from "next/link";

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-[22px] flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-[27px] font-extrabold tracking-[-0.3px]">{title}</h1>
        {subtitle ? <p className="mt-[6px] text-[13.5px] text-text-muted">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex gap-[9px]">{actions}</div> : null}
    </div>
  );
}

export function BackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="mb-4 inline-flex items-center gap-[7px] text-[13px] font-semibold text-text-muted hover:text-text"
    >
      ← {label}
    </Link>
  );
}
