"use client";

import { useState } from "react";
import { Award, CheckCircle2, ChevronRight, HelpCircle, Loader2, Sparkles, AlertCircle } from "lucide-react";

export default function MiniProjectCard({ project, isCompleted, onCompleteProject }) {
  const [submission, setSubmission] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  if (!project) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!submission.trim()) return;

    setLoading(true);
    // Simulate AI grading evaluation
    setTimeout(() => {
      setLoading(false);
      const grade = 80 + Math.floor(Math.random() * 16); // 80 - 95
      setFeedback({
        status: "APPROVED",
        grade,
        summary: `Excellent execution! Your implementation meets all major core objectives.`,
        strengths: [
          "Clear modular structure and clean function partitions.",
          "Efficient error checking for network/array boundaries.",
        ],
        weaknesses: [
          "Could optimize auxiliary space usage slightly.",
          "Consider documenting input parameters more thoroughly.",
        ],
      });
      if (onCompleteProject) {
        onCompleteProject(project.title, grade);
      }
    }, 2500);
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 space-y-6">
      
      {/* Header */}
      <div className="flex justify-between items-start border-b border-gray-150 pb-5">
        <div>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">
            Practical Project Milestone
          </span>
          <h3 className="text-lg font-black text-[#1E1B4B] mt-0.5">
            {project.title}
          </h3>
        </div>
        <div className="text-xs font-extrabold text-[#FF6584] bg-[#FFF0F3] px-3 py-1.5 rounded-full flex items-center gap-1">
          <Sparkles size={12} />
          Level Milestone
        </div>
      </div>

      {/* Description */}
      <p className="text-xs font-semibold text-gray-500 leading-relaxed">
        {project.description}
      </p>

      {/* Objectives */}
      <div className="bg-[#FAFBFF] border border-gray-100 rounded-2xl p-5 space-y-3">
        <h4 className="text-xs font-extrabold text-[#1E1B4B] flex items-center gap-1.5">
          <CheckCircle2 size={14} className="text-[#43C6AC]" />
          Project Key Objectives
        </h4>
        <ul className="space-y-2 text-xs font-semibold text-gray-500">
          {project.objectives.map((obj, i) => (
            <li key={i} className="flex items-start gap-2 pl-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#6C63FF] mt-1.5 shrink-0" />
              <span>{obj}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Submit or feedback */}
      {!feedback && !isCompleted ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-extrabold text-[#1E1B4B] mb-2">
              Submit Project Deliverables
            </label>
            <textarea
              value={submission}
              onChange={(e) => setSubmission(e.target.value)}
              placeholder="Paste your source code links (GitHub, CodePen), summary descriptions, or architectural decisions here..."
              className="w-full h-32 rounded-2xl border border-gray-200 bg-[#FAFBFF] p-4 text-xs text-[#1E1B4B] outline-none focus:ring-2 focus:ring-violet-400 resize-none font-semibold"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading || !submission.trim()}
            className="w-full h-12 bg-[#1E1B4B] hover:bg-[#1E1B4B]/95 text-white text-xs font-extrabold rounded-xl flex items-center justify-center gap-2 shadow-xs transition-all duration-200 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                AI Grading Execution in progress...
              </>
            ) : (
              "Submit Project for AI Evaluation"
            )}
          </button>
        </form>
      ) : (
        /* Grading Feedback Card */
        <div className="space-y-4 animate-fadeIn">
          
          <div className="bg-[#EDFAF5] border border-[#43C6AC]/30 rounded-2xl p-5 text-center">
            <div className="flex justify-center mb-2">
              <Award size={36} className="text-[#43C6AC]" />
            </div>
            <h4 className="text-sm font-extrabold text-[#1E1B4B]">
              Project Grade: {feedback ? feedback.grade : "90"}/100
            </h4>
            <span className="text-[10px] font-bold text-[#43C6AC] uppercase tracking-widest block mt-0.5">
              Status: APPROVED (PASSED)
            </span>
            <p className="text-xs text-gray-500 font-semibold mt-2 leading-relaxed">
              {feedback ? feedback.summary : "Excellent execution! Your implementation meets all major core objectives."}
            </p>
          </div>

          {/* Detailed critique */}
          {feedback && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-150">
                <h5 className="text-[10px] font-extrabold text-[#1E1B4B] uppercase tracking-wider mb-2 flex items-center gap-1">
                  <CheckCircle2 size={12} className="text-[#43C6AC]" />
                  What you did well
                </h5>
                <ul className="space-y-1.5 text-[11px] font-semibold text-gray-500">
                  {feedback.strengths.map((str, i) => (
                    <li key={i}>• {str}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl border border-gray-150">
                <h5 className="text-[10px] font-extrabold text-[#1E1B4B] uppercase tracking-wider mb-2 flex items-center gap-1">
                  <AlertCircle size={12} className="text-[#FF6584]" />
                  Room for Improvement
                </h5>
                <ul className="space-y-1.5 text-[11px] font-semibold text-gray-500">
                  {feedback.weaknesses.map((weak, i) => (
                    <li key={i}>• {weak}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
