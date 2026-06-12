"use client";

import type { Preference } from "@/lib/types";

const OPTIONS: Preference[] = ["fastest", "cheapest"];

export default function PreferenceToggle({
  value,
  onChange,
}: {
  value: Preference;
  onChange: (preference: Preference) => void;
}) {
  return (
    <div
      role="group"
      aria-label="Route preference"
      className="mt-4 grid grid-cols-2 gap-1 rounded-xl bg-gray-100 p-1"
    >
      {OPTIONS.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          aria-pressed={value === option}
          className={`min-h-11 rounded-lg text-sm font-semibold capitalize transition ${
            value === option
              ? "bg-white text-primary shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
