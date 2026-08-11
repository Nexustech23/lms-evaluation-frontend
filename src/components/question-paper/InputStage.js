"use client";
import { FaMicrophone, FaPlus } from "react-icons/fa";
import { withAlpha, darkenColor } from "@/lib/question-paper/colorHelpers";
import DropZone from "./DropZone";
import CoursePlannerUpload from "./CoursePlannerUpload";
import { useEffect, useState } from "react";

// crypto.randomUUID() only exists in secure contexts (HTTPS/localhost) —
// fall back to crypto.getRandomValues (available everywhere) so this
// doesn't crash the page when served over plain HTTP.
function genId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
    const bytes = crypto.getRandomValues(new Uint8Array(16));
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  }
  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

/**
 * Stage 2 — form for either "Upload File" or "Write a Prompt", plus exam metadata.
 *
 * Props (state):
 *   color / inputMode / prompt / setPrompt
 *   uploadedFile / setUploadedFile / isDragging / setIsDragging / fileInputRef
 *   coursePlannerFile / setCoursePlannerFile / isCoursePlannerDragging / setIsCoursePlannerDragging / coursePlannerInputRef
 *   selectedSubject / subjectNameInput / setSubjectNameInput
 *   examType / setExamType / totalMarks / setTotalMarks
 *   duration / setDuration / academicYear / setAcademicYear
 *   sections / setSections  – array of { id, label, bloomLevels, percent }
 *   sectionPercentValid     – computed boolean from parent
 *
 * Props (callbacks):
 *   onBack / onGenerate / startListening / stopListening / cancelListening
 *   isListening
 *
 * Props (i18n):
 *   t  – createQuestionPaper-Prompt namespace
 *   tc – common namespace
 */

// ── Accepted file types ────────────────────────────────────────────────────
const ACCEPTED_FILE_TYPES =
  ".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.csv,.md,.odt";

const ACCEPTED_EXTENSIONS = [
  "pdf", "doc", "docx", "ppt", "pptx", "xls", "xlsx", "txt", "csv", "md", "odt",
];

function isAcceptedFile(file) {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  return ACCEPTED_EXTENSIONS.includes(ext);
}

// ── Bloom level options ────────────────────────────────────────────────────
const BLOOM_OPTIONS = [
  { label: "L1 – Remember",   value: 1 },
  { label: "L2 – Understand", value: 2 },
  { label: "L3 – Apply",      value: 3 },
  { label: "L4 – Analyse",    value: 4 },
  { label: "L5 – Evaluate",   value: 5 },
  { label: "L6 – Create",     value: 6 },
];

// Section palette — cycles for new sections
const SECTION_PALETTE = [
  { bg: "rgba(99,102,241,0.12)",  text: "#6366f1" },
  { bg: "rgba(16,185,129,0.12)",  text: "#10b981" },
  { bg: "rgba(245,158,11,0.12)",  text: "#f59e0b" },
  { bg: "rgba(239,68,68,0.12)",   text: "#ef4444" },
  { bg: "rgba(59,130,246,0.12)",  text: "#3b82f6" },
  { bg: "rgba(168,85,247,0.12)",  text: "#a855f7" },
];

export function getDefaultSections() {
  return [
    { id: genId(), label: "Section A", bloomLevels: [1, 2], percent: 30 },
    { id: genId(), label: "Section B", bloomLevels: [3, 4], percent: 40 },
    { id: genId(), label: "Section C", bloomLevels: [5, 6], percent: 30 },
  ];
}

