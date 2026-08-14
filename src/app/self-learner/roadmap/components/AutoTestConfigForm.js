"use client";

import { useState } from "react";
import { Sparkles, ListChecks, PenLine, Wrench, Hash, MessageSquarePlus } from "lucide-react";

const TYPES = [
  { key: "mcqPercent", label: "Multiple Choice", desc: "Auto-graded, instant", icon: ListChecks, color: "#6C63FF" },
  { key: "subjectivePercent", label: "Subjective", desc: "Written answers, Guru -graded", icon: PenLine, color: "#43C6AC" },
  { key: "practicalPercent", label: "Practical", desc: "Applied problem-solving, Guru -graded", icon: Wrench, color: "#F7971E" },
];

/**
 * Percentage sliders + question count + optional custom prompt. Unlike
 * VarkDifficultyPicker, this deliberately does NOT auto-fill the deficit
 * into other sliders — it just blocks "Generate Test" until the three
 * percentages add up to exactly 100.
 */
export default function AutoTestConfigForm({ onGenerate, generating, error }) {
  const [config, setConfig] = useState({ mcqPercent: 100, subjectivePercent: 0, practicalPercent: 0 });
  const [questionCount, setQuestionCount] = useState(10);
  const [customPrompt, setCustomPrompt] = useState("");

  const total = config.mcqPercent + config.subjectivePercent + config.practicalPercent;
  const isValid = total === 100 && questionCount >= 1 && questionCount <= 50;

  const handleSlide = (key, value) => {
    setConfig((prev) => ({ ...prev, [key]: Math.max(0, Math.min(100, value)) }));
  };

  const handleSubmit = () => {
    if (!isValid || generating) return;
    onGenerate({ ...config, questionCount, customPrompt: customPrompt.trim() || null });
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 md:p-8 space-y-6 max-w-2xl mx-auto">
      <div className="text-center space-y-1">
        <h2 className="text-lg font-black text-[#1E1B4B]">Configure Your Weekly Quiz</h2>
        <p className="text-xs font-semibold text-gray-500">Choose the question mix and count for this attempt.</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-xs font-bold text-red-600 text-center">
          ⚠️ {error}
        </div>
      )}

      <div className="space-y-5">
        {TYPES.map(({ key, label, desc, icon: Icon, color }) => (
          <div key={key} className="space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}1A`, color }}>
                  <Icon size={14} />
                </div>
                <div>
                  <span className="text-xs font-black text-[#1E1B4B] block">{label}</span>
                  <span className="text-[10px] font-semibold text-gray-400">{desc}</span>
                </div>
              </div>
              <span className="text-sm font-black" style={{ color }}>{config[key]}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={config[key]}
              onChange={(e) => handleSlide(key, parseInt(e.target.value, 10))}
              className="w-full accent-[#6C63FF]"
            />
          </div>
        ))}
      </div>

      <div className={`rounded-xl p-3 text-center text-xs font-bold ${total === 100 ? "bg-[#FAFBFF] text-gray-500" : "bg-[#FFF0F3] text-[#FF6584]"
        }`}>
        {total === 100 ? "Total: 100%" : `Total is ${total}% — sliders must add up to exactly 100% to continue.`}
      </div>

      <div>
        <label className="flex items-center gap-1.5 text-xs font-bold text-[#1E1B4B] mb-1.5">
          <Hash size={13} /> Number of Questions
        </label>
        <input
          type="number"
          min="1"
          max="50"
          value={questionCount}
          onChange={(e) => setQuestionCount(Math.max(1, Math.min(50, parseInt(e.target.value, 10) || 1)))}
          className="w-full border border-gray-200 rounded-xl bg-[#FAFBFF] p-3 text-sm font-bold text-[#1E1B4B] outline-none focus:ring-2 focus:ring-violet-400"
        />
      </div>

      <div>
        <label className="flex items-center gap-1.5 text-xs font-bold text-[#1E1B4B] mb-1.5">
          <MessageSquarePlus size={13} /> Custom Instructions (optional)
        </label>
        <textarea
          value={customPrompt}
          onChange={(e) => setCustomPrompt(e.target.value.slice(0, 500))}
          placeholder="e.g. Focus more on recursion, or include a debugging question…"
          rows={3}
          className="w-full border border-gray-200 rounded-xl bg-[#FAFBFF] p-3 text-xs font-semibold text-[#1E1B4B] outline-none focus:ring-2 focus:ring-violet-400 resize-none"
        />
        <span className="text-[10px] text-gray-400 font-semibold">{customPrompt.length}/500</span>
      </div>

      <button
        onClick={handleSubmit}
        disabled={!isValid || generating}
        className="w-full h-12 rounded-2xl bg-[#1E1B4B] hover:bg-black text-white text-sm font-bold flex items-center justify-center gap-2 shadow-md transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <Sparkles size={16} /> {generating ? "Generating…" : "Generate Test"}
      </button>
    </div>
  );
}
