"use client";
import React, { useState } from "react";
import ChoiceGroupsPanel from "@/components/ChoiceGroupsPanel";
import { groupErrors } from "@/lib/choiceGroups";
import {
  splitIntoParts, addPart, removePart, updatePart, applyParts, clearParts, partErrors, partsMax,
} from "@/lib/questionParts";

/**
 * Parts inside one question ("Q1 has ten parts of 2 marks"). The question's max marks follow its
 * parts. Part groups say "answer any N of the parts" (for example any 10 of 11, or one of two
 * alternatives); the backend counts the best parts.
 */
export default function QuestionPartsEditor({ row, onChange, disabled = false, color = "#ff7f10" }) {
  const [count, setCount] = useState(10);
  const [marksEach, setMarksEach] = useState(2);
  const parts = row.parts || [];
  const groups = row.partGroups || [];

  if (parts.length === 0) {
    return (
      <div className="mb-4 flex flex-wrap items-center gap-2 text-sm text-gray-700" data-testid="split-into-parts">
        <span className="font-medium">Parts:</span>
        <span>this question has</span>
        <input type="number" min={2} value={count} disabled={disabled} onChange={(e) => setCount(e.target.value)}
          className="w-16 rounded border px-2 py-1" aria-label="Number of parts" />
        <span>parts of</span>
        <input type="number" min={0} step="0.5" value={marksEach} disabled={disabled} onChange={(e) => setMarksEach(e.target.value)}
          className="w-20 rounded border px-2 py-1" aria-label="Marks per part" />
        <span>marks each</span>
        <button type="button" disabled={disabled || !(Number(marksEach) > 0)}
          onClick={() => onChange(applyParts(row, splitIntoParts(count, marksEach), []))}
          className="rounded border px-3 py-1 disabled:opacity-50" style={{ borderColor: color, color }}>
          Split into parts
        </button>
      </div>
    );
  }

  const set = (nextParts, nextGroups = groups) => onChange(applyParts(row, nextParts, nextGroups));
  const errors = [...partErrors(parts), ...groupErrors(parts, groups)];

  return (
    <div className="mb-4 rounded border bg-gray-50 p-3" data-testid="question-parts">
      <div className="flex items-center justify-between gap-2">
        <h4 className="text-sm font-semibold text-gray-800">
          Parts ({parts.length}) &middot; counted max marks {partsMax(parts, groups)}
        </h4>
        <button type="button" disabled={disabled} onClick={() => onChange(clearParts(row))}
          className="text-xs text-red-600 hover:underline disabled:opacity-50">Remove all parts</button>
      </div>
      <p className="mb-2 text-xs text-gray-500">
        Each part is marked separately against its own guidelines. A question with parts has no parameters.
      </p>

      {parts.map((part, index) => (
        <div key={index} className="mb-2 flex flex-wrap items-start gap-2">
          <input value={part.label} disabled={disabled} aria-label={`Label of part ${index + 1}`}
            onChange={(e) => set(updatePart(parts, index, "label", e.target.value))}
            className="w-20 rounded border px-2 py-1 text-sm" />
          <input type="number" min={0} step="0.5" value={part.maxMarks} disabled={disabled} aria-label={`Max marks of part ${index + 1}`}
            onChange={(e) => set(updatePart(parts, index, "maxMarks", e.target.value === "" ? "" : Number(e.target.value)))}
            className="w-20 rounded border px-2 py-1 text-sm" />
          <input value={part.guidelines || ""} disabled={disabled} placeholder="Guidelines for this part (optional)"
            aria-label={`Guidelines of part ${index + 1}`}
            onChange={(e) => set(updatePart(parts, index, "guidelines", e.target.value))}
            className="min-w-[12rem] flex-1 rounded border px-2 py-1 text-sm" />
          <button type="button" disabled={disabled || parts.length <= 2} aria-label={`Remove part ${index + 1}`}
            onClick={() => { const out = removePart(parts, groups, index); set(out.parts, out.groups); }}
            className="px-2 py-1 text-sm text-red-600 disabled:opacity-30">&times;</button>
        </div>
      ))}
      <button type="button" disabled={disabled} onClick={() => set(addPart(parts))}
        className="mt-1 rounded border px-3 py-1 text-xs disabled:opacity-50" style={{ borderColor: color, color }}>
        + Add part
      </button>

      {errors.length > 0 && (
        <ul role="alert" className="mt-3 list-disc pl-5 text-xs text-red-600">
          {errors.map((message) => <li key={message}>{message}</li>)}
        </ul>
      )}

      <div className="mt-4">
        <ChoiceGroupsPanel rows={parts} groups={groups} onChange={(next) => set(parts, next)} disabled={disabled} color={color}
          heading="Choice among parts"
          hint="Use this for &ldquo;answer any N of the parts&rdquo; or a choice between two alternative parts. The best answers count."
          labelFor={(part) => part.label || "Part"} />
      </div>
    </div>
  );
}
