"use client";

import { Lock, HelpCircle, CheckCircle2 } from "lucide-react";

export default function LockedLevelCard({ levelNumber, title, description }) {
  return (
    <div className="relative bg-white rounded-3xl border border-gray-200 shadow-xs p-6 overflow-hidden">
      
      {/* Background blur overlays to make it look locked */}
      <div className="absolute inset-0 bg-gray-50/40 backdrop-blur-[1px] pointer-events-none z-10" />

      {/* Lock Indicator Floating Element */}
      <div className="absolute top-6 right-6 z-20 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 shadow-xs">
        <Lock size={16} />
      </div>

      <div className="relative z-20 space-y-4">
        
        {/* Stage meta */}
        <div>
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block">
            Stage {levelNumber} (Locked)
          </span>
          <h3 className="text-lg font-bold text-gray-400 mt-1 select-none">
            {title}
          </h3>
          <p className="text-xs font-semibold text-gray-400 mt-1 select-none leading-relaxed">
            {description}
          </p>
        </div>

        {/* Lock constraints list */}
        <div className="bg-gray-50 border border-gray-200/60 rounded-2xl p-4 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
            <HelpCircle size={14} className="text-[#6C63FF]" />
            Unlock Prerequisites
          </div>
          
          <ul className="space-y-2 text-[11px] font-bold text-gray-400">
            <li className="flex items-center gap-2">
              <CheckCircle2 size={12} className="text-gray-300" />
              Complete all Level {levelNumber - 1} study topics.
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 size={12} className="text-gray-300" />
              Pass Level {levelNumber - 1} end-of-level quiz with a score of 70% or more.
            </li>
          </ul>
        </div>

      </div>
    </div>
  );
}
