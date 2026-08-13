"use client";

import { useState } from "react";
import { Calendar, Bell, Clock, RefreshCw, CheckCircle2 } from "lucide-react";

export default function RevisionPlanner({ initialFrequency = "Every Week" }) {
  const [activeTab, setActiveTab] = useState("daily");
  const [reminders, setReminders] = useState(true);
  const [freq, setFreq] = useState(initialFrequency);

  const plannerData = {
    daily: [
      { id: 1, time: "08:30 AM", topic: "Quick review of yesterday's notes", done: true },
      { id: 2, time: "09:00 PM", topic: "Flashcard review for this week's concepts", done: false },
    ],
    weekly: [
      { id: 3, day: "Saturday", topic: "Re-run practice questions for Week 1", done: false },
      { id: 4, day: "Sunday", topic: "Solve weak topic notes and review calculations", done: false },
    ],
    topicWise: [
      { id: 5, category: "Basics", topic: "Revisit Time Complexity definitions", done: true },
      { id: 6, category: "Logic Building", topic: "Solve recursion call stack traces again", done: false },
    ],
  };

  const currentList =
    activeTab === "daily"
      ? plannerData.daily
      : activeTab === "weekly"
      ? plannerData.weekly
      : plannerData.topicWise;

  return (
    <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-5 space-y-4">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
        <h3 className="text-sm font-bold text-[#1E1B4B] flex items-center gap-1.5">
          <Calendar size={16} className="text-[#6C63FF]" />
          Revision Planner
        </h3>
        <button
          onClick={() => setReminders(!reminders)}
          className={`p-1.5 rounded-lg border transition-all duration-200 ${
            reminders ? "bg-[#EDFAF5] text-[#43C6AC] border-[#43C6AC]/30" : "bg-gray-50 text-gray-400 border-gray-200"
          }`}
          title="Toggle alerts"
        >
          <Bell size={14} />
        </button>
      </div>

      {/* Control selectors */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-[10px] font-bold text-gray-400">
          <span>FREQUENCY</span>
          <span className="text-[#6C63FF]">{freq}</span>
        </div>
        <select
          value={freq}
          onChange={(e) => setFreq(e.target.value)}
          className="w-full border border-gray-200 rounded-xl bg-[#FAFBFF] p-2 text-xs text-[#1E1B4B] font-semibold outline-none cursor-pointer"
        >
          <option value="Every Day">Every Day</option>
          <option value="Every 2 Days">Every 2 Days</option>
          <option value="Every 3 Days">Every 3 Days</option>
          <option value="Every Week">Every Week</option>
        </select>
      </div>

      {/* Sub tabs */}
      <div className="grid grid-cols-3 gap-1 bg-[#FAFBFF] p-1 rounded-xl border border-gray-100">
        {[
          { id: "daily", label: "Daily" },
          { id: "weekly", label: "Weekly" },
          { id: "topics", label: "Topics" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`py-1.5 px-2 rounded-lg text-[10px] font-bold text-center transition-all duration-200 ${
              activeTab === tab.id
                ? "bg-white text-[#6C63FF] shadow-2xs font-extrabold"
                : "text-gray-500 hover:text-[#1E1B4B]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Items list */}
      <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
        {currentList.map((item) => (
          <div
            key={item.id}
            className={`p-2.5 rounded-xl border flex items-start gap-2.5 transition-all duration-150 ${
              item.done
                ? "bg-[#EDFAF5]/30 border-gray-100/50 opacity-70"
                : "bg-white border-gray-150"
            }`}
          >
            <div className={`mt-0.5 w-4 h-4 rounded flex items-center justify-center border text-[10px] ${
              item.done ? "bg-[#43C6AC] border-[#43C6AC] text-white" : "border-gray-300"
            }`}>
              {item.done && "✓"}
            </div>
            
            <div className="flex-1">
              <p className={`text-[11px] font-semibold leading-tight ${item.done ? "text-gray-400 line-through" : "text-[#1E1B4B]"}`}>
                {item.topic}
              </p>
              <span className="text-[9px] font-bold text-gray-400 block mt-1 uppercase flex items-center gap-1">
                <Clock size={10} />
                {item.time || item.day || item.category}
              </span>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
