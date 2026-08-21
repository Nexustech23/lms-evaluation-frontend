"use client";

import { useState } from "react";
import { BriefcaseBusiness, ChevronDown } from "lucide-react";
import ActivityShell from "../ActivityShell";

export default function CaseStudyBlock({ block }) {
  const [revealed, setRevealed] = useState(false);

  return (
    <ActivityShell icon={<BriefcaseBusiness size={17} />} eyebrow="Case study" title={block.title} tone="blue">
      <p className="text-sm font-semibold leading-relaxed text-[#1E1B4B]">{block.scenario}</p>
      <div className="mt-4 rounded-xl border border-blue-200 bg-white p-4">
        <p className="text-[9px] font-black uppercase tracking-widest text-blue-600">What you know</p>
        <ul className="mt-2 grid gap-2 sm:grid-cols-2">
          {(block.facts || []).map((fact, index) => <li key={index} className="flex gap-2 text-xs font-medium leading-relaxed text-slate-600"><span className="font-black text-blue-500">•</span>{fact}</li>)}
        </ul>
      </div>
      <div className="mt-3 rounded-xl border border-violet-200 bg-violet-50 p-4">
        <p className="text-[9px] font-black uppercase tracking-widest text-violet-700">Your decision</p>
        <p className="mt-2 text-xs font-bold leading-relaxed text-[#1E1B4B]">{block.decision}</p>
      </div>
      <button type="button" onClick={() => setRevealed((value) => !value)} className="mt-3 flex w-full items-center justify-between rounded-xl bg-[#1E1B4B] px-4 py-3 text-left text-xs font-black text-white" aria-expanded={revealed}>
        <span>{revealed ? "Hide recommended approach" : "Think first, then reveal the approach"}</span>
        <ChevronDown size={15} className={`transition-transform ${revealed ? "rotate-180" : ""}`} />
      </button>
      {revealed && (
        <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-xs font-black text-emerald-800">{block.recommendedApproach}</p>
          <p className="mt-2 text-xs font-medium leading-relaxed text-slate-700"><span className="font-black">Reasoning: </span>{block.reasoning}</p>
        </div>
      )}
    </ActivityShell>
  );
}
