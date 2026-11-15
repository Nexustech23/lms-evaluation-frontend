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
