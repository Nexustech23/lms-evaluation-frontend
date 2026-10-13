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
