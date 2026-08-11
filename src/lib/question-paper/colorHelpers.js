/** Convert a hex color to rgba with the given alpha (0–1). */
export function withAlpha(hex = "#ff7f10", alpha = 1) {
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** Darken a hex color by `amount` (0–1). */
export function darkenColor(hex = "#ff7f10", amount = 0.3) {
  const h = hex.replace("#", "");
  const r = Math.max(0, Math.floor(parseInt(h.substring(0, 2), 16) * (1 - amount)));
  const g = Math.max(0, Math.floor(parseInt(h.substring(2, 4), 16) * (1 - amount)));
  const b = Math.max(0, Math.floor(parseInt(h.substring(4, 6), 16) * (1 - amount)));
  return `rgb(${r}, ${g}, ${b})`;
}