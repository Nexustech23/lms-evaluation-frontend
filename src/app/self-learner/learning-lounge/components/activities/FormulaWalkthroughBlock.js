"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Sigma } from "lucide-react";
import ActivityShell from "../ActivityShell";

export default function FormulaWalkthroughBlock({ block }) {
  const [current, setCurrent] = useState(0);
  const steps = Array.isArray(block.steps) ? block.steps : [];
  if (!steps.length) return null;
  const step = steps[current];

  return (
    <ActivityShell icon={<Sigma size={17} />} eyebrow="Work through it" title={block.title} tone="amber">
      <div className="rounded-xl bg-[#1E1B4B] px-4 py-3 text-center overflow-x-auto">
        <code className="text-sm text-amber-200 font-bold whitespace-pre-wrap">{block.formula}</code>
      </div>
      {block.explanation && <p className="text-xs text-slate-600 font-medium leading-relaxed mt-3">{block.explanation}</p>}
      <div className="mt-4 bg-white border border-amber-200 rounded-xl p-4" aria-live="polite">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[9px] uppercase tracking-widest font-black text-amber-600">Step {current + 1} of {steps.length}</span>
          <span className="text-[10px] font-bold text-slate-400">{step.label}</span>
        </div>
        <code className="block mt-2 text-xs font-bold text-[#1E1B4B] bg-amber-50 rounded-lg p-3 overflow-x-auto">{step.expression}</code>
        {step.result && <p className="text-xs font-black text-emerald-600 mt-2">Result: {step.result}</p>}
        {step.explanation && <p className="text-xs text-slate-600 font-medium leading-relaxed mt-2">{step.explanation}</p>}
      </div>
      <div className="flex justify-end gap-2 mt-3">
        <button type="button" onClick={() => setCurrent((value) => Math.max(0, value - 1))} disabled={current === 0} aria-label="Previous formula step" className="p-2 rounded-lg bg-white border border-gray-200 disabled:opacity-40">
          <ChevronLeft size={15} />
        </button>
        <button type="button" onClick={() => setCurrent((value) => Math.min(steps.length - 1, value + 1))} disabled={current === steps.length - 1} aria-label="Next formula step" className="p-2 rounded-lg bg-amber-500 text-white disabled:opacity-40">
          <ChevronRight size={15} />
        </button>
      </div>
    </ActivityShell>
  );
}
