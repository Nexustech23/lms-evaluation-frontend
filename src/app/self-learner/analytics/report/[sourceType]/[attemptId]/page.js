"use client";

import React, { useState, useEffect, useContext } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import { ArrowLeft, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { AuthContext } from "@/app/AuthContext";

const SOURCE_LABEL = {
  practice_test: "Practice Test",
  roadmap_test: "Roadmap Test",
  weekly_quiz: "Weekly Quiz",
};

function pct(val, total) {
  if (!total) return 0;
  return Math.round((val / total) * 100);
}

function QuestionCard({ q, index }) {
  return (
    <div className="bg-white rounded-3xl border border-gray-200 shadow-xs p-5 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-bold text-[#1E1B4B] leading-relaxed flex-1">
          <span className="text-gray-400 mr-1.5">Q{index + 1}.</span>{q.question}
        </p>
        <span
          className={`flex-shrink-0 flex items-center gap-1 text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${
            q.isCorrect ? "bg-[#EDFAF5] text-[#43C6AC]" : "bg-red-50 text-red-500"
          }`}
        >
          {q.isCorrect ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
          {q.isCorrect ? "Correct" : "Incorrect"}
        </span>
      </div>

      {Array.isArray(q.options) && q.options.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {q.options.map((opt, i) => (
            <div
              key={i}
              className="text-xs font-semibold px-3 py-2 rounded-xl border bg-[#FAFBFF] border-gray-100 text-gray-600"
            >
              {opt}
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div className="rounded-xl px-3 py-2.5 bg-[#FAFBFF] border border-gray-100">
          <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Your Answer</p>
          <p className="font-semibold text-gray-700">{q.studentAnswer || "(no answer given)"}</p>
        </div>
        <div className="rounded-xl px-3 py-2.5 bg-[#EDFAF5] border border-[#43C6AC]/20">
          <p className="text-[10px] font-black text-[#43C6AC] uppercase mb-1">Correct / Model Answer</p>
          <p className="font-semibold text-[#1E1B4B]">{q.correctAnswer || "—"}</p>
        </div>
      </div>

      <div className="space-y-2.5 pt-1">
        {[
          { label: "Reasoning", color: "#6C63FF", bg: "#F0EEFF", value: q.reasoning },
          { label: "Feedback", color: "#F7971E", bg: "#FFF8EE", value: q.feedback },
          { label: "How to Improve", color: "#43C6AC", bg: "#EDFAF5", value: q.improvement },
        ].map((section) => (
          <div key={section.label} className="rounded-xl px-3.5 py-3" style={{ backgroundColor: section.bg }}>
            <p className="text-[10px] font-black uppercase tracking-wider mb-1" style={{ color: section.color }}>
              {section.label}
            </p>
            <p className="text-xs font-semibold text-gray-700 leading-relaxed">
              {section.value || "—"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AttemptInsightReportPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useContext(AuthContext);
  const color = user?.color || "#6C63FF";

  const sourceType = params?.sourceType;
  const attemptId = params?.attemptId;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [attempt, setAttempt] = useState(null);
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    if (!sourceType || !attemptId) return;
    let cancelled = false;

    axios
      .post(
        `/api/self-learner/analytics/attempts/${sourceType}/${encodeURIComponent(attemptId)}/insight`,
        {},
        { withCredentials: true }
      )
      .then((res) => {
        if (cancelled) return;
        setAttempt(res.data.attempt || null);
        setQuestions(res.data.questions || []);
      })
      .catch((err) => {
        if (cancelled) return;
        const msg = err?.response?.data?.error || "Failed to generate detailed feedback.";
        setError(msg);
        toast.error(msg);
      })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [sourceType, attemptId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1E1B4B] text-white flex flex-col items-center justify-center p-6 gap-5">
        <Loader2 size={48} className="animate-spin text-[#6C63FF]" />
        <div className="text-center">
          <h3 className="text-base font-black">Analyzing your answers…</h3>
          <p className="text-xs text-gray-400 font-semibold mt-1 max-w-xs">
            AI is writing detailed reasoning, feedback, and improvement tips for each question.
          </p>
        </div>
      </div>
    );
  }

  if (error || !attempt) {
    return (
      <div className="min-h-screen bg-[#F5F7FB] p-6 flex items-center justify-center">
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-10 text-center space-y-4 max-w-md">
          <h3 className="text-base font-black text-[#1E1B4B]">Couldn't load this report</h3>
          <p className="text-xs font-semibold text-gray-500 leading-relaxed">{error || "Attempt not found."}</p>
          <button
            onClick={() => router.push("/self-learner/analytics")}
            className="inline-flex items-center gap-1.5 bg-[#1E1B4B] text-white px-6 py-3 rounded-2xl text-xs font-extrabold shadow-sm"
          >
            Back to Analytics
          </button>
        </div>
      </div>
    );
  }

  const scorePct = pct(attempt.scored, attempt.totalMarks);

  return (
    <div className="min-h-screen bg-[#F5F7FB] p-4 md:p-6 text-slate-800 animate-fadeIn">
      <div className="max-w-4xl mx-auto space-y-6">

        <button
          onClick={() => router.push("/self-learner/analytics")}
          className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-[#6C63FF] transition-all duration-200"
        >
          <ArrowLeft size={14} /> Back to Analytics
        </button>

        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-[#6C63FF]">
              {SOURCE_LABEL[sourceType] || "Attempt"} · Detailed Feedback
            </span>
            <h1 className="text-xl font-black text-[#1E1B4B] mt-1">{attempt.testTitle}</h1>
            <p className="text-xs font-semibold text-gray-400 mt-1">
              {attempt.subjectName}{attempt.date ? ` · ${new Date(attempt.date).toLocaleString()}` : ""}
            </p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-black" style={{ color }}>{scorePct}%</p>
            <p className="text-xs font-bold text-gray-400">{attempt.scored}/{attempt.totalMarks}</p>
          </div>
        </div>

        <div className="space-y-4">
          {questions.map((q, i) => (
            <QuestionCard key={i} q={q} index={i} />
          ))}
        </div>

      </div>
    </div>
  );
}
