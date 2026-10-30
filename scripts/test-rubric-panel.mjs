import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import vm from "node:vm";

const require = createRequire(import.meta.url);
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
const { transformSync } = require("next/dist/compiled/babel/core");
const source = readFileSync(new URL("../src/components/RubricSuggestionPanel.js", import.meta.url), "utf8");
const compiled = transformSync(source, {
  filename: "RubricSuggestionPanel.js", babelrc: false, configFile: false,
  presets: [["next/babel", { "preset-env": { modules: "commonjs" }, "preset-react": { runtime: "automatic" } }]],
}).code;

function load(error = "", job = null) {
  let hook = 0;
  const sandboxModule = { exports: {} };
  const mockRequire = (name) => {
    if (name === "react") return { ...React, useState: (initial) => {
      const index = hook++;
      return React.useState(index === 0 ? job : index === 2 ? error : initial);
    } };
    if (name === "axios") return {};
    if (name === "@/lib/pollBackoff") return { startRecoverablePolling() { throw new Error("No network in rendering tests"); } };
    return require(name);
  };
  vm.runInNewContext(compiled, { module: sandboxModule, exports: sandboxModule.exports, require: mockRequire, AbortController });
  return sandboxModule.exports;
}

function render(error = "", job = null) {
  return renderToStaticMarkup(React.createElement(load(error, job).default, {
    folderId: "exam", questionCount: 2, onApply() {}, disabled: false,
  }));
}

test("normal layout stays a single Generate parameters button", () => {
  const html = render();
  assert.match(html, />Generate parameters<\/button>/);
  assert.doesNotMatch(html, /Confirm question mapping|uses credits|Edit Mode|Create Mode/);
});

test("mapping failure keeps the single-button UI and shows a short actionable error", () => {
  const { parameterErrorMessage } = load();
  const error = parameterErrorMessage({ response: { data: { detail: {
    code: "QUESTION_MAPPING_REQUIRED", question_count: 38,
    message: "Confirm which printed questions correspond to the evaluation rows.",
    lines: [{ start: 10, text: "Private extracted paper content" }],
  } } } });
  const html = render(error);
  assert.match(html, /role="alert"/);
  assert.match(html, /Could not identify all questions automatically/);
  assert.match(html, /Your existing parameters were kept/);
  assert.equal((html.match(/<button\b/g) || []).length, 1);
  assert.doesNotMatch(html, /Confirm question mapping|Confirm mapping|<select|<input|Private extracted paper content/);
  assert.doesNotMatch(html, /disabled=""/);
});

test("ordinary errors retain extraction and stale-paper instructions", () => {
  const { parameterErrorMessage } = load();
  assert.equal(parameterErrorMessage({ response: { data: { detail: "Wait for question-paper text extraction." } } }),
    "Wait for question-paper text extraction.");
  assert.equal(parameterErrorMessage(new Error("The paper changed. Reload before filling parameters.")),
    "The paper changed. Reload before filling parameters.");
  assert.equal(parameterErrorMessage({}, "Parameters unavailable."), "Parameters unavailable.");
});

test("partial drafts identify uncertain question and display unconfirmed AI values safely", () => {
  const html = render("", { status: "completed", result: { questions: [{
    question_no: 2, question_label: "8(a)", section: "SECTION C", status: "needs_clarification",
    notes: ["Confirm the printed maximum."], review_draft: { max_marks: 9, max_quote: "[5]",
      parameters: [{ name: "Correct method", percentage: 100 }], guidelines: "<script>not executable</script>" },
  }] } });
  assert.match(html, /8\(a\) — review AI draft/);
  assert.match(html, /AI-proposed maximum \(unconfirmed\): 9/);
  assert.match(html, /These values were not applied/);
  assert.match(html, /Correct method: 100%/);
  assert.doesNotMatch(html, /<script>/);
});
