"use client";

import React, { useState, useEffect, useContext } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import { AuthContext } from "@/app/AuthContext";
import Spinner from "@/components/ui/Spinner";

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

function pct(val, total) {
  if (!total) return 0;
  return Math.round((val / total) * 100);
}

function getGrade(p) {
  if (p >= 90) return { grade: "A+", color: "#16a34a" };
  if (p >= 80) return { grade: "A", color: "#22c55e" };
  if (p >= 70) return { grade: "B+", color: "#3b82f6" };
  if (p >= 60) return { grade: "B", color: "#2563eb" };
  if (p >= 50) return { grade: "C", color: "#f59e0b" };
  if (p >= 40) return { grade: "D", color: "#f97316" };
  return { grade: "F", color: "#ef4444" };
}

// ─────────────────────────────────────────────────────────────
// Pill Tab Bar (same style as CreateTest)
// ─────────────────────────────────────────────────────────────

function PillTabs({ tabs, active, onChange, color }) {
  return (
    <div className="flex gap-1 p-1 bg-gray-100 rounded-xl">
      {tabs.map((t) => (
        <button key={t.value} type="button" onClick={() => onChange(t.value)}
          className="flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all duration-150"
          style={
            active === t.value
              ? { backgroundColor: "#fff", color, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }
              : { color: "#9ca3af" }
          }>
          {t.label}
        </button>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Stat Card
// ─────────────────────────────────────────────────────────────

function StatCard({ icon, label, value, sub, accent }) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
        style={{ backgroundColor: accent + "15" }}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xl font-bold leading-tight" style={{ color: accent }}>{value}</p>
        <p className="text-xs font-medium text-gray-500 truncate">{label}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Horizontal Bar
// ─────────────────────────────────────────────────────────────

function HBar({ label, value, max, color, sub }) {
  const width = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="mb-3">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium text-gray-700 truncate max-w-[65%]">{label}</span>
        <span className="text-sm font-bold flex-shrink-0" style={{ color }}>{value}{sub}</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
        <div className="h-2 rounded-full transition-all duration-700"
          style={{ width: `${width}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Mini Bar Chart (score trend)
// ─────────────────────────────────────────────────────────────

function MiniBarChart({ data, color }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="flex items-end gap-2 h-24">
      {data.map((d, i) => {
        const h = Math.max(4, Math.round((d.value / max) * 96));
        return (
          <div key={i} className="flex flex-col items-center gap-1 flex-1 min-w-0">
            <span className="text-xs font-semibold" style={{ color }}>{d.value}</span>
            <div className="w-full rounded-t-md transition-all duration-700"
              style={{ height: h, backgroundColor: color + (d.active ? "ff" : "55") }} />
            <span className="text-xs text-gray-400 truncate w-full text-center">{d.label}</span>
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Section Card
// ─────────────────────────────────────────────────────────────

function SectionCard({ title, icon, children, action }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <span>{icon}</span>
          <h3 className="text-sm font-bold text-gray-800">{title}</h3>
        </div>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Empty State
// ─────────────────────────────────────────────────────────────

function Empty({ text }) {
  return (
    <div className="text-center py-8 text-gray-400 text-sm">{text}</div>
  );
}

// ─────────────────────────────────────────────────────────────
// Attempt Row
// ─────────────────────────────────────────────────────────────

function AttemptRow({ attempt, color, onReview, onFeedback }) {
  const p = pct(attempt.scored, attempt.totalMarks);
  const { grade, color: gc } = getGrade(p);
  const isPracticeTest = attempt.sourceType === "practice_test";
  return (
    <div className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-0">
      <div className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
        style={{ backgroundColor: gc }}>{grade}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800 truncate">{attempt.testTitle}</p>
        <p className="text-xs text-gray-400">{attempt.subjectName} · {attempt.date ? new Date(attempt.date).toLocaleDateString() : "—"}</p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="text-sm font-bold" style={{ color }}>{attempt.scored}/{attempt.totalMarks}</p>
        <p className="text-xs text-gray-400">{p}%</p>
      </div>
      {isPracticeTest && (
        <button onClick={() => onReview(attempt)}
          className="text-xs px-3 py-1.5 rounded-lg border font-medium flex-shrink-0"
          style={{ borderColor: color, color }}>
          Review
        </button>
      )}
      <button onClick={() => onFeedback(attempt)}
        className="text-xs px-3 py-1.5 rounded-lg font-medium flex-shrink-0 text-white"
        style={{ backgroundColor: color }}>
        {attempt.hasInsight ? "View Feedback" : "Get Feedback"}
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Detailed Feedback Modal
// ─────────────────────────────────────────────────────────────

function FeedbackModal({ attempt, loading, data, color, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
          <div>
            <h3 className="text-sm font-bold text-gray-800">Detailed Feedback</h3>
            <p className="text-xs text-gray-400 truncate">{attempt?.testTitle}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none px-2">×</button>
        </div>
        <div className="overflow-y-auto p-5 space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Spinner />
              <p className="text-xs text-gray-400">Generating detailed feedback with AI…</p>
            </div>
          ) : !data?.questions?.length ? (
            <Empty text="No feedback available for this attempt." />
          ) : (
            data.questions.map((q, i) => (
              <div key={i} className="rounded-xl border border-gray-100 p-4"
                style={{ backgroundColor: q.isCorrect ? "#f0fdf4" : "#fff7ed" }}>
                <p className="text-sm font-semibold text-gray-800 mb-1">
                  {i + 1}. {q.question}
                </p>
                <p className="text-xs text-gray-500 mb-2">
                  Your answer: <span className="font-medium">{q.studentAnswer || "(no answer)"}</span>
                  {!q.isCorrect && <> · Correct: <span className="font-medium">{q.correctAnswer}</span></>}
                </p>
                {q.reasoning && (
                  <p className="text-xs text-gray-600 mb-1"><span className="font-semibold">Reasoning:</span> {q.reasoning}</p>
                )}
                {q.feedback && (
                  <p className="text-xs text-gray-600 mb-1"><span className="font-semibold">Feedback:</span> {q.feedback}</p>
                )}
                {q.improvement && (
                  <p className="text-xs text-gray-600"><span className="font-semibold">Improve:</span> {q.improvement}</p>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────

export default function Analytics() {
  const { user } = useContext(AuthContext);
  const router = useRouter();
  const color = user?.color || "#9b1b30";

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [timeRange, setTimeRange] = useState("all");
  const [activeSubject, setActiveSubject] = useState("all");
  const [feedbackAttempt, setFeedbackAttempt] = useState(null);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackData, setFeedbackData] = useState(null);

  const handleFeedback = (attempt) => {
    setFeedbackAttempt(attempt);
    setFeedbackData(null);
    setFeedbackLoading(true);
    axios.post(`/api/mock-tests/attempts/${attempt.sourceType}/${attempt._id}/insight`, {}, { withCredentials: true })
      .then((res) => setFeedbackData(res.data))
      .catch(() => toast.error("Failed to load detailed feedback."))
      .finally(() => setFeedbackLoading(false));
  };

  useEffect(() => {
    setLoading(true);
    axios.get("/api/mock-tests/analytics", {
      params: { range: timeRange },
      withCredentials: true,
    })
      .then((res) => setData(res.data))
      .catch(() => toast.error("Failed to load analytics."))
      .finally(() => setLoading(false));
  }, [timeRange]);

  if (loading) return (
    <div className="flex items-center justify-center h-screen" style={{ backgroundColor: color }}>
      <div className="bg-white rounded-2xl p-10 flex flex-col items-center gap-4 shadow-xl">
        <Spinner />
        <p className="text-sm text-gray-400">Loading your analytics…</p>
      </div>
    </div>
  );

  // ── Data ────────────────────────────────────────────────────
  const stats = data?.summary || { testsAttempted: 0, totalQuestions: 0, avgScore: 0, bestScore: 0, avgAccuracy: 0, totalTimeMins: 0 };
  const attempts = data?.attempts || [];
  const subjectPerf = data?.subjectPerformance || [];
  const topicPerf = data?.topicPerformance || [];
  const diffBreak = data?.difficultyBreakdown || { easy: { correct: 0, total: 0 }, medium: { correct: 0, total: 0 }, hard: { correct: 0, total: 0 } };
  const trend = data?.scoreTrend || [];
  const qTypes = data?.questionTypeBreakdown || [];
  const strengths = data?.strengths || [];
  const improvements = data?.improvements || [];

  const overallPct = stats.avgScore || 0;
  const { grade: overallGrade, color: gradeColor } = getGrade(overallPct);

  const subjectList = ["all", ...Array.from(new Set(subjectPerf.map((s) => s.subject)))];
  const filteredAttempts = activeSubject === "all"
    ? attempts
    : attempts.filter((a) => a.subjectName === activeSubject);

  const typeColors = {
    mcq: "#3b82f6", true_false: "#22c55e", short_answer: "#8b5cf6",
    descriptive: "#f59e0b", fill_blanks: "#06b6d4", match_following: "#f97316",
  };

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: color }}>
      <div className="flex-1 p-4 sm:p-6 space-y-4">

        {/* ── Header ── */}
        <div className="bg-white rounded-xl shadow-sm px-5 py-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold" style={{ color }}>My Analytics</h2>
            <p className="text-xs text-gray-400">Track your performance across all practice tests</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <PillTabs
              tabs={[{ value: "week", label: "Week" }, { value: "month", label: "Month" }, { value: "all", label: "All Time" }]}
              active={timeRange} onChange={setTimeRange} color={color} />
            <button onClick={() => router.push("/self-learner/mocktest/create-test")}
              className="px-4 py-2 text-white rounded-xl text-sm font-semibold"
              style={{ backgroundColor: color }}>
              + New Test
            </button>
          </div>
        </div>

        {/* ── Grade + Stats ── */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">

          {/* Overall grade */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col items-center justify-center text-center md:col-span-1">
            <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white mb-3 shadow-md"
              style={{ backgroundColor: gradeColor }}>{overallGrade}</div>
            <p className="text-xs text-gray-400 font-medium">Overall Grade</p>
            <p className="text-2xl font-bold mt-1" style={{ color }}>{overallPct}%</p>
            <p className="text-xs text-gray-400 mt-0.5">avg score</p>
          </div>

          {/* Stats grid */}
          <div className="md:col-span-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
            <StatCard icon="📝" label="Tests Attempted" value={stats.testsAttempted} accent={color} />
            <StatCard icon="❓" label="Questions Solved" value={stats.totalQuestions} accent="#3b82f6" />
            <StatCard icon="🎯" label="Avg Accuracy" value={`${stats.avgAccuracy || 0}%`} accent="#22c55e" />
            <StatCard icon="🏆" label="Best Score" value={`${stats.bestScore || 0}%`} accent="#f59e0b" />
            <StatCard icon="⏱️" label="Time Spent" value={`${stats.totalTimeMins || 0}m`} accent="#8b5cf6" />
            <StatCard icon="📈" label="Improvement"
              value={data?.improvementPct ? `+${data.improvementPct}%` : "—"}
              sub="vs last period" accent="#06b6d4" />
          </div>
        </div>

        {/* ── Score Trend + Difficulty ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <SectionCard title="Score Trend" icon="📈">
            {trend.length === 0
              ? <Empty text="Attempt a test to see your score trend." />
              : <MiniBarChart
                data={trend.map((t, i) => ({ label: t.label || `T${i + 1}`, value: t.score || 0, active: i === trend.length - 1 }))}
                color={color} />
            }
          </SectionCard>

          <SectionCard title="Difficulty Breakdown" icon="⚡">
            {["easy", "medium", "hard"].map((level) => {
              const d = diffBreak[level] || { correct: 0, total: 0 };
              const c = { easy: "#22c55e", medium: "#f59e0b", hard: "#ef4444" }[level];
              const lbl = { easy: "Easy", medium: "Medium", hard: "Hard" }[level];
              return <HBar key={level} label={lbl} value={pct(d.correct, d.total)} max={100} color={c} sub="%" />;
            })}
            <div className="mt-2 flex flex-wrap gap-3 text-xs text-gray-400">
              {["easy", "medium", "hard"].map((l) => {
                const d = diffBreak[l] || { correct: 0, total: 0 };
                return <span key={l}>{l[0].toUpperCase() + l.slice(1)}: {d.correct}/{d.total}</span>;
              })}
            </div>
          </SectionCard>
        </div>

        {/* ── Subject Performance ── */}
        <SectionCard title="Subject Performance" icon="📚"
          action={
            subjectPerf.length > 0
              ? <PillTabs
                tabs={subjectList.map((s) => ({ value: s, label: s === "all" ? "All" : s.split(" ")[0] }))}
                active={activeSubject} onChange={setActiveSubject} color={color} />
              : null
          }>
          {subjectPerf.length === 0
            ? <Empty text="No subject data yet." />
            : subjectPerf
              .filter((s) => activeSubject === "all" || s.subject === activeSubject)
              .map((s) => (
                <HBar key={s.subject} label={s.subject} value={pct(s.scored, s.total)} max={100} color={color} sub="%" />
              ))
          }
        </SectionCard>

        {/* ── Topic + Question Types ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <SectionCard title="Topic Performance" icon="🗂️">
            {topicPerf.length === 0
              ? <Empty text="No topic data yet." />
              : <div className="space-y-0 max-h-60 overflow-y-auto pr-1">
                {topicPerf.map((t) => (
                  <HBar key={t.topic} label={t.topic} value={pct(t.correct, t.total)} max={100} color={color} sub="%" />
                ))}
              </div>
            }
          </SectionCard>

          <SectionCard title="Question Type Accuracy" icon="❓">
            {qTypes.length === 0
              ? <Empty text="No question type data yet." />
              : qTypes.map((qt) => (
                <HBar key={qt.type}
                  label={qt.type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                  value={pct(qt.correct, qt.total)} max={100}
                  color={typeColors[qt.type] || color} sub="%" />
              ))
            }
          </SectionCard>
        </div>

        {/* ── Strengths & Improvements ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <SectionCard title="Your Strengths" icon="💪">
            {strengths.length === 0
              ? <Empty text="Attempt more tests to identify strengths." />
              : <ul className="space-y-2">
                {strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-3 p-3 rounded-xl"
                    style={{ backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0" }}>
                    <span className="text-green-500 mt-0.5">✓</span>
                    <div>
                      <p className="text-sm font-semibold text-green-800">{s.label}</p>
                      {s.detail && <p className="text-xs text-green-600 mt-0.5">{s.detail}</p>}
                    </div>
                  </li>
                ))}
              </ul>
            }
          </SectionCard>

          <SectionCard title="Areas to Improve" icon="🎯">
            {improvements.length === 0
              ? <Empty text="Attempt more tests to see improvement areas." />
              : <ul className="space-y-2">
                {improvements.map((s, i) => (
                  <li key={i} className="flex items-start gap-3 p-3 rounded-xl"
                    style={{ backgroundColor: "#fff7ed", border: "1px solid #fed7aa" }}>
                    <span className="text-orange-500 mt-0.5">↑</span>
                    <div>
                      <p className="text-sm font-semibold text-orange-800">{s.label}</p>
                      {s.detail && <p className="text-xs text-orange-600 mt-0.5">{s.detail}</p>}
                    </div>
                  </li>
                ))}
              </ul>
            }
          </SectionCard>
        </div>

        {/* ── Recent Attempts ── */}
        <SectionCard title="Recent Attempts" icon="🕓"
          action={
            attempts.length > 0
              ? <button onClick={() => router.push("/self-learner/mocktest")}
                className="text-xs font-semibold" style={{ color }}>
                View All
              </button>
              : null
          }>
          {filteredAttempts.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-4xl mb-3">📭</p>
              <p className="text-sm font-medium text-gray-600">No attempts yet.</p>
              <p className="text-xs text-gray-400 mb-4">Start a practice test to see your history here.</p>
              <button onClick={() => router.push("/self-learner/mocktest/create-test")}
                className="px-5 py-2 text-white rounded-xl text-sm font-semibold"
                style={{ backgroundColor: color }}>
                Create a Test
              </button>
            </div>
          ) : (
            filteredAttempts.slice(0, 8).map((a, i) => (
              <AttemptRow key={i} attempt={a} color={color}
                onReview={(attempt) => router.push(`/self-learner/mocktest/test-yourself/${attempt.test_id}/review`)}
                onFeedback={handleFeedback} />
            ))
          )}
        </SectionCard>

        {/* ── Motivation Banner ── */}
        {stats.testsAttempted > 0 && (
          <div className="rounded-xl p-5 text-center"
            style={{ backgroundColor: color + "12", border: `1px solid ${color}28` }}>
            <p className="text-base font-bold" style={{ color }}>
              {overallPct >= 80
                ? "🌟 Outstanding performance! Keep it up."
                : overallPct >= 60
                  ? "💪 Good progress! A little more practice will get you there."
                  : "📚 Keep practising! Consistency is the key to improvement."}
            </p>
            <p className="text-xs text-gray-500 mt-1.5">
              You've attempted <strong>{stats.testsAttempted}</strong> test{stats.testsAttempted !== 1 ? "s" : ""} and solved <strong>{stats.totalQuestions}</strong> questions.
            </p>
          </div>
        )}

      </div>

      {feedbackAttempt && (
        <FeedbackModal
          attempt={feedbackAttempt}
          loading={feedbackLoading}
          data={feedbackData}
          color={color}
          onClose={() => setFeedbackAttempt(null)}
        />
      )}
    </div>
  );
}