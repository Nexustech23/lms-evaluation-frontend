// Helpers for the CBSE school paper form. Colleges never use these.
export const CBSE_CLASSES = Array.from({ length: 12 }, (_, i) => i + 1);

let nextId = 0;
const sectionId = () => `cbse-${Date.now().toString(36)}-${nextId++}`;

// The board blueprints (Classes 9-12) that exist for one class.
export function boardsForClass(blueprints, classLevel) {
  const level = Number(classLevel);
  return (blueprints?.boards || []).filter((board) => board.class === level);
}

// Classes 1-8 have no CBSE paper pattern, so the backend sends editable starting sections by stage.
export function stageSectionsForClass(blueprints, classLevel) {
  const level = Number(classLevel);
  const stage = Object.values(blueprints?.stages || {}).find((entry) => entry.classes.includes(level));
  if (!stage) return null;
  return stage.sections.map((section) => ({
    id: sectionId(),
    label: section.label,
    bloomLevels: [],
    percent: section.percent,
  }));
}

export function classNote(blueprints, classLevel) {
  const level = Number(classLevel);
  if (!level) return "";
  if (level <= 8) return "CBSE sets no board paper pattern for this class. Start from these sections and edit them below.";
  if (!boardsForClass(blueprints, level).length) return "There is no CBSE blueprint for this class yet. Set the sections below yourself.";
  return "";
}

// ── Editing a CBSE blueprint ─────────────────────────────────────────────────
// The form starts from the official layout and a teacher may change it. A layout is one entry per official section:
// { label, pattern: [[marksEach, questions], ...], choice }. Setting every question count in a section to 0 leaves it out.

const whole = (value) => Number.isInteger(value);

export function layoutFromBoard(board) {
  return (board?.sections || []).map((section) => ({
    label: section.label,
    style: section.style || "",
    kind: section.kind || "",
    pattern: (section.pattern || []).map(([marks, count]) => [marks, count]),
    choice: section.choice ?? null,
  }));
}

export const sectionMarks = (section) => section.pattern.reduce((sum, [marks, count]) => sum + (Number(marks) || 0) * (Number(count) || 0), 0);
export const sectionQuestions = (section) => section.pattern.reduce((sum, [, count]) => sum + (Number(count) || 0), 0);
export const layoutMarks = (layout) => (layout || []).reduce((sum, section) => sum + sectionMarks(section), 0);

// What the server needs back: the numbers only. Labels and wording come from the official blueprint on the server.
export function layoutPayload(layout) {
  return (layout || []).map((section) => ({ pattern: section.pattern, choice: section.choice }));
}

// A message when the edited numbers cannot make a paper, or "" when they can.
export function layoutProblem(layout, total) {
  if (!layout?.length) return "";
  for (const section of layout) {
    for (const [marks, count] of section.pattern) {
      if (!whole(marks) || marks < 1 || marks > 20) return `${section.label}: marks per question must be a whole number from 1 to 20.`;
      if (!whole(count) || count < 0 || count > 100) return `${section.label}: number of questions must be a whole number from 0 to 100.`;
    }
  }
  if (!whole(total) || total < 1) return "Enter the total marks.";
  const marks = layoutMarks(layout);
  if (marks === 0) return "At least one section needs questions.";
  if (marks !== total) return `The sections add up to ${marks} of ${total} marks.`;
  return "";
}

// True when the numbers differ from the official blueprint (the server applies the same rule).
export function isLayoutCustomised(board, layout, total) {
  if (!board) return false;
  if (total !== board.total) return true;
  return board.sections.some((official, index) => {
    const edited = layout?.[index];
    if (!edited) return true;
    if (JSON.stringify(edited.pattern) !== JSON.stringify(official.pattern)) return true;
    return official.choice !== null && official.choice !== undefined && edited.choice !== official.choice;
  });
}

// Keeps internal choice within the number of questions after the teacher changes a count.
export function withCounts(section, patternIndex, field, value) {
  const pattern = section.pattern.map((group, index) => (index === patternIndex ? (field === "marks" ? [value, group[1]] : [group[0], value]) : group));
  const next = { ...section, pattern };
  const count = sectionQuestions(next);
  if (next.choice !== null && next.choice > count) next.choice = count;
  return next;
}

// ── Choosing the blueprint from the batch and subject the teacher already picked ─────────────────────────────────────
const SUBJECT_WORDS = [
  [/math/i, "Mathematics"],
  [/science/i, "Science"],
  [/english/i, "English"],
  [/physics/i, "Physics"],
  [/chemistry/i, "Chemistry"],
];

const ROMAN = { IX: 9, X: 10, XI: 11, XII: 12 };

// Reads a class only from "Class 10", "Grade 12", "Std X" and the like, or from a name that is just a number ("10", "10-A").
// A word like "Semester 1" or "Batch 2026" is never taken for a class.
function classFromText(text) {
  const value = String(text || "").trim();
  const named = value.match(/\b(?:class|grade|std|standard)\s*[-:]?\s*(1[0-2]|[1-9]|XII|XI|IX|X)\b/i);
  if (named) return ROMAN[named[1].toUpperCase()] || Number(named[1]);
  const bare = value.match(/^(1[0-2]|[1-9])(?:\s*[-]?\s*[A-Za-z])?$/);
  return bare ? Number(bare[1]) : null;
}

// The one board blueprint that fits, or null. It never guesses between two.
export function matchBoard(blueprints, { batchName, semester, subjectName } = {}) {
  const level = classFromText(semester) || classFromText(batchName);
  if (!level || !blueprints?.boards) return null;
  const word = SUBJECT_WORDS.find(([pattern]) => pattern.test(subjectName || ""));
  if (!word) return null;
  let candidates = boardsForClass(blueprints, level).filter((board) => board.subject.startsWith(word[1]) || (word[1] === "English" && /english/i.test(board.subject)));
  if (candidates.length > 1) {
    const basic = /basic/i.test(subjectName || "");
    candidates = candidates.filter((board) => /basic/i.test(board.subject) === basic);
  }
  return candidates.length === 1 ? candidates[0] : null;
}
