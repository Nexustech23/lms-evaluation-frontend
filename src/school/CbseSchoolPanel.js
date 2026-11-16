"use client";
import { useState } from "react";
import { FaPlus } from "react-icons/fa";
import { withAlpha } from "@/lib/question-paper/colorHelpers";
import { SECTION_PALETTE } from "@/lib/question-paper/sectionPalette";
import { CBSE_CLASSES, CUSTOM_PAPER, boardsForClass, classNote, layoutFromBoard, sectionMarks, sectionQuestions, withCounts } from "@/school/cbse";

// A small number field that sits inside a sentence.
function NumberBox({ value, onChange, label, testId, min = 0, max = 500, width = "w-14" }) {
  return (
    <input
      type="number" inputMode="numeric" min={min} max={max} value={value} aria-label={label} data-testid={testId}
      onChange={(e) => onChange(e.target.value === "" ? 0 : Math.trunc(Number(e.target.value)))}
      className={`${width} px-2 py-1 border border-gray-300 rounded-lg text-sm text-center text-gray-700 bg-white outline-none focus:border-gray-500`}
    />
  );
}

// Shown only to school institutes. Picks a CBSE class and, for Classes 9-12, a board blueprint (or a custom paper).
// The blueprint is the starting point: every number can be changed by the teacher. It looks like the college
// section editor: one coloured tab per section, an editor for the open one, and a bar showing how the marks split.
export default function CbseSchoolPanel({
  color, blueprints, classLevel, presetKey, custom = false, onClassChange, onPresetChange,
  layout, onLayoutChange, total, duration, customised, problem, onReset,
}) {
  const [openIndex, setOpenIndex] = useState(0);
  const boards = boardsForClass(blueprints, classLevel);
  const board = boards.find((entry) => entry.key === presetKey);
  const note = custom ? "" : classNote(blueprints, classLevel);
  const selectClass = "p-2 border rounded text-sm outline-none bg-white w-full";
  const border = { borderColor: withAlpha(color, 0.3) };

  const change = (sectionIndex, updated) => onLayoutChange(layout.map((section, index) => (index === sectionIndex ? updated : section)));
  const official = board ? layoutFromBoard(board) : [];
  const isLeftOut = (section) => sectionQuestions(section) === 0;
  const leftOut = (layout || []).map((section, index) => (isLeftOut(section) ? index : -1)).filter((index) => index >= 0);

  const removeSection = (index) => change(index, { ...layout[index], pattern: layout[index].pattern.map(([marks]) => [marks, 0]) });
  const restoreSection = (index) => { change(index, official[index]); setOpenIndex(index); };
  const addSection = () => { if (leftOut.length) restoreSection(leftOut[0]); };

  const active = layout?.[Math.min(openIndex, (layout?.length || 1) - 1)];
  const activeIndex = layout ? layout.indexOf(active) : -1;
  const palette = SECTION_PALETTE[Math.max(activeIndex, 0) % SECTION_PALETTE.length];
  const marksSum = (layout || []).reduce((sum, section) => sum + sectionMarks(section), 0);

  return (
    <div className="rounded-2xl border border-gray-200 p-5 bg-gray-50" data-testid="cbse-panel">
      <p className="text-sm font-semibold text-gray-600 mb-1">CBSE paper format</p>
      <p className="text-xs text-gray-400 mb-4">
        Pick the class and subject. Marks, time and sections start from the CBSE sample paper, and you can change any of them.
        For any other test, choose <strong>Custom paper</strong> as the subject and set your own sections.
      </p>

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
          <select id="cbse-subject" name="cbse_subject" className={selectClass} style={border}
            value={custom ? CUSTOM_PAPER : presetKey} onChange={(e) => onPresetChange(e.target.value)}>
            <option value="">Select subject</option>
            <option value={CUSTOM_PAPER}>Custom paper (no CBSE pattern)</option>
            {boards.map((entry) => <option key={entry.key} value={entry.key}>{entry.subject} ({entry.code})</option>)}
          </select>
        </div>
      </div>

      {custom && (
        <p className="text-xs text-gray-500 mt-3" data-testid="cbse-custom-note">
          Custom paper: set the total marks and time above, then build your own sections in the section editor below.
        </p>
      )}
      {note && <p className="text-xs text-gray-500 mt-3" data-testid="cbse-note">{note}</p>}

      {board && layout && (
        <div className="mt-5 pt-4 border-t border-gray-200" data-testid="cbse-summary">
          <div className="flex items-center justify-between gap-3 mb-3">
            <p className="text-xs font-semibold text-gray-600">
              {total} marks · {duration} · about {board.competencyPercent}% competency-focused
              {customised && (
                <span className="ml-2 font-medium rounded px-1.5 py-0.5 bg-amber-100 text-amber-700" data-testid="cbse-customised">CBSE (customised)</span>
              )}
            </p>
            <div className="flex items-center gap-2">
              {customised && (
                <button type="button" onClick={onReset} data-testid="cbse-reset"
                  className="text-xs font-medium px-2 py-1 rounded-lg hover:opacity-80 whitespace-nowrap"
                  style={{ backgroundColor: withAlpha(color, 0.1), color }}>
                  Reset to CBSE
                </button>
              )}
              <button type="button" onClick={addSection} disabled={!leftOut.length} data-testid="cbse-add-section"
                title={leftOut.length ? "Bring back a section you removed" : "Every CBSE section is already in the paper"}
                className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg transition-all hover:opacity-80 disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
                style={{ backgroundColor: withAlpha(color, 0.1), color }}>
                <FaPlus size={9} />
                Add Section
              </button>
            </div>
          </div>

          {/* One tab per section */}
          <div className="flex flex-wrap gap-1.5 mb-4" data-testid="cbse-tabs">
            {layout.map((section, index) => {
              const colour = SECTION_PALETTE[index % SECTION_PALETTE.length];
              const isActive = index === activeIndex;
              const out = isLeftOut(section);
              return (
                <button key={section.label} type="button" onClick={() => setOpenIndex(index)} data-testid={`cbse-tab-${index}`}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                  style={{
                    backgroundColor: isActive ? colour.bg : "transparent",
                    color: isActive ? colour.text : "#9ca3af",
                    border: `1px solid ${isActive ? colour.text + "33" : "#e5e7eb"}`,
                    textDecoration: out ? "line-through" : "none",
                  }}>
                  {section.label}
                  <span className="text-xs font-semibold rounded px-1"
                    style={{ backgroundColor: isActive ? colour.text + "22" : "#f3f4f6", color: isActive ? colour.text : "#9ca3af" }}>
                    {out ? "out" : `${sectionMarks(section)}`}
                  </span>
                  {!out && layout.length - leftOut.length > 1 && (
                    <span role="button" aria-label={`Remove ${section.label}`} title="Remove section" data-testid={`cbse-remove-${index}`}
                      onClick={(e) => { e.stopPropagation(); removeSection(index); }}
                      className="ml-0.5 hover:opacity-70 transition cursor-pointer">×</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* The open section */}
          {active && (
            <div className="rounded-xl p-4 space-y-3" style={{ backgroundColor: palette.bg, border: `1px solid ${palette.text}22` }} data-testid="cbse-editor">
              {isLeftOut(active) ? (
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs" style={{ color: palette.text }}>{active.label} is left out of the paper.</p>
                  <button type="button" onClick={() => restoreSection(activeIndex)} data-testid="cbse-restore"
                    className="text-xs font-medium px-2.5 py-1 rounded-lg bg-white hover:opacity-80" style={{ color: palette.text }}>
                    Put it back
                  </button>
                </div>
              ) : (
                <>
                  <p className="text-xs" style={{ color: palette.text }}>{active.style}</p>
                  <div className="text-xs flex flex-wrap items-center gap-x-2 gap-y-2 text-gray-600">
                    {active.pattern.map(([marks, count], groupIndex) => (
                      <span key={groupIndex} className="inline-flex items-center gap-1.5 whitespace-nowrap">
                        {groupIndex > 0 && <span>+</span>}
                        <NumberBox value={count} max={100} label={`${active.label} number of questions`} testId={`cbse-count-${activeIndex}-${groupIndex}`}
                          onChange={(value) => change(activeIndex, withCounts(active, groupIndex, "count", value))} />
                        <span>questions ×</span>
                        <NumberBox value={marks} min={1} max={20} label={`${active.label} marks per question`} testId={`cbse-marks-${activeIndex}-${groupIndex}`}
                          onChange={(value) => change(activeIndex, withCounts(active, groupIndex, "marks", value))} />
                        <span>{marks === 1 ? "mark" : "marks"}</span>
                      </span>
                    ))}
                    <span className="font-semibold whitespace-nowrap" data-testid={`cbse-total-${activeIndex}`}>= {sectionMarks(active)} marks</span>
                  </div>
                  {sectionQuestions(active) > 0 && active.choice !== null && (
                    <div className="text-xs text-gray-600 flex items-center gap-2">
                      Internal choice in
                      <NumberBox value={active.choice} max={sectionQuestions(active)} label={`${active.label} internal choice`} testId={`cbse-choice-${activeIndex}`}
                        onChange={(value) => change(activeIndex, { ...active, choice: Math.min(value, sectionQuestions(active)) })} />
                      of {sectionQuestions(active)} questions
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* How the marks split */}
          <div className="mt-4 h-2.5 rounded-full overflow-hidden flex gap-px bg-gray-100" data-testid="cbse-bar">
            {layout.map((section, index) => {
              const share = marksSum ? (100 * sectionMarks(section)) / marksSum : 0;
              return share > 0 ? (
                <div key={section.label} style={{ width: `${share}%`, backgroundColor: SECTION_PALETTE[index % SECTION_PALETTE.length].text, transition: "width 0.3s ease" }} />
              ) : null;
            })}
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
            {layout.map((section, index) => (
              <span key={section.label} className="text-xs" style={{ color: SECTION_PALETTE[index % SECTION_PALETTE.length].text, opacity: isLeftOut(section) ? 0.4 : 1 }}>
                {section.label}: {sectionMarks(section)} marks
              </span>
            ))}
          </div>

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
