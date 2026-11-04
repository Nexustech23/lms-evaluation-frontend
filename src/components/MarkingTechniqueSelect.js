"use client";
import React from "react";

export const MARKING_TECHNIQUES = {
  standard: "Standard",
  step_marking: "Balanced university-style step marking",
};

export function loadTechnique(value) {
  return value === "step_marking" ? "step_marking" : "standard";
}

const HINTS = {
  standard: "Marks follow the guidelines exactly. A wrong or off-target answer can score zero.",
  step_marking: "Marks follow the steps like a university examiner: correct method earns marks even if the final answer is wrong, a correct step after an earlier mistake is credited, and a relevant attempt earns a small share.",
};

/** How the AI should mark every answer of this exam. Saved with the rubric, so it locks when evaluation starts. */
export default function MarkingTechniqueSelect({ value, onChange, disabled = false, color = "#ff7f10" }) {
  return (
    <div className="mb-6 border rounded-lg p-4" data-testid="marking-technique">
      <label htmlFor="marking-technique-select" className="font-semibold text-gray-800">Marking technique</label>
      <select id="marking-technique-select" value={value} disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 block w-full rounded border px-3 py-2 text-sm disabled:opacity-50"
        style={{ borderColor: color }}>
        {Object.entries(MARKING_TECHNIQUES).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
      </select>
      <p className="mt-2 text-xs text-gray-500">{HINTS[value]}</p>
    </div>
  );
}
