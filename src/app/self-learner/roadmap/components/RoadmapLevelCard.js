"use client";

import { useState } from "react";
import { ChevronRight, ChevronDown, CheckCircle, PlayCircle, HelpCircle } from "lucide-react";
import TopicTree from "./TopicTree";

export default function RoadmapLevelCard({
  levelData,
  completedSubtopics,
  activeSubtopic,
  onSelectSubtopic,
  quizStatus, // 'locked' | 'unlocked' | 'passed'
  onTakeQuiz
}) {
  const [isOpen, setIsOpen] = useState(true);

  // Count subtopics in this level
  let totalSubtopics = 0;
  let completedInLevel = 0;

  levelData.topics.forEach((topic, topicIdx) => {
    topic.subtopics.forEach((sub) => {
      totalSubtopics++;
      const subKey = `${levelData.level}-${topicIdx}-${sub.title}`;
      if (completedSubtopics.includes(subKey)) {
        completedInLevel++;
      }
    });
  });

  const levelProgress = totalSubtopics > 0 ? Math.round((completedInLevel / totalSubtopics) * 100) : 0;

  return (
    <div className="bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden transition-all duration-200">
      
      {/* Level Card Header */}
      <div className="p-6 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Title details */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-gray-400 hover:text-[#6C63FF] transition-all duration-200"
          >
            {isOpen ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
          </button>
          <div>
            <span className="text-[11px] font-bold text-[#6C63FF] uppercase tracking-wider block">
              Stage {levelData.level}
            </span>
            <h3 className="text-lg font-extrabold text-[#1E1B4B] mt-0.5">
              {levelData.title}
            </h3>
            <p className="text-xs font-semibold text-gray-500 leading-relaxed mt-0.5">
              {levelData.description}
            </p>
          </div>
        </div>

        {/* Level progress */}
        <div className="flex items-center gap-4 min-w-[200px]">
          <div className="flex-1">
            <div className="flex justify-between items-center text-[10px] font-bold text-gray-400 mb-1">
              <span>PROGRESS</span>
              <span>{levelProgress}%</span>
            </div>
            <div className="h-2 bg-gray-150 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#6C63FF] to-[#43C6AC] rounded-full transition-all duration-300"
                style={{ width: `${levelProgress}%` }}
              />
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold text-[#1E1B4B] block">
              {completedInLevel}/{totalSubtopics}
            </span>
            <span className="text-[9px] font-bold text-gray-400 uppercase block">
              Completed
            </span>
          </div>
        </div>

      </div>

      {/* Level Body Content */}
      {isOpen && (
        <div className="p-6 border-t border-gray-100 bg-[#FAFBFF]/30 space-y-6 animate-fadeIn">
          
          {/* Render nested Topic Tree */}
          <TopicTree
            topics={levelData.topics}
            level={levelData.level}
            completedSubtopics={completedSubtopics}
            activeSubtopic={activeSubtopic}
            onSelectSubtopic={onSelectSubtopic}
          />

          {/* End of Level Quiz Box */}
          <div className="bg-white border border-gray-150 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs">
            <div className="flex items-start gap-3">
              <div className="text-[#F7971E] bg-[#FFF8EE] p-2.5 rounded-xl flex items-center justify-center mt-0.5">
                <HelpCircle size={20} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#1E1B4B]">
                  Stage {levelData.level} End Quiz
                </h4>
                <p className="text-xs font-semibold text-gray-500 mt-0.5">
                  Complete all topics and pass this quiz with &gt;= 70% to unlock Stage {levelData.level + 1}.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {quizStatus === "passed" ? (
                <span className="flex items-center gap-1.5 text-xs font-extrabold text-[#43C6AC] bg-[#EDFAF5] border border-[#43C6AC]/20 px-4 py-2.5 rounded-xl">
                  <CheckCircle size={14} />
                  Passed & Unlocked
                </span>
              ) : (
                <button
                  onClick={onTakeQuiz}
                  disabled={completedInLevel < totalSubtopics}
                  className={`flex items-center gap-1.5 px-5 py-3 rounded-xl text-xs font-extrabold shadow-2xs transition-all duration-200 ${
                    completedInLevel < totalSubtopics
                      ? "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed"
                      : "bg-[#1E1B4B] hover:bg-[#1E1B4B]/95 text-white border border-transparent hover:scale-102"
                  }`}
                >
                  <PlayCircle size={14} />
                  {quizStatus === "unlocked" ? "Resume Quiz" : "Take Quiz"}
                </button>
              )}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
