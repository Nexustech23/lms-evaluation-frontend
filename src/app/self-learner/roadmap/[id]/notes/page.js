"use client";

import { useEffect, useState, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import ReactMarkdown from "react-markdown";
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  BookOpen,
  Lightbulb,
  AlertTriangle,
  Code2,
  Star,
  ClipboardList,
} from "lucide-react";
import {
  getRoadmapById,
  updateSubtopicProgress,
  fetchSubtopicNotes,
} from "../../api";

// ─── AI Notes Renderer ────────────────────────────────────────────────────────

const markdownComponents = {
  strong: ({node, ...props}) => <strong className="font-bold text-[#1E1B4B]" {...props} />,
  h1: ({node, ...props}) => <h3 className="text-lg font-black text-[#1E1B4B] mt-4 mb-2" {...props} />,
  h2: ({node, ...props}) => <h4 className="text-base font-black text-[#1E1B4B] mt-3 mb-2" {...props} />,
  h3: ({node, ...props}) => <h5 className="text-sm font-bold text-[#1E1B4B] mt-2 mb-1" {...props} />,
  h4: ({node, ...props}) => <h6 className="text-xs font-bold text-[#1E1B4B] mt-2 mb-1" {...props} />,
  p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
  ul: ({node, ...props}) => <ul className="list-disc pl-4 mb-2" {...props} />,
  ol: ({node, ...props}) => <ol className="list-decimal pl-4 mb-2" {...props} />,
  li: ({node, ...props}) => <li className="mb-1" {...props} />
};

