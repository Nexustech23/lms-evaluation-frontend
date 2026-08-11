"use client";

import { useState, useEffect } from "react";
import { X, Award, ChevronRight, Check, Loader2, AlertTriangle } from "lucide-react";
import { getPreAssessmentQuiz } from "../api";

export default function SkillAssessmentModal({ subject, onClose, onFinish }) {
  const [questions, setQuestions]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [loadError, setLoadError]   = useState(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers]       = useState({});

  useEffect(() => {
    let cancelled = false;
    async function fetchQuestions() {
      try {
        const data = await getPreAssessmentQuiz(subject);
        if (!cancelled) {
          setQuestions(data.questions || []);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setLoadError("Could not load assessment questions. You can skip and proceed directly.");
          setLoading(false);
        }
      }
    }
    fetchQuestions();
    return () => { cancelled = true; };
  }, [subject]);

  const handleSelectOption = (optIdx) => {
    setAnswers({ ...answers, [currentIdx]: optIdx });
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      // Score: each question is worth (100 / total) points
      const pointsEach = Math.round(100 / questions.length);
      let score = 0;
      const strengths = [];
      const weaknesses = [];

      questions.forEach((q, idx) => {
        const studentAns = answers[idx];
        if (studentAns === q.answer) {
          score += pointsEach;
          strengths.push(q.question.split(" ").slice(0, 4).join(" ") + "...");
        } else {
          weaknesses.push(q.question.split(" ").slice(0, 4).join(" ") + "...");
        }
      });
      score = Math.min(100, score);

      let recommendedLevel = "Beginner (Level 1)";
      if (score >= 80) recommendedLevel = "Advanced (Level 2 Fast-track)";
      else if (score >= 40) recommendedLevel = "Intermediate (Level 1 Accelerated)";

      onFinish({
        score,
        strengths: strengths.length ? strengths : ["Foundations"],
        weaknesses: weaknesses.length ? weaknesses : ["No significant weaknesses"],
        recommendedLevel,
      });
    }
  };

  const progressPercent = questions.length
    ? Math.round(((currentIdx + 1) / questions.length) * 100)
    : 0;
  const currentQuestion = questions[currentIdx];

  return (
    <div className="fixed inset-0 z-50 bg-[#1E1B4B]/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl border border-gray-100 shadow-xl max-w-2xl w-full overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between bg-[#FAFBFF] border-b border-gray-100 p-6">
          <div className="flex items-center gap-2">
            <div className="bg-[#FFF8EE] text-[#F7971E] p-2 rounded-xl">
              <Award size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#1E1B4B]">Knowledge Check</h3>
              <p className="text-xs font-semibold text-gray-500">{subject} · Beginner Level</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-red-500 bg-white hover:bg-gray-100 p-2 rounded-full border border-gray-100 transition-all duration-200"
          >
            <X size={18} />
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="p-12 flex flex-col items-center gap-4 text-center">
            <Loader2 size={36} className="animate-spin text-[#6C63FF]" />
            <p className="text-sm font-semibold text-gray-500">
              Preparing your {subject} assessment…
            </p>
          </div>
        )}

        {/* Error State */}
        {!loading && loadError && (
          <div className="p-8 space-y-4 text-center">
            <AlertTriangle size={36} className="mx-auto text-amber-500" />
            <p className="text-sm font-semibold text-gray-600">{loadError}</p>
            <button
              onClick={onClose}
              className="mt-2 bg-[#1E1B4B] text-white px-6 py-3 rounded-2xl text-sm font-bold"
            >
              Skip Assessment
            </button>
          </div>
        )}

        {/* Quiz Body */}
        {!loading && !loadError && currentQuestion && (
          <>
            {/* Progress Bar */}
            <div className="h-1 bg-gray-100 w-full">
              <div
                className="h-full bg-gradient-to-r from-[#6C63FF] to-[#43C6AC] transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="p-6 md:p-8 space-y-6">
              <div className="flex justify-between items-center text-xs font-bold text-gray-400">
                <span>QUESTION {currentIdx + 1} OF {questions.length}</span>
                <span className="text-[#6C63FF]">{progressPercent}% COMPLETED</span>
              </div>

              <h4 className="text-lg font-extrabold text-[#1E1B4B] leading-snug">
                {currentQuestion.question}
              </h4>

              <div className="space-y-3">
                {currentQuestion.options.map((option, optIdx) => {
                  const isSelected = answers[currentIdx] === optIdx;
                  return (
                    <button
                      key={optIdx}
                      type="button"
                      onClick={() => handleSelectOption(optIdx)}
                      className={`w-full text-left p-4 rounded-2xl border text-sm font-semibold flex items-center justify-between transition-all duration-200 ${
                        isSelected
                          ? "bg-[#F0EEFF] border-[#6C63FF] text-[#1E1B4B]"
                          : "bg-[#FAFBFF] border-gray-200 text-gray-600 hover:border-gray-300"
                      }`}
                    >
                      <span>{option}</span>
                      {isSelected && (
                        <div className="w-5 h-5 bg-[#6C63FF] rounded-full flex items-center justify-center text-white">
                          <Check size={12} strokeWidth={3} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="bg-[#FAFBFF] border-t border-gray-100 p-6 flex justify-end">
              <button
                onClick={handleNext}
                disabled={answers[currentIdx] === undefined}
                className="flex items-center justify-center gap-2 bg-[#1E1B4B] text-white px-6 py-3.5 rounded-2xl text-sm font-bold shadow-sm transition-all duration-200 hover:bg-[#1E1B4B]/95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {currentIdx < questions.length - 1 ? (
                  <>Next Question <ChevronRight size={16} /></>
                ) : (
                  "Submit & Evaluate"
                )}
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
