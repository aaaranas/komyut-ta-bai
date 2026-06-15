"use client";

import { Map, Navigation, Route } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/", label: "Plan", Icon: Navigation, match: (p: string) => p === "/" },
  {
    href: "/routes",
    label: "Routes",
    Icon: Route,
    match: (p: string) => p.startsWith("/routes"),
  },
  {
    href: "/map",
    label: "Map",
    Icon: Map,
    match: (p: string) => p.startsWith("/map"),
  },
];

export default function MainNav() {
  const pathname = usePathname();
  return (
    <nav className="flex items-center gap-0.5">
      {LINKS.map(({ href, label, Icon, match }) => {
        const active = match(pathname);
        return (
          <Link
            key={href}
            href={href}
            aria-label={label}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex min-h-10 items-center gap-1.5 rounded-lg px-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="size-4" />
            <span className="hidden min-[420px]:inline">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