export default function InputStage({
  color,
  inputMode,
  prompt,
  setPrompt,
  isListening,
  startListening,
  stopListening,
  cancelListening,
  uploadedFile,
  setUploadedFile,
  isDragging,
  setIsDragging,
  fileInputRef,
  coursePlannerFile,
  setCoursePlannerFile,
  isCoursePlannerDragging,
  setIsCoursePlannerDragging,
  coursePlannerInputRef,
  selectedSubject,
  subjectNameInput,
  setSubjectNameInput,
  examType,
  setExamType,
  totalMarks,
  setTotalMarks,
  duration,
  setDuration,
  academicYear,
  setAcademicYear,
  // Sections — must be controlled from parent (page.js) so they survive re-renders
  sections,
  setSections,
  onBack,
  onGenerate,
  t,
  tc,
}) {
  // ── Active section tab ─────────────────────────────────────────────────────
  const [activeSectionId, setActiveSectionId] = useState(
    () => sections?.[0]?.id ?? null
  );

  // Keep activeSectionId valid when sections array changes
  useEffect(() => {
    if (sections && !sections.find((s) => s.id === activeSectionId)) {
      setActiveSectionId(sections[0]?.id ?? null);
    }
  }, [sections, activeSectionId]);

  const selCls =
    "p-2 border rounded text-sm disabled:bg-gray-50 disabled:text-gray-400 outline-none transition bg-white";

  // ── Derived totals ─────────────────────────────────────────────────────────
  const totalPercent = (sections || []).reduce(
    (sum, sec) => sum + (Number(sec.percent) || 0), 0
  );

  // Validation: all sections > 0 AND total === 100
  const sectionPercentValid =
    sections?.length > 0 &&
    totalPercent === 100 &&
    sections.every((s) => Number(s.percent) > 0);

  // ── Drop handler for main file ─────────────────────────────────────────────
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && isAcceptedFile(file)) setUploadedFile(file);
  };

  // ── Drop handler for course planner ───────────────────────────────────────
  const handleCoursePlannerDrop = (e) => {
    e.preventDefault();
    setIsCoursePlannerDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && isAcceptedFile(file)) setCoursePlannerFile(file);
  };

  // ── Section helpers ────────────────────────────────────────────────────────
  const addSection = () => {
    const newSec = {
      id: genId(),
      label: `Section ${String.fromCharCode(65 + sections.length)}`,
      bloomLevels: [],
      percent: 0,
    };
    setSections([...sections, newSec]);
    setActiveSectionId(newSec.id);
  };

  const removeSection = (id) => {
    if (sections.length <= 1) return;
    const next = sections.filter((s) => s.id !== id);
    setSections(next);
    // If removed section was active, switch to first
    if (id === activeSectionId) setActiveSectionId(next[0]?.id ?? null);
  };

  const updateSection = (id, patch) =>
    setSections(sections.map((s) => (s.id === id ? { ...s, ...patch } : s)));

  const toggleBloom = (id, level) => {
    const sec = sections.find((s) => s.id === id);
    if (!sec) return;
    const next = sec.bloomLevels.includes(level)
      ? sec.bloomLevels.filter((l) => l !== level)
      : [...sec.bloomLevels, level].sort((a, b) => a - b);
    updateSection(id, { bloomLevels: next });
  };

  // ── Exam metadata fields ───────────────────────────────────────────────────
  const metaFields = [
    {
      label:    t("examType"),
      isSelect: true,
      value:    examType,
      onChange: (e) => setExamType(e.target.value),
      options: [
        "End Semester Examination",
        "Mid Semester Examination",
        "Unit Test",
        "Quiz",
        "Internal Assessment",
      ],
    },
    {
      label:    t("totalMarks"),
      isInput:  true,
      type:     "number",
      value:    totalMarks,
      onChange: (e) => setTotalMarks(Number(e.target.value)),
      min:      10,
      max:      500,
    },
    {
      label:    t("duration"),
      isSelect: true,
      value:    duration,
      onChange: (e) => setDuration(e.target.value),
      options:  ["1 Hour", "1.5 Hours", "2 Hours", "2.5 Hours", "3 Hours"],
    },
    {
      label:       "Academic Year",
      isInput:     true,
      value:       academicYear,
      onChange:    (e) => setAcademicYear(e.target.value),
      placeholder: "e.g. 2024-25",
    },
  ];

  const activeSection = sections?.find((s) => s.id === activeSectionId);

  // ── Generate guard ─────────────────────────────────────────────────────────
  const canGenerate =
    (inputMode === "pdf" ? !!uploadedFile : !!prompt.trim()) &&
    sectionPercentValid;

  return (
    <>
      <style>{`
        @keyframes voiceGlow {
          0%   { box-shadow: 0 0 0 0   rgba(234,67,53,0.4); opacity: 1; }
          70%  { box-shadow: 0 0 0 14px rgba(234,67,53,0.0); opacity: 0; }
          100% { box-shadow: 0 0 0 0   rgba(234,67,53,0.0); opacity: 0; }
        }
        @keyframes barBounce1 { 0%,100%{height:6px}  50%{height:20px} }
        @keyframes barBounce2 { 0%,100%{height:14px} 50%{height:6px}  }
        @keyframes barBounce3 { 0%,100%{height:10px} 50%{height:24px} }
        @keyframes barBounce4 { 0%,100%{height:18px} 50%{height:8px}  }
        @keyframes barBounce5 { 0%,100%{height:8px}  50%{height:16px} }
        .bar1 { animation: barBounce1 0.7s ease-in-out infinite; }
        .bar2 { animation: barBounce2 0.6s ease-in-out infinite 0.1s; }
        .bar3 { animation: barBounce3 0.8s ease-in-out infinite 0.05s; }
        .bar4 { animation: barBounce4 0.65s ease-in-out infinite 0.15s; }
        .bar5 { animation: barBounce5 0.75s ease-in-out infinite 0.08s; }
        .bloom-chip { transition: all 0.15s ease; }
        .bloom-chip:hover { filter: brightness(0.95); }
      `}</style>

      <div className="space-y-5">
        {/* Back link */}
        <button
          onClick={onBack}
          className="text-gray-400 hover:text-gray-700 transition text-sm"
        >
          ← {tc("back")}
        </button>

        {/* ── Content source card ── */}
        <div className="rounded-2xl border border-gray-200 p-6 bg-gray-50">
          {inputMode === "pdf" ? (
            <>
              <h2 className="text-lg font-bold mb-1 text-gray-800">
                {t("uploadQuestionBank")}
              </h2>
              <p className="text-gray-400 text-xs mb-5">{t("uploadNote")}</p>

              <DropZone
                color={color}
                file={uploadedFile}
                isDragging={isDragging}
                inputRef={fileInputRef}
                accept={ACCEPTED_FILE_TYPES}
                onDragOver={() => setIsDragging(true)}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onFileChange={(e) => {
                  const f = e.target.files[0];
                  if (!f) return;
                  if (isAcceptedFile(f)) {
                    setUploadedFile(f);
                  } else {
                    // Inform user if extension not supported
                    const ext = f.name.split(".").pop()?.toLowerCase();
                    alert(`".${ext}" files are not supported. Please upload: PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX, TXT, CSV, MD, or ODT.`);
                  }
                }}
                uploadLabel={
                  <>
                    <span style={{ color }} className="font-medium">
                      {t("clickUpload")}
                    </span>
                    {t("dragOrUpload")}
                  </>
                }
                uploadSub="PDF, DOC, DOCX, PPT, XLSX, TXT and more"
                replaceLabel={t("replace")}
              />

              <CoursePlannerSection
                color={color}
                coursePlannerFile={coursePlannerFile}
                setCoursePlannerFile={setCoursePlannerFile}
                isCoursePlannerDragging={isCoursePlannerDragging}
                setIsCoursePlannerDragging={setIsCoursePlannerDragging}
                coursePlannerInputRef={coursePlannerInputRef}
                handleCoursePlannerDrop={handleCoursePlannerDrop}
              />
            </>
          ) : (
            <>
              <h2 className="text-lg font-bold mb-1 text-gray-800">
                {t("describeTitle")}
              </h2>
              <p className="text-gray-400 text-xs mb-4">{t("describeNote")}</p>

              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={6}
                placeholder={t("examplePrompt")}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-700 placeholder-gray-300 resize-none outline-none transition text-sm leading-relaxed"
                style={{ caretColor: color }}
                onFocus={(e) => {
                  e.target.style.borderColor = color;
                  e.target.style.boxShadow = `0 0 0 2px ${withAlpha(color, 0.12)}`;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#e5e7eb";
                  e.target.style.boxShadow = "none";
                }}
              />

              {/* Voice controls */}
              <div className="flex items-center justify-between mt-2 mb-5">
                <span className="text-gray-300 text-xs">{prompt.length} chars</span>

                {!isListening ? (
                  <button
                    type="button"
                    onClick={startListening}
                    title="Start voice input"
                    className="relative flex items-center justify-center rounded-full transition-transform hover:scale-105 active:scale-95"
                    style={{ width: 46, height: 46, backgroundColor: "#e8e8e8", boxShadow: "0 2px 8px rgba(0,0,0,0.18)" }}
                  >
                    <div className="flex items-center justify-center rounded-full" style={{ width: 34, height: 34, backgroundColor: "#EA4335" }}>
                      <FaMicrophone size={14} color="#fff" />
                    </div>
                  </button>
                ) : (
                  <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-full" style={{ background: "#fff", border: "1px solid #e5e7eb", boxShadow: "0 1px 6px rgba(0,0,0,0.10)" }}>
                    <button type="button" onClick={cancelListening ?? stopListening} title="Cancel" className="w-6 h-6 rounded-full flex items-center justify-center text-xs text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition">✕</button>
                    <div className="relative flex items-center justify-center" style={{ width: 34, height: 34 }}>
                      <span className="absolute rounded-full" style={{ width: 34, height: 34, backgroundColor: "rgba(234,67,53,0.25)", animation: "voiceGlow 1.1s ease-out infinite" }} />
                      <span className="absolute rounded-full" style={{ width: 34, height: 34, backgroundColor: "rgba(234,67,53,0.12)", animation: "voiceGlow 1.1s ease-out infinite 0.35s" }} />
                      <div className="relative z-10 w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: "#EA4335", boxShadow: "0 0 8px rgba(234,67,53,0.45)" }}>
                        <FaMicrophone size={13} color="#fff" />
                      </div>
                    </div>
                    <div className="flex items-center gap-px" style={{ height: 20 }}>
                      {["bar1","bar2","bar3","bar4","bar5"].map((cls) => (
                        <span key={cls} className={`${cls} block rounded-full`} style={{ width: 3, backgroundColor: "#EA4335", minHeight: 3 }} />
                      ))}
                    </div>
                    <button type="button" onClick={stopListening} title="Done" className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition hover:opacity-80" style={{ backgroundColor: "#EA4335", color: "#fff" }}>✓</button>
                  </div>
                )}
              </div>

              <CoursePlannerSection
                color={color}
                coursePlannerFile={coursePlannerFile}
                setCoursePlannerFile={setCoursePlannerFile}
                isCoursePlannerDragging={isCoursePlannerDragging}
                setIsCoursePlannerDragging={setIsCoursePlannerDragging}
                coursePlannerInputRef={coursePlannerInputRef}
                handleCoursePlannerDrop={handleCoursePlannerDrop}
              />
            </>
          )}
        </div>

        {/* ── Exam metadata card ── */}
        <div className="rounded-2xl border border-gray-200 p-5 bg-gray-50">
          <p className="text-sm font-semibold text-gray-600 mb-4">{t("examDetails")}</p>

          <div className="grid grid-cols-2 gap-4">
            {/* Subject name */}
            <div className="col-span-2">
              <label className="text-xs text-gray-400 mb-1 block">Subject Name</label>
              <input
                type="text"
                value={selectedSubject?.subject_name || subjectNameInput}
                onChange={(e) => { if (!selectedSubject) setSubjectNameInput(e.target.value); }}
                disabled={!!selectedSubject}
                placeholder="e.g. Marketing Analytics"
                className={`${selCls} w-full ${selectedSubject ? "bg-gray-100 text-gray-500" : ""}`}
                style={{ borderColor: withAlpha(color, 0.3) }}
                onFocus={(e) => (e.target.style.borderColor = color)}
                onBlur={(e) => (e.target.style.borderColor = withAlpha(color, 0.3))}
              />
              {selectedSubject && (
                <p className="text-xs text-gray-400 mt-0.5">Auto-filled from filter selection</p>
              )}
            </div>

            {metaFields.map(({ label, isSelect, isInput, options, ...rest }) => (
              <div key={label}>
                <label className="text-xs text-gray-400 mb-1 block">{label}</label>
                {isSelect ? (
                  <select
                    {...rest}
                    className={`${selCls} w-full`}
                    style={{ borderColor: withAlpha(color, 0.3) }}
                    onFocus={(e) => (e.target.style.borderColor = color)}
                    onBlur={(e) => (e.target.style.borderColor = withAlpha(color, 0.3))}
                  >
                    {options.map((v) => <option key={v}>{v}</option>)}
                  </select>
                ) : (
                  <input
                    {...rest}
                    className={`${selCls} w-full`}
                    style={{ borderColor: withAlpha(color, 0.3) }}
                    onFocus={(e) => (e.target.style.borderColor = color)}
                    onBlur={(e) => (e.target.style.borderColor = withAlpha(color, 0.3))}
                  />
                )}
              </div>
            ))}
          </div>

          {/* ── Section marks distribution ── */}
          <div className="mt-5 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <p className="text-xs font-semibold text-gray-600">Section Marks Distribution</p>
                <span className="text-xs text-gray-400 font-normal">— must total 100%</span>
              </div>
              <button
                type="button"
                onClick={addSection}
                className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg transition-all hover:opacity-80"
                style={{ backgroundColor: withAlpha(color, 0.1), color }}
              >
                <FaPlus size={9} />
                Add Section
              </button>
            </div>

            {/* ── Section tabs ── */}
            <div className="flex flex-wrap gap-1.5 mb-4">
              {sections.map((sec, idx) => {
                const palette = SECTION_PALETTE[idx % SECTION_PALETTE.length];
                const isActive = sec.id === activeSectionId;
                return (
                  <button
                    key={sec.id}
                    type="button"
                    onClick={() => setActiveSectionId(sec.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                    style={{
                      backgroundColor: isActive ? palette.bg : "transparent",
                      color: isActive ? palette.text : "#9ca3af",
                      border: `1px solid ${isActive ? palette.text + "33" : "#e5e7eb"}`,
                    }}
                  >
                    {sec.label || `Section ${idx + 1}`}
                    <span
                      className="text-xs font-semibold rounded px-1"
                      style={{
                        backgroundColor: isActive ? palette.text + "22" : "#f3f4f6",
                        color: isActive ? palette.text : "#9ca3af",
                      }}
                    >
                      {sec.percent}%
                    </span>
                    {sections.length > 1 && (
                      <span
                        onClick={(e) => { e.stopPropagation(); removeSection(sec.id); }}
                        className="ml-0.5 hover:opacity-70 transition cursor-pointer"
                        title="Remove section"
                      >
                        ×
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* ── Active section editor ── */}
            {activeSection && (() => {
              const idx = sections.findIndex((s) => s.id === activeSection.id);
              const palette = SECTION_PALETTE[idx % SECTION_PALETTE.length];
              return (
                <div
                  className="rounded-xl p-4 space-y-4"
                  style={{ backgroundColor: palette.bg, border: `1px solid ${palette.text}22` }}
                >
                  <div className="grid grid-cols-2 gap-3">
                    {/* Label */}
                    <div>
                      <label className="text-xs font-medium mb-1 block" style={{ color: palette.text }}>
                        Section Label
                      </label>
                      <input
                        type="text"
                        value={activeSection.label}
                        onChange={(e) => updateSection(activeSection.id, { label: e.target.value })}
                        placeholder="e.g. Section A"
                        className="w-full px-3 py-1.5 rounded-lg border text-sm outline-none bg-white transition"
                        style={{ borderColor: palette.text + "44" }}
                        onFocus={(e) => (e.target.style.borderColor = palette.text)}
                        onBlur={(e) => (e.target.style.borderColor = palette.text + "44")}
                      />
                    </div>

                    {/* Percentage */}
                    <div>
                      <label className="text-xs font-medium mb-1 block" style={{ color: palette.text }}>
                        Marks %{" "}
                        <span
                          className="font-normal"
                          style={{ color: totalPercent === 100 ? "#10b981" : "#f59e0b" }}
                        >
                          (Total: {totalPercent}% {totalPercent === 100 ? "✓" : `— need ${100 - totalPercent > 0 ? "+" : ""}${100 - totalPercent}%`})
                        </span>
                      </label>
                      <input
                        type="number"
                        value={activeSection.percent}
                        onChange={(e) =>
                          updateSection(activeSection.id, {
                            percent: Math.max(0, Math.min(100, Number(e.target.value))),
                          })
                        }
                        min={0}
                        max={100}
                        className="w-full px-3 py-1.5 rounded-lg border text-sm outline-none bg-white transition"
                        style={{ borderColor: palette.text + "44" }}
                        onFocus={(e) => (e.target.style.borderColor = palette.text)}
                        onBlur={(e) => (e.target.style.borderColor = palette.text + "44")}
                      />
                    </div>
                  </div>

                  {/* Bloom levels */}
                  <div>
                    <label className="text-xs font-medium mb-2 block" style={{ color: palette.text }}>
                      Bloom's Taxonomy Levels
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {BLOOM_OPTIONS.map((bl) => {
                        const selected = activeSection.bloomLevels.includes(bl.value);
                        return (
                          <button
                            key={bl.value}
                            type="button"
                            onClick={() => toggleBloom(activeSection.id, bl.value)}
                            className="bloom-chip px-2.5 py-1 rounded-full text-xs font-medium border transition-all"
                            style={{
                              backgroundColor: selected ? palette.text : "#fff",
                              color: selected ? "#fff" : palette.text,
                              borderColor: palette.text + "55",
                            }}
                          >
                            {bl.label}
                          </button>
                        );
                      })}
                    </div>
                    {activeSection.bloomLevels.length === 0 && (
                      <p className="text-xs text-gray-400 mt-1.5">
                        No levels selected — all levels will be included.
                      </p>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* ── Segmented progress bar ── */}
            <div className="mt-4 h-2.5 rounded-full overflow-hidden flex gap-px bg-gray-100">
              {sections.map((sec, idx) => {
                const palette = SECTION_PALETTE[idx % SECTION_PALETTE.length];
                return (
                  <div
                    key={sec.id}
                    style={{
                      width: `${sec.percent}%`,
                      backgroundColor: palette.text,
                      transition: "width 0.3s ease",
                    }}
                    className={
                      idx === 0
                        ? "rounded-l-full"
                        : idx === sections.length - 1
                        ? "rounded-r-full"
                        : ""
                    }
                  />
                );
              })}
            </div>

            {/* Section summary labels */}
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
              {sections.map((sec, idx) => {
                const palette = SECTION_PALETTE[idx % SECTION_PALETTE.length];
                return (
                  <span key={sec.id} className="text-xs" style={{ color: palette.text }}>
                    {sec.label || `Section ${idx + 1}`}: {sec.percent}%
                  </span>
                );
              })}
            </div>

            {/* Validation messages */}
            {totalPercent !== 100 && (
              <p className="text-xs text-amber-500 mt-2 flex items-center gap-1">
                ⚠️ Sections total <strong>{totalPercent}%</strong> — must equal exactly 100%.
              </p>
            )}
            {totalPercent === 100 && sections.some((s) => Number(s.percent) <= 0) && (
              <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                ⚠️ Each section must have a percentage greater than 0.
              </p>
            )}
            {sectionPercentValid && (
              <p className="text-xs text-green-500 mt-2 flex items-center gap-1">
                ✓ Section distribution looks good.
              </p>
            )}
          </div>
        </div>

        {/* ── Generate button ── */}
        <button
          onClick={onGenerate}
          disabled={!canGenerate}
          className="w-full py-4 rounded-xl text-white font-bold text-base disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          style={{ backgroundColor: color }}
          onMouseEnter={(e) => {
            if (!e.currentTarget.disabled)
              e.currentTarget.style.backgroundColor = darkenColor(color, 0.15);
          }}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = color)}
        >
          {t("generate")} →
        </button>
      </div>
    </>
  );
}

// ── Internal helper: course-planner upload section ─────────────────────────
function CoursePlannerSection(props) {
  return (
    <div className="border-t border-gray-200 pt-5 mt-5">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-base">📘</span>
        <p className="text-xs font-semibold text-gray-600">Attach Course Planner</p>
        <span className="text-xs text-gray-400 font-normal">
          — optional, AI will align questions to it
        </span>
      </div>
      <CoursePlannerUpload {...props} />
    </div>
  );
}