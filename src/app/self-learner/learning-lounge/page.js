"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ReactMarkdown from "react-markdown";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  Loader2,
  BookOpen,
  Lightbulb,
  AlertTriangle,
  Code2,
  Star,
  ClipboardList,
  Pencil,
  Lock,
  Volume2,
  Square,
} from "lucide-react";
import {
  getRoadmaps,
  getRoadmapById,
  updateSubtopicProgress,
  fetchSubtopicNotes,
  fetchLearningResources,
  fetchPracticeQuestions,
  evaluatePracticeAnswer,
} from "../roadmap/api";
import VarkDifficultyPicker from "../roadmap/components/VarkDifficultyPicker";
import MermaidDiagram from "../roadmap/components/MermaidDiagram";
import HandsOnTaskPanel from "../roadmap/components/HandsOnTaskPanel";
import ResourcesPanel from "../roadmap/components/ResourcesPanel";

// ─── Read-aloud (browser Web Speech API — no backend/API cost) ───────────────

function notesToSpeechText(notes) {
  const parts = [notes.summary];
  if (Array.isArray(notes.detailedExplanation)) {
    notes.detailedExplanation.forEach((s) => parts.push(s.heading, s.content));
  } else if (notes.detailedExplanation) {
    parts.push(notes.detailedExplanation);
  }
  if (notes.keyPoints?.length) parts.push("Key points.", ...notes.keyPoints);
  if (notes.commonMistakes?.length) parts.push("Common mistakes.", ...notes.commonMistakes);
  if (notes.interviewTips?.length) parts.push("Interview tips.", ...notes.interviewTips);
  if (notes.revisionChecklist?.length) parts.push("Revision checklist.", ...notes.revisionChecklist);
  return parts.filter(Boolean).join(". ");
}

function useReadAloud() {
  const [speaking, setSpeaking] = useState(false);

  const speak = (text) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const stop = () => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setSpeaking(false);
  };

  useEffect(() => () => stop(), []);

  return { speaking, speak, stop };
}

// ─── AI Notes Renderer ────────────────────────────────────────────────────────

const markdownComponents = {
  strong: ({ node, ...props }) => <strong className="font-bold text-[#1E1B4B]" {...props} />,
  h1: ({ node, ...props }) => <h3 className="text-lg font-black text-[#1E1B4B] mt-4 mb-2" {...props} />,
  h2: ({ node, ...props }) => <h4 className="text-base font-black text-[#1E1B4B] mt-3 mb-2" {...props} />,
  h3: ({ node, ...props }) => <h5 className="text-sm font-bold text-[#1E1B4B] mt-2 mb-1" {...props} />,
  h4: ({ node, ...props }) => <h6 className="text-xs font-bold text-[#1E1B4B] mt-2 mb-1" {...props} />,
  p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
  ul: ({ node, ...props }) => <ul className="list-disc pl-4 mb-2" {...props} />,
  ol: ({ node, ...props }) => <ol className="list-decimal pl-4 mb-2" {...props} />,
  li: ({ node, ...props }) => <li className="mb-1" {...props} />
};

