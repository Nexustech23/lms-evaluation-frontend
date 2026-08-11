"use client";

import { Sparkles, RefreshCw } from "lucide-react";

export default function RoadmapHeader({ title, subtitle, showReset, onReset }) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between bg-white rounded-3xl border border-gray-200 shadow-sm p-6 mb-6">
      <div className="flex items-start gap-4">
        <div className="bg-[#F0EEFF] text-[#6C63FF] p-3 rounded-2xl flex items-center justify-center mt-1">
          <Sparkles size={24} />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#1E1B4B] tracking-tight">
            {title}
          </h1>
          <p className="text-sm font-medium text-gray-500 mt-1 max-w-2xl leading-relaxed">
            {subtitle}
          </p>
        </div>
      </div>
      {showReset && (
        <button
          onClick={onReset}
          className="mt-4 md:mt-0 flex items-center justify-center gap-2 bg-[#FAFBFF] hover:bg-[#F0EEFF] text-[#1E1B4B] border border-gray-200 hover:border-[#6C63FF] px-5 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 hover:scale-102 hover:shadow-xs active:scale-98"
        >
          <RefreshCw size={16} className="text-[#6C63FF]" />
          Create New Roadmap
        </button>
      )}
    </div>
  );
}
