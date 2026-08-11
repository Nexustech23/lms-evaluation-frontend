"use client";

import { useEffect, useState, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  Clock,
  ShieldAlert,
  Award,
  ArrowLeft,
  ArrowRight,
  Loader2,
  CheckCircle2,
  RotateCcw,
} from "lucide-react";
import { fetchStageQuiz, submitStageQuiz } from "../../api";

// ─── Quiz Logic ───────────────────────────────────────────────────────────────

function QuizPageContent() {
  const router       = useRouter();
  const { id }       = useParams();
  const searchParams = useSearchParams();
  const levelNum     = parseInt(searchParams.get("level") || "1");

  // Quiz data
  const [quiz,        setQuiz]        = useState(null);  // array of questions
  const [quizLoading, setQuizLoading] = useState(true);
  const [quizError,   setQuizError]   = useState(null);
  const [subject,     setSubject]     = useState("");

  // Exam state
  const [currentIdx,   setCurrentIdx]   = useState(0);
  const [answers,      setAnswers]      = useState({});   // { "0": optIdx, … }
  const [timeLeft,     setTimeLeft]     = useState(600);  // 10 minutes for 10 questions
  const [isSubmitted,  setIsSubmitted]  = useState(false);
  const [grading,      setGrading]      = useState(false);
  const [quizResult,   setQuizResult]   = useState(null); // server response

  // ── Fetch AI quiz on mount ──────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      setQuizLoading(true);
      setQuizError(null);
      try {
        const data = await fetchStageQuiz(id, levelNum);
        setQuiz(data.quiz);
        // Extract subject name from first question's topic context if available
        // (roadmap subject stored separately)
      } catch (err) {
        console.error("Failed to load quiz", err);
        setQuizError(
          err?.response?.data?.error || "Failed to load quiz. Please close and try again."
        );
      } finally {
        setQuizLoading(false);
      }
    };

    if (id) load();
  }, [id, levelNum]);

  // ── Countdown timer ─────────────────────────────────────────────────────
  useEffect(() => {
    if (quizLoading || !quiz || isSubmitted || grading) return;
    if (timeLeft <= 0) { handleSubmit(); return; }

    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, quizLoading, quiz, isSubmitted, grading]);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const handleSelectOption = (optIdx) => {
    setAnswers({ ...answers, [String(currentIdx)]: optIdx });
  };

  const handleSubmit = async () => {
    if (grading || isSubmitted) return;
    setGrading(true);
    try {
      const result = await submitStageQuiz(id, levelNum, answers);
      setQuizResult(result);
      setIsSubmitted(true);
    } catch (err) {
      console.error("Quiz submission failed", err);
      alert("Submission failed. Please close and try again.");
    } finally {
      setGrading(false);
    }
  };

  // ── Loading / Error screens ──────────────────────────────────────────────

  if (quizLoading) {
    return (
      <div className="min-h-screen bg-[#1E1B4B] text-white flex flex-col items-center justify-center p-6 gap-5">
        <Loader2 size={48} className="animate-spin text-[#6C63FF]" />
        <div className="text-center">
          <h3 className="text-base font-black">Generating Stage {levelNum} Quiz…</h3>
          <p className="text-xs text-gray-400 font-semibold mt-1 max-w-xs">
            Claude is crafting 10 personalised questions based on your curriculum. ~10 seconds.
          </p>
        </div>
      </div>
    );
  }

  if (quizError) {
    return (
      <div className="min-h-screen bg-[#1E1B4B] text-white flex flex-col items-center justify-center p-6 gap-5">
        <ShieldAlert size={48} className="text-red-400" />
        <div className="text-center">
          <h3 className="text-base font-black text-red-400">Quiz Load Failed</h3>
          <p className="text-xs text-gray-400 font-semibold mt-1 max-w-xs">{quizError}</p>
        </div>
        <button
          onClick={() => window.close()}
          className="bg-white/10 border border-white/10 px-5 py-2.5 rounded-xl text-xs font-bold"
        >
          Close Tab
        </button>
      </div>
    );
  }

  if (grading) {
    return (
      <div className="min-h-screen bg-[#1E1B4B] text-white flex flex-col items-center justify-center p-6 space-y-4">
        <Loader2 size={48} className="animate-spin text-[#6C63FF]" />
        <h3 className="text-lg font-black">Evaluating Your Answers…</h3>
        <p className="text-xs text-gray-400 font-semibold max-w-xs text-center leading-relaxed">
          The backend is grading your responses and updating your progress.
        </p>
      </div>
    );
  }

  // ── Results Screen ───────────────────────────────────────────────────────

  if (isSubmitted && quizResult) {
    const { score, passed, correctCount, totalQuestions, weakTopics, results } = quizResult;

    return (
      <div className="min-h-screen bg-[#F5F7FB] flex flex-col items-center justify-start p-6 gap-6 animate-fadeIn">

        {/* Score Card */}
        <div className="bg-white rounded-3xl border border-gray-200 shadow-xl max-w-2xl w-full p-8 text-center space-y-6">

          <div className="flex justify-center">
            <div className={`p-4 rounded-full ${passed ? "bg-[#EDFAF5] text-[#43C6AC]" : "bg-[#FFF0F3] text-[#FF6584]"}`}>
              {passed ? <Award size={48} /> : <ShieldAlert size={48} />}
            </div>
          </div>

          <div>
            <h3 className="text-xl font-black text-[#1E1B4B]">
              {passed ? "Stage Passed! 🎉" : "Keep Studying 📚"}
            </h3>
            <p className="text-xs font-semibold text-gray-500 mt-2 leading-relaxed">
              {passed
                ? `You scored ${score}% (${correctCount}/${totalQuestions} correct). Stage ${levelNum + 1} has been unlocked!`
                : `You scored ${score}% (${correctCount}/${totalQuestions} correct). You need 70% to pass. Review the topics below and try again.`}
            </p>
          </div>

          <div className={`p-5 rounded-2xl border max-w-xs mx-auto ${passed ? "bg-[#EDFAF5] border-[#43C6AC]/30 text-[#43C6AC]" : "bg-[#FFF0F3] border-[#FF6584]/30 text-[#FF6584]"}`}>
            <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">Your Grade</span>
            <span className="text-4xl font-black block mt-0.5">{score}%</span>
            <span className="block text-[10px] text-gray-400 font-semibold mt-1">Passing score: 70%</span>
          </div>

          {/* Weak topics */}
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
            onClick={() => {
              if (window.opener) window.opener.location.reload();
              window.close();
            }}
            className="w-full h-12 bg-[#1E1B4B] hover:bg-black text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all duration-200"
          >
            <CheckCircle2 size={14} />
            Close Exam Window
          </button>
        </div>

        {/* Per-question breakdown */}
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
                    <span className="font-black text-[#1E1B4B]">Q{i + 1}</span>
                    <span className={`font-black ${r.isCorrect ? "text-[#43C6AC]" : "text-[#FF6584]"}`}>
                      {r.isCorrect ? "✓ Correct" : "✗ Incorrect"}
                    </span>
                  </div>
                  {!r.isCorrect && (
                    <p className="text-[10px] text-gray-500 font-semibold leading-relaxed">
                      {r.explanation}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    );
  }

  // ── Active Quiz Screen ───────────────────────────────────────────────────

  const q             = quiz[currentIdx];
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="min-h-screen bg-[#1E1B4B] text-white flex flex-col justify-between p-6">

      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <span className="text-[10px] font-bold text-[#6C63FF] uppercase tracking-widest block">
            grAdelytics Exam Portal
          </span>
          <h2 className="text-base font-extrabold mt-0.5">Stage {levelNum} Assessment</h2>
        </div>

        <div className="flex items-center gap-3">
          {/* Progress pill */}
          <div className="bg-white/10 border border-white/5 px-3 py-1.5 rounded-xl text-[10px] font-bold text-gray-300">
            {answeredCount}/{quiz.length} answered
          </div>
          {/* Timer */}
          <div className="flex items-center gap-2 bg-white/10 border border-white/5 px-4 py-2.5 rounded-2xl">
            <Clock size={16} className={timeLeft <= 60 ? "text-red-400 animate-pulse" : "text-emerald-400"} />
            <span className={`text-sm font-mono font-black ${timeLeft <= 60 ? "text-red-400 animate-pulse" : "text-white"}`}>
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>
      </div>

      {/* Question panel */}
      <div className="max-w-3xl w-full mx-auto bg-white/5 border border-white/5 rounded-3xl p-6 md:p-8 space-y-6 my-6">

        <div className="flex justify-between items-center text-[10px] font-bold text-gray-400">
          <span>QUESTION {currentIdx + 1} OF {quiz.length}</span>
          <span className="text-[#6C63FF] uppercase">{q.difficulty || "—"} • {q.topic || ""}</span>
        </div>

        <h3 className="text-base md:text-lg font-black leading-snug">{q.question}</h3>

        <div className="space-y-3 pt-2">
          {q.options.map((option, optIdx) => {
            const isSelected = answers[String(currentIdx)] === optIdx;
            return (
              <button
                key={optIdx}
                type="button"
                onClick={() => handleSelectOption(optIdx)}
                className={`w-full text-left p-4 rounded-2xl border text-xs font-bold flex items-center justify-between transition-all duration-200 ${
                  isSelected
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
      </div>

      {/* Bottom controls */}
      <div className="flex items-center justify-between border-t border-white/10 pt-4 max-w-3xl w-full mx-auto">
        <button
          onClick={() => setCurrentIdx(currentIdx - 1)}
          disabled={currentIdx === 0}
          className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 text-white border border-white/10 px-5 py-3 rounded-xl text-xs font-bold disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ArrowLeft size={14} /> Previous
        </button>

        {currentIdx < quiz.length - 1 ? (
          <button
            onClick={() => setCurrentIdx(currentIdx + 1)}
            disabled={answers[String(currentIdx)] === undefined}
            className="flex items-center gap-1.5 bg-[#6C63FF] hover:bg-[#6C63FF]/90 text-white px-6 py-3 rounded-xl text-xs font-bold disabled:opacity-50"
          >
            Next <ArrowRight size={14} />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={answeredCount < quiz.length}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl text-xs font-black shadow-md disabled:opacity-50 transition-all"
          >
            Submit Exam ({answeredCount}/{quiz.length})
          </button>
        )}
      </div>

    </div>
  );
}

export default function QuizPage() {
  return (
    <Suspense
      fallback={
        <div className="p-6 text-center text-gray-500 bg-[#1E1B4B] min-h-screen text-white">
          Loading exam viewport...
        </div>
      }
    >
      <QuizPageContent />
    </Suspense>
  );
}
