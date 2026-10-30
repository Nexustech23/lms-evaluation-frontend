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

function render(mapping = null, boundaries = []) {
  let hook = 0;
  const module = { exports: {} };
  const mockRequire = (name) => {
    if (name === "react") return { ...React, useState: (initial) => {
      const index = hook++;
      return React.useState(index === 4 ? mapping : index === 5 ? boundaries : initial);
    } };
    if (name === "axios") return {};
    if (name === "@/lib/pollBackoff") return { startRecoverablePolling() { throw new Error("No network in rendering tests"); } };
    return require(name);
  };
  vm.runInNewContext(compiled, { module, exports: module.exports, require: mockRequire, AbortController });
  return renderToStaticMarkup(React.createElement(module.exports.default, {
    folderId: "exam", questionCount: 2, onApply() {}, disabled: false,
  }));
}

test("normal layout stays a single Generate parameters button", () => {
  const html = render();
  assert.match(html, />Generate parameters<\/button>/);
  assert.doesNotMatch(html, /Confirm question mapping|uses credits|Edit Mode|Create Mode/);
});

test("ambiguous layout shows source choices and faculty confirmation", () => {
  const mapping = { question_count: 2, candidates: [], lines: [
    { start: 10, text: "8(a) Define work", section: "SECTION C" },
    { start: 40, text: "8(b) Explain heat", section: "SECTION C" },
  ] };
  const html = render(mapping, [{ start: 10, question_label: "8(a)" }, { start: 40, question_label: "8(b)" }]);
  assert.match(html, /Confirm question mapping/);
  assert.match(html, /This step uses no AI credits/);
  assert.match(html, /value="10" selected/);
  assert.match(html, /8\(a\) Define work/);
  assert.match(html, />Confirm mapping<\/button>/);
  assert.match(html, /disabled=""[^>]*>Generate parameters/);
});
