/** Only an explicit null means no saved rubric; malformed responses are errors. */
export function sequentialPaperBlocks(text, count) {
  if (typeof text !== "string") return [];
  const matches = [...text.matchAll(/^\s*Q(\d+)[.)]\s*(?!\d)/gm)];
  // Prefilling is only a convenience for legacy sequential papers. All other
  // layouts use the server's verified mapping; never shift marks/COs by index.
  if (matches.length !== count || matches.some((match, i) => Number(match[1]) !== i + 1)) return [];
  return matches.map((match, i) => text.slice(match.index, matches[i + 1]?.index ?? text.length));
}

export function savedRubricRows(data) {
  if (data?.success !== true) throw new Error("Could not load saved evaluation parameters.");
  if (data.evaluation === null) return null;
  const rows = data.evaluation?.questionEvaluationDetails;
  if (!Array.isArray(rows) || rows.length === 0) {
    throw new Error("Saved evaluation parameters are incomplete. Reload before editing.");
  }
  return rows;
}

/** Applying a draft is an explicit, local edit; saving still requires confirmation. */
export function applyRubricSuggestion(current, suggestion, { includeCOs = false } = {}) {
  if (suggestion.status !== "draft_ready" || !suggestion.parameters?.length ||
      !Number.isFinite(suggestion.max_marks) || suggestion.max_marks <= 0 ||
      !Number.isFinite(suggestion.min_marks) || suggestion.min_marks < 0 ||
      suggestion.min_marks > suggestion.max_marks) {
    throw new Error("This question needs clarification before its draft can be applied.");
  }
  const names = suggestion.parameters.map((p) => p.name?.trim().toLowerCase());
  const total = suggestion.parameters.reduce((sum, p) => sum + p.percentage, 0);
  if (!names.every(Boolean) || new Set(names).size !== names.length ||
      suggestion.parameters.some((p) => !Number.isFinite(p.percentage) || p.percentage <= 0 || p.percentage > 100) ||
      Math.abs(total - 100) > 1e-7) throw new Error("Invalid parameter suggestion.");
  const next = { ...current, minMarks: suggestion.min_marks, maxMarks: suggestion.max_marks,
    guidelines: suggestion.guidelines,
    parameters: suggestion.parameters.map((p) => ({ ...p, isCustom: true })) };
  for (const key of ["question_id", "question_label", "section", "question_text"]) {
    if (typeof suggestion[key] === "string") next[key] = suggestion[key];
  }
  if (includeCOs) {
    const tags = (suggestion.co_tags || []).filter((tag) => tag.eligible);
    next.cos = tags.map((tag) => ({ co_code: tag.co_code, description: tag.description,
      // No fabricated equal split. Existing allocations survive only if the
      // maximum and complete CO set are unchanged.
      marks: tags.length === 1 ? suggestion.max_marks :
        (Number(current.maxMarks) === suggestion.max_marks &&
         current.cos?.length === tags.length && tags.every((t) => current.cos.some((co) => co.co_code === t.co_code))
          ? current.cos.find((co) => co.co_code === tag.co_code)?.marks ?? "" : "") }));
  }
  return next;
}

/** Prepare all edits before updating React state; unresolved questions stay intact. */
export function applyRubricSuggestions(current, suggestions, options = {}) {
  if (!Array.isArray(suggestions) || suggestions.length !== current.length ||
      suggestions.some((q, index) => q.question_no !== index + 1)) {
    throw new Error("The question count or order changed. Reload before filling parameters.");
  }
  const warnings = {};
  let appliedCount = 0;
  const questions = current.map((question, index) => {
    const draft = suggestions[index];
    const notes = [...(draft.notes || [])];
    if (draft.status !== "draft_ready") {
      warnings[index] = [...notes, "Complete this question manually; AI could not resolve its requirements."].join(" ");
      if (!draft.question_id) return question;
      return { ...question, question_id: draft.question_id, question_label: draft.question_label,
        section: draft.section, question_text: draft.question_text };
    }
    const updated = applyRubricSuggestion(question, draft, options);
    appliedCount += 1;
    if (options.includeCOs) {
      if (!updated.cos.length) notes.push("Select the course outcome manually; no available printed CO was found.");
      if (updated.cos.some((co) => co.marks === "")) notes.push("Allocate marks between the course outcomes manually.");
    }
    if (notes.length) warnings[index] = notes.join(" ");
    return updated;
  });
  return { questions, warnings, appliedCount };
}
