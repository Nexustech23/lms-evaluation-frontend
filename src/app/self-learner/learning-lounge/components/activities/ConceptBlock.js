import { BookOpen, Lightbulb } from "lucide-react";
import ReactMarkdown from "react-markdown";
import ActivityShell from "../ActivityShell";

export default function ConceptBlock({ block }) {
  return (
    <ActivityShell icon={<BookOpen size={17} />} eyebrow="Understand the idea" title={block.title}>
      <div className="text-sm font-medium text-slate-700 leading-relaxed">
        <ReactMarkdown>{block.simpleExplanation}</ReactMarkdown>
      </div>
      <div className="mt-4 rounded-xl border border-[#6C63FF]/15 bg-white p-4">
        <div className="flex items-center gap-2 text-[#6C63FF]">
          <Lightbulb size={14} />
          <span className="text-[9px] font-black uppercase tracking-widest">Why this matters</span>
        </div>
        <p className="mt-2 text-xs font-medium leading-relaxed text-slate-600">{block.whyItMatters}</p>
      </div>
      {block.realWorldConnection && (
        <p className="mt-3 text-xs font-semibold leading-relaxed text-slate-600">
          <span className="font-black text-[#1E1B4B]">Real-world connection: </span>{block.realWorldConnection}
        </p>
      )}
    </ActivityShell>
  );
}
