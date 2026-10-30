import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const source = await readFile(new URL("../src/lib/rubricSuggestions.js", import.meta.url), "utf8");
const { applyRubricSuggestion, applyRubricSuggestions, savedRubricRows, sequentialPaperBlocks } = await import(`data:text/javascript;base64,${Buffer.from(source).toString("base64")}`);
const draft = () => ({ status: "draft_ready", min_marks: 0, max_marks: 5,
  parameters: [{ name: "Correct method", percentage: 100, isCustom: true }],
  guidelines: "Credit valid steps.", co_tags: [{ co_code: "CO1", eligible: true, description: "Methods" }] });

test("create mode requires an explicit successful no-rubric response", () => {
  assert.equal(savedRubricRows({ success: true, evaluation: null }), null);
  const rows = [{ maxMarks: 2 }];
  assert.equal(savedRubricRows({ success: true, evaluation: { questionEvaluationDetails: rows } }), rows);
});

test("legacy prefill only accepts complete sequential labels", () => {
  const paper = "Q1. First [2 Marks]\nQ2. Second [3 Marks]";
  assert.equal(sequentialPaperBlocks(paper, 2).length, 2);
  assert.deepEqual(sequentialPaperBlocks(paper, 3), []);
  assert.deepEqual(sequentialPaperBlocks("SECTION A\nQ1. First\nSECTION B\nQ1. Second", 2), []);
  assert.deepEqual(sequentialPaperBlocks("Q1. First\nQ3. Third", 2), []);
  assert.deepEqual(sequentialPaperBlocks("1(i) First\n1(ii) Second", 2), []);
});

for (const data of [undefined, { success: false }, { success: true },
  { success: true, evaluation: {} }, { success: true, evaluation: { questionEvaluationDetails: [] } }]) {
  test(`malformed rubric response cannot become create mode: ${JSON.stringify(data)}`, () => {
    assert.throws(() => savedRubricRows(data));
  });
}

test("applying a draft preserves unrelated state and does not mutate inputs", () => {
  const current = { minMarks: 1, maxMarks: 3, guidelines: "Old", parameters: [], cos: [{ co_code: "OLD", marks: 3 }], custom: "keep" };
  const before = structuredClone(current);
  const row = draft();
  const result = applyRubricSuggestion(current, row);
  assert.deepEqual(current, before);
  assert.equal(result.minMarks, 0);
  assert.equal(result.maxMarks, 5);
  assert.equal(result.guidelines, row.guidelines);
  assert.equal(result.custom, "keep");
  assert.deepEqual(result.cos, current.cos);
  assert.notEqual(result.parameters[0], row.parameters[0]);
});

test("one explicit available CO gets the question allocation", () => {
  const result = applyRubricSuggestion({}, draft(), { includeCOs: true });
  assert.equal(result.cos[0].marks, 5);
});

test("multiple COs receive no invented split", () => {
  const row = draft();
  row.co_tags.push({ co_code: "CO2", eligible: true, description: "Application" });
  assert.deepEqual(applyRubricSuggestion({}, row, { includeCOs: true }).cos.map((c) => c.marks), ["", ""]);
});

test("existing multiple CO allocations survive only for the same maximum and set", () => {
  const row = draft();
  row.co_tags.push({ co_code: "CO2", eligible: true, description: "Application" });
  const current = { maxMarks: 5, cos: [{ co_code: "CO1", marks: 2 }, { co_code: "CO2", marks: 3 }] };
  assert.deepEqual(applyRubricSuggestion(current, row, { includeCOs: true }).cos.map((c) => c.marks), [2, 3]);
  current.maxMarks = 6;
  assert.deepEqual(applyRubricSuggestion(current, row, { includeCOs: true }).cos.map((c) => c.marks), ["", ""]);
});

test("unavailable COs cannot be applied", () => {
  const row = draft();
  row.co_tags[0].eligible = false;
  assert.deepEqual(applyRubricSuggestion({}, row, { includeCOs: true }).cos, []);
});

