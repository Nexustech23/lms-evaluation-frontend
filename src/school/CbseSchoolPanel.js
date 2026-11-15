"use client";
import { withAlpha } from "@/lib/question-paper/colorHelpers";
import { CBSE_CLASSES, boardsForClass, classNote, sectionMarks, sectionQuestions, withCounts } from "@/school/cbse";

// A small number field that sits inside a sentence.
function NumberBox({ value, onChange, label, testId, min = 0, max = 500, width = "w-12" }) {
  return (
    <input
      type="number" inputMode="numeric" min={min} max={max} value={value} aria-label={label} data-testid={testId}
      onChange={(e) => onChange(e.target.value === "" ? 0 : Math.trunc(Number(e.target.value)))}
      className={`${width} px-1 py-0.5 border border-gray-300 rounded text-xs text-center text-gray-700 bg-white outline-none focus:border-gray-500`}
    />
  );
}

// Shown only to school institutes. Picks a CBSE class and, for Classes 9-12, a board blueprint.
// The blueprint is the starting point: every number in the summary can be changed by the teacher.
export default function CbseSchoolPanel({
  color, blueprints, classLevel, presetKey, onClassChange, onPresetChange,
  layout, onLayoutChange, total, duration, customised, problem, onReset,
}) {
  const boards = boardsForClass(blueprints, classLevel);
  const board = boards.find((entry) => entry.key === presetKey);
  const note = classNote(blueprints, classLevel);
  const selectClass = "p-2 border rounded text-sm outline-none bg-white w-full";
  const border = { borderColor: withAlpha(color, 0.3) };

  const change = (sectionIndex, updated) => onLayoutChange(layout.map((section, index) => (index === sectionIndex ? updated : section)));

  return (
    <div className="rounded-2xl border border-gray-200 p-5 bg-gray-50" data-testid="cbse-panel">
      <p className="text-sm font-semibold text-gray-600 mb-1">CBSE paper format</p>
      <p className="text-xs text-gray-400 mb-4">Pick the class and subject. Marks, time and sections start from the CBSE sample paper, and you can change any of them.</p>

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

      {board && layout && (
        <div className="mt-4" data-testid="cbse-summary">
          <div className="flex items-center justify-between gap-3 mb-2">
            <p className="text-xs font-semibold text-gray-600">
              {total} marks · {duration} · about {board.competencyPercent}% competency-focused
              {customised && (
                <span className="ml-2 font-medium rounded px-1.5 py-0.5 bg-amber-100 text-amber-700" data-testid="cbse-customised">CBSE (customised)</span>
              )}
            </p>
            {customised && (
              <button type="button" onClick={onReset} data-testid="cbse-reset"
                className="text-xs font-medium px-2 py-1 rounded-lg hover:opacity-80 whitespace-nowrap"
                style={{ backgroundColor: withAlpha(color, 0.1), color }}>
                Reset to CBSE
              </button>
            )}
          </div>

          <ul className="space-y-2">
            {layout.map((section, sectionIndex) => {
              const questions = sectionQuestions(section);
              return (
                <li key={section.label} className={questions ? "text-gray-600" : "text-gray-400"}>
                  <div className="text-xs flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="font-medium whitespace-nowrap">{section.label}</span>
                    {section.pattern.map(([marks, count], groupIndex) => (
                      <span key={groupIndex} className="inline-flex items-center gap-1 whitespace-nowrap">
                        {groupIndex > 0 && <span>+</span>}
                        <NumberBox value={count} max={100} label={`${section.label} number of questions`} testId={`cbse-count-${sectionIndex}-${groupIndex}`}
                          onChange={(value) => change(sectionIndex, withCounts(section, groupIndex, "count", value))} />
                        <span>×</span>
                        <NumberBox value={marks} min={1} max={20} width="w-11" label={`${section.label} marks per question`} testId={`cbse-marks-${sectionIndex}-${groupIndex}`}
                          onChange={(value) => change(sectionIndex, withCounts(section, groupIndex, "marks", value))} />
                        <span>{marks === 1 ? "mark" : "marks"}</span>
                      </span>
                    ))}
                    <span className="font-medium whitespace-nowrap ml-1" data-testid={`cbse-total-${sectionIndex}`}>= {sectionMarks(section)} marks</span>
                    {questions > 0 && section.choice !== null && (
                      <span className="inline-flex items-center gap-1 whitespace-nowrap text-gray-500">
                        · internal choice in
                        <NumberBox value={section.choice} max={questions} width="w-11" label={`${section.label} internal choice`} testId={`cbse-choice-${sectionIndex}`}
                          onChange={(value) => change(sectionIndex, { ...section, choice: Math.min(value, questions) })} />
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">{questions ? section.style : "Left out of the paper"}</p>
                </li>
              );
            })}
          </ul>

          {problem ? (
            <p role="alert" className="text-xs text-amber-600 mt-3" data-testid="cbse-problem">⚠️ {problem}</p>
          ) : (
            <p className="text-xs text-green-600 mt-3" data-testid="cbse-ok">✓ The sections add up to {total} marks.</p>
          )}
        </div>
      )}
    </div>
  );
}
