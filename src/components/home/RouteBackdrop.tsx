/**
 * Calm sea-wave motif for the hero — a few gentle, evenly spaced swells with a
 * single gold accent line, evoking Cebu's coast and ferry crossings. Purely
 * decorative; sits behind the hero content at low opacity. Inline SVG so it
 * works offline and scales crisply.
 */
export default function RouteBackdrop() {
  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 h-full w-full"
      viewBox="0 0 400 300"
      preserveAspectRatio="xMidYMid slice"
      fill="none"
    >
      <g
        stroke="white"
        strokeOpacity="0.14"
        strokeWidth="2"
        strokeLinecap="round"
      >
        <path d="M-20 96 Q 60 78 140 96 T 300 96 T 460 96" />
        <path d="M-20 150 Q 70 132 150 150 T 320 150 T 480 150" />
        <path d="M-20 204 Q 60 186 140 204 T 300 204 T 460 204" />
      </g>
      <g
        stroke="var(--gold)"
        strokeOpacity="0.5"
        strokeWidth="2"
        strokeLinecap="round"
      >
        <path d="M-20 123 Q 65 105 145 123 T 310 123 T 480 123" />
      </g>
    </svg>
  );
}
