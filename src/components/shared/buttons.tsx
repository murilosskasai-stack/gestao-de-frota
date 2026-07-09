import { cn } from "@/lib/utils";
import Link from "next/link";
import type { ButtonHTMLAttributes } from "react";

const base =
  "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-[9px] text-[13px] font-sans cursor-pointer disabled:cursor-not-allowed disabled:opacity-60";

const variants = {
  primary: "border-none bg-ink text-white font-semibold",
  amber: "border-none bg-amber text-ink font-bold",
  outline: "border border-input-border bg-white text-[#3a3f47] font-semibold",
  ghost: "border-none bg-transparent text-text-muted font-semibold",
};

export function Button({
  variant = "primary",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: keyof typeof variants }) {
  return <button className={cn(base, variants[variant], className)} {...props} />;
}

export function LinkButton({
  variant = "primary",
  className,
  href,
  children,
}: {
  variant?: keyof typeof variants;
  className?: string;
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className={cn(base, variants[variant], className)}>
      {children}
    </Link>
  );
}
