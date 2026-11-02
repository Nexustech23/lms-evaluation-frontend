"use client";
import React from "react";
import {
  addGroup, removeGroup, toggleQuestion, setAnswerN, takenByOthers, countedMax, groupErrors,
} from "@/lib/choiceGroups";

/**
 * Lets the faculty say "the student answers N of these questions" (including "1 of Q4 and Q5").
 * The backend counts the student's best N answers in each group.
 */
export default function ChoiceGroupsPanel({ rows, groups, onChange, totalMarks, disabled = false, color = "#ff7f10", onSuggest, suggesting = false, notes = [] }) {
  const errors = groupErrors(rows, groups);
  const counted = countedMax(rows, groups);
  const totalKnown = totalMarks !== undefined && totalMarks !== "" && totalMarks !== null;
  const matches = totalKnown && Math.abs(counted - Number(totalMarks)) < 1e-7;

  return (
    <div className="mb-6 border rounded-lg p-4" data-testid="choice-groups-panel">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="font-semibold text-gray-800">Choice groups</h3>
          <p className="text-xs text-gray-500">
            Use this when the paper says &ldquo;answer any N&rdquo; or offers a choice between separate questions.
            The student&apos;s best answers in each group count.
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          {onSuggest && (
            <button type="button" disabled={disabled || suggesting} onClick={onSuggest}
              className="rounded border px-3 py-1.5 text-sm disabled:opacity-50" style={{ borderColor: color, color }}>
              {suggesting ? "Reading the paper…" : "Suggest from paper"}
            </button>
          )}
          <button type="button" disabled={disabled} onClick={() => onChange(addGroup(groups))}
            className="rounded px-3 py-1.5 text-sm text-white disabled:opacity-50" style={{ backgroundColor: color }}>
            + Add choice group
          </button>
        </div>
      </div>
      {notes.length > 0 && (
        <ul role="status" className="mt-3 list-disc pl-5 text-xs text-amber-800">
          {notes.map((note) => <li key={note}>{note}</li>)}
        </ul>
      )}

      {groups.map((group, index) => {
        const taken = takenByOthers(groups, group.id);
        return (
          <div key={group.id} className="mt-4 rounded border bg-gray-50 p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Group {index + 1}</span>
              <button type="button" disabled={disabled} onClick={() => onChange(removeGroup(groups, group.id))}
                className="text-xs text-red-600 hover:underline disabled:opacity-50">Remove group</button>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {rows.map((row, i) => {
                const n = i + 1;
                const checked = group.questions.includes(n);
                const blocked = taken.has(n);
                return (
                  <label key={n} className={`flex items-center gap-1 rounded border bg-white px-2 py-1 text-xs ${blocked ? "opacity-40" : "cursor-pointer"}`}>
                    <input type="checkbox" checked={checked} disabled={disabled || blocked}
                      onChange={() => onChange(toggleQuestion(groups, group.id, n))} />
                    Q{n}{row.maxMarks !== "" && row.maxMarks != null ? ` (${row.maxMarks})` : ""}
                  </label>
                );
              })}
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-gray-700">
              <span>Student answers</span>
              <input type="number" min={1} value={group.answerN} disabled={disabled}
                onChange={(e) => onChange(setAnswerN(groups, group.id, e.target.value))}
                className="w-16 rounded border px-2 py-1" aria-label={`Number of questions to answer in group ${index + 1}`} />
              <span>of the {group.questions.length} chosen questions. The best answers count.</span>
            </div>
          </div>
        );
      })}

      {errors.length > 0 && (
        <ul role="alert" className="mt-3 list-disc pl-5 text-xs text-red-600">
          {errors.map((message) => <li key={message}>{message}</li>)}
        </ul>
      )}
      {groups.length > 0 && (
        <p className={`mt-3 text-sm ${matches ? "text-green-700" : "text-gray-700"}`}>
          Counted total: <strong>{counted}</strong>
          {totalKnown && <> &nbsp;·&nbsp; Paper total: <strong>{totalMarks}</strong> {matches ? "✓" : "(must match)"}</>}
        </p>
      )}
    </div>
  );
}
