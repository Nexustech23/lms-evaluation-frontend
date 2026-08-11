"use client";

import { useState } from "react";
import { ChevronRight, ChevronDown, CheckCircle, BookOpen, AlertCircle } from "lucide-react";

export default function TopicTree({ topics, level, completedSubtopics, activeSubtopic, onSelectSubtopic }) {
  const [expandedTopics, setExpandedTopics] = useState({ 0: true }); // index 0 expanded by default

  const toggleTopic = (index) => {
    setExpandedTopics({
      ...expandedTopics,
      [index]: !expandedTopics[index],
    });
  };

  return (
    <div className="space-y-3">
      {topics.map((topic, topicIdx) => {
        const isExpanded = expandedTopics[topicIdx];
        const allCompleted = topic.subtopics.every((sub) =>
          completedSubtopics.includes(`${level}-${topicIdx}-${sub.title}`)
        );

        return (
          <div key={topicIdx} className="border border-gray-100 rounded-2xl overflow-hidden bg-[#FAFBFF]">
            {/* Topic Header Clickable */}
            <button
              onClick={() => toggleTopic(topicIdx)}
              className="w-full text-left p-4 flex items-center justify-between bg-[#FAFBFF] hover:bg-gray-50 transition-all duration-200"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl flex items-center justify-center ${
                  allCompleted ? "bg-[#EDFAF5] text-[#43C6AC]" : "bg-[#F0EEFF] text-[#6C63FF]"
                }`}>
                  <BookOpen size={16} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#1E1B4B]">
                    {topic.title}
                  </h4>
                  <span className="text-[10px] font-bold text-gray-400 uppercase">
                    {topic.subtopics.length} subtopics
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {allCompleted && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-[#43C6AC] bg-[#EDFAF5] px-2.5 py-1 rounded-full">
                    Completed
                  </span>
                )}
                <div className="text-gray-400">
                  {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </div>
              </div>
            </button>

            {/* Subtopics Area */}
            {isExpanded && (
              <div className="bg-white border-t border-gray-50 p-2 space-y-1 animate-fadeIn">
                {topic.subtopics.map((sub, subIdx) => {
                  const subKey = `${level}-${topicIdx}-${sub.title}`;
                  const isCompleted = completedSubtopics.includes(subKey);
                  const isActive = activeSubtopic && activeSubtopic.key === subKey;

                  return (
                    <button
                      key={subIdx}
                      onClick={() => onSelectSubtopic({ ...sub, key: subKey, topicIdx, level })}
                      className={`w-full text-left p-3 rounded-xl flex items-center justify-between text-xs font-semibold transition-all duration-200 ${
                        isActive
                          ? "bg-[#F0EEFF] text-[#6C63FF]"
                          : "hover:bg-[#FAFBFF] text-gray-600"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 pl-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                        <span>{sub.title}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {isCompleted ? (
                          <CheckCircle size={14} className="text-[#43C6AC]" />
                        ) : (
                          <AlertCircle size={14} className="text-gray-300" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
