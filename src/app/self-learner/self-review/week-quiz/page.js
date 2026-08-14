"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Clock,
  ShieldAlert,
  Award,
  ArrowLeft,
  ArrowRight,
  Loader2,
  CheckCircle2,
  BookOpen,
} from "lucide-react";
import { getRoadmaps, getRoadmapById, resumeAutoTest, generateAutoTest, submitWeekQuiz } from "../../roadmap/api";
import AutoTestConfigForm from "../../roadmap/components/AutoTestConfigForm";

function resolveCurrentWeek(roadmap) {
  const unlocked = roadmap.unlockedWeeks?.length ? roadmap.unlockedWeeks : [1];
  return Math.max(...unlocked);
}

// ─── Quiz Logic ───────────────────────────────────────────────────────────────

function WeekQuizContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Both self-resolve to the student's active roadmap / current in-progress
  // week when not given explicitly — mirrors the Learning Lounge, so the
  // Self-Review hub tile can link here with no query params at all.
  const [roadmapId, setRoadmapId] = useState(searchParams.get("roadmapId"));
  const [weekNum, setWeekNum] = useState(searchParams.get("week") ? parseInt(searchParams.get("week")) : null);

  // Phase state machine: loading -> gated -> config -> generating -> exam -> grading -> results
  const [phase, setPhase] = useState("loading");
  const [loadError, setLoadError] = useState(null);
  const [generateError, setGenerateError] = useState(null);
  const [roadmap, setRoadmap] = useState(null);

  const [questions, setQuestions] = useState(null);

  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(600);
  const [quizResult, setQuizResult] = useState(null);

  // ── Resolve roadmap/week, check the completion gate, then check for a resumable test ──
  useEffect(() => {
    const load = async () => {
      setPhase("loading");
      setLoadError(null);
      try {
        let activeRoadmapId = roadmapId;
        if (!activeRoadmapId) {
          const list = await getRoadmaps();
          const active = (list || []).find((r) => r.active) || list?.[0] || null;
          if (!active) {
            setLoadError("You don't have a roadmap yet. Create one first.");
            return;
          }
          activeRoadmapId = active._id || active.id;
          setRoadmapId(activeRoadmapId);
        }

        const data = await getRoadmapById(activeRoadmapId);
        setRoadmap(data);

        const activeWeek = weekNum || resolveCurrentWeek(data);
        if (!weekNum) setWeekNum(activeWeek);

        const weekData = data.weeks?.find((w) => w.week === activeWeek);
        if (!weekData) {
          setLoadError(`Week ${activeWeek} was not found on this roadmap.`);
          return;
        }

        const completed = new Set(data.progress?.completedSubtopics || []);
        const allDone = weekData.subtopics.every((sub, idx) => completed.has(`${activeWeek}-${idx}-${sub.title}`));
        if (!allDone) {
          setPhase("gated");
          return;
        }

        const resumed = await resumeAutoTest(activeRoadmapId, activeWeek);
        if (resumed.questions?.length) {
          setQuestions(resumed.questions);
          setTimeLeft(60 * resumed.questions.length);
          setPhase("exam");
        } else {
          setPhase("config");
        }
      } catch (err) {
        console.error("Failed to load week quiz", err);
        setLoadError(err?.response?.data?.error || "Failed to load. Please try again.");
      }
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Countdown timer ─────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== "exam") return;
    if (timeLeft <= 0) { handleSubmit(); return; }

    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, phase]);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const isAnswered = (idx) => {
    const val = answers[String(idx)];
    if (val === undefined || val === null) return false;
    if (typeof val === "string") return val.trim().length > 0;
    return true;
  };

  const handleSelectOption = (optIdx) => setAnswers({ ...answers, [String(currentIdx)]: optIdx });
  const handleFreeTextChange = (text) => setAnswers({ ...answers, [String(currentIdx)]: text });

  const handleGenerate = async (config) => {
    setGenerateError(null);
    setPhase("generating");
    try {
      const data = await generateAutoTest(roadmapId, weekNum, config);
      setQuestions(data.questions);
      setAnswers({});
      setCurrentIdx(0);
      setTimeLeft(60 * data.questions.length);
      setPhase("exam");
    } catch (err) {
      console.error("Failed to generate test", err);
      setGenerateError(err?.response?.data?.error || "Failed to generate the test. Please try again.");
      setPhase("config");
    }
  };

  const handleSubmit = async () => {
    setPhase("grading");
    try {
      const result = await submitWeekQuiz(roadmapId, weekNum, answers);
      setQuizResult(result);
      setPhase("results");
    } catch (err) {
      console.error("Quiz submission failed", err);
      alert("Submission failed. Please try again.");
      setPhase("exam");
    }
  };

  // ── Loading / Error / Gated screens ───────────────────────────────────────

  if (phase === "loading") {
    return (
      <div className="min-h-screen bg-[#1E1B4B] text-white flex flex-col items-center justify-center p-6 gap-5">
        <Loader2 size={48} className="animate-spin text-[#6C63FF]" />
        <p className="text-xs text-gray-400 font-semibold">Checking your progress…</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen bg-[#1E1B4B] text-white flex flex-col items-center justify-center p-6 gap-5">
        <ShieldAlert size={48} className="text-red-400" />
        <div className="text-center">
          <h3 className="text-base font-black text-red-400">Couldn't Load Weekly Quiz</h3>
          <p className="text-xs text-gray-400 font-semibold mt-1 max-w-xs">{loadError}</p>
        </div>
        <button
          onClick={() => router.push("/self-learner/roadmap")}
          className="bg-white/10 border border-white/10 px-5 py-2.5 rounded-xl text-xs font-bold"
        >
          Back to Roadmaps
        </button>
      </div>
    );
  }

  if (phase === "gated") {
    return (
      <div className="min-h-screen bg-[#F5F7FB] flex flex-col items-center justify-center p-6 gap-5 text-center">
        <div className="bg-white rounded-3xl border border-gray-200 shadow-xl max-w-md w-full p-8 space-y-4">
          <div className="w-14 h-14 rounded-full bg-[#FFF8EE] text-[#F7971E] flex items-center justify-center mx-auto">
            <BookOpen size={26} />
          </div>
          <h3 className="text-lg font-black text-[#1E1B4B]">Finish Studying First</h3>
          <p className="text-xs font-semibold text-gray-500 leading-relaxed">
            Complete every subtopic for Week {weekNum} in the Learning Lounge before taking this week's quiz.
          </p>
          <button
            onClick={() => router.push(`/self-learner/learning-lounge?roadmapId=${roadmapId}&week=${weekNum}`)}
            className="w-full h-12 bg-[#1E1B4B] hover:bg-black text-white text-xs font-bold rounded-xl transition-all duration-200"
          >
            Go to Learning Lounge
          </button>
        </div>
      </div>
    );
  }

  if (phase === "config") {
    return (
      <div className="min-h-screen bg-[#F5F7FB] flex items-center justify-center p-4 md:p-6">
        <AutoTestConfigForm onGenerate={handleGenerate} generating={false} error={generateError} />
      </div>
    );
  }

  if (phase === "generating") {
    return (
      <div className="min-h-screen bg-[#1E1B4B] text-white flex flex-col items-center justify-center p-6 gap-5">
        <Loader2 size={48} className="animate-spin text-[#6C63FF]" />
        <div className="text-center">
          <h3 className="text-base font-black">Generating Week {weekNum} Quiz…</h3>
          <p className="text-xs text-gray-400 font-semibold mt-1 max-w-xs">
            The Guru is crafting personalised questions based on your curriculum. ~10-20 seconds.
          </p>
        </div>
      </div>
    );
  }

  if (phase === "grading") {
    return (
      <div className="min-h-screen bg-[#1E1B4B] text-white flex flex-col items-center justify-center p-6 space-y-4">
        <Loader2 size={48} className="animate-spin text-[#6C63FF]" />
        <h3 className="text-lg font-black">Evaluating Your Answers…</h3>
        <p className="text-xs text-gray-400 font-semibold max-w-xs text-center leading-relaxed">
          The backend is grading your responses (written answers are graded by Guru) and updating your progress.
        </p>
      </div>
    );
  }

  // ── Results Screen ───────────────────────────────────────────────────────

  if (phase === "results" && quizResult) {
    const { score, passed, correctCount, totalQuestions, weakTopics, results } = quizResult;

    return (
      <div className="min-h-screen bg-[#F5F7FB] flex flex-col items-center justify-start p-6 gap-6 animate-fadeIn">

        <div className="bg-white rounded-3xl border border-gray-200 shadow-xl max-w-2xl w-full p-8 text-center space-y-6">

          <div className="flex justify-center">
            <div className={`p-4 rounded-full ${passed ? "bg-[#EDFAF5] text-[#43C6AC]" : "bg-[#FFF0F3] text-[#FF6584]"}`}>
              {passed ? <Award size={48} /> : <ShieldAlert size={48} />}
            </div>
          </div>

          <div>
            <h3 className="text-xl font-black text-[#1E1B4B]">
              {passed ? "Week Passed! 🎉" : "Keep Studying 📚"}
            </h3>
            <p className="text-xs font-semibold text-gray-500 mt-2 leading-relaxed">
              {passed
                ? `You scored ${score}% (${correctCount}/${totalQuestions} questions at 50%+ credit). Week ${weekNum + 1} has been unlocked!`
                : `You scored ${score}% (${correctCount}/${totalQuestions} questions at 50%+ credit). You need 50% to pass. Review the topics below and try again.`}
            </p>
          </div>

          <div className={`p-5 rounded-2xl border max-w-xs mx-auto ${passed ? "bg-[#EDFAF5] border-[#43C6AC]/30 text-[#43C6AC]" : "bg-[#FFF0F3] border-[#FF6584]/30 text-[#FF6584]"}`}>
            <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">Your Grade</span>
            <span className="text-4xl font-black block mt-0.5">{score}%</span>
            <span className="block text-[10px] text-gray-400 font-semibold mt-1">Passing score: 50%</span>
          </div>

          {weakTopics?.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-left">
              <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-2">
                Topics to Review
              </p>
              <div className="flex flex-wrap gap-2">
                {weakTopics.map((t, i) => (
                  <span key={i} className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-1 rounded-full">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={() => router.push(`/self-learner/roadmap/${roadmapId}`)}
            className="w-full h-12 bg-[#1E1B4B] hover:bg-black text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all duration-200"
          >
            <CheckCircle2 size={14} />
            Back to Roadmap
          </button>
        </div>

        {results?.length > 0 && (
          <div className="max-w-2xl w-full bg-white rounded-3xl border border-gray-200 shadow-sm p-6">
            <h4 className="text-xs font-black text-[#1E1B4B] uppercase tracking-wider mb-4">
              Question Breakdown
            </h4>
            <div className="space-y-3">
              {results.map((r, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-xl border text-xs ${r.isCorrect ? "bg-[#EDFAF5] border-[#43C6AC]/30" : "bg-[#FFF0F3] border-[#FF6584]/30"}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-black text-[#1E1B4B]">
                      Q{i + 1} <span className="text-[9px] font-bold text-gray-400 uppercase ml-1">{r.type}</span>
                    </span>
                    <span className={`font-black ${r.isCorrect ? "text-[#43C6AC]" : "text-[#FF6584]"}`}>
                      {r.score}%
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-500 font-semibold leading-relaxed">
                    {r.feedback}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    );
  }

  // ── Active Exam Screen ───────────────────────────────────────────────────

  const q = questions[currentIdx];
  const answeredCount = questions.filter((_, idx) => isAnswered(idx)).length;

  return (
    <div className="min-h-screen bg-[#1E1B4B] text-white flex flex-col justify-between p-6">

      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <span className="text-[10px] font-bold text-[#6C63FF] uppercase tracking-widest block">
            grAdelytics Exam Portal
          </span>
          <h2 className="text-base font-extrabold mt-0.5">Week {weekNum} Assessment</h2>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white/10 border border-white/5 px-3 py-1.5 rounded-xl text-[10px] font-bold text-gray-300">
            {answeredCount}/{questions.length} answered
          </div>
          <div className="flex items-center gap-2 bg-white/10 border border-white/5 px-4 py-2.5 rounded-2xl">
            <Clock size={16} className={timeLeft <= 60 ? "text-red-400 animate-pulse" : "text-emerald-400"} />
            <span className={`text-sm font-mono font-black ${timeLeft <= 60 ? "text-red-400 animate-pulse" : "text-white"}`}>
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-3xl w-full mx-auto bg-white/5 border border-white/5 rounded-3xl p-6 md:p-8 space-y-6 my-6">

        <div className="flex justify-between items-center text-[10px] font-bold text-gray-400">
          <span>QUESTION {currentIdx + 1} OF {questions.length}</span>
          <span className="text-[#6C63FF] uppercase">
            {q.type} • {q.difficulty || "—"} • {q.topic || ""}
          </span>
        </div>

        <h3 className="text-base md:text-lg font-black leading-snug">{q.question}</h3>

        {q.type === "mcq" ? (
          <div className="space-y-3 pt-2">
            {q.options.map((option, optIdx) => {
              const isSelected = answers[String(currentIdx)] === optIdx;
              return (
                <button
                  key={optIdx}
                  type="button"
                  onClick={() => handleSelectOption(optIdx)}
                  className={`w-full text-left p-4 rounded-2xl border text-xs font-bold flex items-center justify-between transition-all duration-200 ${isSelected
                    ? "bg-[#6C63FF] border-[#6C63FF] text-white shadow-md"
                    : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10"
                    }`}
                >
                  <span>{option}</span>
                  {isSelected && (
                    <div className="w-4 h-4 rounded-full bg-white text-[#6C63FF] flex items-center justify-center text-[10px] font-black">
                      ✓
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="pt-2">
            <textarea
              value={answers[String(currentIdx)] || ""}
              onChange={(e) => handleFreeTextChange(e.target.value)}
              placeholder="Write your answer here…"
              rows={7}
              className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-[#6C63FF] resize-none"
            />
          </div>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-white/10 pt-4 max-w-3xl w-full mx-auto">
        <button
          onClick={() => setCurrentIdx(currentIdx - 1)}
          disabled={currentIdx === 0}
          className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 text-white border border-white/10 px-5 py-3 rounded-xl text-xs font-bold disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ArrowLeft size={14} /> Previous
        </button>

        {currentIdx < questions.length - 1 ? (
          <button
            onClick={() => setCurrentIdx(currentIdx + 1)}
            disabled={!isAnswered(currentIdx)}
            className="flex items-center gap-1.5 bg-[#6C63FF] hover:bg-[#6C63FF]/90 text-white px-6 py-3 rounded-xl text-xs font-bold disabled:opacity-50"
          >
            Next <ArrowRight size={14} />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={answeredCount < questions.length}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl text-xs font-black shadow-md disabled:opacity-50 transition-all"
          >
            Submit Exam ({answeredCount}/{questions.length})
          </button>
        )}
      </div>

    </div>
  );
}

export default function WeekQuizPage() {
  return (
    <Suspense
      fallback={
        <div className="p-6 text-center text-gray-500 bg-[#1E1B4B] min-h-screen text-white">
          Loading exam viewport...
        </div>
      }
    >
      <WeekQuizContent />
    </Suspense>
  );
}
