"use client";

import { useState, useRef } from "react";
import { Sparkles, Calendar, BookOpen, Clock, BarChart, FileQuestion, FileUp, X, MessageSquarePlus } from "lucide-react";

const ACCEPTED_EXTENSIONS = [".pdf", ".docx", ".md", ".txt"];

export default function RoadmapGeneratorForm({ onSubmit }) {
  const [subject, setSubject] = useState("");
  const [goal, setGoal] = useState("Interview Preparation");
  const [skillLevel, setSkillLevel] = useState("Beginner");
  const [dailyTime, setDailyTime] = useState("1 Hour");
  const [revisionFreq, setRevisionFreq] = useState("Every Week");
  const [customRevision, setCustomRevision] = useState(3); // default custom every 3 days
  const [assessmentMode, setAssessmentMode] = useState("Yes");
  const [file, setFile] = useState(null);
  const [customInstruction, setCustomInstruction] = useState("");
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    const ext = "." + selected.name.split(".").pop().toLowerCase();
    if (!ACCEPTED_EXTENSIONS.includes(ext)) {
      alert(`Unsupported file type. Please upload one of: ${ACCEPTED_EXTENSIONS.join(", ")}`);
      e.target.value = "";
      return;
    }
    setFile(selected);
  };

  const clearFile = () => {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

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
      file,
      customInstruction: customInstruction.trim(),
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-[0_1px_3px_rgba(22,31,76,0.06),0_4px_12px_rgba(22,31,76,0.04)] px-5 py-6 md:px-8 md:py-7 max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Subject input */}
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-[#161F4C] mb-2">
            <BookOpen size={16} className="text-[#6C63FF]" />
            What subject do you want to learn?
          </label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g. Python, DSA, DBMS, Operating Systems, Machine Learning..."
            className="w-full h-[46px] border border-[#E2E8F0] rounded-xl bg-[#FAFBFF] px-4 text-sm text-[#161F4C] placeholder-[#94A3B8] outline-none focus:ring-2 focus:ring-violet-400 transition-all duration-200"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Learning Goal */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-[#161F4C] mb-2">
              <BarChart size={16} className="text-[#43C6AC]" />
              What is your learning goal?
            </label>
            <select
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className="mcg-select w-full h-[46px] border border-[#E2E8F0] rounded-xl bg-[#FAFBFF] px-4 text-sm text-[#161F4C] outline-none focus:ring-2 focus:ring-violet-400 cursor-pointer transition-all duration-200"
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
            <label className="flex items-center gap-2 text-sm font-semibold text-[#161F4C] mb-2">
              <Clock size={16} className="text-[#FF6584]" />
              Daily Study Time
            </label>
            <select
              value={dailyTime}
              onChange={(e) => setDailyTime(e.target.value)}
              className="mcg-select w-full h-[46px] border border-[#E2E8F0] rounded-xl bg-[#FAFBFF] px-4 text-sm text-[#161F4C] outline-none focus:ring-2 focus:ring-violet-400 cursor-pointer transition-all duration-200"
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
          <label className="flex items-center gap-2 text-sm font-semibold text-[#161F4C] mb-3">
            <BarChart size={16} className="text-[#F7971E]" />
            What is your current skill level?
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {["Beginner", "Intermediate", "Advanced", "Not Sure"].map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => setSkillLevel(level)}
                className={`h-11 px-4 rounded-xl border text-sm font-semibold transition-all duration-200 ${
                  skillLevel === level
                    ? "bg-[#F0EEFF] text-[#6C63FF] border-[1.5px] border-[#6C63FF]"
                    : "bg-[#FAFBFF] text-[#475569] border-[#E2E8F0] hover:border-[#6C63FF]"
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* Revision Frequency */}
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-[#161F4C] mb-3">
            <Calendar size={16} className="text-[#6C63FF]" />
            Choose Revision Frequency
          </label>
          <div className="flex flex-wrap gap-2 mb-3">
            {["Every Day", "Every 2 Days", "Every 3 Days", "Every Week", "Custom"].map((freq) => (
              <button
                key={freq}
                type="button"
                onClick={() => setRevisionFreq(freq)}
                className={`h-10 px-4 rounded-xl border text-xs font-semibold transition-all duration-200 ${
                  revisionFreq === freq
                    ? "bg-[#EDFAF5] text-[#43C6AC] border-[1.5px] border-[#43C6AC]"
                    : "bg-[#FAFBFF] text-[#475569] border-[#E2E8F0] hover:border-[#43C6AC]"
                }`}
              >
                {freq}
              </button>
            ))}
          </div>
          {revisionFreq === "Custom" && (
            <div className="flex items-center gap-3 animate-fadeIn">
              <span className="text-xs text-[#475569] font-medium">Revise every</span>
              <input
                type="number"
                min="1"
                max="30"
                value={customRevision}
                onChange={(e) => setCustomRevision(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-20 border border-[#E2E8F0] rounded-lg bg-[#FAFBFF] h-9 text-center text-xs font-bold text-[#161F4C] outline-none focus:ring-1 focus:ring-violet-400"
              />
              <span className="text-xs text-[#475569] font-medium">days</span>
            </div>
          )}
        </div>

        {/* Assessment Mode */}
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-[#161F4C] mb-3">
            <FileQuestion size={16} className="text-[#FF6584]" />
            Would you like a quick knowledge check first?
          </label>
          <div className="flex gap-4">
            {["Yes", "No"].map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setAssessmentMode(option)}
                className={`flex-1 h-11 px-6 rounded-xl border text-sm font-semibold transition-all duration-200 ${
                  assessmentMode === option
                    ? "bg-[#EEF2FF] text-[#4338CA] border-[1.5px] border-[#6366F1]"
                    : "bg-[#FAFBFF] text-[#475569] border-[#E2E8F0] hover:border-[#6366F1]"
                }`}
              >
                {option === "Yes" ? "Yes, evaluate my level" : "No, generate roadmap directly"}
              </button>
            ))}
          </div>
          {assessmentMode === "Yes" && (
            <p className="text-xs text-[#64748B] mt-2 font-medium">
              💡 Recommended: You'll get a 10-question beginner-level check to personalise your starting point.
            </p>
          )}
        </div>

        {/* Course Material Upload (optional grounding document) */}
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-[#161F4C] mb-2">
            <FileUp size={16} className="text-[#43C6AC]" />
            Ground it in your own material (optional)
          </label>
          {!file ? (
            <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-[#CBD5E1] rounded-xl bg-[#FAFBFF] px-5 py-7 text-center cursor-pointer hover:border-[#43C6AC] transition-all duration-200">
              <FileUp size={22} className="text-[#64748B]" />
              <span className="text-sm font-medium text-[#475569]">
                Upload a syllabus, course profile, or textbook (PDF, DOCX, MD, TXT)
              </span>
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED_EXTENSIONS.join(",")}
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          ) : (
            <div className="flex items-center justify-between border border-[#E2E8F0] rounded-xl bg-[#FAFBFF] px-4 py-3">
              <div className="flex items-center gap-2 min-w-0">
                <FileUp size={18} className="text-[#43C6AC] shrink-0" />
                <span className="text-sm font-medium text-[#161F4C] truncate">{file.name}</span>
              </div>
              <button
                type="button"
                onClick={clearFile}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-[#FF6584] transition-all duration-200 shrink-0"
                aria-label="Remove file"
              >
                <X size={16} />
              </button>
            </div>
          )}
        </div>

        {/* Custom Instructions */}
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-[#161F4C] mb-2">
            <MessageSquarePlus size={16} className="text-[#6C63FF]" />
            Anything specific you want the roadmap to focus on? (optional)
          </label>
          <textarea
            value={customInstruction}
            onChange={(e) => setCustomInstruction(e.target.value)}
            placeholder="e.g. Focus purely on advanced neural networks and PyTorch implementation"
            maxLength={1000}
            rows={3}
            className="w-full border border-[#E2E8F0] rounded-xl bg-[#FAFBFF] px-4 py-3 text-sm text-[#161F4C] placeholder-[#94A3B8] outline-none focus:ring-2 focus:ring-violet-400 transition-all duration-200 resize-none"
          />
        </div>

        {/* Submit CTA */}
        <button
          type="submit"
          className="w-full h-12 mt-3 rounded-xl bg-[#161F4C] hover:bg-[#252F6B] text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-sm transition-colors duration-200"
        >
          <Sparkles size={18} />
          Generate Roadmap
        </button>

      </form>
    </div>
  );
}
