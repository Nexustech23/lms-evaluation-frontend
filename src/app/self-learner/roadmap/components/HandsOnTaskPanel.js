"use client";

import { useState } from "react";
import { Hand, CheckCircle2, Target } from "lucide-react";

/**
 * Live-checkable "Try It Yourself" checklist for a Kinesthetic-dominant
 * subtopic's handsOnTask. Local UI-only state — completion here is just for
 * the student's own sense of progress, not persisted (unlike the subtopic's
 * own "mark complete", which is a real progress-tracked action).
 */
export default function HandsOnTaskPanel({ task }) {
  const [checked, setChecked] = useState({});

  if (!task || !task.steps?.length) return null;

  const toggle = (idx) => setChecked((prev) => ({ ...prev, [idx]: !prev[idx] }));
  const allDone = task.steps.every((_, idx) => checked[idx]);

  return (
    <div className="bg-[#FFF8EE] border border-[#F7971E]/30 rounded-2xl p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Hand size={14} className="text-[#F7971E]" />
        <span className="text-[10px] font-black text-[#F7971E] uppercase tracking-widest">
          Try It Yourself
        </span>
      </div>

      {task.title && (
        <h5 className="text-sm font-black text-[#1E1B4B]">{task.title}</h5>
      )}

      <ul className="space-y-1.5">
        {task.steps.map((step, idx) => (
          <li key={idx}>
            <button
              type="button"
              onClick={() => toggle(idx)}
              className="w-full flex items-start gap-2.5 text-left p-2.5 rounded-xl hover:bg-white/60 transition-all duration-150"
            >
              <div className={`mt-0.5 w-4 h-4 rounded flex items-center justify-center border shrink-0 text-[10px] ${
                checked[idx] ? "bg-[#43C6AC] border-[#43C6AC] text-white" : "border-gray-300"
              }`}>
                {checked[idx] && "✓"}
              </div>
              <span className={`text-xs font-semibold leading-relaxed ${checked[idx] ? "text-gray-400 line-through" : "text-slate-700"}`}>
                {step}
              </span>
            </button>
          </li>
        ))}
      </ul>

      {task.expectedOutcome && (
        <div className={`rounded-xl p-3 flex items-start gap-2 transition-all duration-300 ${
          allDone ? "bg-[#EDFAF5] border border-[#43C6AC]/30" : "bg-white/60 border border-gray-100"
        }`}>
          {allDone
            ? <CheckCircle2 size={14} className="text-[#43C6AC] shrink-0 mt-0.5" />
            : <Target size={14} className="text-gray-400 shrink-0 mt-0.5" />}
          <div>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-0.5">
              Expected Outcome
            </span>
            <span className="text-xs font-semibold text-slate-700">{task.expectedOutcome}</span>
          </div>
        </div>
      )}
    </div>
  );
}
