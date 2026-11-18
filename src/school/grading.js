// A school grades each student by their own percentage: it falls in a band and the band is the grade. These are the pure
// rules (no React, no network) the Grading page uses, and they mirror the server's checks so the page can say what is
// wrong before saving. The server stays the judge; it checks again on save.

export const MAX_BANDS = 20;
export const MAX_GRADE_LENGTH = 8;
export const MAX_GRADE_POINT = 10;

const toNumber = (value) => (value === "" || value === null || value === undefined ? NaN : Number(value));

// Highest marks first; a band with no marks yet sorts last.
export function sortedBands(bands) {
  const key = (band) => {
    const n = toNumber(band.min);
    return Number.isFinite(n) ? n : -Infinity;
  };
  return [...bands].sort((a, b) => key(b) - key(a));
}

// The band a percentage falls in: the highest band whose lowest marks it reaches. Null when there is no usable percentage.
export function gradeFor(percentage, bands) {
  const value = toNumber(percentage);
  if (!Number.isFinite(value)) return null;
  const usable = sortedBands(bands).filter((band) => Number.isFinite(toNumber(band.min)));
  if (!usable.length) return null;
  return usable.find((band) => value >= toNumber(band.min)) || usable[usable.length - 1];
}

// What the page shows for each band, highest first: the marks it starts at and the marks it stops below.
export function rangesOf(bands) {
  const sorted = sortedBands(bands);
  return sorted.map((band, index) => ({
    band,
    from: toNumber(band.min),
    below: index === 0 ? null : toNumber(sorted[index - 1].min),
  }));
}

// The first thing wrong with a grading setup, as a sentence for the faculty, or null when it can be saved.
export function validateScale({ pass, bands }) {
  const passMark = toNumber(pass);
  if (!Number.isFinite(passMark) || passMark < 0 || passMark > 100) return "The pass mark must be between 0 and 100.";
  if (!bands.length) return "Add at least one grade.";
  if (bands.length > MAX_BANDS) return `Use at most ${MAX_BANDS} grades.`;

  const seen = new Set();
  for (const band of bands) {
    const name = String(band.grade ?? "").trim();
    if (!name) return "Every grade needs a name.";
    if (name.length > MAX_GRADE_LENGTH) return `The grade name "${name}" is longer than ${MAX_GRADE_LENGTH} characters.`;
    if (seen.has(name.toLowerCase())) return `The grade "${name}" is listed twice.`;
    seen.add(name.toLowerCase());

    const min = toNumber(band.min);
    if (!Number.isFinite(min) || min < 0 || min > 100) return `Marks for ${name} must be a number from 0 to 100.`;
    const point = toNumber(band.point);
    if (!Number.isFinite(point) || point < 0 || point > MAX_GRADE_POINT) return `The grade point for ${name} must be from 0 to ${MAX_GRADE_POINT}.`;
  }

  const sorted = sortedBands(bands);
  for (let i = 1; i < sorted.length; i += 1) {
    if (toNumber(sorted[i].min) === toNumber(sorted[i - 1].min)) {
      return `${sorted[i - 1].grade} and ${sorted[i].grade} start at the same marks.`;
    }
  }
  if (toNumber(sorted[sorted.length - 1].min) !== 0) {
    return `The lowest grade (${sorted[sorted.length - 1].grade}) must start at 0 so every mark has a grade.`;
  }
  return null;
}

// What the server expects.
export function toPayload({ pass, bands }) {
  return {
    pass_percentage: Number(pass),
    bands: sortedBands(bands).map((band) => ({
      grade: String(band.grade).trim(),
      min_percentage: Number(band.min),
      grade_point: Number(band.point),
    })),
  };
}

let counter = 0;
export const newKey = () => `band-${(counter += 1)}`;

// A band as the page edits it: text inputs hold strings, and a key keeps a row steady while its name is typed.
export function fromServer(band) {
  return { key: newKey(), grade: band.grade, min: String(band.min_percentage), point: String(band.grade_point) };
}

export const blankBand = () => ({ key: newKey(), grade: "", min: "", point: "" });
