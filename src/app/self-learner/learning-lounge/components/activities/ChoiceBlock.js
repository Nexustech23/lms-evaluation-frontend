"use client";

import { useState } from "react";
import { Brain, CheckCircle2, CircleHelp, RotateCcw, XCircle } from "lucide-react";
import ActivityShell from "../ActivityShell";

export default function ChoiceBlock({ block, mode = "check" }) {
  const [selected, setSelected] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const options = Array.isArray(block.options) ? block.options : [];
  if (options.length < 2) return null;
  const correct = selected === block.correctAnswerIndex;
  const isPrediction = mode === "prediction";

  const reset = () => {
    setSelected(null);
    setSubmitted(false);
  };

  return (
    <ActivityShell
      icon={isPrediction ? <Brain size={17} /> : <CircleHelp size={17} />}
      eyebrow={isPrediction ? "Predict before revealing" : "Check your understanding"}
      title={block.title}
      tone={isPrediction ? "violet" : "emerald"}
    >
      <p className="text-sm font-bold text-[#1E1B4B] leading-relaxed">{block.question}</p>
      <div className="grid gap-2 mt-4">
        {options.map((option, index) => {
          const isSelected = selected === index;
          const isCorrectOption = submitted && index === block.correctAnswerIndex;
          const isWrongSelection = submitted && isSelected && !isCorrectOption;
          return (
            <button
              type="button"
              key={index}
              onClick={() => !submitted && setSelected(index)}
              disabled={submitted}
              className={`w-full rounded-xl border px-3 py-3 text-left text-xs font-semibold transition-all ${isCorrectOption ? "border-emerald-400 bg-emerald-50 text-emerald-800" : isWrongSelection ? "border-rose-300 bg-rose-50 text-rose-700" : isSelected ? "border-[#6C63FF] bg-[#F0EEFF] text-[#1E1B4B]" : "border-gray-200 bg-white text-slate-600 hover:border-[#6C63FF]/50"}`}
            >
              <span className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full border border-current/30 flex items-center justify-center text-[9px] font-black shrink-0">{String.fromCharCode(65 + index)}</span>
                {option}
              </span>
            </button>
          );
        })}
      </div>
      {!submitted ? (
        <button type="button" onClick={() => setSubmitted(true)} disabled={selected === null} className="mt-4 w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#1E1B4B] text-white text-xs font-black disabled:opacity-40">
          Check answer
        </button>
      ) : (
        <div className={`mt-4 rounded-xl border p-4 ${correct ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"}`} aria-live="polite">
          <div className={`flex items-center gap-2 text-xs font-black ${correct ? "text-emerald-700" : "text-amber-700"}`}>
            {correct ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
            {correct ? "Correct — nice reasoning." : "Not quite — use the explanation and try again."}
          </div>
          <p className="text-xs text-slate-700 font-medium leading-relaxed mt-2">{block.explanation}</p>
          <button type="button" onClick={reset} className="mt-3 flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-slate-500">
            <RotateCcw size={12} /> Try again
          </button>
        </div>
      )}
    </ActivityShell>
  );
}