function AINotesDisplay({ notes, isCompleted, onToggleComplete, onDiagramError }) {
  const [compliment, setCompliment] = useState("");
  const { speaking, speak, stop } = useReadAloud();

  if (!notes) return null;

  const handleToggle = () => {
    if (!isCompleted) {
      const words = ["Wonderful!", "Amazing!", "Well done!", "Great job!"];
      setCompliment(words[Math.floor(Math.random() * words.length)]);
    } else {
      setCompliment("");
    }
    onToggleComplete();
  };

  return (
    <div className="space-y-5">

      {/* Read Aloud control */}
      <div className="flex justify-end">
        <button
          onClick={() => (speaking ? stop() : speak(notesToSpeechText(notes)))}
          className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-[#6C63FF] bg-[#F0EEFF] hover:bg-[#E4E1FF] px-3 py-2 rounded-xl transition-all duration-200"
        >
          {speaking ? <Square size={12} /> : <Volume2 size={12} />}
          {speaking ? "Stop Reading" : "Read Aloud"}
        </button>
      </div>

      {/* Summary */}
      <div className="bg-[#F0EEFF] border border-[#6C63FF]/20 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-2">
          <BookOpen size={14} className="text-[#6C63FF]" />
          <span className="text-[10px] font-black text-[#6C63FF] uppercase tracking-widest">Overview</span>
        </div>
        <div className="text-xs font-semibold text-slate-700 leading-relaxed">
          <ReactMarkdown components={markdownComponents}>{notes.summary}</ReactMarkdown>
        </div>
      </div>

      {/* Concept Diagram (Visual-dominant notes only) */}
      {notes.conceptDiagram && (
        <MermaidDiagram diagram={notes.conceptDiagram} onError={onDiagramError} />
      )}

      {/* Hands-On Task (Kinesthetic-dominant notes only) */}
      <HandsOnTaskPanel task={notes.handsOnTask} />

      {/* Detailed Explanation */}
      {notes.detailedExplanation && (
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-xs">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-4">
            Detailed Explanation
          </span>
          {Array.isArray(notes.detailedExplanation) ? (
            <div className="space-y-5">
              {notes.detailedExplanation.map((section, i) => (
                <div key={i}>
                  {section.heading && (
                    <h5 className="text-xs font-black text-[#1E1B4B] uppercase tracking-wide mb-1.5 border-b border-gray-100 pb-1">
                      {section.heading}
                    </h5>
                  )}
                  <div className="text-xs text-slate-700 leading-relaxed font-medium whitespace-pre-wrap">
                    <ReactMarkdown components={markdownComponents}>{section.content}</ReactMarkdown>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs text-slate-700 leading-relaxed font-medium whitespace-pre-wrap">
              <ReactMarkdown components={markdownComponents}>{notes.detailedExplanation}</ReactMarkdown>
            </div>
          )}
        </div>
      )}

      {/* Key Points */}
      {notes.keyPoints?.length > 0 && (
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb size={13} className="text-amber-500" />
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Key Points</span>
          </div>
          <ul className="space-y-2">
            {notes.keyPoints.map((pt, i) => (
              <li key={i} className="flex items-start gap-2 text-xs font-semibold text-slate-700">
                <span className="text-[#6C63FF] shrink-0 mt-0.5">→</span>
                <span>{pt}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Formulas / Rules */}
      {notes.formulasOrRules?.length > 0 && (
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-xs">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-3">
            Formulas &amp; Rules
          </span>
          <div className="space-y-3">
            {notes.formulasOrRules.map((fr, i) => (
              <div key={i} className="bg-[#FAFBFF] border border-gray-100 rounded-xl p-3">
                <span className="block text-[10px] font-black text-[#6C63FF] uppercase tracking-wider">
                  {fr.name}
                </span>
                <code className="block text-xs font-mono text-slate-800 mt-1 font-bold">{fr.formula}</code>
                <p className="text-[10px] text-gray-500 font-semibold mt-1 leading-relaxed">{fr.explanation}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Code Example */}
      {notes.codeExample?.code && notes.codeExample.code !== "N/A" && (
        <div className="bg-[#1E1B4B] rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Code2 size={13} className="text-[#6C63FF]" />
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              Code Example ({notes.codeExample.language})
            </span>
          </div>
          <pre className="text-xs text-emerald-300 font-mono overflow-x-auto leading-relaxed whitespace-pre-wrap">
            {notes.codeExample.code}
          </pre>
          {notes.codeExample.explanation && (
            <p className="text-[10px] text-gray-400 font-semibold mt-3 leading-relaxed border-t border-white/10 pt-3">
              {notes.codeExample.explanation}
            </p>
          )}
        </div>
      )}

      {/* Common Mistakes */}
      {notes.commonMistakes?.length > 0 && (
        <div className="bg-[#FFF8F0] border border-amber-200 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={13} className="text-amber-500" />
            <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest">
              Common Mistakes
            </span>
          </div>
          <ul className="space-y-2">
            {notes.commonMistakes.map((m, i) => (
              <li key={i} className="text-xs font-semibold text-slate-700 flex items-start gap-2">
                <span className="text-amber-500 shrink-0 mt-0.5">⚠</span>
                <div className="flex-1">
                  <ReactMarkdown components={markdownComponents}>{m}</ReactMarkdown>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Interview Tips */}
      {notes.interviewTips?.length > 0 && (
        <div className="bg-[#EDFAF5] border border-[#43C6AC]/30 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Star size={13} className="text-[#43C6AC]" />
            <span className="text-[10px] font-black text-[#43C6AC] uppercase tracking-widest">
              Interview Tips
            </span>
          </div>
          <ul className="space-y-2">
            {notes.interviewTips.map((tip, i) => (
              <li key={i} className="text-xs font-semibold text-slate-700 flex items-start gap-2">
                <span className="text-[#43C6AC] shrink-0 mt-0.5">✓</span>
                <div className="flex-1">
                  <ReactMarkdown components={markdownComponents}>{tip}</ReactMarkdown>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Revision Checklist */}
      {notes.revisionChecklist?.length > 0 && (
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <ClipboardList size={13} className="text-[#6C63FF]" />
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              Revision Checklist
            </span>
          </div>
          <ul className="space-y-2">
            {notes.revisionChecklist.map((item, i) => (
              <li key={i} className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                <div className="w-3.5 h-3.5 rounded border-2 border-[#6C63FF] shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Mark Complete Button */}
      <div className="flex flex-col items-center gap-2">
        <button
          onClick={handleToggle}
          className={`w-full h-11 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all duration-200 hover:scale-[1.01] ${isCompleted
            ? "bg-[#EDFAF5] text-[#43C6AC] border border-[#43C6AC]/30"
            : "bg-[#1E1B4B] text-white hover:bg-black"
            }`}
        >
          <CheckCircle2 size={14} />
          {isCompleted ? "Marked as Complete ✓" : "Mark as Complete"}
        </button>
        {isCompleted && compliment && (
          <span className="text-sm font-bold text-[#43C6AC] animate-pulse">{compliment}</span>
        )}
      </div>
    </div>
  );
}

// ─── Practice Questions Panel ─────────────────────────────────────────────────

const VERDICT_STYLE = {
  correct: { label: "Correct", bg: "bg-[#EDFAF5]", border: "border-[#43C6AC]/30", text: "text-[#43C6AC]" },
  partially_correct: { label: "Partially Correct", bg: "bg-[#FFF8F0]", border: "border-amber-300", text: "text-amber-600" },
  incorrect: { label: "Needs Work", bg: "bg-[#FFF0F3]", border: "border-[#FF6584]/30", text: "text-[#FF6584]" },
};

function PracticeQuestionsPanel({ questions, loading, error, roadmapId, week, subtopicIdx }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [studentAnswer, setStudentAnswer] = useState("");
  const [evaluating, setEvaluating] = useState(false);
  const [evalResult, setEvalResult] = useState(null);
  const [evalError, setEvalError] = useState(null);

  if (loading) {
    return (
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 flex items-center justify-center gap-3 text-gray-500">
        <Loader2 size={18} className="animate-spin text-[#6C63FF]" />
        <span className="text-xs font-bold">Generating practice questions…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-5 text-xs font-bold text-red-600 text-center">
        ⚠️ {error}
      </div>
    );
  }

  if (!questions || questions.length === 0) return null;

  const q = questions[currentIdx];
  const isMCQ = q.type === "MCQ";

  const resetQuestionState = () => {
    setSelected(null);
    setRevealed(false);
    setStudentAnswer("");
    setEvalResult(null);
    setEvalError(null);
  };

  const handleNext = () => {
    setCurrentIdx((i) => Math.min(i + 1, questions.length - 1));
    resetQuestionState();
  };

  const handlePrev = () => {
    setCurrentIdx((i) => Math.max(i - 1, 0));
    resetQuestionState();
  };

  const handleSubmitForFeedback = async () => {
    if (!studentAnswer.trim()) return;
    setEvaluating(true);
    setEvalError(null);
    try {
      const result = await evaluatePracticeAnswer(roadmapId, week, subtopicIdx, currentIdx, studentAnswer.trim());
      setEvalResult(result);
      setRevealed(true);
    } catch (err) {
      console.error("Failed to evaluate practice answer", err);
      setEvalError(err?.response?.data?.error || "Failed to evaluate your answer. Try again.");
    } finally {
      setEvaluating(false);
    }
  };

  const verdictStyle = evalResult ? VERDICT_STYLE[evalResult.verdict] || VERDICT_STYLE.incorrect : null;

  return (
    <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-black text-[#1E1B4B] uppercase tracking-wider">
          Practice Questions
        </h4>
        <span className="text-[10px] text-gray-400 font-bold">
          {currentIdx + 1} / {questions.length}
        </span>
      </div>

      <div className="bg-[#FAFBFF] border border-gray-100 rounded-2xl p-4">
        <p className="text-xs font-bold text-slate-800 leading-relaxed">{q.question}</p>
      </div>

      {isMCQ ? (
        <div className="space-y-2">
          {q.options.map((opt, i) => {
            let style = "bg-white border-gray-200 text-slate-700 hover:border-[#6C63FF]/40";
            if (revealed) {
              if (i === q.answer) style = "bg-[#EDFAF5] border-[#43C6AC] text-[#43C6AC]";
              else if (i === selected) style = "bg-[#FFF0F3] border-[#FF6584] text-[#FF6584]";
            } else if (i === selected) {
              style = "bg-[#F0EEFF] border-[#6C63FF] text-[#6C63FF]";
            }

            return (
              <button
                key={i}
                onClick={() => !revealed && setSelected(i)}
                className={`w-full text-left p-3 rounded-xl border text-xs font-bold transition-all duration-200 ${style}`}
              >
                {opt}
              </button>
            );
          })}
        </div>
      ) : (
        !revealed && (
          <div className="space-y-2">
            <textarea
              value={studentAnswer}
              onChange={(e) => setStudentAnswer(e.target.value)}
              placeholder="Write your answer here…"
              rows={4}
              maxLength={4000}
              className="w-full border border-gray-200 rounded-xl bg-[#FAFBFF] p-3 text-xs font-medium text-slate-700 placeholder-gray-400 outline-none focus:ring-2 focus:ring-violet-400 resize-none"
            />
            {evalError && (
              <p className="text-[10px] font-bold text-red-500">⚠️ {evalError}</p>
            )}
          </div>
        )
      )}

      {isMCQ && !revealed && selected !== null && (
        <button
          onClick={() => setRevealed(true)}
          className="w-full h-9 bg-[#6C63FF] text-white rounded-xl text-xs font-black hover:bg-[#5B52EE] transition-all"
        >
          Check Answer
        </button>
      )}
      {!isMCQ && !revealed && (
        <div className="flex gap-2">
          <button
            onClick={handleSubmitForFeedback}
            disabled={!studentAnswer.trim() || evaluating}
            className="flex-1 h-9 bg-[#6C63FF] text-white rounded-xl text-xs font-black hover:bg-[#5B52EE] transition-all disabled:opacity-40 flex items-center justify-center gap-2"
          >
            {evaluating ? <Loader2 size={14} className="animate-spin" /> : null}
            {evaluating ? "Evaluating…" : "Submit for Feedback"}
          </button>
          <button
            onClick={() => setRevealed(true)}
            className="px-4 h-9 bg-[#FAFBFF] hover:bg-gray-100 text-gray-500 border border-gray-200 rounded-xl text-xs font-bold transition-all"
          >
            Just show answer
          </button>
        </div>
      )}

      {revealed && !isMCQ && evalResult && verdictStyle && (
        <div className={`${verdictStyle.bg} border ${verdictStyle.border} rounded-xl p-4`}>
          <p className={`text-[10px] font-black ${verdictStyle.text} uppercase tracking-wider mb-1.5`}>
            {verdictStyle.label}
          </p>
          <div className="text-xs font-semibold text-slate-700 leading-relaxed">
            <ReactMarkdown components={markdownComponents}>{evalResult.feedback}</ReactMarkdown>
          </div>
        </div>
      )}

      {revealed && !isMCQ && q.modelAnswer && (
        <div className="bg-[#EDFAF5] border border-[#43C6AC]/30 rounded-xl p-4">
          <p className="text-[10px] font-black text-[#43C6AC] uppercase tracking-wider mb-1.5">Model Answer</p>
          <div className="text-xs font-semibold text-slate-700 leading-relaxed">
            <ReactMarkdown components={markdownComponents}>{q.modelAnswer}</ReactMarkdown>
          </div>
        </div>
      )}

      {revealed && q.explanation && (
        <div className="bg-[#FAFBFF] border border-gray-100 rounded-xl p-3">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Explanation</p>
          <div className="text-xs font-semibold text-slate-700 leading-relaxed">
            <ReactMarkdown components={markdownComponents}>{q.explanation}</ReactMarkdown>
          </div>
        </div>
      )}

      <div className="flex justify-between pt-1">
        <button
          onClick={handlePrev}
          disabled={currentIdx === 0}
          className="text-[10px] font-black text-gray-400 hover:text-[#6C63FF] disabled:opacity-30 transition"
        >
          ← Prev
        </button>
        <button
          onClick={handleNext}
          disabled={currentIdx === questions.length - 1}
          className="text-[10px] font-black text-gray-400 hover:text-[#6C63FF] disabled:opacity-30 transition"
        >
          Next →
        </button>
      </div>
    </div>
  );
}

// ─── Helpers ────────────────────────────────────────────────────────────────

const varkStorageKey = (roadmapId, week) => `roadmap-vark:${roadmapId}:${week}`;

function resolveCurrentWeek(roadmap) {
  const unlocked = roadmap.unlockedWeeks?.length ? roadmap.unlockedWeeks : [1];
  return Math.max(...unlocked);
}

// ─── Main Learning Lounge Workspace ────────────────────────────────────────────

function LearningLoungeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [allRoadmaps, setAllRoadmaps] = useState([]);
  const [roadmapsLoading, setRoadmapsLoading] = useState(true);
  const [roadmapId, setRoadmapId] = useState(searchParams.get("roadmapId") || null);
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSwitcher, setShowSwitcher] = useState(false);

  const [weekNum, setWeekNum] = useState(searchParams.get("week") ? parseInt(searchParams.get("week")) : null);
  const [subIdx, setSubIdx] = useState(searchParams.get("subtopic") ? parseInt(searchParams.get("subtopic")) : 0);

  // VARK blend + difficulty — remembered per (roadmapId, week) in localStorage.
  const [vark, setVark] = useState(null);
  const [difficulty, setDifficulty] = useState(null);
  const [showPicker, setShowPicker] = useState(false);
  const [retryTick, setRetryTick] = useState(0);
  const forceRegenerateRef = useRef(false);

  const [notes, setNotes] = useState(null);
  const [noteMeta, setNoteMeta] = useState(null);
  const [notesLoading, setNotesLoading] = useState(false);
  const [notesError, setNotesError] = useState(null);

  const healAttemptedRef = useRef(new Set());

  // ── Load the student's roadmaps, resolve an active one if none picked ────
  useEffect(() => {
    let cancelled = false;
    getRoadmaps()
      .then((list) => {
        if (cancelled) return;
        setAllRoadmaps(list || []);
        if (!roadmapId) {
          const active = (list || []).find((r) => r.active) || list?.[0] || null;
          if (active) setRoadmapId(active._id || active.id);
        }
      })
      .catch((err) => console.error("Failed to load roadmaps", err))
      .finally(() => { if (!cancelled) setRoadmapsLoading(false); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Load the resolved roadmap, resolve current week if none picked ───────
  useEffect(() => {
    if (!roadmapId) return;
    let cancelled = false;
    setLoading(true);
    getRoadmapById(roadmapId)
      .then((data) => {
        if (cancelled) return;
        setRoadmap(data);
        setWeekNum((prev) => prev || resolveCurrentWeek(data));
      })
      .catch((err) => console.error("Failed to load roadmap", err))
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [roadmapId]);

  // ── Load remembered VARK choice whenever the active week changes ─────────
  useEffect(() => {
    if (!roadmapId || !weekNum) return;
    try {
      const stored = localStorage.getItem(varkStorageKey(roadmapId, weekNum));
      if (stored) {
        const parsed = JSON.parse(stored);
        setVark({ visual: parsed.visual, auditory: parsed.auditory, reading: parsed.reading, kinesthetic: parsed.kinesthetic });
        setDifficulty(parsed.difficulty);
        setShowPicker(false);
        return;
      }
    } catch (err) {
      console.warn("Failed to read stored VARK choice", err);
    }
    setVark(null);
    setDifficulty(null);
    setShowPicker(true);
  }, [roadmapId, weekNum]);

  const handlePickerComplete = (result) => {
    const { difficulty: d, ...blend } = result;
    setVark(blend);
    setDifficulty(d);
    setShowPicker(false);
    try {
      localStorage.setItem(varkStorageKey(roadmapId, weekNum), JSON.stringify(result));
    } catch (err) {
      console.warn("Failed to store VARK choice", err);
    }
  };

  // ── Load notes whenever subtopic/style/difficulty selection changes ──────
  useEffect(() => {
    if (!roadmap?.weeks || !weekNum || !vark || !difficulty) return;

    const weekData = roadmap.weeks.find((w) => w.week === weekNum);
    if (!weekData) return;

    const subtopic = weekData.subtopics?.[subIdx];
    if (!subtopic) return;

    const regenerate = forceRegenerateRef.current;
    forceRegenerateRef.current = false;

    const fetchNotes = async () => {
      setNotes(null);
      setNotesError(null);
      setNotesLoading(true);
      try {
        const res = await fetchSubtopicNotes(roadmapId, weekNum, subIdx, vark, difficulty, regenerate);
        setNotes(res.notes);
        setNoteMeta({ style: res.style, difficulty: res.difficulty });
      } catch (err) {
        console.error("Failed to fetch notes", err);
        setNotesError(err?.response?.data?.error || "Failed to generate notes. Try again.");
      } finally {
        setNotesLoading(false);
      }
    };

    fetchNotes();
  }, [roadmap?._id, roadmapId, weekNum, subIdx, vark, difficulty, retryTick]);

  // ── Load real learning resources for the current subtopic ─────────────────
  // Deliberately not keyed on vark/difficulty — resources don't vary by
  // style or difficulty, so they don't need to reload when the blend changes.
  const [resources, setResources] = useState(null);
  const [resourcesLoading, setResourcesLoading] = useState(false);
  const [resourcesError, setResourcesError] = useState(null);

  useEffect(() => {
    if (!roadmap?.weeks || !weekNum) return;

    const weekData = roadmap.weeks.find((w) => w.week === weekNum);
    if (!weekData) return;

    const subtopic = weekData.subtopics?.[subIdx];
    if (!subtopic) return;

    let cancelled = false;
    setResources(null);
    setResourcesError(null);
    setResourcesLoading(true);
    fetchLearningResources(roadmapId, weekNum, subIdx)
      .then((res) => { if (!cancelled) setResources(res.resources); })
      .catch((err) => {
        if (cancelled) return;
        console.error("Failed to fetch learning resources", err);
        setResourcesError(err?.response?.data?.error || "Couldn't load recommended resources right now.");
      })
      .finally(() => { if (!cancelled) setResourcesLoading(false); });

    return () => { cancelled = true; };
  }, [roadmap?._id, roadmapId, weekNum, subIdx]);

  const handleDiagramError = () => {
    const key = `${weekNum}-${subIdx}-${noteMeta?.style}-${noteMeta?.difficulty}`;
    if (healAttemptedRef.current.has(key)) return;
    healAttemptedRef.current.add(key);
    forceRegenerateRef.current = true;
    setRetryTick((t) => t + 1);
  };

  const activeSubtopicKey = (() => {
    if (!roadmap?.weeks || !weekNum) return null;
    const weekData = roadmap.weeks.find((w) => w.week === weekNum);
    const sub = weekData?.subtopics?.[subIdx];
    return sub ? `${weekNum}-${subIdx}-${sub.title}` : null;
  })();

  const handleToggleComplete = async () => {
    if (!activeSubtopicKey) return;
    const isCompleted = (roadmap.progress?.completedSubtopics || []).includes(activeSubtopicKey);
    try {
      const updated = await updateSubtopicProgress(roadmapId, activeSubtopicKey, !isCompleted);
      setRoadmap(updated);
    } catch (err) {
      console.error("Failed to toggle subtopic progress", err);
    }
  };

  // ── Practice questions state (per-subtopic, self-check only) ─────────────
  // Scoped to the subtopic just completed, not the whole week — generated
  // automatically the moment "Mark as Complete" flips this subtopic to done.
  const [practiceQuestions, setPracticeQuestions] = useState(null);
  const [practiceLoading, setPracticeLoading] = useState(false);
  const [practiceError, setPracticeError] = useState(null);

  useEffect(() => {
    if (!roadmap?.weeks || !weekNum) return;
    const weekData = roadmap.weeks.find((w) => w.week === weekNum);
    if (!weekData) return;
    const subtopic = weekData.subtopics?.[subIdx];
    if (!subtopic) return;

    const subtopicKey = `${weekNum}-${subIdx}-${subtopic.title}`;
    const done = (roadmap.progress?.completedSubtopics || []).includes(subtopicKey);
    if (!done) {
      setPracticeQuestions(null);
      setPracticeError(null);
      return;
    }

    if (subtopic.practiceQuestions) {
      setPracticeQuestions(subtopic.practiceQuestions);
      return;
    }

    let cancelled = false;
    setPracticeLoading(true);
    setPracticeError(null);
    fetchPracticeQuestions(roadmapId, weekNum, subIdx)
      .then((res) => {
        if (cancelled) return;
        setPracticeQuestions(res.questions);
        setRoadmap((prev) => {
          if (!prev) return prev;
          const updated = JSON.parse(JSON.stringify(prev));
          const wk = (updated.weeks || []).find((w) => w.week === weekNum);
          const sub = wk?.subtopics?.[subIdx];
          if (sub) sub.practiceQuestions = res.questions;
          return updated;
        });
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("Failed to fetch practice questions", err);
        setPracticeError(err?.response?.data?.error || "Failed to generate practice questions.");
      })
      .finally(() => { if (!cancelled) setPracticeLoading(false); });

    return () => { cancelled = true; };
  }, [roadmap?._id, roadmapId, weekNum, subIdx, roadmap?.progress?.completedSubtopics?.length]);

  const updateUrl = (nextRoadmapId, nextWeek, nextSub) => {
    const params = new URLSearchParams();
    params.set("roadmapId", nextRoadmapId);
    if (nextWeek) params.set("week", nextWeek);
    if (nextSub !== undefined) params.set("subtopic", nextSub);
    router.replace(`/self-learner/learning-lounge?${params.toString()}`);
  };

  const handleSelectSubtopic = (sIdx) => {
    setSubIdx(sIdx);
    updateUrl(roadmapId, weekNum, sIdx);
  };

  const handleSelectWeek = (wk) => {
    setWeekNum(wk);
    setSubIdx(0);
    updateUrl(roadmapId, wk, 0);
  };

  const handleSwitchRoadmap = (newId) => {
    setShowSwitcher(false);
    setRoadmapId(newId);
    setRoadmap(null);
    setWeekNum(null);
    setSubIdx(0);
    router.replace(`/self-learner/learning-lounge?roadmapId=${newId}`);
  };

  // ── Guards ───────────────────────────────────────────────────────────────
  if (roadmapsLoading || loading || !roadmap) {
    return (
      <div className="min-h-screen bg-[#F5F7FB] p-6 text-center font-bold text-gray-500 py-40">
        Loading Learning Lounge…
      </div>
    );
  }

  if (!roadmap.weeks?.length) {
    return (
      <div className="min-h-screen bg-[#F5F7FB] p-6 text-center py-40 space-y-4">
        <p className="text-red-500 font-bold">This roadmap has no weeks yet.</p>
        <button
          onClick={() => router.push("/self-learner/roadmap")}
          className="bg-[#1E1B4B] text-white px-5 py-2.5 rounded-xl font-bold text-xs"
        >
          Back to Roadmaps
        </button>
      </div>
    );
  }

  const weekData = roadmap.weeks.find((w) => w.week === weekNum) || roadmap.weeks[0];
  const activeSubtopic = weekData.subtopics[subIdx] || weekData.subtopics[0];
  const isCompleted = activeSubtopicKey ? (roadmap.progress?.completedSubtopics || []).includes(activeSubtopicKey) : false;
  const unlockedWeeks = roadmap.unlockedWeeks?.length ? roadmap.unlockedWeeks : [1];

  return (
    <div className="min-h-screen bg-[#F5F7FB] p-4 md:p-6 text-slate-800 animate-fadeIn">
      {showPicker && (
        <VarkDifficultyPicker
          initialBlend={vark}
          initialDifficulty={difficulty}
          completeLabel="Go To Learning Lounge"
          onComplete={handlePickerComplete}
        />
      )}

      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header bar */}
        <div className="flex flex-wrap justify-between items-center gap-3 bg-white rounded-3xl border border-gray-200 shadow-sm p-4">
          <button
            onClick={() => router.push(`/self-learner/roadmap/${roadmapId}`)}
            className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-[#6C63FF] transition-all duration-200"
          >
            <ArrowLeft size={14} /> Back to roadmap
          </button>

          <div className="flex items-center gap-3">
            {difficulty && (
              <button
                onClick={() => setShowPicker(true)}
                className="flex items-center gap-1.5 text-[10px] font-bold text-[#6C63FF] bg-[#F0EEFF] px-3 py-1.5 rounded-full hover:bg-[#E4E1FF] transition-all"
                title="Change learning style / difficulty"
              >
                <Pencil size={11} /> {difficulty}
              </button>
            )}

            {/* Roadmap switcher */}
            <div className="relative">
              <button
                onClick={() => setShowSwitcher((s) => !s)}
                className="flex items-center gap-1.5 text-xs font-black text-[#1E1B4B] bg-[#FAFBFF] border border-gray-200 px-3 py-1.5 rounded-full hover:border-[#6C63FF]/40 transition-all"
              >
                {roadmap.subject} <ChevronDown size={12} />
              </button>
              {showSwitcher && (
                <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-2xl shadow-xl z-20 p-2 space-y-1">
                  {allRoadmaps.map((r) => {
                    const rId = r._id || r.id;
                    return (
                      <button
                        key={rId}
                        onClick={() => handleSwitchRoadmap(rId)}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between transition-all ${rId === roadmapId ? "bg-[#F0EEFF] text-[#6C63FF]" : "hover:bg-gray-50 text-gray-600"
                          }`}
                      >
                        <span className="truncate">{r.subject}</span>
                        <span className="text-[10px] font-semibold text-gray-400 shrink-0 ml-2">
                          {r.progress?.overallProgress || 0}%
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Compact week selector */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {roadmap.weeks.map((wk) => {
            const isUnlocked = unlockedWeeks.includes(wk.week);
            const isActive = wk.week === weekNum;
            return (
              <button
                key={wk.week}
                disabled={!isUnlocked}
                onClick={() => handleSelectWeek(wk.week)}
                className={`shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[11px] font-black transition-all duration-200 ${isActive
                  ? "bg-[#1E1B4B] text-white"
                  : isUnlocked
                    ? "bg-white border border-gray-200 text-gray-600 hover:border-[#6C63FF]/40"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  }`}
              >
                {!isUnlocked && <Lock size={10} />}
                Week {wk.week}
              </button>
            );
          })}
        </div>

        {/* Split layout — sidebar stays put (sticky) while the notes
            column on the right scrolls independently in its own box, so
            reading a long note never requires re-scrolling past the week
            intro / subtopic list to get back to them. */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">

          {/* ── Sidebar syllabus menu ── */}
          <div className="space-y-4 md:sticky md:top-6 md:self-start">
            <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-5 space-y-4">
              <h4 className="text-xs font-black text-[#1E1B4B] uppercase tracking-wider border-b border-gray-100 pb-2">
                Week {weekNum}: {weekData.title}
              </h4>
              {weekData.introDescription && (
                <p className="text-[11px] font-semibold text-gray-400 leading-relaxed -mt-2 pb-2 border-b border-gray-100">
                  {weekData.introDescription}
                </p>
              )}

              <div className="space-y-1">
                {weekData.subtopics.map((sub, sIdx) => {
                  const subKey = `${weekNum}-${sIdx}-${sub.title}`;
                  const isDone = (roadmap.progress?.completedSubtopics || []).includes(subKey);
                  const isCurrent = subIdx === sIdx;

                  return (
                    <button
                      key={sIdx}
                      onClick={() => handleSelectSubtopic(sIdx)}
                      className={`w-full text-left p-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-all duration-200 ${isCurrent
                        ? "bg-[#F0EEFF] text-[#6C63FF]"
                        : "hover:bg-gray-50 text-gray-600"
                        }`}
                    >
                      <span className="truncate pl-2">• {sub.title}</span>
                      {isDone && (
                        <CheckCircle2 size={12} className="text-[#43C6AC] shrink-0 ml-2" />
                      )}
                    </button>
                  );
                })}
              </div>

            </div>
          </div>

          {/* ── Main workspace ── */}
          <div className="md:col-span-2 space-y-6">

            {activeSubtopic && (
              <>

                {/* Subtopic title bar — stays put, only the notes below it scroll */}
                <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-5">
                  <span className="text-[10px] font-black text-[#6C63FF] uppercase tracking-widest block">
                    Week {weekNum} — {weekData.title}
                  </span>
                  <h2 className="text-base font-black text-[#1E1B4B] mt-1">
                    {activeSubtopic.title}
                  </h2>
                  {activeSubtopic.difficulty && (
                    <span className="inline-block mt-2 text-[10px] font-bold bg-[#F0EEFF] text-[#6C63FF] px-2 py-0.5 rounded-full">
                      {activeSubtopic.difficulty}
                    </span>
                  )}
                </div>

                {/* Scrollable notes region — one dedicated scroller for
                      notes/resources/practice, independent from the sidebar
                      and the title bar above it. */}
                <div className="space-y-6 md:max-h-[calc(100vh-220px)] md:overflow-y-auto md:pr-2 -mr-2">

                  {/* Notes area */}
                  {notesLoading ? (
                    <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-10 flex flex-col items-center gap-4 text-center">
                      <Loader2 size={36} className="animate-spin text-[#6C63FF]" />
                      <div>
                        <p className="text-sm font-black text-[#1E1B4B]">
                          Guru is generating your study notes…
                        </p>
                        <p className="text-xs text-gray-400 font-semibold mt-1">
                          This takes ~10 seconds on first load. Notes are cached after that.
                        </p>
                      </div>
                    </div>
                  ) : notesError ? (
                    <div className="bg-red-50 border border-red-200 rounded-2xl p-5 text-center space-y-3">
                      <p className="text-xs font-bold text-red-600">⚠️ {notesError}</p>
                      <button
                        onClick={() => {
                          forceRegenerateRef.current = true;
                          setRetryTick((t) => t + 1);
                        }}
                        className="bg-red-500 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-red-600 transition"
                      >
                        Retry
                      </button>
                    </div>
                  ) : notes ? (
                    <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-5">
                      <AINotesDisplay
                        notes={notes}
                        isCompleted={isCompleted}
                        onToggleComplete={handleToggleComplete}
                        onDiagramError={handleDiagramError}
                      />
                    </div>
                  ) : null}

                  {/* Recommended Resources — real YouTube/Wikipedia/arXiv links */}
                  {notes && (
                    <ResourcesPanel
                      resources={resources}
                      loading={resourcesLoading}
                      error={resourcesError}
                    />
                  )}

                  {/* Practice Questions — 10 questions auto-generated for this
                      exact subtopic the moment it's marked complete */}
                  {isCompleted && (
                    <PracticeQuestionsPanel
                      questions={practiceQuestions}
                      loading={practiceLoading}
                      error={practiceError}
                      roadmapId={roadmapId}
                      week={weekNum}
                      subtopicIdx={subIdx}
                    />
                  )}

                </div>

              </>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

export default function LearningLoungePage() {
  return (
    <Suspense fallback={<div className="p-6 text-center text-gray-500">Loading Learning Lounge…</div>}>
      <LearningLoungeContent />
    </Suspense>
  );
}
