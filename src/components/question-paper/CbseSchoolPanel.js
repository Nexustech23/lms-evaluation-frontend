"use client";
import { withAlpha } from "@/lib/question-paper/colorHelpers";
import { CBSE_CLASSES, boardsForClass, classNote } from "@/lib/cbse";

// Shown only to school institutes. Picks a CBSE class and, for Classes 9-12, a board blueprint.
export default function CbseSchoolPanel({ color, blueprints, classLevel, presetKey, onClassChange, onPresetChange }) {
  const boards = boardsForClass(blueprints, classLevel);
  const board = boards.find((entry) => entry.key === presetKey);
  const note = classNote(blueprints, classLevel);
  const selectClass = "p-2 border rounded text-sm outline-none bg-white w-full";
  const border = { borderColor: withAlpha(color, 0.3) };

  return (
    <div className="rounded-2xl border border-gray-200 p-5 bg-gray-50" data-testid="cbse-panel">
      <p className="text-sm font-semibold text-gray-600 mb-1">CBSE paper format</p>
      <p className="text-xs text-gray-400 mb-4">Pick the class and subject. Marks, time and sections follow the CBSE sample paper.</p>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-gray-400 mb-1 block" htmlFor="cbse-class">Class</label>
          <select id="cbse-class" name="cbse_class" className={selectClass} style={border}
            value={classLevel} onChange={(e) => onClassChange(e.target.value)}>
            <option value="">Select class</option>
            {CBSE_CLASSES.map((level) => <option key={level} value={level}>Class {level}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-400 mb-1 block" htmlFor="cbse-subject">Subject</label>
          <select id="cbse-subject" name="cbse_subject" className={`${selectClass} disabled:bg-gray-100 disabled:text-gray-400`} style={border}
            value={presetKey} disabled={!boards.length} onChange={(e) => onPresetChange(e.target.value)}>
            <option value="">{boards.length ? "Select subject" : "Not needed"}</option>
            {boards.map((entry) => <option key={entry.key} value={entry.key}>{entry.subject} ({entry.code})</option>)}
          </select>
        </div>
      </div>

      {note && <p className="text-xs text-gray-500 mt-3" data-testid="cbse-note">{note}</p>}

      {board && (
        <div className="mt-4" data-testid="cbse-summary">
          <p className="text-xs font-semibold text-gray-600 mb-2">
            {board.total} marks · {board.duration} · about {board.competencyPercent}% competency-focused
          </p>
          <ul className="space-y-1">
            {board.sections.map((section) => (
              <li key={section.label} className="text-xs text-gray-600 flex gap-2">
                <span className="font-medium whitespace-nowrap">{section.label}</span>
                <span className="text-gray-400">{section.marks} marks, {section.questions} questions. {section.kind}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
