import { cn } from "@/lib/utils";
import { CHIP_CLASSES } from "@/lib/status";

export function Chip({
  label,
  tone,
  className,
}: {
  label: string;
  tone: keyof typeof CHIP_CLASSES;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded-full px-[11px] py-1 text-[11.5px] font-bold",
        CHIP_CLASSES[tone],
        className
      )}
    >
      {label}
    </span>
  );
}
