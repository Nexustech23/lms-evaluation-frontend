// Choice groups: "the student answers N of these questions". Pure helpers, no imports.
// Shape (matches the backend `choiceGroups` rubric field):
//   { id: "g1", questions: [4, 5], answerN: 1, rule: "best" }   // questions are 1-based rubric rows
const num = (value) => Number(value) || 0;

/** Normalise groups loaded from the server (or nothing) into an editable list. */
export function loadGroups(saved) {
  if (!Array.isArray(saved)) return [];
  return saved.map((group) => ({
    id: String(group.id),
    questions: [...(group.questions || [])].map(Number).sort((a, b) => a - b),
    answerN: Number(group.answerN) || 1,
    rule: "best",
  }));
}

/** The most a student can earn: required rows plus answerN x marks for each group. */
export function countedMax(rows, groups) {
  const grouped = new Set((groups || []).flatMap((group) => group.questions));
  let total = rows.reduce((sum, row, index) => (grouped.has(index + 1) ? sum : sum + num(row.maxMarks)), 0);
  for (const group of groups || []) {
    total += num(group.answerN) * num(rows[group.questions[0] - 1]?.maxMarks);
  }
  return Math.round(total * 1e6) / 1e6;
}

/** Human-readable problems with the current groups ([] when they are fine). */
export function groupErrors(rows, groups) {
  const errors = [];
  const seen = new Set();
  (groups || []).forEach((group, index) => {
    const name = `Group ${index + 1}`;
    const questions = group.questions || [];
    if (questions.length < 2) errors.push(`${name}: choose at least two questions`);
    if (questions.some((q) => q < 1 || q > rows.length)) errors.push(`${name}: a chosen question is not in the rubric`);
    if (questions.some((q) => seen.has(q))) errors.push(`${name}: a question can belong to only one group`);
    questions.forEach((q) => seen.add(q));
    if (questions.length >= 2 && !(group.answerN >= 1 && group.answerN < questions.length))
      errors.push(`${name}: the number to answer must be at least 1 and fewer than the questions chosen`);
    const maxima = new Set(questions.map((q) => num(rows[q - 1]?.maxMarks)));
    if (maxima.size > 1) errors.push(`${name}: every question in a group must have the same max marks`);
  });
  return errors;
}

/** { row number: "Group 1: any 2 of 3" } for the small badge on each question. */
export function groupBadges(groups) {
  const badges = {};
  (groups || []).forEach((group, index) => {
    group.questions.forEach((q) => {
      badges[q] = `Group ${index + 1}: any ${group.answerN} of ${group.questions.length}`;
    });
  });
  return badges;
}

const nextId = (groups) => {
  let n = groups.length + 1;
  while (groups.some((group) => group.id === `g${n}`)) n += 1;
  return `g${n}`;
};

export function addGroup(groups) {
  return [...groups, { id: nextId(groups), questions: [], answerN: 1, rule: "best" }];
}

export function removeGroup(groups, id) {
  return groups.filter((group) => group.id !== id);
}

/** Questions already used by a different group (they cannot be picked again). */
export function takenByOthers(groups, id) {
  return new Set(groups.filter((group) => group.id !== id).flatMap((group) => group.questions));
}

/** Tick or untick a question in a group; keeps the "answer N" number valid. */
export function toggleQuestion(groups, id, row) {
  return groups.map((group) => {
    if (group.id !== id) return group;
    if (takenByOthers(groups, id).has(row)) return group;
    const has = group.questions.includes(row);
    const questions = (has ? group.questions.filter((q) => q !== row) : [...group.questions, row]).sort((a, b) => a - b);
    const answerN = questions.length >= 2 ? Math.min(Math.max(group.answerN, 1), questions.length - 1) : group.answerN;
    return { ...group, questions, answerN };
  });
}

export function setAnswerN(groups, id, value) {
  return groups.map((group) => (group.id === id ? { ...group, answerN: Math.floor(num(value)) } : group));
}

/** Drop choices that point past the last row (for example after the question count changes). */
export function pruneForRowCount(groups, count) {
  return (groups || [])
    .map((group) => ({ ...group, questions: group.questions.filter((q) => q <= count) }))
    .filter((group) => group.questions.length > 0);
}

const score = (question) => Number(question.final_marks ?? question.ai_awarded_marks) || 0;

/** A question outside any group, or one the backend marked counted, counts towards the total. */
export const isCounted = (question) => question.counted !== false;

/**
 * Best N of each group count (a tie goes to the earlier question). Mirrors the backend so the
 * review dialog's totals move as soon as a faculty adjustment changes who ranks highest.
 * Returns new objects; the input is not changed.
 */
export function reselectCounted(questions) {
  const copies = (questions || []).map((question) => ({ ...question }));
  const byGroup = {};
  copies.forEach((question) => {
    if (!question.choice_group) return;
    const id = question.choice_group.id;
    byGroup[id] = byGroup[id] || [];
    byGroup[id].push(question);
  });
  Object.values(byGroup).forEach((members) => {
    const keep = members[0].choice_group.answer_n;
    const ranked = [...members].sort((a, b) => score(b) - score(a) || a.question_no - b.question_no);
    const winners = new Set(ranked.slice(0, keep));
    members.forEach((question) => { question.counted = winners.has(question); });
  });
  return copies;
}
