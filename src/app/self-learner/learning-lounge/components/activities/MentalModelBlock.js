import { Brain, Pin } from "lucide-react";
import ActivityShell from "../ActivityShell";

export default function MentalModelBlock({ block }) {
  return (
    <ActivityShell icon={<Brain size={17} />} eyebrow="Build a mental model" title={block.title} tone="blue">
      <div className="rounded-xl border border-blue-200 bg-white p-4">
        <p className="text-[9px] font-black uppercase tracking-widest text-blue-600">Think of it like this</p>
        <p className="mt-2 text-sm font-bold leading-relaxed text-[#1E1B4B]">{block.analogy}</p>
      </div>
      <p className="mt-3 text-xs font-medium leading-relaxed text-slate-600">{block.explanation}</p>
      <div className="mt-4 flex items-start gap-2 rounded-xl bg-blue-50 p-3 text-blue-800">
        <Pin size={14} className="mt-0.5 shrink-0" />
        <p className="text-xs font-black leading-relaxed">Remember: {block.remember}</p>
      </div>
    </ActivityShell>
  );
}