for (const [name, change] of [
  ["clarification", (d) => { d.status = "needs_clarification"; }],
  ["missing maximum", (d) => { d.max_marks = null; }],
  ["over-minimum", (d) => { d.min_marks = 6; }],
  ["wrong percentage total", (d) => { d.parameters[0].percentage = 50; }],
  ["duplicate criteria", (d) => { d.parameters.push({ name: "correct METHOD", percentage: 1 }); }],
  ["nonfinite percentage", (d) => { d.parameters[0].percentage = Infinity; }],
]) test(`reject ${name} without changing existing values`, () => {
  const row = draft();
  change(row);
  const current = { maxMarks: 2 };
  assert.throws(() => applyRubricSuggestion(current, row));
  assert.deepEqual(current, { maxMarks: 2 });
});

test("fill all questions in one edit and retain unrelated fields", () => {
  const current = [{ custom: "keep", maxMarks: 2 }, { custom: "also keep", maxMarks: 3 }];
  const snapshot = structuredClone(current);
  const rows = [1, 2].map((question_no) => ({ ...draft(), question_no }));
  const result = applyRubricSuggestions(current, rows, { includeCOs: true });
  assert.equal(result.appliedCount, 2);
  assert.deepEqual(result.questions.map((q) => q.maxMarks), [5, 5]);
  assert.deepEqual(result.questions.map((q) => q.cos[0].marks), [5, 5]);
  assert.equal(result.questions[0].custom, "keep");
  assert.deepEqual(current, snapshot);
});

test("clarification preserves that question and puts its warning beside its index", () => {
  const current = [{ maxMarks: 2 }, { maxMarks: 7, guidelines: "Faculty work" }];
  const rows = [{ ...draft(), question_no: 1 },
    { question_no: 2, status: "needs_clarification", notes: ["Missing classifier figure."] }];
  const result = applyRubricSuggestions(current, rows);
  assert.equal(result.appliedCount, 1);
  assert.equal(result.questions[1], current[1]);
  assert.match(result.warnings[1], /Missing classifier figure/);
});

test("one invalid ready draft rejects the batch without changing any inputs", () => {
  const current = [{ maxMarks: 2 }, { maxMarks: 3 }];
  const snapshot = structuredClone(current);
  const rows = [{ ...draft(), question_no: 1 }, { ...draft(), question_no: 2, max_marks: null }];
  assert.throws(() => applyRubricSuggestions(current, rows));
  assert.deepEqual(current, snapshot);
});

test("wrong count, order and duplicate question labels cannot fill the wrong questions", () => {
  for (const numbers of [[1], [2, 1], [1, 1]]) {
    assert.throws(() => applyRubricSuggestions([{}, {}], numbers.map((question_no) => ({ ...draft(), question_no }))));
  }
});

test("missing and multiple CO mappings show actionable warnings", () => {
  const multiple = { ...draft(), question_no: 1 };
  multiple.co_tags.push({ co_code: "CO2", eligible: true });
  const missing = { ...draft(), question_no: 2, co_tags: [] };
  const result = applyRubricSuggestions([{}, {}], [multiple, missing], { includeCOs: true });
  assert.match(result.warnings[0], /Allocate marks/);
  assert.match(result.warnings[1], /Select the course outcome/);
  assert.deepEqual(result.questions[0].cos.map((co) => co.marks), ["", ""]);
});

test("all unresolved questions return warnings without applied credit or data changes", () => {
  const current = [{ maxMarks: 2 }];
  const result = applyRubricSuggestions(current, [{ question_no: 1, status: "needs_clarification" }]);
  assert.equal(result.appliedCount, 0);
  assert.equal(result.questions[0], current[0]);
  assert.match(result.warnings[0], /Complete this question manually/);
});

test("printed labels, section and stable source IDs survive applying a draft", () => {
  const row = { ...draft(), question_no: 1, question_id: "stable-source-id",
    question_label: "8(a)", section: "SECTION C", question_text: "8(a) Explain work. [5 Marks]" };
  const result = applyRubricSuggestions([{}], [row]);
  assert.equal(result.questions[0].question_label, "8(a)");
  assert.equal(result.questions[0].question_id, "stable-source-id");
  assert.equal(result.questions[0].section, "SECTION C");
  assert.equal(result.questions[0].question_text, row.question_text);
});

