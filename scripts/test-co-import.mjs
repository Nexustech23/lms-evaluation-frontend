import assert from "node:assert/strict";
import fs from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";

const require = createRequire(import.meta.url);
const XLSX = require("xlsx");
const source = fs.readFileSync(new URL("../src/lib/coImport.js", import.meta.url), "utf8");
const { mergeCoImport } = await import(`data:text/javascript;base64,${Buffer.from(source).toString("base64")}`);
const cos = [{ co_code: "CO1", description: "Original", threshold: 60 },
  { co_code: "CO2", description: "Keep", threshold: 50 }];
const matrix = { CO1: { PO1: 3, PO2: 2 }, CO2: { PO1: 1, PO2: 3 } };
const pos = [{ po_code: "PO1" }, { po_code: "PO2" }];
const header = ["co_code", "co_description"];

test("CO-only import preserves mappings, thresholds and unmentioned COs", () => {
  const before = structuredClone({ cos, matrix });
  const result = mergeCoImport([header, ["CO1", "Updated"], ["CO3", "New"]], cos, matrix, pos);
  assert.deepEqual(result.matrix.CO1, matrix.CO1);
  assert.deepEqual(result.matrix.CO2, matrix.CO2);
  assert.deepEqual(result.matrix.CO3, {});
  assert.deepEqual(result.coList.map((co) => co.co_code), ["CO1", "CO2", "CO3"]);
  assert.equal(result.coList[0].threshold, 60);
  assert.equal(result.coList[0].description, "Updated");
  assert.equal(result.coList[1].description, "Keep");
  assert.deepEqual({ cos, matrix }, before);
  result.matrix.CO1.PO1 = 0;
  assert.equal(matrix.CO1.PO1, 3);
});

test("partial PO import changes supplied cells only; explicit zero clears", () => {
  const result = mergeCoImport([[...header, "PO1", "PO2"], ["CO1", "Updated", "", 0],
    ["CO2", "Keep", 2, ""]], cos, matrix, pos);
  assert.deepEqual(result.matrix, { CO1: { PO1: 3, PO2: 0 }, CO2: { PO1: 2, PO2: 3 } });
});

test("PO headers normalize to programme spelling and numeric strings work", () => {
  const result = mergeCoImport([[...header, " po1 "], [" CO1 ", " Updated ", "2"]], cos, matrix, pos);
  assert.equal(result.matrix.CO1.PO1, 2);
  assert.equal(result.matrix.CO1.PO2, 2);
  assert.equal(result.coList[0].description, "Updated");
});

test("empty rows/trailing empty columns are ignored", () => {
  const result = mergeCoImport([[...header, ""], ["", "", ""], ["CO1", "Updated", ""]], cos, matrix, pos);
  assert.equal(result.importedCount, 1);
  assert.deepEqual(result.matrix, matrix);
});

for (const [label, rows] of [
  ["empty workbook", []], ["no data", [header]], ["blank data", [header, ["", ""]]],
  ["missing header", [["", "description"], ["CO1", "Name"]]],
  ["missing description", [header, ["CO1", ""]]],
  ["missing CO", [header, ["", "Name"]]],
  ["duplicate CO", [header, ["CO1", "One"], ["CO1", "Two"]]],
  ["unknown PO", [[...header, "PO9"], ["CO1", "Name", 2]]],
  ["duplicate PO", [[...header, "PO1", "po1"], ["CO1", "Name", 2, 3]]],
  ["missing PO header", [[...header, ""], ["CO1", "Name", 2]]],
]) {
  test(`reject ${label} without changing editor data`, () => {
    const before = structuredClone({ cos, matrix });
    assert.throws(() => mergeCoImport(rows, cos, matrix, pos));
    assert.deepEqual({ cos, matrix }, before);
  });
}

for (const value of ["bad", -1, 4, 1.5, Infinity, NaN, true]) {
  test(`reject invalid mapping ${String(value)} atomically`, () => {
    const before = structuredClone({ cos, matrix });
    assert.throws(() => mergeCoImport([[...header, "PO1"], ["CO1", "Valid first row", 1],
      ["CO2", "Invalid second row", value]], cos, matrix, pos));
    assert.deepEqual({ cos, matrix }, before);
  });
}

test("repeat import is idempotent", () => {
  const rows = [header, ["CO1", "Update"], ["CO3", "New"]];
  const first = mergeCoImport(rows, cos, matrix, pos);
  assert.deepEqual(mergeCoImport(rows, first.coList, first.matrix, pos), first);
});

test("new subject imports COs and supplied PO values", () => {
  const result = mergeCoImport([[...header, "PO1"], ["CO1", "Description", 3]], [], {}, []);
  assert.deepEqual(result.matrix, { CO1: { PO1: 3 } });
  assert.equal(result.coList[0].threshold, 0);
});

for (const bookType of ["xlsx", "xls"]) {
  test(`${bookType} workbook parse -> merge -> save payload -> reload preserves maps`, () => {
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet([header, ["CO1", "Updated"]]), "COs");
    const parsed = XLSX.read(XLSX.write(workbook, { type: "buffer", bookType }), { type: "buffer" });
    const rows = XLSX.utils.sheet_to_json(parsed.Sheets[parsed.SheetNames[0]], { header: 1, defval: "" });
    const imported = mergeCoImport(rows, cos, matrix, pos);
    const payload = JSON.parse(JSON.stringify({ co_list: imported.coList, co_po_matrix: imported.matrix }));
    assert.deepEqual(payload.co_po_matrix, matrix);
    assert.equal(payload.co_list[0].threshold, 60);
    assert.equal(payload.co_list[0].description, "Updated");
  });
}
