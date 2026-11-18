"use client";

import { useState } from "react";
import { Sparkles, ListChecks, PenLine, Wrench, Hash, MessageSquarePlus } from "lucide-react";

const TYPES = [
  { key: "mcqPercent", label: "Multiple Choice", desc: "Auto-graded, instant", icon: ListChecks, color: "#6366F1" },
  { key: "subjectivePercent", label: "Subjective", desc: "Written answers, Guru -graded", icon: PenLine, color: "#10B981" },
  { key: "practicalPercent", label: "Practical", desc: "Applied problem-solving, Guru -graded", icon: Wrench, color: "#F59E0B" },
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
    <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-[0_1px_3px_rgba(22,31,76,0.06),0_4px_12px_rgba(22,31,76,0.04)] p-6 md:p-8 space-y-6 max-w-[480px] w-full mx-auto">
      <div className="text-center space-y-1">
        <h2 className="text-lg font-black text-[#161F4C]">Configure Your Weekly Quiz</h2>
        <p className="text-xs font-semibold text-[#475569]">Choose the question mix and count for this attempt.</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-xs font-bold text-red-600 text-center">
          ⚠️ {error}
        </div>
      )}

      <div className="space-y-5">
        {TYPES.map(({ key, label, desc, icon: Icon, color }) => (
          <div key={key} className="space-y-2.5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 shrink-0 rounded-[10px] flex items-center justify-center" style={{ backgroundColor: `${color}1A`, color }}>
                  <Icon size={16} />
                </div>
                <div>
                  <span className="text-xs font-black text-[#161F4C] block leading-tight">{label}</span>
                  <span className="text-[11px] font-semibold text-[#64748B] block leading-tight mt-0.5">{desc}</span>
                </div>
              </div>
              <span className="text-sm font-black tabular-nums min-w-[44px] text-right" style={{ color }}>{config[key]}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={config[key]}
              onChange={(e) => handleSlide(key, parseInt(e.target.value, 10))}
              className="mcg-range"
              style={{ "--mcg-slider": color, "--mcg-fill": `${config[key]}%` }}
            />
          </div>
        ))}
      </div>

      <div className={`rounded-[10px] min-h-[40px] px-4 flex items-center justify-center text-center text-xs font-bold ${total === 100 ? "bg-[#F5F7FB] border border-[#E2E8F0] text-[#475569]" : "bg-[#FFF0F3] text-[#FF6584]"
        }`}>
        {total === 100 ? "Total: 100%" : `Total is ${total}% — sliders must add up to exactly 100% to continue.`}
      </div>

      <div>
        <label className="flex items-center gap-1.5 text-xs font-bold text-[#161F4C] mb-2">
          <Hash size={13} /> Number of Questions
        </label>
        <input
          type="number"
          min="1"
          max="50"
          value={questionCount}
          onChange={(e) => setQuestionCount(Math.max(1, Math.min(50, parseInt(e.target.value, 10) || 1)))}
          className="w-full border border-[#E2E8F0] rounded-[10px] bg-[#FAFBFF] h-11 px-4 text-sm font-bold text-[#161F4C] outline-none focus:ring-2 focus:ring-violet-400"
        />
      </div>

      <div>
        <label className="flex items-center gap-1.5 text-xs font-bold text-[#161F4C] mb-2">
          <MessageSquarePlus size={13} /> Custom Instructions (optional)
        </label>
        <textarea
          value={customPrompt}
          onChange={(e) => setCustomPrompt(e.target.value.slice(0, 500))}
          placeholder="e.g. Focus more on recursion, or include a debugging question…"
          rows={3}
          className="w-full border border-[#E2E8F0] rounded-[10px] bg-[#FAFBFF] px-4 py-3 text-xs font-semibold text-[#161F4C] outline-none focus:ring-2 focus:ring-violet-400 resize-none"
        />
        <span className="text-[10px] text-[#64748B] font-semibold block mt-1 text-right">{customPrompt.length}/500</span>
      </div>

      <button
        onClick={handleSubmit}
        disabled={!isValid || generating}
        className="w-full h-12 rounded-2xl bg-[#161F4C] hover:bg-black text-white text-sm font-bold flex items-center justify-center gap-2 shadow-md transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <Sparkles size={16} /> {generating ? "Generating…" : "Generate Test"}
      </button>
    </div>
  );
}
