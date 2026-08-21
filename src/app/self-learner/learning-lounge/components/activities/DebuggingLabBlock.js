"use client";

import { useState } from "react";
import { Bug, ChevronDown, Lightbulb } from "lucide-react";
import ActivityShell from "../ActivityShell";

export default function DebuggingLabBlock({ block }) {
  const hints = Array.isArray(block.hints) ? block.hints : [];
  const [hintCount, setHintCount] = useState(0);
  const [solutionVisible, setSolutionVisible] = useState(false);

  return (
    <ActivityShell icon={<Bug size={17} />} eyebrow="Debugging lab" title={block.title} tone="amber">
      <p className="text-xs font-medium leading-relaxed text-slate-600">{block.scenario}</p>
      <div className="mt-3 overflow-hidden rounded-xl bg-[#17152F]">
        <p className="border-b border-white/10 px-4 py-2 text-[9px] font-black uppercase tracking-widest text-rose-300">Broken example</p>
        <pre className="overflow-x-auto whitespace-pre-wrap p-4 text-xs leading-relaxed text-rose-200">{block.brokenExample}</pre>
      </div>
      <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
        <p className="text-xs font-black text-amber-800">Find the issue before revealing the solution.</p>
        {hintCount > 0 && <ul className="mt-2 space-y-2">{hints.slice(0, hintCount).map((hint, index) => <li key={index} className="flex gap-2 text-xs font-medium text-slate-700"><Lightbulb size={13} className="mt-0.5 shrink-0 text-amber-600" />{hint}</li>)}</ul>}
        {hintCount < hints.length && <button type="button" onClick={() => setHintCount((value) => value + 1)} className="mt-3 text-[10px] font-black uppercase tracking-wider text-amber-700">Show hint {hintCount + 1}</button>}
      </div>
      <button type="button" onClick={() => setSolutionVisible((value) => !value)} className="mt-3 flex w-full items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3 text-xs font-black text-[#1E1B4B]" aria-expanded={solutionVisible}>
        <span>{solutionVisible ? "Hide solution" : "Reveal solution"}</span>
        <ChevronDown size={15} className={`transition-transform ${solutionVisible ? "rotate-180" : ""}`} />
      </button>
      {solutionVisible && (
        <div className="mt-3 overflow-hidden rounded-xl bg-[#17152F]">
          <pre className="overflow-x-auto whitespace-pre-wrap p-4 text-xs leading-relaxed text-emerald-300">{block.solution}</pre>
          <p className="border-t border-white/10 px-4 py-3 text-xs font-medium leading-relaxed text-slate-300">{block.explanation}</p>
        </div>
      )}
    </ActivityShell>
  );
}
