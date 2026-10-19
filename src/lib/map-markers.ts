/**
 * DOM markers in the same vocabulary as the trip timeline: a ring for the
 * origin, a square for the destination, small dots for stops and alerts.
 * Classes resolve against the app theme, so markers follow light and dark.
 */
export function endpointMarker(kind: "origin" | "destination"): HTMLElement {
  const element = document.createElement("div");
  element.className =
    kind === "origin"
      ? "size-4 rounded-full border-[3px] border-foreground bg-background shadow-[0_0_0_2px_var(--background)]"
      : "size-4 rounded-[3px] bg-foreground shadow-[0_0_0_2px_var(--background)]";
  return element;
}

export function dotMarker(color: string, size: number, filled = true): HTMLElement {
  const element = document.createElement("div");
  element.style.width = `${size}px`;
  element.style.height = `${size}px`;
  element.style.borderRadius = "9999px";
  element.style.backgroundColor = filled ? color : "var(--background)";
  element.style.border = `${filled ? 2 : 3}px solid ${filled ? "var(--background)" : color}`;
  return element;
}
