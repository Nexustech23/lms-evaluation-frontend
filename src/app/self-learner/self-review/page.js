"use client";

import { useRouter } from "next/navigation";
import { NotebookPen, MessageCircleQuestion, ClipboardCheck, ArrowRight } from "lucide-react";
import RoadmapHeader from "../roadmap/components/RoadmapHeader";

const TILES = [
  {
    title: "Notes Generate",
    desc: "Turn any topic or uploaded material into structured study notes.",
    icon: NotebookPen,
    color: "#6C63FF",
    bg: "#F0EEFF",
    href: "/self-learner/self-review/notes-generate",
  },
  {
    title: "Homework Help",
    desc: "Get step-by-step Guru help on homework questions or uploaded files.",
    icon: MessageCircleQuestion,
    color: "#43C6AC",
    bg: "#EDFAF5",
    href: "/self-learner/self-review/homework-help",
  },
  {
    title: "Weekly Quiz",
    desc: "Take your current roadmap week's evaluation once you've finished studying it.",
    icon: ClipboardCheck,
    color: "#F7971E",
    bg: "#FFF8EE",
    href: "/self-learner/self-review/week-quiz",
  },
];

export default function SelfReviewHubPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#F5F7FB] p-4 md:p-6 text-slate-800">
      <RoadmapHeader
        title="Self-Review"
        subtitle="Reinforce what you're learning — generate notes, get homework help, or test yourself."
        showReset={false}
      />

      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-5 mt-6">
        {TILES.map(({ title, desc, icon: Icon, color, bg, href }) => (
          <button
            key={title}
            onClick={() => router.push(href)}
            className="text-left bg-white rounded-2xl border border-[#E2E8F0] shadow-[0_1px_3px_rgba(22,31,76,0.06),0_4px_12px_rgba(22,31,76,0.04)] p-6 hover:-translate-y-0.5 hover:shadow-md transition-all duration-300 flex flex-col justify-between gap-5 min-h-[220px] h-full"
          >
            <div>
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                style={{ backgroundColor: bg, color }}
              >
                <Icon size={22} />
              </div>
              <h3 className="text-base font-black text-[#161F4C]">{title}</h3>
              <p className="text-xs font-semibold text-[#475569] mt-2 leading-relaxed">{desc}</p>
            </div>
            <span className="text-xs font-extrabold flex items-center gap-1" style={{ color }}>
              Open <ArrowRight size={14} />
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
