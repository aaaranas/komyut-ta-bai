/**
 * Decorative transit-network illustration for the hero — stylized route lines
 * and station dots that evoke a multimodal transport map. Purely visual; sits
 * behind the hero content. Inline SVG so it works offline and scales crisply.
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
        strokeOpacity="0.18"
        strokeWidth="2.5"
        strokeLinecap="round"
      >
        <path d="M-20 70 C 60 50 120 110 200 95 S 360 72 420 95" />
        <path d="M-20 212 C 70 232 150 180 220 214 S 350 250 420 220" />
        <path d="M60 -20 C 90 70 150 110 165 200 S 190 300 210 340" />
      </g>
      <g
        stroke="var(--gold)"
        strokeOpacity="0.5"
        strokeWidth="2.5"
        strokeLinecap="round"
      >
        <path d="M-20 140 C 80 130 170 166 270 146 S 380 160 420 150" />
      </g>
      <g fill="white" fillOpacity="0.4">
        <circle cx="60" cy="55" r="3.5" />
        <circle cx="200" cy="95" r="3.5" />
        <circle cx="360" cy="78" r="3.5" />
        <circle cx="70" cy="228" r="3.5" />
        <circle cx="220" cy="214" r="3.5" />
        <circle cx="165" cy="200" r="3.5" />
      </g>
      <g fill="var(--gold)" fillOpacity="0.85">
        <circle cx="80" cy="133" r="3.5" />
        <circle cx="270" cy="146" r="3.5" />
      </g>
    </svg>
  );
}
