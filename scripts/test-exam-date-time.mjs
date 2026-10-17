import assert from "node:assert/strict";
import fs from "node:fs";

const source = fs.readFileSync(new URL("../src/lib/examDateTime.js", import.meta.url), "utf8");
const { examDateTimeInput } = await import(`data:text/javascript;base64,${Buffer.from(source).toString("base64")}`);
for (const timezone of ["UTC", "Asia/Kolkata", "America/New_York"]) {
  process.env.TZ = timezone;
  for (const saved of ["2026-10-17T10:30:00", "2026-10-17T10:30:00Z", "2026-10-17T10:30:00+05:30"]) {
    assert.equal(examDateTimeInput(saved), "2026-10-17T10:30");
  }
  assert.equal(examDateTimeInput("2026-03-08T02:30:00"), "2026-03-08T02:30");
  assert.equal(examDateTimeInput(null), "");
  assert.equal(examDateTimeInput("invalid"), "");
}
console.log("Exam date edit: 18 assertions passed across 3 timezones");
