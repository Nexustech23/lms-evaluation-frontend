"use client";

import React, { useState, useContext, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import { AuthContext } from "@/app/AuthContext";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import Spinner from "@/components/ui/Spinner";
import { cn } from "@/lib/utils";
import { useFacultySubjects } from "@/api/Filter";
import { getRoadmaps } from "../../roadmap/api";
import AutoTestConfigForm from "../../roadmap/components/AutoTestConfigForm";

// ─────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────

const DIFFICULTY_OPTIONS = [
  { value: "easy", label: "Easy", icon: "🟢", color: "#22c55e" },
  { value: "medium", label: "Medium", icon: "🟡", color: "#f59e0b" },
  { value: "hard", label: "Hard", icon: "🔴", color: "#ef4444" },
  { value: "mixed", label: "Mixed", icon: "🎲", color: "#8b5cf6" },
];

const QUESTION_TYPES = [
  { value: "mcq", label: "MCQ", icon: "🔵" },
  { value: "true_false", label: "True / False", icon: "✅" },
  { value: "short_answer", label: "Short Answer", icon: "✏️" },
  { value: "descriptive", label: "Descriptive", icon: "📝" },
  { value: "fill_blanks", label: "Fill in Blanks", icon: "🔲" },
  { value: "match_following", label: "Match", icon: "🔗" },
];

const DURATION_OPTIONS = [
  { value: 15, label: "15 min" },
  { value: 30, label: "30 min" },
  { value: 45, label: "45 min" },
  { value: 60, label: "1 hr" },
  { value: 90, label: "1.5 hr" },
  { value: 120, label: "2 hr" },
  { value: 180, label: "3 hr" },
];

const QUESTION_COUNT_PRESETS = [5, 10, 15, 20, 30, 50];

const EMPTY_FORM = {
  subject_id: "",
  subjectName: "",
  topic: "",
  difficulty: "mixed",
  questionCount: 10,
  marksPerQuestion: 1,
  negativeMarking: false,
  negativeMarks: 0.25,
  duration: 30,
  questionTypes: ["mcq"],
};

// ─────────────────────────────────────────────────────────────
// Pill Toggle
// ─────────────────────────────────────────────────────────────

function Pill({ active, color, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-all duration-150 select-none"
      style={
        active
          ? { backgroundColor: color + "18", borderColor: color, color }
          : { backgroundColor: "#f9fafb", borderColor: "#e5e7eb", color: "#6b7280" }
      }
    >
      {children}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────
// Step Indicator
// ─────────────────────────────────────────────────────────────

function Steps({ current, total, color }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <React.Fragment key={i}>
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300"
            style={
              i < current
                ? { backgroundColor: color, color: "#fff" }
                : i === current
                  ? { backgroundColor: color + "20", color, border: `2px solid ${color}` }
                  : { backgroundColor: "#f3f4f6", color: "#9ca3af" }
            }
          >
            {i < current ? "✓" : i + 1}
          </div>
          {i < total - 1 && (
            <div className="flex-1 h-0.5 rounded-full transition-all duration-500"
              style={{ backgroundColor: i < current ? color : "#e5e7eb", maxWidth: 40 }} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Subject Card (from profile subjects)
// ─────────────────────────────────────────────────────────────

function SubjectCard({ subject, selected, color, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative w-full text-left rounded-xl p-4 border-2 transition-all duration-150"
      style={
        selected
          ? { backgroundColor: color + "12", borderColor: color }
          : { backgroundColor: "#fafafa", borderColor: "#e5e7eb" }
      }
    >
      {selected && (
        <div className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center text-white text-xs"
          style={{ backgroundColor: color }}>✓</div>
      )}
      <p className="text-sm font-semibold" style={{ color: selected ? color : "#1f2937" }}>
        {subject.name}
      </p>
      {subject.code && (
        <p className="text-xs text-gray-400 mt-0.5">{subject.code}</p>
      )}
      {subject.semester && (
        <p className="text-xs mt-1 font-medium" style={{ color: selected ? color : "#6b7280" }}>
          Sem {subject.semester}
        </p>
      )}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────
// Step Cards
// ─────────────────────────────────────────────────────────────

const STEP_LABELS = ["Subject & Topic", "Format", "Schedule"];

function StepSubject({ form, setField, color, subjects, loadingSubjects }) {
  const [search, setSearch] = useState("");

  const filtered = subjects.filter((s) =>
    !search || s.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Subject search */}
      <div>
        <Label className="mb-2 block">
          Your Subject <span className="text-red-500">*</span>
        </Label>
        {loadingSubjects ? (
          <div className="flex items-center gap-2 py-4 text-gray-400 text-sm">
            <Spinner className="w-4 h-4" /> Loading your subjects…
          </div>
        ) : subjects.length === 0 ? (
          <div className="space-y-3">
            <div className="rounded-xl border border-dashed border-gray-200 p-4 text-center text-xs text-gray-400">
              No subjects found automatically — type your subject below.
            </div>
            <input
              type="text"
              placeholder="e.g. Data Structures, Mathematics II…"
              value={form.subjectName}
              onChange={(e) => setField({ subjectName: e.target.value, subject_id: "manual" })}
              className="w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none"
              style={{ borderColor: form.subjectName ? color : "#d1d5db" }}
            />
          </div>
        ) : (
          <>
            {subjects.length > 5 && (
              <input
                type="text"
                placeholder="Search subject…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full mb-3 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none"
                style={{ borderColor: search ? color : "#e5e7eb" }}
              />
            )}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-64 overflow-y-auto pr-0.5">
              {filtered.map((s) => (
                <SubjectCard
                  key={s._id || s.id}
                  subject={s}
                  selected={form.subject_id === (s._id || s.id)}
                  color={color}
                  onClick={() =>
                    setField({
                      subject_id: s._id || s.id || "",
                      subjectName: s.name || "",
                    })
                  }
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Topic */}
      <div>
        <Label htmlFor="topic" className="mb-2 block">
          Topic / Chapter
          <span className="ml-1 text-xs text-gray-400 font-normal">(optional — leave blank for full syllabus)</span>
        </Label>
        <Input
          id="topic"
          placeholder="e.g. Linked Lists, Chapter 3, Thermodynamics…"
          value={form.topic}
          onChange={(e) => setField({ topic: e.target.value })}
          className="bg-white"
          style={{ borderColor: form.topic ? color : "#d1d5db" }}
        />
      </div>
    </div>
  );
}

function StepFormat({ form, setField, color }) {
  const totalMarks = form.questionCount * form.marksPerQuestion;

  return (
    <div className="space-y-7">

      {/* Difficulty */}
      <div>
        <Label className="mb-3 block">Difficulty</Label>
        <div className="flex flex-wrap gap-2">
          {DIFFICULTY_OPTIONS.map((d) => (
            <Pill
              key={d.value}
              active={form.difficulty === d.value}
              color={d.color}
              onClick={() => setField({ difficulty: d.value })}
            >
              {d.icon} {d.label}
            </Pill>
          ))}
        </div>
      </div>

      {/* Question count */}
      <div>
        <Label className="mb-3 block">
          Number of Questions <span className="text-red-500">*</span>
        </Label>
        <div className="flex flex-wrap gap-2 mb-3">
          {QUESTION_COUNT_PRESETS.map((n) => (
            <Pill
              key={n}
              active={form.questionCount === n}
              color={color}
              onClick={() => setField({ questionCount: n })}
            >
              {n}
            </Pill>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">or enter custom:</span>
          <input
            type="number"
            min={1}
            max={200}
            value={form.questionCount}
            onChange={(e) => setField({ questionCount: Math.max(1, Number(e.target.value)) })}
            className="w-20 border rounded-lg px-2 py-1 text-sm text-center focus:outline-none"
            style={{ borderColor: color + "60" }}
          />
        </div>
      </div>

      {/* Duration */}
      <div>
        <Label className="mb-3 block">Duration</Label>
        <div className="flex flex-wrap gap-2">
          {DURATION_OPTIONS.map((d) => (
            <Pill
              key={d.value}
              active={form.duration === d.value}
              color={color}
              onClick={() => setField({ duration: d.value })}
            >
              {d.label}
            </Pill>
          ))}
        </div>
      </div>

      {/* Question types */}
      <div>
        <Label className="mb-3 block">Question Types</Label>
        <div className="flex flex-wrap gap-2">
          {QUESTION_TYPES.map((qt) => {
            const active = form.questionTypes.includes(qt.value);
            return (
              <Pill
                key={qt.value}
                active={active}
                color={color}
                onClick={() =>
                  setField({
                    questionTypes: active
                      ? form.questionTypes.filter((t) => t !== qt.value).length
                        ? form.questionTypes.filter((t) => t !== qt.value)
                        : form.questionTypes                     // keep at least one
                      : [...form.questionTypes, qt.value],
                  })
                }
              >
                {qt.icon} {qt.label}
              </Pill>
            );
          })}
        </div>
      </div>

      {/* Marks + Negative */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="marksPerQ" className="mb-2 block">Marks per Question</Label>
          <div className="flex items-center gap-2">
            <input
              id="marksPerQ"
              type="number"
              min={0.5}
              step={0.5}
              value={form.marksPerQuestion}
              onChange={(e) => setField({ marksPerQuestion: Number(e.target.value) })}
              className="w-20 border rounded-lg px-2 py-1.5 text-sm text-center focus:outline-none"
              style={{ borderColor: color + "60" }}
            />
            <span className="text-xs text-gray-400">→ Total: <strong style={{ color }}>{totalMarks}</strong> marks</span>
          </div>
        </div>

        <div>
          <Label className="mb-2 block">Negative Marking</Label>
          <div className="flex items-center gap-3">
            <div
              className="relative w-10 h-6 rounded-full cursor-pointer transition-colors duration-200"
              style={{ backgroundColor: form.negativeMarking ? color : "#d1d5db" }}
              onClick={() => setField({ negativeMarking: !form.negativeMarking })}
            >
              <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${form.negativeMarking ? "translate-x-4" : "translate-x-0"}`} />
            </div>
            {form.negativeMarking && (
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-500">−</span>
                <input
                  type="number"
                  min={0}
                  step={0.25}
                  value={form.negativeMarks}
                  onChange={(e) => setField({ negativeMarks: Number(e.target.value) })}
                  className="w-16 border rounded-lg px-2 py-1 text-xs text-center focus:outline-none"
                  style={{ borderColor: "#ef444460" }}
                />
                <span className="text-xs text-gray-400">per wrong</span>
              </div>
            )}
            {!form.negativeMarking && (
              <span className="text-sm text-gray-400">Off</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StepSchedule({ form, setField, color }) {
  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="scheduleDate" className="mb-2 block">
          Schedule Date &amp; Time
          <span className="ml-1 text-xs text-gray-400 font-normal">(optional — blank = start now)</span>
        </Label>
        <input
          id="scheduleDate"
          type="datetime-local"
          value={form.scheduleDate || ""}
          onChange={(e) => setField({ scheduleDate: e.target.value })}
          className="w-full border rounded-xl px-3 py-2 text-sm bg-white focus:outline-none"
          style={{ borderColor: form.scheduleDate ? color : "#d1d5db" }}
        />
      </div>

      <div>
        <Label htmlFor="instructions" className="mb-2 block">Instructions for Yourself</Label>
        <textarea
          id="instructions"
          rows={4}
          placeholder="e.g. Focus on weak areas, revise Sem 3 topics…"
          value={form.instructions || ""}
          onChange={(e) => setField({ instructions: e.target.value })}
          className="w-full border rounded-xl px-3 py-2 text-sm bg-white resize-none focus:outline-none"
          style={{ borderColor: form.instructions ? color : "#d1d5db" }}
        />
      </div>

      {/* Summary card */}
      <div className="rounded-xl p-4 space-y-3"
        style={{ backgroundColor: color + "0c", border: `1.5px solid ${color}25` }}>
        <p className="text-xs font-bold uppercase tracking-wide" style={{ color }}>Test Summary</p>
        <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
          {[
            { label: "Subject", value: form.subjectName || "—" },
            { label: "Topic", value: form.topic || "Full Syllabus" },
            { label: "Questions", value: form.questionCount },
            { label: "Total Marks", value: form.questionCount * form.marksPerQuestion },
            { label: "Duration", value: DURATION_OPTIONS.find((d) => d.value === form.duration)?.label },
            { label: "Difficulty", value: DIFFICULTY_OPTIONS.find((d) => d.value === form.difficulty)?.label },
            { label: "Neg. Marking", value: form.negativeMarking ? `−${form.negativeMarks} per wrong` : "None" },
            { label: "Starts", value: form.scheduleDate ? new Date(form.scheduleDate).toLocaleString() : "Immediately" },
          ].map((item) => (
            <div key={item.label}>
              <p className="text-gray-400 text-xs">{item.label}</p>
              <p className="font-semibold text-gray-800">{item.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Mode Picker — Practice Test (existing wizard, untouched) vs
// Roadmap Test (new week-range wizard, reusing Auto Test's config shape)
// ─────────────────────────────────────────────────────────────

function ModePicker({ color, onSelect }) {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center p-5" style={{ backgroundColor: color }}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden">
        <div className="px-6 pt-6 pb-5 text-center" style={{ borderBottom: "1.5px solid #f3f4f6" }}>
          <h2 className="text-xl font-bold text-gray-900">Create a Test</h2>
          <p className="text-sm text-gray-400 mt-1">Choose how you want to test yourself.</p>
        </div>
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => onSelect("subject")}
            className="text-left rounded-2xl border-2 p-5 transition-all duration-150 hover:-translate-y-0.5"
            style={{ borderColor: "#e5e7eb" }}
          >
            <div className="text-2xl mb-2">📚</div>
            <h3 className="font-bold text-gray-900">Practice Test</h3>
            <p className="text-xs text-gray-500 mt-1">Test yourself on any subject or topic — Generated, fully configurable.</p>
          </button>
          <button
            type="button"
            onClick={() => onSelect("roadmap")}
            className="text-left rounded-2xl border-2 p-5 transition-all duration-150 hover:-translate-y-0.5"
            style={{ borderColor: color }}
          >
            <div className="text-2xl mb-2">🗺️</div>
            <h3 className="font-bold text-gray-900">Roadmap Test</h3>
            <p className="text-xs text-gray-500 mt-1">Test yourself on a week range from one of your active roadmaps.</p>
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Roadmap Test Wizard — pick roadmap + week range, then reuse
// AutoTestConfigForm (same config shape as the Weekly Quiz)
// ─────────────────────────────────────────────────────────────

function RoadmapTestWizard({ color, onBack }) {
  const router = useRouter();
  const [roadmaps, setRoadmaps] = useState([]);
  const [loadingRoadmaps, setLoadingRoadmaps] = useState(true);
  const [roadmapId, setRoadmapId] = useState(null);
  const [weekStart, setWeekStart] = useState(null);
  const [weekEnd, setWeekEnd] = useState(null);
  const [showConfig, setShowConfig] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getRoadmaps()
      .then((list) => { if (!cancelled) setRoadmaps(list || []); })
      .catch((err) => console.error("Failed to load roadmaps", err))
      .finally(() => { if (!cancelled) setLoadingRoadmaps(false); });
    return () => { cancelled = true; };
  }, []);

  const selectedRoadmap = roadmaps.find((r) => (r._id || r.id) === roadmapId);
  const unlockedWeeks = selectedRoadmap?.unlockedWeeks?.length ? selectedRoadmap.unlockedWeeks : [1];

  const handleSelectRoadmap = (id) => {
    setRoadmapId(id);
    setWeekStart(null);
    setWeekEnd(null);
  };

  const canContinue = roadmapId && weekStart && weekEnd && weekStart <= weekEnd;

  const handleGenerate = async (config) => {
    setError(null);
    setGenerating(true);
    try {
      const res = await axios.post("/api/mock-tests", {
        mode: "roadmap",
        roadmap_id: roadmapId,
        week_start: weekStart,
        week_end: weekEnd,
        mcq_percent: config.mcqPercent,
        subjective_percent: config.subjectivePercent,
        practical_percent: config.practicalPercent,
        questionCount: config.questionCount,
        custom_prompt: config.customPrompt || null,
      }, { withCredentials: true });

      toast.success("Roadmap test created! Good luck 🎯");
      const newTestId = res.data?.mockTest?._id || res.data?.test?._id || res.data?.testId;
      if (newTestId) {
        router.push(`/self-learner/test-engine/test-yourself/${newTestId}`);
      } else {
        router.push("/self-learner/test-engine");
      }
    } catch (err) {
      setError(err?.response?.data?.error || "Failed to create the test. Please try again.");
      setGenerating(false);
    }
  };

  if (showConfig) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center p-5" style={{ backgroundColor: color }}>
        <div className="w-full max-w-xl space-y-3">
          <button
            type="button"
            onClick={() => setShowConfig(false)}
            className="text-sm font-medium text-white/80 hover:text-white"
          >
            ← Change week range
          </button>
          <AutoTestConfigForm onGenerate={handleGenerate} generating={generating} error={error} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen items-center justify-center p-5" style={{ backgroundColor: color }}>
      <div className="w-full max-w-xl">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="px-6 pt-6 pb-5" style={{ borderBottom: "1.5px solid #f3f4f6" }}>
            <h2 className="text-xl font-bold text-gray-900">Roadmap Test</h2>
            <p className="text-sm text-gray-400 mt-0.5">Pick a roadmap and week range</p>
          </div>

          <div className="px-6 py-6 space-y-6">
            {loadingRoadmaps ? (
              <div className="flex items-center gap-2 py-4 text-gray-400 text-sm">
                <Spinner className="w-4 h-4" /> Loading your roadmaps…
              </div>
            ) : roadmaps.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-200 p-6 text-center text-sm text-gray-400">
                You don't have any roadmaps yet.{" "}
                <button
                  type="button"
                  onClick={() => router.push("/self-learner/roadmap/create")}
                  className="font-semibold underline"
                  style={{ color }}
                >
                  Create one first
                </button>
              </div>
            ) : (
              <>
                <div>
                  <Label className="mb-2 block">
                    Roadmap <span className="text-red-500">*</span>
                  </Label>
                  <div className="space-y-2">
                    {roadmaps.map((r) => {
                      const rId = r._id || r.id;
                      const selected = rId === roadmapId;
                      return (
                        <button
                          key={rId}
                          type="button"
                          onClick={() => handleSelectRoadmap(rId)}
                          className="w-full text-left rounded-xl p-3 border-2 transition-all duration-150"
                          style={selected ? { backgroundColor: color + "12", borderColor: color } : { backgroundColor: "#fafafa", borderColor: "#e5e7eb" }}
                        >
                          <p className="text-sm font-semibold" style={{ color: selected ? color : "#1f2937" }}>{r.subject}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{r.progress?.overallProgress || 0}% complete · {(r.weeks || []).length} weeks</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {roadmapId && (
                  <div>
                    <Label className="mb-2 block">
                      Week Range <span className="text-red-500">*</span>
                      <span className="ml-1 text-xs text-gray-400 font-normal">(only unlocked weeks are testable)</span>
                    </Label>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-400 mb-1.5">From</p>
                        <div className="flex flex-wrap gap-1.5">
                          {unlockedWeeks.map((w) => (
                            <Pill key={w} active={weekStart === w} color={color} onClick={() => setWeekStart(w)}>
                              Wk {w}
                            </Pill>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-1.5">To</p>
                        <div className="flex flex-wrap gap-1.5">
                          {unlockedWeeks.filter((w) => !weekStart || w >= weekStart).map((w) => (
                            <Pill key={w} active={weekEnd === w} color={color} onClick={() => setWeekEnd(w)}>
                              Wk {w}
                            </Pill>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="px-6 py-4 flex items-center justify-between" style={{ borderTop: "1.5px solid #f3f4f6", backgroundColor: "#fafafa" }}>
            <button type="button" onClick={onBack} className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
              ← Back
            </button>
            <button
              type="button"
              onClick={() => setShowConfig(true)}
              disabled={!canContinue}
              className="flex items-center gap-2 px-6 py-2 rounded-xl text-white text-sm font-semibold shadow disabled:opacity-40 transition-all"
              style={{ backgroundColor: color }}
            >
              Continue →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────

export default function StudentCreateTest() {
  const { user } = useContext(AuthContext);
  const router = useRouter();
  const color = user?.color || "#9b1b30";

  // null = show ModePicker; "subject" = existing practice-test wizard
  // (untouched below); "roadmap" = new week-range wizard.
  const [mode, setMode] = useState(null);

  const [form, setFormState] = useState(EMPTY_FORM);
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pull IDs from student's profile — tries every common key shape
  const school_id = user?.school_id || user?.school || user?.schoolId || "";
  const programme_id = user?.programme_id || user?.programme || user?.programmeId || "";
  const department_id = user?.department_id || user?.department || user?.departmentId || "";
  const batch_id = user?.batch_id || user?.batch || user?.batchId || "";
  const semester = user?.semester || user?.current_semester || user?.currentSemester || "";

  // Always pass an object — hook cannot receive null (destructuring crash)
  const { data: subjectData = {}, isLoading: hookLoading } = useFacultySubjects({
    school_id,
    programme_id,
    department_id,
    batch_id,
    semester,
  });

  // If profile IDs are missing, skip loading state entirely → show manual input
  const canFetch = !!(school_id && programme_id);
  const loadingSubjects = canFetch && hookLoading;

  const subjects = useMemo(() => {
    const raw = subjectData?.subjects || [];
    return raw.map((s) => ({
      _id: s._id || s.id || "",
      id: s._id || s.id || "",
      name: s.subject_name || s.name || "",
      code: s.subject_code || s.code || "",
      semester: s.semester || semester || "",
    }));
  }, [subjectData, semester]);

  // Patch helper: setField({ key: value, ... })
  const setField = (patch) => setFormState((p) => ({ ...p, ...patch }));

  // Step validation
  const canAdvance = () => {
    if (step === 0) return !!form.subject_id || !!form.subjectName;
    if (step === 1) return form.questionCount >= 1 && form.questionTypes.length >= 1;
    return true;
  };

  const handleNext = () => {
    if (!canAdvance()) {
      toast.error(step === 0 ? "Please select a subject first." : "Fill required fields.");
      return;
    }
    setStep((s) => s + 1);
  };

  const handleBack = () => setStep((s) => Math.max(0, s - 1));

  const handleSubmit = async () => {
    if (!canAdvance()) return;
    setIsSubmitting(true);
    try {
      const res = await axios.post("/api/mock-tests", form, { withCredentials: true });
      toast.success("Test created! Good luck 🎯");

      // Naya test ka ID response se nikalo (backend ke response shape ke hisaab se)
      const newTestId =
        res.data?.mockTest?._id ||
        res.data?.test?._id ||
        res.data?._id ||
        res.data?.id;

      if (newTestId) {
        router.push(`/self-learner/test-engine/test-yourself/${newTestId}`);
      } else {
        router.push("/self-learner/test-engine");
      }
    } catch (err) {
      toast.error(err?.response?.data?.error || "Something went wrong. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const STEPS_TOTAL = STEP_LABELS.length;

  if (mode === null) {
    return <ModePicker color={color} onSelect={setMode} />;
  }

  if (mode === "roadmap") {
    return <RoadmapTestWizard color={color} onBack={() => setMode(null)} />;
  }

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: color }}>
      <div className="flex-1 flex items-start justify-center p-5 pt-8">
        <div className="w-full max-w-xl">

          {/* Card */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">

            {/* Card header */}
            <div className="px-6 pt-6 pb-5" style={{ borderBottom: "1.5px solid #f3f4f6" }}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Create a Practice Test</h2>
                  <p className="text-sm text-gray-400 mt-0.5">{STEP_LABELS[step]}</p>
                </div>
                <Steps current={step} total={STEPS_TOTAL} color={color} />
              </div>

              {/* Progress bar */}
              <div className="w-full bg-gray-100 rounded-full h-1.5">
                <div
                  className="h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${((step + 1) / STEPS_TOTAL) * 100}%`, backgroundColor: color }}
                />
              </div>
            </div>

            {/* Card body */}
            <div className="px-6 py-6">
              {step === 0 && (
                <StepSubject
                  form={form}
                  setField={setField}
                  color={color}
                  subjects={subjects}
                  loadingSubjects={loadingSubjects}
                />
              )}
              {step === 1 && (
                <StepFormat form={form} setField={setField} color={color} />
              )}
              {step === 2 && (
                <StepSchedule form={form} setField={setField} color={color} />
              )}
            </div>

            {/* Card footer */}
            <div className="px-6 py-4 flex items-center justify-between"
              style={{ borderTop: "1.5px solid #f3f4f6", backgroundColor: "#fafafa" }}>
              {step > 0 ? (
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
                >
                  ← Back
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
                >
                  Cancel
                </button>
              )}

              {step < STEPS_TOTAL - 1 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl text-white text-sm font-semibold shadow transition-opacity duration-150"
                  style={{ backgroundColor: color, opacity: canAdvance() ? 1 : 0.5 }}
                >
                  Next →
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-6 py-2 rounded-xl text-white text-sm font-semibold shadow disabled:opacity-60 transition-all"
                  style={{ backgroundColor: color }}
                >
                  {isSubmitting ? (
                    <><Spinner className="w-4 h-4" /> Creating…</>
                  ) : (
                    "Create Test 🎯"
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Help nudge */}
          <p className="text-center text-xs mt-4" style={{ color: color + "bb" }}>
            Test questions are auto-generated from your syllabusS.
          </p>
        </div>
      </div>
    </div>
  );
}