/** RFC 4180 CSV: fields with commas, quotes, or newlines are quoted, quotes doubled. */
export function toCsv<T extends Record<string, unknown>>(rows: readonly T[], columns: readonly (keyof T & string)[]): string {
  const cell = (value: unknown) => {
    if (value === null || value === undefined) return "";
    const text = typeof value === "number" ? (Number.isFinite(value) ? String(Math.round(value * 1000) / 1000) : "") : String(value);
    // Leading =, +, -, @ would run as formulas in spreadsheets.
    const safe = /^[=+\-@]/.test(text) && typeof value !== "number" ? `'${text}` : text;
    return /[",\r\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
  };
  return [columns.join(","), ...rows.map((row) => columns.map((column) => cell(row[column])).join(","))].join("\r\n") + "\r\n";
}