test("clarification retains printed mapping while preserving faculty criteria", () => {
  const current = [{ maxMarks: 5, guidelines: "Faculty criteria" }];
  const result = applyRubricSuggestions(current, [{ question_no: 1, status: "needs_clarification",
    question_id: "id", question_label: "1(ii)", section: "SECTION A", question_text: "1(ii) Explain" }]);
  assert.equal(result.questions[0].question_label, "1(ii)");
  assert.equal(result.questions[0].guidelines, "Faculty criteria");
  assert.equal(current[0].question_label, undefined);
});

// ── Unverified AI drafts (review_draft) are offered as flagged, editable starting points ──
const flagged = (extra = {}) => ({ question_no: 1, status: "needs_clarification",
  notes: ["Question Q1: Confirm maximum marks: AI proposed 5, quoting '5'. The printed maximum could not be verified."],
  question_id: "id-1", question_label: "Q1", section: "SECTION A", question_text: "Q1. Explain. 5", ...extra });

test("unverified but complete AI draft fills marks, parameters and guidelines and keeps the warning", () => {
  const row = flagged({ review_draft: { ...draft(), status: "needs_clarification" } });
  const result = applyRubricSuggestions([{ custom: "keep" }], [row]);
  assert.equal(result.appliedCount, 1);
  assert.equal(result.questions[0].maxMarks, 5);
  assert.equal(result.questions[0].parameters.length, 1);
  assert.equal(result.questions[0].guidelines, "Credit valid steps.");
  assert.equal(result.questions[0].custom, "keep");
  assert.equal(result.questions[0].question_label, "Q1");
  assert.match(result.warnings[0], /Confirm maximum marks/);
  assert.match(result.warnings[0], /Unverified AI draft/);
});

test("unverified draft without parameters or guidelines fills only the marks and keeps the rest", () => {
  const row = flagged({ review_draft: { status: "needs_clarification", min_marks: 0, max_marks: 3, parameters: [], guidelines: "" } });
  const current = [{ minMarks: 1, maxMarks: "", guidelines: "Faculty work", parameters: [{ name: "Mine", percentage: 100 }] }];
  const result = applyRubricSuggestions(current, [row]);
  assert.equal(result.appliedCount, 1);
  assert.equal(result.questions[0].maxMarks, 3);
  assert.equal(result.questions[0].minMarks, 0);
  assert.equal(result.questions[0].guidelines, "Faculty work");
  assert.deepEqual(result.questions[0].parameters, current[0].parameters);
  assert.equal(result.questions[0].question_id, "id-1");
});

test("unverified draft with percentages not totalling 100 falls back to marks only", () => {
  const bad = { ...draft(), status: "needs_clarification", parameters: [{ name: "A", percentage: 60 }] };
  const result = applyRubricSuggestions([{ guidelines: "Keep" }], [flagged({ review_draft: bad })]);
  assert.equal(result.questions[0].maxMarks, 5);
  assert.deepEqual(result.questions[0].parameters ?? [], []);
  assert.equal(result.questions[0].guidelines, "Keep");
});

for (const [name, proposal] of [["null maximum", { max_marks: null }], ["zero maximum", { max_marks: 0 }],
  ["non-numeric maximum", { max_marks: "5" }], ["no proposal", undefined]]) {
  test(`unverified draft with ${name} leaves the question untouched`, () => {
    const current = [{ maxMarks: 2 }];
    const row = flagged(proposal ? { review_draft: { ...draft(), status: "needs_clarification", ...proposal } } : {});
    const result = applyRubricSuggestions(current, [row]);
    assert.equal(result.appliedCount, 0);
    assert.equal(result.questions[0].maxMarks, 2);
    assert.match(result.warnings[0], /Complete this question manually/);
  });
}

test("an invalid minimum in an unverified draft becomes zero instead of blocking the fill", () => {
  const row = flagged({ review_draft: { ...draft(), status: "needs_clarification", min_marks: 9 } });
  assert.equal(applyRubricSuggestions([{}], [row]).questions[0].minMarks, 0);
});

test("unverified draft never mutates its inputs", () => {
  const current = [{ maxMarks: 2 }];
  const row = flagged({ review_draft: { ...draft(), status: "needs_clarification" } });
  const before = structuredClone({ current, row });
  applyRubricSuggestions(current, [row]);
  assert.deepEqual({ current, row }, before);
});
