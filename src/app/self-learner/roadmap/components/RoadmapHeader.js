"use client";

import { Sparkles, RefreshCw } from "lucide-react";

export default function RoadmapHeader({ title, subtitle, showReset, onReset }) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between bg-white rounded-2xl border border-[#E2E8F0] shadow-[0_1px_3px_rgba(22,31,76,0.06),0_4px_12px_rgba(22,31,76,0.04)] px-6 py-5 mb-6">
      <div className="flex items-center gap-4">
        <div className="bg-[#F0EEFF] text-[#6C63FF] w-11 h-11 shrink-0 rounded-xl flex items-center justify-center">
          <Sparkles size={22} />
        </div>
        <div>
          <h1 className="text-2xl md:text-[26px] leading-tight font-extrabold text-[#161F4C] tracking-tight">
            {title}
          </h1>
          <p className="text-sm font-medium text-[#475569] mt-1 max-w-2xl leading-snug">
            {subtitle}
          </p>
        </div>
      </div>
      {showReset && (
        <button
          onClick={onReset}
          className="mt-4 md:mt-0 flex items-center justify-center gap-2 bg-[#FAFBFF] hover:bg-[#F0EEFF] text-[#161F4C] border border-[#E2E8F0] hover:border-[#6C63FF] h-11 px-5 rounded-xl text-sm font-semibold transition-all duration-200"
        >
          <RefreshCw size={16} className="text-[#6C63FF]" />
          Create New Roadmap
        </button>
      )}
    </div>
  );
}
