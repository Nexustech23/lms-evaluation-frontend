"use client";

import { useState } from "react";
import { Sparkles, FileText, CheckCircle, BookOpen } from "lucide-react";

export default function AINotesCard({ subtopic, isCompleted, onToggleComplete }) {
  const [activeTab, setActiveTab] = useState("Summary");

  if (!subtopic) return null;

  const tabs = [
    { name: "Summary", icon: FileText, content: subtopic.content },
    { name: "Key Points", icon: BookOpen, content: subtopic.summary },
    { name: "Formulas / Rules", icon: Sparkles, content: subtopic.formulas },
    { name: "Common Mistakes", icon: Sparkles, content: subtopic.mistakes },
    { name: "Interview Tips", icon: Sparkles, content: subtopic.tips },
  ];

  const currentTab = tabs.find((t) => t.name === activeTab) || tabs[0];

  return (
    <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">
            Generated Study Notes
          </span>
          <h3 className="text-lg font-black text-[#1E1B4B] mt-0.5">
            {subtopic.title}
          </h3>
        </div>

        <button
          onClick={onToggleComplete}
          className={`flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 hover:scale-102 ${isCompleted
            ? "bg-[#EDFAF5] text-[#43C6AC] border border-[#43C6AC]/30"
            : "bg-[#1E1B4B] hover:bg-[#1E1B4B]/95 text-white border border-transparent shadow-xs"
            }`}
        >
          <CheckCircle size={14} />
          {isCompleted ? "Completed" : "Mark as Completed"}
        </button>
      </div>

      {/* Tabs list */}
      <div className="flex flex-wrap gap-1.5 bg-[#FAFBFF] p-1.5 rounded-2xl border border-gray-100">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.name;
          return (
            <button
              key={tab.name}
              onClick={() => setActiveTab(tab.name)}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${isActive
                ? "bg-white text-[#6C63FF] shadow-2xs font-extrabold"
                : "text-gray-500 hover:text-[#1E1B4B]"
                }`}
            >
              <Icon size={12} />
              {tab.name}
            </button>
          );
        })}
      </div>

      {/* Active Tab Panel Content */}
      <div className="bg-[#FAFBFF] border border-gray-150 rounded-2xl p-5 min-h-[160px] animate-fadeIn">
        <h4 className="text-xs font-extrabold text-gray-400 uppercase tracking-wider mb-2">
          {currentTab.name}
        </h4>
        <p className="text-sm font-semibold text-gray-600 leading-relaxed whitespace-pre-line">
          {currentTab.content || "No information generated for this section."}
        </p>
      </div>

      {/* Footer Info */}
      <p className="text-[11px] font-semibold text-gray-400 text-center">
        ⚡ Core theories generated dynamically. Revise these notes for upcoming quizzes.
      </p>

    </div>
  );
}
