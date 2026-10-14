import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Display helper: round a number to at most 2 decimals without trailing zeros
// (31.400000000000002 -> "31.4", 37.85 -> "37.85", 50 -> "50"). Display only —
// stored marks and all calculations keep their full precision.
export function fmt2(value) {
  if (value === null || value === undefined || value === "") return value;
  const n = Number(value);
  if (!Number.isFinite(n)) return value;
  return String(Math.round((n + Number.EPSILON) * 100) / 100);
}

// Compact pagination: always show the first and last page and the pages around
// the current one, with "…" for skipped ranges, e.g. 1 … 7 8 9 … 57.
// Returns at most 7 entries; for 7 pages or fewer every page number is shown.
export function getPageNumbers(current, total) {
  if (!total || total < 1) return [1];
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set([1, total, current - 1, current, current + 1]);
  if (current <= 3) [2, 3, 4].forEach((n) => pages.add(n));
  if (current >= total - 2) [total - 3, total - 2, total - 1].forEach((n) => pages.add(n));
  const sorted = [...pages].filter((n) => n >= 1 && n <= total).sort((a, b) => a - b);
  const out = [];
  sorted.forEach((n, i) => {
    if (i > 0) {
      const gap = n - sorted[i - 1];
      if (gap === 2) out.push(n - 1);
      else if (gap > 2) out.push("…");
    }
    out.push(n);
  });
  return out;
}
