"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Code2, RotateCcw } from "lucide-react";
import ActivityShell from "../ActivityShell";

export default function CodeTraceBlock({ block }) {
  const steps = Array.isArray(block.steps) ? block.steps : [];
  const lines = String(block.code || "").split("\n");
  const [current, setCurrent] = useState(-1);
  if (!steps.length || !block.code) return null;
  const activeStep = current >= 0 ? steps[current] : null;

  return (
    <ActivityShell icon={<Code2 size={17} />} eyebrow="Trace the code" title={block.title} tone="blue">
      <p className="text-xs text-slate-600 font-medium leading-relaxed mb-3">{block.purpose || block.prompt}</p>
      <div className="rounded-xl bg-[#17152F] overflow-hidden">
        <div className="px-4 py-2 border-b border-white/10 text-[9px] font-black uppercase tracking-widest text-slate-400">{block.language || "code"}</div>
        <pre className="py-3 overflow-x-auto text-xs leading-6">
          {lines.map((line, index) => {
            const lineNumber = index + 1;
            const highlighted = activeStep?.line === lineNumber;
            return (
              <div key={lineNumber} className={`px-4 flex min-w-max ${highlighted ? "bg-blue-500/20 border-l-2 border-blue-400" : "border-l-2 border-transparent"}`}>
                <span className="w-7 shrink-0 text-slate-600 select-none">{lineNumber}</span>
                <code className={highlighted ? "text-blue-200" : "text-emerald-300"}>{line || " "}</code>
              </div>
            );
          })}
        </pre>
      </div>
      {activeStep ? (
        <div className="mt-3 rounded-xl border border-blue-200 bg-white p-4" aria-live="polite">
          <span className="text-[9px] font-black uppercase tracking-widest text-blue-600">Trace {current + 1} of {steps.length} · line {activeStep.line}</span>
          {activeStep.focus && <h5 className="mt-1 text-xs font-black text-[#1E1B4B]">{activeStep.focus}</h5>}
          {activeStep.state && <code className="block mt-2 rounded-lg bg-blue-50 p-2 text-xs font-bold text-blue-800">State: {activeStep.state}</code>}
          <p className="text-xs text-slate-600 font-medium leading-relaxed mt-2">{activeStep.explanation}</p>
        </div>
      ) : (
        <div className="mt-3 rounded-xl border border-dashed border-blue-200 bg-white/70 p-4 text-xs font-medium text-slate-500">
          Start the trace to reveal one state change at a time.
        </div>
      )}
      {current === steps.length - 1 && block.outcome && (
        <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-bold leading-relaxed text-emerald-800">
          Final outcome: {block.outcome}
        </div>
      )}
      <div className="flex justify-end gap-2 mt-3">
        <button type="button" onClick={() => setCurrent((value) => Math.max(-1, value - 1))} disabled={current < 0} aria-label="Previous trace step" className="p-2 rounded-lg bg-white border border-gray-200 disabled:opacity-40">
          <ChevronLeft size={15} />
        </button>
        {current < steps.length - 1 ? (
          <button type="button" onClick={() => setCurrent((value) => value + 1)} className="px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-black flex items-center gap-1">
            {current < 0 ? "Start trace" : "Next"} <ChevronRight size={14} />
          </button>
        ) : (
          <button type="button" onClick={() => setCurrent(-1)} className="px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-black flex items-center gap-1">
            <RotateCcw size={13} /> Reset
          </button>
        )}
      </div>
    </ActivityShell>
  );
}