function AINotesDisplay({ notes, isCompleted, onToggleComplete }) {
  const [compliment, setCompliment] = useState("");

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
          className={`w-full h-11 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all duration-200 hover:scale-[1.01] ${
            isCompleted
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

function PracticeQuestionsPanel({ questions }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(false);

  if (!questions || questions.length === 0) return null;

  const q = questions[currentIdx];

  const handleNext = () => {
    setCurrentIdx((i) => Math.min(i + 1, questions.length - 1));
    setSelected(null);
    setRevealed(false);
  };

  const handlePrev = () => {
    setCurrentIdx((i) => Math.max(i - 1, 0));
    setSelected(null);
    setRevealed(false);
  };

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

      {!revealed && selected !== null && (
        <button
          onClick={() => setRevealed(true)}
          className="w-full h-9 bg-[#6C63FF] text-white rounded-xl text-xs font-black hover:bg-[#5B52EE] transition-all"
        >
          Check Answer
        </button>
      )}

      {revealed && (
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

// ─── Main Notes Workspace ─────────────────────────────────────────────────────

function NotesWorkspaceContent() {
  const router        = useRouter();
  const { id }        = useParams();
  const searchParams  = useSearchParams();

  const levelNum        = parseInt(searchParams.get("level") || "1");
  const initialTopicIdx = parseInt(searchParams.get("topic") || "0");
  const initialSubIdx   = parseInt(searchParams.get("subtopic") || "0");
  const initialWS       = "notes";

  const [roadmap,   setRoadmap]   = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [topicIdx,  setTopicIdx]  = useState(initialTopicIdx);
  const [subIdx,    setSubIdx]    = useState(initialSubIdx);
  const [workspace, setWorkspace] = useState(initialWS);

  // Notes loading state
  const [notes,         setNotes]         = useState(null);
  const [notesLoading,  setNotesLoading]  = useState(false);
  const [notesError,    setNotesError]    = useState(null);

  // ── Load roadmap on mount ────────────────────────────────────────────────
  const loadData = async () => {
    try {
      const data = await getRoadmapById(id);
      setRoadmap(data);
    } catch (err) {
      console.error("Failed to load notes data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (id) loadData(); }, [id]);

  // ── Load notes whenever subtopic selection changes ───────────────────────
  useEffect(() => {
    if (!roadmap || workspace !== "notes") return;

    const levelData  = roadmap.levels.find((l) => l.level === levelNum);
    if (!levelData) return;

    const subtopic = levelData.topics?.[topicIdx]?.subtopics?.[subIdx];
    if (!subtopic) return;

    // Check if notes are already embedded in the DB doc (cached)
    if (subtopic.notes) {
      setNotes(subtopic.notes);
      setNotesError(null);
      return;
    }

    // Fetch / generate from backend
    const fetchNotes = async () => {
      setNotes(null);
      setNotesError(null);
      setNotesLoading(true);
      try {
        const res = await fetchSubtopicNotes(id, levelNum, topicIdx, subIdx);
        setNotes(res.notes);
        // Update local roadmap doc cache so re-selects are instant
        setRoadmap((prev) => {
          if (!prev) return prev;
          const updated = JSON.parse(JSON.stringify(prev));
          const lvl = updated.levels.find((l) => l.level === levelNum);
          if (lvl?.topics?.[topicIdx]?.subtopics?.[subIdx]) {
            lvl.topics[topicIdx].subtopics[subIdx].notes = res.notes;
          }
          return updated;
        });
      } catch (err) {
        console.error("Failed to fetch notes", err);
        setNotesError(
          err?.response?.data?.error || "Failed to generate notes. Try again."
        );
      } finally {
        setNotesLoading(false);
      }
    };

    fetchNotes();
  }, [roadmap?._id, levelNum, topicIdx, subIdx, workspace]);

  // ── Toggle subtopic complete ─────────────────────────────────────────────
  const handleToggleComplete = async () => {
    if (!activeSubtopic) return;
    const isCompleted = (roadmap.progress?.completedSubtopics || []).includes(activeSubtopicKey);
    try {
      const updated = await updateSubtopicProgress(id, activeSubtopicKey, !isCompleted);
      setRoadmap(updated);
    } catch (err) {
      console.error("Failed to toggle subtopic progress", err);
    }
  };

  const handleSelectSubtopic = (tIdx, sIdx) => {
    setTopicIdx(tIdx);
    setSubIdx(sIdx);
    setWorkspace("notes");
    router.push(
      `/self-learner/roadmap/${id}/notes?level=${levelNum}&topic=${tIdx}&subtopic=${sIdx}&workspace=notes`
    );
  };

  // ── Guards ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F7FB] p-6 text-center font-bold text-gray-500 py-40">
        Loading study notes...
      </div>
    );
  }

  if (!roadmap) {
    return (
      <div className="min-h-screen bg-[#F5F7FB] p-6 text-center py-40">
        <p className="text-red-500 font-bold">Roadmap not found</p>
      </div>
    );
  }

  const levelData       = roadmap.levels.find((l) => l.level === levelNum) || roadmap.levels[0];
  const activeTopic     = levelData.topics[topicIdx] || levelData.topics[0];
  const activeSubtopic  = activeTopic?.subtopics[subIdx] || activeTopic?.subtopics[0];
  const activeSubtopicKey = `${levelNum}-${topicIdx}-${activeSubtopic?.title}`;
  const isCompleted     = (roadmap.progress?.completedSubtopics || []).includes(activeSubtopicKey);

  return (
    <div className="min-h-screen bg-[#F5F7FB] p-4 md:p-6 text-slate-800 animate-fadeIn">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header bar */}
        <div className="flex justify-between items-center bg-white rounded-3xl border border-gray-200 shadow-sm p-4">
          <button
            onClick={() => router.push(`/self-learner/roadmap/${id}`)}
            className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-[#6C63FF] transition-all duration-200"
          >
            <ArrowLeft size={14} /> Back to stage board
          </button>
          <div>
            <span className="text-xs font-bold text-gray-400 mr-2 uppercase">Subject:</span>
            <span className="text-xs font-black text-[#1E1B4B]">{roadmap.subject}</span>
          </div>
        </div>

        {/* Split layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* ── Sidebar syllabus menu ── */}
          <div className="space-y-4">
            <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-5 space-y-4">
              <h4 className="text-xs font-black text-[#1E1B4B] uppercase tracking-wider border-b border-gray-100 pb-2">
                Stage {levelNum} Syllabus
              </h4>

              <div className="space-y-2">
                {levelData.topics.map((topic, tIdx) => (
                  <div key={tIdx} className="space-y-1">
                    <span className="block text-[10px] font-bold text-gray-400 uppercase pl-2 mt-2">
                      {topic.title}
                    </span>
                    <div className="space-y-1">
                      {topic.subtopics.map((sub, sIdx) => {
                        const subKey   = `${levelNum}-${tIdx}-${sub.title}`;
                        const isDone   = (roadmap.progress?.completedSubtopics || []).includes(subKey);
                        const isCurrent = workspace === "notes" && topicIdx === tIdx && subIdx === sIdx;

                        return (
                          <button
                            key={sIdx}
                            onClick={() => handleSelectSubtopic(tIdx, sIdx)}
                            className={`w-full text-left p-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-all duration-200 ${
                              isCurrent
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
                ))}
              </div>

            </div>
          </div>

          {/* ── Main workspace ── */}
          <div className="md:col-span-2 space-y-6">

            {activeSubtopic && (
                <div className="space-y-6">

                  {/* Subtopic title bar */}
                  <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-5">
                    <span className="text-[10px] font-black text-[#6C63FF] uppercase tracking-widest block">
                      Stage {levelNum} — {activeTopic?.title}
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

                  {/* Notes area */}
                  {notesLoading ? (
                    <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-10 flex flex-col items-center gap-4 text-center">
                      <Loader2 size={36} className="animate-spin text-[#6C63FF]" />
                      <div>
                        <p className="text-sm font-black text-[#1E1B4B]">
                          Claude is generating your study notes…
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
                          setNotes(null);
                          // Force re-fetch by clearing cached notes from local state
                          setRoadmap((prev) => {
                            if (!prev) return prev;
                            const updated = JSON.parse(JSON.stringify(prev));
                            const lvl = updated.levels.find((l) => l.level === levelNum);
                            if (lvl?.topics?.[topicIdx]?.subtopics?.[subIdx]) {
                              delete lvl.topics[topicIdx].subtopics[subIdx].notes;
                            }
                            return updated;
                          });
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
                      />
                    </div>
                  ) : null}

                  {/* Practice Questions */}
                  {isCompleted && (
                    <PracticeQuestionsPanel questions={levelData.practiceQuestions} />
                  )}

                </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

export default function NotesWorkspacePage() {
  return (
    <Suspense fallback={<div className="p-6 text-center text-gray-500">Loading notes workspace...</div>}>
      <NotesWorkspaceContent />
    </Suspense>
  );
}
