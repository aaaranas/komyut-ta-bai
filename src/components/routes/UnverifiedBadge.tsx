import { TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";

export default function UnverifiedBadge({
  className,
}: {
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-300",
        className
      )}
    >
      <TriangleAlert className="size-3" />
      unverified
    </span>
  );
}
