"use client";

import { useState } from "react";
import { CheckCircle2, ChevronLeft, ChevronRight, Map, RotateCcw } from "lucide-react";
import ActivityShell from "../ActivityShell";

export default function GuidedWalkthroughBlock({ block }) {
  const steps = Array.isArray(block.steps) ? block.steps : [];
  const [current, setCurrent] = useState(0);
  if (steps.length < 2) return null;
  const step = steps[current];
  const finished = current === steps.length - 1;

  return (
    <ActivityShell icon={<Map size={17} />} eyebrow="Guided walkthrough" title={block.title} tone="blue">
      <p className="text-xs font-medium leading-relaxed text-slate-600"><span className="font-black text-[#1E1B4B]">Purpose: </span>{block.purpose}</p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-blue-200 bg-white p-4">
          <p className="text-[9px] font-black uppercase tracking-widest text-blue-600">Example</p>
          <p className="mt-2 text-sm font-black leading-relaxed text-[#1E1B4B]">{block.example}</p>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-[9px] font-black uppercase tracking-widest text-amber-700">Why this example?</p>
          <p className="mt-2 text-xs font-medium leading-relaxed text-slate-700">{block.exampleReason}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2" aria-label={`Step ${current + 1} of ${steps.length}`}>
        {steps.map((item, index) => (
          <button
            type="button"
            key={index}
            onClick={() => setCurrent(index)}
            className={`min-w-9 rounded-lg border px-3 py-2 text-[10px] font-black transition ${index === current ? "border-blue-600 bg-blue-600 text-white" : index < current ? "border-blue-200 bg-blue-50 text-blue-700" : "border-gray-200 bg-white text-gray-500"}`}
            aria-label={`Open step ${index + 1}: ${item.focus}`}
          >
            {index + 1}
          </button>
        ))}
      </div>

      <div className="mt-3 rounded-xl border border-blue-200 bg-white p-4" aria-live="polite">
        <p className="text-[9px] font-black uppercase tracking-widest text-blue-600">Current focus · {current + 1}/{steps.length}</p>
        <h5 className="mt-1 text-sm font-black text-[#1E1B4B]">{step.focus}</h5>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg bg-blue-50 p-3">
            <p className="text-[9px] font-black uppercase tracking-widest text-blue-700">What happens?</p>
            <p className="mt-1 text-xs font-semibold leading-relaxed text-slate-700">{step.action}</p>
          </div>
          <div className="rounded-lg bg-violet-50 p-3">
            <p className="text-[9px] font-black uppercase tracking-widest text-violet-700">Why?</p>
            <p className="mt-1 text-xs font-semibold leading-relaxed text-slate-700">{step.why}</p>
          </div>
        </div>
        {step.state && (
          <div className="mt-3 rounded-lg border border-gray-200 bg-slate-50 p-3">
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">State after this step</p>
            <pre className="mt-1 overflow-x-auto whitespace-pre-wrap text-xs font-bold text-[#1E1B4B]">{step.state}</pre>
          </div>
        )}
      </div>

      {finished && (
        <div className="mt-3 flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800">
          <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
          <p className="text-xs font-bold leading-relaxed"><span className="font-black">Final result: </span>{block.conclusion}</p>
        </div>
      )}

      <div className="mt-4 flex justify-between gap-2">
        <button type="button" onClick={() => setCurrent((value) => Math.max(0, value - 1))} disabled={current === 0} className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 disabled:opacity-40"><ChevronLeft size={14} /> Back</button>
        {finished ? (
          <button type="button" onClick={() => setCurrent(0)} className="flex items-center gap-1 rounded-lg bg-blue-600 px-4 py-2 text-xs font-black text-white"><RotateCcw size={13} /> Replay</button>
        ) : (
          <button type="button" onClick={() => setCurrent((value) => value + 1)} className="flex items-center gap-1 rounded-lg bg-blue-600 px-4 py-2 text-xs font-black text-white">Next <ChevronRight size={14} /></button>
        )}
      </div>
    </ActivityShell>
  );
}
