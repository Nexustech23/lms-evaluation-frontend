"use client";

import { Flame, Award, Calendar, Check } from "lucide-react";

export default function StreakCard({ streakDays = 7, completedLevelsCount = 0 }) {
  const weekDays = [
    { name: "Mon", active: true },
    { name: "Tue", active: true },
    { name: "Wed", active: true },
    { name: "Thu", active: true },
    { name: "Fri", active: true },
    { name: "Sat", active: false },
    { name: "Sun", active: false },
  ];

  const badges = [
    {
      title: "7 Day Streak",
      desc: "Maintain 7 days active learning.",
      unlocked: streakDays >= 7,
      icon: "🔥",
    },
    {
      title: "Stage 1 Conqueror",
      desc: "Complete level 1 curriculum.",
      unlocked: completedLevelsCount >= 1,
      icon: "🏆",
    },
    {
      title: "Master Learner",
      desc: "Reach 30 day learning streak.",
      unlocked: streakDays >= 30,
      icon: "⚡",
    },
  ];

  return (
    <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-5 space-y-4">
      
      {/* Flame Header */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-[#FFF0F3] text-[#FF6584] flex items-center justify-center">
            <Flame size={18} fill="#FF6584" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#1E1B4B]">
              Learning Streak
            </h3>
            <span className="text-[10px] font-bold text-gray-400 uppercase">
              Keep it up!
            </span>
          </div>
        </div>
        <div className="text-right">
          <span className="text-2xl font-black text-[#FF6584]">
            {streakDays} Days
          </span>
        </div>
      </div>

      {/* Week Calendar Map */}
      <div className="space-y-2">
        <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
          Weekly Consistency
        </span>
        <div className="grid grid-cols-7 gap-1 text-center">
          {weekDays.map((day, i) => (
            <div key={i} className="space-y-1">
              <div
                className={`w-8 h-8 rounded-full mx-auto flex items-center justify-center border text-[10px] font-bold transition-all duration-200 ${
                  day.active
                    ? "bg-[#FFF0F3] text-[#FF6584] border-[#FF6584]/30"
                    : "bg-gray-50 text-gray-400 border-gray-200"
                }`}
              >
                {day.active ? <Check size={12} strokeWidth={3} /> : day.name.slice(0, 1)}
              </div>
              <span className="text-[9px] font-bold text-gray-400 uppercase">
                {day.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Badges unlocked */}
      <div className="space-y-2 pt-2 border-t border-gray-100">
        <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
          Earned Achievements
        </span>
        
        <div className="space-y-2">
          {badges.map((badge, i) => (
            <div
              key={i}
              className={`p-3 rounded-xl border flex items-center gap-3 transition-all duration-200 ${
                badge.unlocked
                  ? "bg-white border-gray-150"
                  : "bg-gray-50 border-gray-100/50 opacity-60"
              }`}
            >
              <div className="text-xl shrink-0">
                {badge.icon}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className={`text-xs font-bold ${badge.unlocked ? "text-[#1E1B4B]" : "text-gray-400"}`}>
                  {badge.title}
                </h4>
                <p className="text-[10px] font-semibold text-gray-400 leading-snug">
                  {badge.desc}
                </p>
              </div>
              <div className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] ${
                badge.unlocked
                  ? "bg-[#43C6AC] border-[#43C6AC] text-white font-black"
                  : "border-gray-300"
              }`}>
                {badge.unlocked ? "✓" : ""}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
