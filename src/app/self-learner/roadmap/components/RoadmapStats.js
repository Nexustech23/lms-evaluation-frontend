"use client";

import { Calendar, CheckSquare, Award, BookOpen, Target, ListTodo } from "lucide-react";

export default function RoadmapStats({ stats, progress }) {
  const {
    estimatedDays,
    estimatedWeeks,
    totalTopics,
    totalQuizzes = 0,
  } = stats;
  const displayDays = estimatedDays ?? (estimatedWeeks ? estimatedWeeks * 7 : 0);

  const {
    overallProgress = 0,
    topicsCompleted = 0,
    quizzesPassed = 0,
  } = progress;

  const cards = [
    {
      label: "Estimated Completion",
      value: `${estimatedWeeks} Wks (${displayDays} Days)`,
      icon: Calendar,
      color: "text-[#6C63FF]",
      bg: "bg-[#F0EEFF]",
    },
    {
      label: "Total Topics",
      value: `${topicsCompleted}/${totalTopics}`,
      icon: BookOpen,
      color: "text-[#43C6AC]",
      bg: "bg-[#EDFAF5]",
    },
    {
      label: "Practice & Quizzes",
      value: `${quizzesPassed}/${totalQuizzes}`,
      icon: CheckSquare,
      color: "text-[#F7971E]",
      bg: "bg-[#FFF8EE]",
    },
  ];

  return (
    <div className="space-y-6">
      
      {/* Grid of Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={i}
              className="bg-white rounded-2xl border border-gray-200 shadow-xs p-4 flex flex-col justify-between min-h-[110px]"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  {card.label}
                </span>
                <div className={`w-8 h-8 rounded-lg ${card.bg} ${card.color} flex items-center justify-center`}>
                  <Icon size={16} />
                </div>
              </div>
              <div className="text-lg md:text-xl font-extrabold text-[#1E1B4B] mt-2">
                {card.value}
              </div>
            </div>
          );
        })}
      </div>

      {/* Progress Tracker Card */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-sm font-bold text-[#1E1B4B] flex items-center gap-1.5">
              <Target size={18} className="text-[#6C63FF]" />
              Learning Progress Tracker
            </h3>
            <p className="text-xs text-gray-500 font-semibold mt-0.5">
              Complete notes and pass quizzes to unlock upcoming weeks.
            </p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black text-[#6C63FF]">
              {overallProgress}%
            </span>
            <span className="text-[11px] text-gray-400 font-bold block uppercase">
              Overall Roadmap
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden mb-6">
          <div
            className="h-full bg-gradient-to-r from-[#6C63FF] via-[#43C6AC] to-[#F7971E] rounded-full transition-all duration-500"
            style={{ width: `${overallProgress}%` }}
          />
        </div>

        {/* Sub-Progress metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-gray-100 pt-4">
          <div className="flex items-center gap-3">
            <div className="text-[#43C6AC] bg-[#EDFAF5] p-2 rounded-xl">
              <ListTodo size={16} />
            </div>
            <div>
              <span className="block text-[10px] font-bold text-gray-400 uppercase">
                Topics Mastered
              </span>
              <span className="text-xs font-bold text-[#1E1B4B]">
                {topicsCompleted} of {totalTopics} completed
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-[#F7971E] bg-[#FFF8EE] p-2 rounded-xl">
              <Award size={16} />
            </div>
            <div>
              <span className="block text-[10px] font-bold text-gray-400 uppercase">
                Quizzes Passed
              </span>
              <span className="text-xs font-bold text-[#1E1B4B]">
                {quizzesPassed} of {totalQuizzes} passed
              </span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
