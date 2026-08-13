"use client";

import { useRouter } from "next/navigation";
import { NotebookPen, MessageCircleQuestion, ClipboardCheck, ArrowRight } from "lucide-react";
import RoadmapHeader from "../roadmap/components/RoadmapHeader";

const TILES = [
  {
    title: "Notes Generate",
    desc: "Turn any topic or uploaded material into structured AI study notes.",
    icon: NotebookPen,
    color: "#6C63FF",
    bg: "#F0EEFF",
    href: "/self-learner/self-review/notes-generate",
  },
  {
    title: "Homework Help",
    desc: "Get step-by-step AI help on homework questions or uploaded files.",
    icon: MessageCircleQuestion,
    color: "#43C6AC",
    bg: "#EDFAF5",
    href: "/self-learner/self-review/homework-help",
  },
  {
    title: "Weekly Quiz",
    desc: "Take your current roadmap week's AI-generated evaluation once you've finished studying it.",
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

      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        {TILES.map(({ title, desc, icon: Icon, color, bg, href }) => (
          <button
            key={title}
            onClick={() => router.push(href)}
            className="text-left bg-white rounded-3xl border border-gray-200 shadow-sm p-6 hover:-translate-y-1 hover:shadow-md transition-all duration-300 flex flex-col justify-between h-[220px]"
          >
            <div>
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
                style={{ backgroundColor: bg, color }}
              >
                <Icon size={22} />
              </div>
              <h3 className="text-base font-black text-[#1E1B4B]">{title}</h3>
              <p className="text-xs font-semibold text-gray-500 mt-2 leading-relaxed">{desc}</p>
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
