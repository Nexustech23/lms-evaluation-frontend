"use client";

import { Award, CheckCircle, AlertTriangle, ArrowRight, ShieldCheck } from "lucide-react";

export default function AssessmentResultCard({ results, onProceed }) {
  const { score, strengths, weaknesses, recommendedLevel } = results;

  // Color schemes based on score range
  const scoreColors =
    score >= 80
      ? { text: "text-[#43C6AC]", bg: "bg-[#EDFAF5]", border: "border-[#43C6AC]/30" }
      : score >= 40
        ? { text: "text-[#F7971E]", bg: "bg-[#FFF8EE]", border: "border-[#F7971E]/30" }
        : { text: "text-[#FF6584]", bg: "bg-[#FFF0F3]", border: "border-[#FF6584]/30" };

  return (
    <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 md:p-8 max-w-2xl mx-auto text-center space-y-6">

      {/* Icon Banner */}
      <div className="flex justify-center">
        <div className="bg-[#F0EEFF] text-[#6C63FF] p-5 rounded-full flex items-center justify-center animate-bounce duration-1000">
          <Award size={48} />
        </div>
      </div>

      {/* Title */}
      <div>
        <h2 className="text-2xl font-black text-[#1E1B4B]">Assessment Completed!</h2>
        <p className="text-sm font-medium text-gray-500 mt-1">
          Our engine has evaluated your current level.
        </p>
      </div>

      {/* Score Box */}
      <div className={`p-6 rounded-2xl border ${scoreColors.bg} ${scoreColors.border} max-w-sm mx-auto`}>
        <span className="block text-xs font-extrabold text-gray-400 uppercase tracking-widest">
          Evaluation Score
        </span>
        <span className={`block text-5xl font-black mt-1 ${scoreColors.text}`}>
          {score}%
        </span>
      </div>

      {/* Details (Strengths & Weaknesses) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
        {/* Strengths */}
        <div className="bg-[#FAFBFF] border border-gray-150 p-5 rounded-2xl">
          <h4 className="text-sm font-bold text-[#1E1B4B] flex items-center gap-2 mb-3">
            <CheckCircle size={16} className="text-[#43C6AC]" />
            Areas Mastered
          </h4>
          <ul className="space-y-2 text-xs font-semibold text-gray-500">
            {strengths.map((str, i) => (
              <li key={i} className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-[#43C6AC] rounded-full" />
                {str}
              </li>
            ))}
          </ul>
        </div>

        {/* Weaknesses */}
        <div className="bg-[#FAFBFF] border border-gray-150 p-5 rounded-2xl">
          <h4 className="text-sm font-bold text-[#1E1B4B] flex items-center gap-2 mb-3">
            <AlertTriangle size={16} className="text-[#FF6584]" />
            Recommended Focus
          </h4>
          <ul className="space-y-2 text-xs font-semibold text-gray-500">
            {weaknesses.map((weak, i) => (
              <li key={i} className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-[#FF6584] rounded-full" />
                {weak}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Starting Level recommendation */}
      <div className="flex items-center gap-3 bg-[#F0EEFF] p-4 rounded-2xl border border-[#6C63FF]/20 text-left">
        <ShieldCheck size={24} className="text-[#6C63FF] shrink-0" />
        <div>
          <span className="block text-xs font-bold text-gray-400 uppercase">Recommended Starting Point</span>
          <span className="text-sm font-extrabold text-[#1E1B4B]">{recommendedLevel}</span>
        </div>
      </div>

      {/* Proceed button */}
      <button
        onClick={onProceed}
        className="w-full h-14 rounded-2xl bg-[#1E1B4B] hover:bg-[#1E1B4B]/95 text-white text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition-all duration-200 hover:scale-[1.01]"
      >
        Build My Roadmap
        <ArrowRight size={18} />
      </button>

    </div>
  );
}
