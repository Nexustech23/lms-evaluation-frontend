import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const source = await readFile(new URL("../src/lib/rubricSuggestions.js", import.meta.url), "utf8");
const { applyRubricSuggestion, savedRubricRows } = await import(`data:text/javascript;base64,${Buffer.from(source).toString("base64")}`);
const draft = () => ({ status: "draft_ready", min_marks: 0, max_marks: 5,
  parameters: [{ name: "Correct method", percentage: 100, isCustom: true }],
  guidelines: "Credit valid steps.", co_tags: [{ co_code: "CO1", eligible: true, description: "Methods" }] });

test("create mode requires an explicit successful no-rubric response", () => {
  assert.equal(savedRubricRows({ success: true, evaluation: null }), null);
  const rows = [{ maxMarks: 2 }];
  assert.equal(savedRubricRows({ success: true, evaluation: { questionEvaluationDetails: rows } }), rows);
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
