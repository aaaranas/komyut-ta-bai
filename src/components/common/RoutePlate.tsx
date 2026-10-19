import type { Route } from "@/core/transit/types";
import { MODE_CONFIG, routeCode } from "@/lib/presentation";
import { cn } from "@/lib/utils";

/** A route's code on its line color, like the plate on the vehicle. */
export default function RoutePlate({
  route,
  size = "md",
  className,
}: {
  route: Route;
  size?: "sm" | "md";
  className?: string;
}) {
  const mode = MODE_CONFIG[route.mode];
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-[5px] font-extrabold leading-none tabular-nums tracking-tight",
        size === "sm" ? "h-5 min-w-8 px-1.5 text-[11px]" : "h-7 min-w-11 px-2 text-sm",
        className
      )}
      style={{ backgroundColor: mode.hex, color: mode.ink }}
      title={mode.label}
    >
      {routeCode(route)}
    </span>
  );
}
