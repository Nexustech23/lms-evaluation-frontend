"use client";

import { useState } from "react";
import { Sparkles, Calendar, BookOpen, Clock, BarChart, FileQuestion } from "lucide-react";

export default function RoadmapGeneratorForm({ onSubmit }) {
  const [subject, setSubject] = useState("");
  const [goal, setGoal] = useState("Interview Preparation");
  const [skillLevel, setSkillLevel] = useState("Beginner");
  const [dailyTime, setDailyTime] = useState("1 Hour");
  const [revisionFreq, setRevisionFreq] = useState("Every Week");
  const [customRevision, setCustomRevision] = useState(3); // default custom every 3 days
  const [assessmentMode, setAssessmentMode] = useState("Yes");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!subject.trim()) {
      alert("Please enter a subject to learn!");
      return;
    }
    const finalRevisionFreq = revisionFreq === "Custom" ? `Every ${customRevision} Days` : revisionFreq;
    onSubmit({
      subject: subject.trim(),
      goal,
      skillLevel,
      dailyTime,
      revisionFrequency: finalRevisionFreq,
      assessmentMode: assessmentMode === "Yes",
    });
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 md:p-8 max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Subject input */}
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-[#1E1B4B] mb-2">
            <BookOpen size={16} className="text-[#6C63FF]" />
            What subject do you want to learn?
          </label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g. Python, DSA, DBMS, Operating Systems, Machine Learning..."
            className="w-full border border-gray-200 rounded-2xl bg-[#FAFBFF] p-4 text-sm text-[#1E1B4B] placeholder-gray-400 outline-none focus:ring-2 focus:ring-violet-400 transition-all duration-200"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Learning Goal */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-[#1E1B4B] mb-2">
              <BarChart size={16} className="text-[#43C6AC]" />
              What is your learning goal?
            </label>
            <select
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className="w-full border border-gray-200 rounded-2xl bg-[#FAFBFF] p-4 text-sm text-[#1E1B4B] outline-none focus:ring-2 focus:ring-violet-400 cursor-pointer transition-all duration-200"
            >
              <option value="Interview Preparation">Interview Preparation</option>
              <option value="Exam Preparation">Exam Preparation</option>
              <option value="Academic Learning">Academic Learning</option>
              <option value="Job Ready Skills">Job Ready Skills</option>
              <option value="Skill Upgrade">Skill Upgrade</option>
            </select>
          </div>

          {/* Daily Study Time */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-[#1E1B4B] mb-2">
              <Clock size={16} className="text-[#FF6584]" />
              Daily Study Time
            </label>
            <select
              value={dailyTime}
              onChange={(e) => setDailyTime(e.target.value)}
              className="w-full border border-gray-200 rounded-2xl bg-[#FAFBFF] p-4 text-sm text-[#1E1B4B] outline-none focus:ring-2 focus:ring-violet-400 cursor-pointer transition-all duration-200"
            >
              <option value="30 Minutes">30 Minutes</option>
              <option value="1 Hour">1 Hour</option>
              <option value="2 Hours">2 Hours</option>
              <option value="3 Hours">3 Hours</option>
              <option value="4+ Hours">4+ Hours</option>
            </select>
          </div>
        </div>

        {/* Current Skill Level */}
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-[#1E1B4B] mb-3">
            <BarChart size={16} className="text-[#F7971E]" />
            What is your current skill level?
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {["Beginner", "Intermediate", "Advanced", "Not Sure"].map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => setSkillLevel(level)}
                className={`py-3 px-4 rounded-2xl border text-sm font-semibold transition-all duration-200 ${
                  skillLevel === level
                    ? "bg-[#F0EEFF] text-[#6C63FF] border-[#6C63FF]"
                    : "bg-[#FAFBFF] text-gray-600 border-gray-200 hover:border-[#6C63FF]"
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* Revision Frequency */}
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-[#1E1B4B] mb-3">
            <Calendar size={16} className="text-[#6C63FF]" />
            Choose Revision Frequency
          </label>
          <div className="flex flex-wrap gap-2 mb-3">
            {["Every Day", "Every 2 Days", "Every 3 Days", "Every Week", "Custom"].map((freq) => (
              <button
                key={freq}
                type="button"
                onClick={() => setRevisionFreq(freq)}
                className={`py-2.5 px-4 rounded-xl border text-xs font-semibold transition-all duration-200 ${
                  revisionFreq === freq
                    ? "bg-[#EDFAF5] text-[#43C6AC] border-[#43C6AC]"
                    : "bg-[#FAFBFF] text-gray-600 border-gray-200 hover:border-[#43C6AC]"
                }`}
              >
                {freq}
              </button>
            ))}
          </div>
          {revisionFreq === "Custom" && (
            <div className="flex items-center gap-3 animate-fadeIn">
              <span className="text-xs text-gray-500 font-medium">Revise every</span>
              <input
                type="number"
                min="1"
                max="30"
                value={customRevision}
                onChange={(e) => setCustomRevision(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-20 border border-gray-200 rounded-xl bg-[#FAFBFF] p-2 text-center text-xs font-bold text-[#1E1B4B] outline-none focus:ring-1 focus:ring-violet-400"
              />
              <span className="text-xs text-gray-500 font-medium">days</span>
            </div>
          )}
        </div>

        {/* Assessment Mode */}
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-[#1E1B4B] mb-3">
            <FileQuestion size={16} className="text-[#FF6584]" />
            Would you like a quick knowledge check first?
          </label>
          <div className="flex gap-4">
            {["Yes", "No"].map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setAssessmentMode(option)}
                className={`flex-1 py-3.5 px-6 rounded-2xl border text-sm font-semibold transition-all duration-200 ${
                  assessmentMode === option
                    ? "bg-[#FFF0F3] text-[#FF6584] border-[#FF6584]"
                    : "bg-[#FAFBFF] text-gray-600 border-gray-200 hover:border-[#FF6584]"
                }`}
              >
                {option === "Yes" ? "Yes, evaluate my level" : "No, generate roadmap directly"}
              </button>
            ))}
          </div>
          {assessmentMode === "Yes" && (
            <p className="text-xs text-gray-400 mt-2 font-medium">
              💡 Recommended: You'll get a 10-question beginner-level check to personalise your starting point.
            </p>
          )}
        </div>

        {/* Submit CTA */}
        <button
          type="submit"
          className="w-full h-14 mt-4 rounded-2xl bg-[#1E1B4B] hover:bg-[#1e1b4b]/95 text-white text-sm font-bold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all duration-200 active:scale-[0.99]"
        >
          <Sparkles size={18} />
          Generate Roadmap
        </button>

      </form>
    </div>
  );
}
