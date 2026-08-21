"use client";

import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import ActivityShell from "../ActivityShell";

export default function ParameterExplorerBlock({ block }) {
  const options = Array.isArray(block.options) ? block.options : [];
  const [selected, setSelected] = useState(0);
  if (options.length < 2) return null;
  const option = options[selected];

  return (
    <ActivityShell icon={<SlidersHorizontal size={17} />} eyebrow="Change and observe" title={block.title} tone="emerald">
      <p className="text-xs text-slate-600 font-medium leading-relaxed">{block.prompt}</p>
      <div className="mt-4">
        <div className="flex justify-between text-[10px] font-black uppercase tracking-wider text-emerald-700 mb-2">
          <label htmlFor={`parameter-${block.title}`}>{block.parameterLabel}</label>
          <span>{option.label || option.value}</span>
        </div>
        <input
          id={`parameter-${block.title}`}
          type="range"
          min="0"
          max={options.length - 1}
          step="1"
          value={selected}
          onChange={(event) => setSelected(Number(event.target.value))}
          className="w-full accent-emerald-500"
        />
        <div className="flex justify-between gap-2 mt-1 text-[9px] font-bold text-gray-400">
          {options.map((item, index) => <span key={index}>{item.value}</span>)}
        </div>
      </div>
      <div className="mt-4 bg-white border border-emerald-200 rounded-xl p-4" aria-live="polite">
        <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600">What changes?</span>
        <p className="text-xs text-slate-700 font-medium leading-relaxed mt-1">{option.effect}</p>
      </div>
    </ActivityShell>
  );
}
