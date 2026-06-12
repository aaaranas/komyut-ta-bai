"use client";

export default function SwapButton({ onSwap }: { onSwap: () => void }) {
  return (
    <button
      type="button"
      aria-label="Swap origin and destination"
      onClick={onSwap}
      className="flex h-11 w-11 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-600 transition hover:border-primary hover:text-primary"
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M7 16V4m0 0L3 8m4-4 4 4" />
        <path d="M17 8v12m0 0 4-4m-4 4-4-4" />
      </svg>
    </button>
  );
}
