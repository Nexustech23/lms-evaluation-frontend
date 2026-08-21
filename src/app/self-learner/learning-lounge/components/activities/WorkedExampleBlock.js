"use client";

import { useState } from "react";
import { CheckCircle2, ChevronLeft, ChevronRight, PlayCircle, RotateCcw } from "lucide-react";
import ActivityShell from "../ActivityShell";

export default function WorkedExampleBlock({ block }) {
  const steps = Array.isArray(block.steps) ? block.steps : [];
  const [current, setCurrent] = useState(0);
  if (steps.length < 2) return null;
  const step = steps[current];
  const finished = current === steps.length - 1;

  return (
    <ActivityShell icon={<PlayCircle size={17} />} eyebrow="Worked example" title={block.title} tone="emerald">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-emerald-200 bg-white p-4">
          <p className="text-[9px] font-black uppercase tracking-widest text-emerald-600">Scenario</p>
          <p className="mt-2 text-xs font-medium leading-relaxed text-slate-700">{block.scenario}</p>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-[9px] font-black uppercase tracking-widest text-amber-700">Why this example?</p>
          <p className="mt-2 text-xs font-medium leading-relaxed text-slate-700">{block.exampleReason}</p>
        </div>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-[160px_1fr]">
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-1 content-start">
          {steps.map((item, index) => (
            <button
              type="button"
              key={index}
              onClick={() => setCurrent(index)}
              className={`rounded-lg border px-2 py-2 text-left text-[10px] font-black transition ${index === current ? "border-emerald-500 bg-emerald-500 text-white" : index < current ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-gray-200 bg-white text-gray-500"}`}
              aria-label={`Open step ${index + 1}: ${item.label}`}
            >
              <span className="sm:mr-1">{index + 1}.</span> <span className="hidden sm:inline">{item.label}</span>
            </button>
          ))}
        </div>
        <div className="min-h-44 rounded-xl border border-emerald-200 bg-white p-4" aria-live="polite">
          <p className="text-[9px] font-black uppercase tracking-widest text-emerald-600">Step {current + 1} of {steps.length}</p>
          <h5 className="mt-1 text-sm font-black text-[#1E1B4B]">{step.label}</h5>
          <p className="mt-3 text-xs font-bold leading-relaxed text-slate-700">{step.action}</p>
          <p className="mt-2 text-xs font-medium leading-relaxed text-slate-600"><span className="font-black">Why: </span>{step.explanation}</p>
          {step.result && <p className="mt-3 rounded-lg bg-emerald-50 p-3 text-xs font-black text-emerald-800">Result: {step.result}</p>}
        </div>
      </div>

      {finished && (
        <div className="mt-3 flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800">
          <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
          <p className="text-xs font-bold leading-relaxed"><span className="font-black">Final outcome: </span>{block.outcome}</p>
        </div>
      )}

      <div className="mt-4 flex justify-between gap-2">
        <button type="button" onClick={() => setCurrent((value) => Math.max(0, value - 1))} disabled={current === 0} className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 disabled:opacity-40"><ChevronLeft size={14} /> Back</button>
        {finished ? (
          <button type="button" onClick={() => setCurrent(0)} className="flex items-center gap-1 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-black text-white"><RotateCcw size={13} /> Replay</button>
        ) : (
          <button type="button" onClick={() => setCurrent((value) => value + 1)} className="flex items-center gap-1 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-black text-white">Next <ChevronRight size={14} /></button>
        )}
      </div>
    </ActivityShell>
  );
}
