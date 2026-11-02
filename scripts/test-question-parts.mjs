import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const load = async (name) => {
  const source = await readFile(new URL(`../src/lib/${name}`, import.meta.url), "utf8");
  return import(`data:text/javascript;base64,${Buffer.from(source).toString("base64")}`);
};
const p = await load("questionParts.js");

test("ten parts of two marks make a twenty mark question", () => {
  const parts = p.splitIntoParts(10, 2);
  assert.equal(parts.length, 10);
  assert.deepEqual(parts.map((x) => x.label).slice(0, 4), ["(i)", "(ii)", "(iii)", "(iv)"]);
  assert.equal(p.partsMax(parts, []), 20);
});

test("any 10 of 11 parts is still twenty marks, and one of two alternatives counts once", () => {
  const eleven = p.splitIntoParts(11, 2);
  assert.equal(p.partsMax(eleven, [{ id: "g1", questions: eleven.map((_, i) => i + 1), answerN: 10 }]), 20);
  const six = p.splitIntoParts(6, 2);
  assert.equal(p.partsMax(six, [{ id: "g1", questions: [2, 3], answerN: 1 }]), 10);
});

test("a split never makes fewer than two parts", () => {
  assert.equal(p.splitIntoParts(1, 5).length, 2);
});

test("problems with parts are reported in plain words", () => {
  assert.match(p.partErrors([{ label: "(i)", maxMarks: 2 }]).join(), /at least two parts/);
  assert.match(p.partErrors([{ label: "", maxMarks: 2 }, { label: "(ii)", maxMarks: 2 }]).join(), /add a label/);
  assert.match(p.partErrors([{ label: "(i)", maxMarks: 2 }, { label: "(I)", maxMarks: 2 }]).join(), /used twice/);
  assert.match(p.partErrors([{ label: "(i)", maxMarks: 0 }, { label: "(ii)", maxMarks: 2 }]).join(), /greater than 0/);
  assert.deepEqual(p.partErrors(p.splitIntoParts(3, 2)), []);
});

test("adding a part continues the labels and copies the marks", () => {
  const parts = p.addPart(p.splitIntoParts(2, 3));
  assert.equal(parts.length, 3);
  assert.equal(parts[2].label, "(iii)");
  assert.equal(parts[2].maxMarks, 3);
});

test("removing a part keeps the groups pointing at the right parts", () => {
  const parts = p.splitIntoParts(5, 2);
  const groups = [{ id: "g1", questions: [2, 3, 5], answerN: 2 }];
  const out = p.removePart(parts, groups, 0);                    // remove part 1: parts 2,3,5 become 1,2,4
  assert.equal(out.parts.length, 4);
  assert.deepEqual(out.groups[0].questions, [1, 2, 4]);
  const two = p.removePart(parts, [{ id: "g", questions: [2, 3], answerN: 1 }], 1);   // a group left with one part is dropped
  assert.deepEqual(two.groups, []);
});

test("applying parts sets the max marks from the parts and clears parameters", () => {
  const row = { maxMarks: 5, parameters: [{ name: "Accuracy", percentage: 100 }], guidelines: "x" };
  const next = p.applyParts(row, p.splitIntoParts(10, 2), []);
  assert.equal(next.maxMarks, 20);
  assert.deepEqual(next.parameters, []);
  assert.equal(next.guidelines, "x");
  assert.equal(row.maxMarks, 5);                                  // the input is not changed
});

test("clearing parts returns an ordinary question", () => {
  const next = p.clearParts({ maxMarks: 20, parts: [1], partGroups: [], guidelines: "" });
  assert.equal("parts" in next, false);
  assert.equal("partGroups" in next, false);
  assert.equal(next.maxMarks, 20);
});

test("parts load back from a saved rubric row", () => {
  assert.deepEqual(p.loadParts({ maxMarks: 5 }), {});
  const loaded = p.loadParts({ parts: [{ label: "(i)", maxMarks: 2 }, { label: "(ii)", maxMarks: 2, guidelines: "g" }],
    partGroups: [{ id: "g1", questions: [2, 1], answerN: "1" }] });
  assert.equal(loaded.parts[1].guidelines, "g");
  assert.deepEqual(loaded.partGroups[0].questions, [1, 2]);
  assert.equal(loaded.partGroups[0].answerN, 1);
});
