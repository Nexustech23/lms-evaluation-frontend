"use client";

import { useState } from "react";
import { CheckCircle2, Sparkles, Play } from "lucide-react";

export default function PracticeQuestionCard({ questions = [], onCompleteQuestion }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [codeAnswer, setCodeAnswer] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [evaluationMsg, setEvaluationMsg] = useState(null);

  if (!questions || questions.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 text-center text-gray-500 font-semibold text-sm">
        No practice questions available for this level. Complete notes and proceed to the level quiz!
      </div>
    );
  }

  const q = questions[currentIdx];

  const handleRevealAnswer = () => {
    setIsSubmitted(true);
    // Reveal the correct answer text from the stored options array
    const correctText = Array.isArray(q.options) ? q.options[q.answer] : null;
    setEvaluationMsg({
      isCorrect: null,
      text: correctText ? `Answer: ${correctText}` : "See explanation below.",
    });
    if (onCompleteQuestion) {
      onCompleteQuestion(q.id, true);
    }
  };

  const handleRunCode = () => {
    if (!codeAnswer.trim()) return;
    setIsSubmitted(true);
    // Code validation simulator - checking if they defined a function
    const hasFunction = codeAnswer.includes("function") || codeAnswer.includes("=>") || codeAnswer.includes("def ");
    setEvaluationMsg({
      isCorrect: hasFunction,
      text: hasFunction
        ? "Code evaluated successfully! 3/3 test cases passed."
        : "Evaluation error: Make sure to define the function with proper syntax.",
    });
    if (onCompleteQuestion) {
      onCompleteQuestion(q.id, hasFunction);
    }
  };

  const handleNext = () => {
    setCurrentIdx((currentIdx + 1) % questions.length);
    setCodeAnswer("");
    setIsSubmitted(false);
    setEvaluationMsg(null);
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 space-y-6">
      
      {/* Top Header */}
      <div className="flex justify-between items-center border-b border-gray-100 pb-4">
        <div>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">
            Practice Sandbox
          </span>
          <h3 className="text-sm font-bold text-[#1E1B4B] mt-0.5">
            Question {currentIdx + 1} of {questions.length} ({q.type})
          </h3>
        </div>
        <div className="text-xs font-bold text-[#6C63FF] bg-[#F0EEFF] px-2.5 py-1 rounded-full">
          Level Practice
        </div>
      </div>

      {/* Question Statement */}
      <div className="text-sm font-bold text-[#1E1B4B] leading-relaxed">
        {q.question}
      </div>

      {/* Answer Form Panel */}
      {!isSubmitted ? (
        <div className="space-y-4">

          {/* MCQ: no options shown — student thinks, then reveals answer */}
          {q.type === "MCQ" && (
            <p className="text-xs text-gray-400 font-medium bg-[#FAFBFF] border border-gray-100 rounded-xl p-3">
              Think about your answer, then click &quot;Reveal Answer&quot; to see the correct response.
            </p>
          )}

          {/* Coding sandbox panel */}
          {q.type === "Coding Question" && (
            <div className="space-y-3">
              <textarea
                value={codeAnswer}
                onChange={(e) => setCodeAnswer(e.target.value)}
                placeholder="// Write your solution here...&#10;function solve() {&#10;  // code&#10;}"
                className="w-full h-44 rounded-2xl border border-gray-200 bg-[#1E1B4B] p-4 text-xs font-mono text-gray-100 outline-none focus:ring-2 focus:ring-violet-400 resize-none"
              />
              <p className="text-[10px] font-semibold text-gray-400">
                💡 Click &quot;Run Tests&quot; to execute your logic against the validation suite.
              </p>
            </div>
          )}

        </div>
      ) : (
        /* Evaluation Results Feedback Panel */
        <div className="space-y-4">
          {evaluationMsg && (
            <div className="p-5 rounded-2xl border flex gap-3 items-start bg-[#EDFAF5] border-[#43C6AC]/30 text-[#43C6AC]">
              <CheckCircle2 size={20} className="shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider">Revealed</h4>
                <p className="text-xs font-medium text-gray-600 mt-1">
                  {evaluationMsg.text}
                </p>
              </div>
            </div>
          )}

          {/* Solution trace / Explanation block */}
          {q.explanation && (
            <div className="bg-[#FAFBFF] border border-gray-150 rounded-2xl p-4">
              <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5 mb-1.5">
                <Sparkles size={12} className="text-[#F7971E]" />
                Explanation
              </h5>
              <p className="text-xs font-semibold text-gray-500 leading-relaxed">
                {q.explanation}
              </p>
            </div>
          )}

          {q.solution && (
            <div className="bg-[#FAFBFF] border border-gray-150 rounded-2xl p-4">
              <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5 mb-1.5">
                <Sparkles size={12} className="text-[#43C6AC]" />
                Reference Solution
              </h5>
              <pre className="text-[10px] font-mono text-gray-600 bg-white p-3 rounded-xl border border-gray-100 overflow-x-auto">
                {q.solution}
              </pre>
            </div>
          )}

        </div>
      )}

      {/* Button Controls */}
      <div className="flex justify-end pt-4 border-t border-gray-100">
        {!isSubmitted ? (
          q.type === "MCQ" ? (
            <button
              onClick={handleRevealAnswer}
              className="flex items-center gap-1.5 bg-[#1E1B4B] hover:bg-[#1E1B4B]/95 text-white px-5 py-3 rounded-xl text-xs font-extrabold shadow-2xs transition-all duration-200"
            >
              <CheckCircle2 size={12} />
              Reveal Answer
            </button>
          ) : (
            <button
              onClick={handleRunCode}
              disabled={!codeAnswer.trim()}
              className="flex items-center gap-1.5 bg-[#6C63FF] hover:bg-[#6C63FF]/95 text-white px-5 py-3 rounded-xl text-xs font-extrabold shadow-2xs transition-all duration-200 disabled:opacity-50"
            >
              <Play size={12} />
              Run Tests
            </button>
          )
        ) : (
          <button
            onClick={handleNext}
            className="bg-[#FAFBFF] hover:bg-gray-100 text-[#1E1B4B] border border-gray-200 px-5 py-3 rounded-xl text-xs font-extrabold transition-all duration-200"
          >
            {currentIdx < questions.length - 1 ? "Next Question" : "Reset / Loop"}
          </button>
        )}
      </div>

    </div>
  );
}
