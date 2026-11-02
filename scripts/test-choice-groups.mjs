import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const source = await readFile(new URL("../src/lib/choiceGroups.js", import.meta.url), "utf8");
const g = await import(`data:text/javascript;base64,${Buffer.from(source).toString("base64")}`);

const rows = (...maxima) => maxima.map((maxMarks) => ({ maxMarks }));
// Pharmaceutical Analysis: Q1 20, Group B 3 x 10 (answer 2), Group C 9 x 5 (answer 7) -> 75 counted of 95 offered
const pharma = rows(20, 10, 10, 10, 5, 5, 5, 5, 5, 5, 5, 5, 5);
const groupB = { id: "g1", questions: [2, 3, 4], answerN: 2, rule: "best" };
const groupC = { id: "g2", questions: [5, 6, 7, 8, 9, 10, 11, 12, 13], answerN: 7, rule: "best" };

test("the counted total is the real paper maximum", () => {
  assert.equal(g.countedMax(pharma, [groupB, groupC]), 75);
  assert.equal(g.countedMax(pharma, []), 95);
  assert.equal(g.countedMax(rows(10, 10), [{ id: "g1", questions: [1, 2], answerN: 1 }]), 10);
});

test("valid groups have no errors", () => {
  assert.deepEqual(g.groupErrors(pharma, [groupB, groupC]), []);
  assert.deepEqual(g.groupErrors(pharma, []), []);
});

test("problems with groups are reported in plain words", () => {
  assert.match(g.groupErrors(pharma, [{ id: "a", questions: [2], answerN: 1 }]).join(), /at least two/);
  assert.match(g.groupErrors(pharma, [{ id: "a", questions: [2, 3], answerN: 2 }]).join(), /at least 1 and fewer/);
  assert.match(g.groupErrors(pharma, [{ id: "a", questions: [1, 2], answerN: 1 }]).join(), /same max marks/);
  assert.match(g.groupErrors(pharma, [{ id: "a", questions: [2, 3], answerN: 1 }, { id: "b", questions: [3, 4], answerN: 1 }]).join(), /only one group/);
  assert.match(g.groupErrors(pharma, [{ id: "a", questions: [2, 99], answerN: 1 }]).join(), /not in the rubric/);
});

test("each grouped question gets a badge", () => {
  const badges = g.groupBadges([groupB, groupC]);
  assert.equal(badges[3], "Group 1: any 2 of 3");
  assert.equal(badges[9], "Group 2: any 7 of 9");
  assert.equal(badges[1], undefined);
});

test("adding, ticking and removing questions keeps the group valid", () => {
  let groups = g.addGroup([]);
  assert.deepEqual(groups, [{ id: "g1", questions: [], answerN: 1, rule: "best" }]);
  groups = g.toggleQuestion(groups, "g1", 4);
  groups = g.toggleQuestion(groups, "g1", 5);
  assert.deepEqual(groups[0].questions, [4, 5]);
  assert.equal(groups[0].answerN, 1);
  groups = g.setAnswerN(groups, "g1", 5);
  groups = g.toggleQuestion(groups, "g1", 6);           // three chosen, answer 5 is too many
  assert.equal(groups[0].answerN, 2);
  groups = g.toggleQuestion(groups, "g1", 6);
  assert.deepEqual(groups[0].questions, [4, 5]);
  assert.deepEqual(g.removeGroup(groups, "g1"), []);
});

test("a question already in another group cannot be ticked again", () => {
  let groups = [{ id: "g1", questions: [2, 3], answerN: 1, rule: "best" }, ...g.addGroup([]).map((x) => ({ ...x, id: "g2" }))];
  assert.ok(g.takenByOthers(groups, "g2").has(2));
  groups = g.toggleQuestion(groups, "g2", 2);
  assert.deepEqual(groups[1].questions, []);
});

test("new ids never repeat", () => {
  const groups = g.addGroup([{ id: "g2", questions: [1, 2], answerN: 1 }]);
  assert.equal(groups.length, 2);
  assert.notEqual(groups[1].id, "g2");
});

test("saved groups load into an editable list", () => {
  assert.deepEqual(g.loadGroups(undefined), []);
  assert.deepEqual(g.loadGroups([{ id: "g1", questions: [3, 2], answerN: "1" }]), [{ id: "g1", questions: [2, 3], answerN: 1, rule: "best" }]);
});

test("groups pointing past the last question are dropped", () => {
  assert.deepEqual(g.pruneForRowCount([groupB, { id: "x", questions: [20, 21], answerN: 1 }], 13), [groupB]);
});

const marked = (scores, maxima, group = { id: "g1", answer_n: 1 }) =>
  scores.map((s, i) => ({ question_no: i + 1, max_marks: maxima[i], ai_awarded_marks: s, final_marks: s, choice_group: group }));

test("the best answers count and a tie goes to the earlier question", () => {
  const result = g.reselectCounted(marked([4, 9, 9, 2], [10, 10, 10, 10], { id: "g1", answer_n: 2 }));
  assert.deepEqual(result.map((q) => q.counted), [false, true, true, false]);
  const tie = g.reselectCounted(marked([5, 5], [10, 10]));
  assert.deepEqual(tie.map((q) => q.counted), [true, false]);
});

test("a faculty adjustment can move which answer counts", () => {
  const rows = marked([4, 6], [10, 10]);
  assert.deepEqual(g.reselectCounted(rows).map((q) => q.counted), [false, true]);
  rows[0].final_marks = 8;
  assert.deepEqual(g.reselectCounted(rows).map((q) => q.counted), [true, false]);
});

test("questions outside a group always count and the input is not changed", () => {
  const rows = [{ question_no: 1, final_marks: 3 }, ...marked([1, 2], [5, 5]).map((q, i) => ({ ...q, question_no: i + 2 }))];
  const result = g.reselectCounted(rows);
  assert.equal(result[0].counted, undefined);
  assert.ok(g.isCounted(result[0]));
  assert.equal(rows[1].counted, undefined);
  assert.equal(g.isCounted({ counted: false }), false);
});
