import * as React from "react";

/**
 * Custom jeepney glyph drawn in lucide's style (24×24, currentColor stroke,
 * round joins) since lucide has no jeepney — the signature Cebu vehicle.
 * Accepts the same props as a lucide icon, so `className="size-4"` works.
 */
export function Jeepney({
  className,
  ...props
}: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path d="M3 16V9a1 1 0 0 1 1-1h10.3a1 1 0 0 1 .77.36L18 11h1a1 1 0 0 1 1 1v4" />
      <path d="M3 11.5h14.5" />
      <path d="M3 16h3" />
      <path d="M10 16h4" />
      <path d="M18 16h2" />
      <circle cx="8" cy="17.5" r="2" />
      <circle cx="16" cy="17.5" r="2" />
    </svg>
  );
}
