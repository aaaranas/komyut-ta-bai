"use client";

import { BellRing, Megaphone, Navigation, Route, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useConditions } from "@/components/providers/ConditionsProvider";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/", label: "Plan", Icon: Navigation, match: (p: string) => p === "/" || p.startsWith("/plan") },
  { href: "/alerts", label: "Alerts", Icon: BellRing, match: (p: string) => p.startsWith("/alerts") },
  { href: "/report", label: "Report", Icon: Megaphone, match: (p: string) => p.startsWith("/report") },
  { href: "/routes", label: "Routes", Icon: Route, match: (p: string) => p.startsWith("/routes") },
  { href: "/privacy", label: "Privacy", Icon: ShieldCheck, match: (p: string) => p.startsWith("/privacy") },
];

function useActiveAlertCount(): number {
  const { snapshot } = useConditions();
  return snapshot?.events.length ?? 0;
}

function AlertCount({ count, className }: { count: number; className?: string }) {
  if (count === 0) return null;
  return (
    <span
      className={cn(
        "grid min-w-4 place-items-center rounded-full bg-destructive px-1 text-[10px] font-bold leading-4 text-destructive-foreground",
        className
      )}
    >
      {count > 9 ? "9+" : count}
    </span>
  );
}

/** Inline navigation for wider screens. */
export function DesktopNav() {
  const pathname = usePathname();
  const alerts = useActiveAlertCount();
  return (
    <nav aria-label="Main" className="hidden items-center gap-0.5 md:flex">
      {LINKS.map(({ href, label, Icon, match }) => {
        const active = match(pathname);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex min-h-10 items-center gap-1.5 rounded-lg px-3 text-sm font-medium transition-colors",
              active ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="size-4" />
            {label}
            {href === "/alerts" && <AlertCount count={alerts} />}
          </Link>
        );
      })}
    </nav>
  );
}

/** Thumb-reachable tab bar on phones; Report sits in the middle and stands out. */
export function MobileTabBar() {
  const pathname = usePathname();
  const alerts = useActiveAlertCount();
  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-40 border-t bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
    >
      <ul className="mx-auto grid max-w-md grid-cols-5">
        {LINKS.map(({ href, label, Icon, match }) => {
          const active = match(pathname);
          const isReport = href === "/report";
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex min-h-16 flex-col items-center justify-center gap-1 text-[11px] font-medium",
                  active ? "text-primary" : "text-muted-foreground"
                )}
              >
                <span
                  className={cn(
                    "relative grid place-items-center rounded-full transition-colors",
                    isReport ? "size-10 bg-primary text-primary-foreground shadow-sm" : "size-7"
                  )}
                >
                  <Icon className={isReport ? "size-5" : "size-5"} />
                  {href === "/alerts" && <AlertCount count={alerts} className="absolute -right-2 -top-1" />}
                </span>
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
