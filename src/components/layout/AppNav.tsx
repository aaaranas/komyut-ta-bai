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

function useAlertCount(): number {
  return useConditions().snapshot?.events.length ?? 0;
}

/** Text navigation for wider screens. */
export function DesktopNav() {
  const pathname = usePathname();
  const alerts = useAlertCount();
  return (
    <nav aria-label="Main" className="hidden items-center gap-5 md:flex">
      {LINKS.map(({ href, label, match }) => {
        const active = match(pathname);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "text-sm transition-colors",
              active ? "font-semibold text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {label}
            {href === "/alerts" && alerts > 0 && <span className="ml-1 tabular-nums text-muted-foreground">{alerts}</span>}
          </Link>
        );
      })}
    </nav>
  );
}

/** Thumb-reachable tab bar on phones. */
export function MobileTabBar() {
  const pathname = usePathname();
  const alerts = useAlertCount();
  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
    >
      <ul className="mx-auto grid max-w-md grid-cols-5">
        {LINKS.map(({ href, label, Icon, match }) => {
          const active = match(pathname);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-15 flex-col items-center justify-center gap-1 text-[11px]",
                  active ? "font-semibold text-foreground" : "text-muted-foreground"
                )}
              >
                <span className="relative">
                  <Icon className="size-5" />
                  {href === "/alerts" && alerts > 0 && (
                    <span className="absolute -right-1.5 -top-1 size-2 rounded-full bg-destructive" aria-label={`${alerts} active`} />
                  )}
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
