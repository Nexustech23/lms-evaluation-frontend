// Parts inside one question ("Q1 has ten parts of 2 marks"). Pure helpers, no imports.
// A rubric row gets `parts: [{ label, maxMarks, guidelines }]` and `partGroups` (the same
// "answer N of these" groups used between questions, here between parts). The row's maxMarks is the
// counted maximum of its parts, and a row with parts has no parameters.
const num = (value) => Number(value) || 0;
const ROMAN = ["i", "ii", "iii", "iv", "v", "vi", "vii", "viii", "ix", "x", "xi", "xii", "xiii", "xiv", "xv",
  "xvi", "xvii", "xviii", "xix", "xx"];

export const partLabel = (index) => `(${ROMAN[index] ?? index + 1})`;

const round2 = (value) => Math.round(value * 100) / 100;

/** Make `count` parts of `marksEach` marks, labelled (i), (ii), ... */
export function splitIntoParts(count, marksEach) {
  const n = Math.max(2, Math.floor(num(count)));
  return Array.from({ length: n }, (_, i) => ({ label: partLabel(i), maxMarks: round2(num(marksEach)), guidelines: "" }));
}

/** The question's maximum: parts outside any group plus answerN x marks for each group. */
export function partsMax(parts, groups) {
  const grouped = new Set((groups || []).flatMap((group) => group.questions));
  let total = (parts || []).reduce((sum, part, index) => (grouped.has(index + 1) ? sum : sum + num(part.maxMarks)), 0);
  for (const group of groups || []) total += num(group.answerN) * num((parts || [])[group.questions[0] - 1]?.maxMarks);
  return round2(total);
}

/** Plain-words problems with the parts themselves (groups are checked separately). */
export function partErrors(parts) {
  const errors = [];
  const seen = new Set();
  (parts || []).forEach((part, index) => {
    const name = `Part ${index + 1}`;
    const label = String(part.label ?? "").trim();
    if (!label) errors.push(`${name}: add a label such as (i)`);
    else if (seen.has(label.toLowerCase())) errors.push(`${name}: the label ${label} is used twice`);
    seen.add(label.toLowerCase());
    if (!(num(part.maxMarks) > 0)) errors.push(`${name}: max marks must be greater than 0`);
  });
  if ((parts || []).length < 2) errors.push("A question with parts needs at least two parts");
  return errors;
}

export function updatePart(parts, index, field, value) {
  return parts.map((part, i) => (i === index ? { ...part, [field]: value } : part));
}

export function addPart(parts) {
  const last = parts[parts.length - 1];
  return [...parts, { label: partLabel(parts.length), maxMarks: last ? num(last.maxMarks) : 1, guidelines: "" }];
}

/** Remove one part and keep the groups pointing at the right parts. */
export function removePart(parts, groups, index) {
  const row = index + 1;
  const nextGroups = (groups || [])
    .map((group) => {
      const questions = group.questions.filter((q) => q !== row).map((q) => (q > row ? q - 1 : q));
      const answerN = Math.min(Math.max(group.answerN, 1), Math.max(questions.length - 1, 1));
      return { ...group, questions, answerN };
    })
    .filter((group) => group.questions.length >= 2);
  return { parts: parts.filter((_, i) => i !== index), groups: nextGroups };
}

/** The question row with these parts: max marks follow the parts and parameters are cleared. */
export function applyParts(row, parts, groups) {
  return { ...row, parts, partGroups: groups, maxMarks: partsMax(parts, groups), parameters: [] };
}

/** Back to one undivided question (the max marks stay as they were). */
export function clearParts(row) {
  const { parts, partGroups, ...rest } = row;
  return rest;
}

/** Parts as loaded from a saved rubric row. */
export function loadParts(saved) {
  if (!Array.isArray(saved?.parts) || saved.parts.length === 0) return {};
  return {
    parts: saved.parts.map((part) => ({ label: String(part.label), maxMarks: num(part.maxMarks), guidelines: part.guidelines ?? "" })),
    partGroups: (saved.partGroups || []).map((group) => ({
      id: String(group.id), questions: [...group.questions].map(Number).sort((a, b) => a - b),
      answerN: Number(group.answerN) || 1, rule: "best" })),
  };
}
