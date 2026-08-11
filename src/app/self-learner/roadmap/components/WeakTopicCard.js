"use client";

import { AlertTriangle, BookOpen, ChevronRight, CheckCircle2 } from "lucide-react";

export default function WeakTopicCard({ weakTopics = [], onReviewTopic }) {
  const hasWeakAreas = weakTopics.length > 0;

  return (
    <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-5 space-y-4">
      
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
        <div className={`p-1.5 rounded-lg flex items-center justify-center ${
          hasWeakAreas ? "bg-[#FFF0F3] text-[#FF6584]" : "bg-[#EDFAF5] text-[#43C6AC]"
        }`}>
          {hasWeakAreas ? <AlertTriangle size={16} /> : <CheckCircle2 size={16} />}
        </div>
        <h3 className="text-sm font-bold text-[#1E1B4B]">
          Weak Topic Detector
        </h3>
      </div>

      {/* Content list */}
      {!hasWeakAreas ? (
        <div className="text-center py-4 space-y-2">
          <p className="text-xs font-semibold text-gray-500">
            Keep scoring 80%+ on quizzes. No weak areas detected yet!
          </p>
          <span className="text-[10px] font-bold text-[#43C6AC] bg-[#EDFAF5] px-2.5 py-1 rounded-full inline-block">
            All Systems Clear
          </span>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-xs font-semibold text-gray-400">
            AI detected struggles on these topics. Review study notes and retry practice questions:
          </p>
          
          <div className="space-y-2">
            {weakTopics.map((topic, i) => (
              <div
                key={i}
                className="p-3 rounded-xl border border-gray-150 bg-white flex items-center justify-between gap-3 hover:border-[#FF6584]/40 hover:bg-[#FFF0F3]/10 transition-all duration-200"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-2 h-2 rounded-full bg-[#FF6584] shrink-0" />
                  <span className="text-xs font-bold text-[#1E1B4B] truncate">
                    {topic}
                  </span>
                </div>

                {onReviewTopic && (
                  <button
                    onClick={() => onReviewTopic(topic)}
                    className="text-[10px] font-extrabold text-[#6C63FF] hover:text-[#1E1B4B] flex items-center gap-0.5 shrink-0"
                  >
                    Review
                    <ChevronRight size={10} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
