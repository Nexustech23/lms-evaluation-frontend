"use client";

import { useState } from "react";
import { Check, X, Award, ShieldAlert, ArrowRight, Play } from "lucide-react";

export default function QuizCard({ level, questions = [], onPassQuiz }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState(null);
  const [answers, setAnswers] = useState({}); // { questionIdx: optionIdx }
  const [isFinished, setIsFinished] = useState(false);
  const [score, setScore] = useState(0);

  if (!questions || questions.length === 0) return null;

  const handleNext = () => {
    if (selectedOpt === null) return;
    
    const newAnswers = { ...answers, [currentIdx]: selectedOpt };
    setAnswers(newAnswers);
    setSelectedOpt(null);

    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      // Calculate final score
      let correctCount = 0;
      questions.forEach((q, idx) => {
        if (newAnswers[idx] === q.answer) {
          correctCount++;
        }
      });
      const finalScore = Math.round((correctCount / questions.length) * 100);
      setScore(finalScore);
      setIsFinished(true);
    }
  };

  const handleRestart = () => {
    setCurrentIdx(0);
    setSelectedOpt(null);
    setAnswers({});
    setIsFinished(false);
    setScore(0);
  };

  const handleProceed = () => {
    if (score >= 70 && onPassQuiz) {
      onPassQuiz(level, score);
    }
  };

  const q = questions[currentIdx];
  const isCorrectOption = (idx) => answers[currentIdx] !== undefined && idx === q.answer;
  const isWrongOption = (idx) => answers[currentIdx] !== undefined && answers[currentIdx] === idx && idx !== q.answer;

  if (isFinished) {
    const passed = score >= 70;
    return (
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 text-center space-y-6 animate-fadeIn">
        <div className="flex justify-center">
          <div className={`p-4 rounded-full flex items-center justify-center ${
            passed ? "bg-[#EDFAF5] text-[#43C6AC]" : "bg-[#FFF0F3] text-[#FF6584]"
          }`}>
            {passed ? <Award size={40} /> : <ShieldAlert size={40} />}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-black text-[#1E1B4B]">
            {passed ? "Stage Quiz Passed!" : "Stage Quiz Failed"}
          </h3>
          <p className="text-xs font-semibold text-gray-500 mt-1">
            {passed
              ? "Amazing! You have satisfied the stage unlock requirements."
              : "Review your study notes and attempt the quiz again to unlock the next stage."}
          </p>
        </div>

        <div className={`p-4 rounded-2xl border max-w-xs mx-auto ${
          passed ? "bg-[#EDFAF5] border-[#43C6AC]/20 text-[#43C6AC]" : "bg-[#FFF0F3] border-[#FF6584]/20 text-[#FF6584]"
        }`}>
          <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">Quiz Score</span>
          <span className="text-3xl font-black">{score}%</span>
          <span className="block text-[10px] font-semibold text-gray-500 mt-0.5">
            (Required: 70% or more)
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          {!passed ? (
            <button
              onClick={handleRestart}
              className="flex-1 bg-[#1E1B4B] hover:bg-[#1E1B4B]/95 text-white px-5 py-3 rounded-xl text-xs font-bold transition-all duration-200 hover:scale-102"
            >
              Try Again
            </button>
          ) : (
            <button
              onClick={handleProceed}
              className="flex-1 bg-[#43C6AC] hover:bg-[#43C6AC]/95 text-white px-5 py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all duration-200 hover:scale-102"
            >
              Unlock Stage {level + 1}
              <ArrowRight size={14} />
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 space-y-6">
      
      {/* Header */}
      <div className="flex justify-between items-center border-b border-gray-100 pb-4">
        <div>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">
            Level {level} Assessment
          </span>
          <h3 className="text-sm font-bold text-[#1E1B4B] mt-0.5">
            End-of-Level Quiz
          </h3>
        </div>
        <div className="text-xs font-bold text-gray-400">
          Q {currentIdx + 1} of {questions.length}
        </div>
      </div>

      {/* Question */}
      <div className="text-sm font-extrabold text-[#1E1B4B] leading-relaxed">
        {q.question}
      </div>

      {/* Options */}
      <div className="space-y-2.5">
        {q.options.map((opt, idx) => {
          const isSelected = selectedOpt === idx;
          return (
            <button
              key={idx}
              onClick={() => setSelectedOpt(idx)}
              className={`w-full text-left p-4 rounded-2xl border text-xs font-bold flex items-center justify-between transition-all duration-200 ${
                isSelected
                  ? "bg-[#F0EEFF] border-[#6C63FF] text-[#1E1B4B]"
                  : "bg-[#FAFBFF] border-gray-200 text-gray-600 hover:border-gray-300"
              }`}
            >
              <span>{opt}</span>
              {isSelected && (
                <div className="w-4 h-4 rounded-full bg-[#6C63FF] flex items-center justify-center text-white">
                  <Check size={10} strokeWidth={3} />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom bar */}
      <div className="flex justify-between items-center pt-4 border-t border-gray-100">
        <span className="text-[10px] font-bold text-gray-400 uppercase">
          Score required to pass: 70%
        </span>
        <button
          onClick={handleNext}
          disabled={selectedOpt === null}
          className="flex items-center gap-1 bg-[#1E1B4B] hover:bg-[#1E1B4B]/95 text-white px-5 py-3 rounded-xl text-xs font-bold transition-all duration-200 disabled:opacity-50"
        >
          {currentIdx === questions.length - 1 ? "Finish Quiz" : "Next"}
          <ArrowRight size={12} />
        </button>
      </div>

    </div>
  );
}
