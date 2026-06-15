import { STOP_TYPE_CONFIG } from "@/lib/constants";
import type { StopType } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * Inline badge marking a stop's kind. Street stops are unremarkable, so they
 * render nothing — only terminals and ports get highlighted.
 */
export default function StopTypeBadge({
  type,
  className,
}: {
  type: StopType;
  className?: string;
}) {
  if (type === "street_stop") return null;
  const config = STOP_TYPE_CONFIG[type];
  const Icon = config.Icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
        config.badge,
        className
      )}
    >
      <Icon className="size-3" />
      {config.label}
    </span>
  );
}
