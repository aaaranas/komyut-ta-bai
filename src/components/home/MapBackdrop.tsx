/**
 * Faint, page-wide transit-map motif for the landing background: a few long
 * flowing route lines and sparse stops in a neutral tone at very low opacity.
 * Sits over the gradient mesh, beneath all content — enough to feel like a map
 * without distracting. Adapts to light/dark via currentColor (foreground).
 */
export default function MapBackdrop() {
  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 h-full w-full text-foreground"
      viewBox="0 0 1200 800"
      preserveAspectRatio="xMidYMid slice"
      fill="none"
    >
      <g
        stroke="currentColor"
        strokeOpacity="0.06"
        strokeWidth="2"
        strokeLinecap="round"
      >
        <path d="M-60 180 C 220 110 400 270 640 205 S 1060 120 1270 225" />
        <path d="M-60 520 C 230 610 470 455 710 545 S 1050 645 1270 535" />
        <path d="M-60 360 C 320 345 540 405 840 360 S 1110 340 1270 385" />
        <path d="M150 -60 C 230 210 430 330 500 575 S 580 830 620 920" />
        <path d="M780 -60 C 820 230 1000 365 1040 610 S 1100 830 1120 920" />
      </g>
      <g fill="currentColor" fillOpacity="0.08">
        <circle cx="220" cy="118" r="5" />
        <circle cx="640" cy="205" r="5" />
        <circle cx="500" cy="575" r="5" />
        <circle cx="840" cy="360" r="5" />
        <circle cx="710" cy="545" r="5" />
        <circle cx="1040" cy="610" r="5" />
      </g>
    </svg>
  );
}
