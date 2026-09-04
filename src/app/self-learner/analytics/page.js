"use client";

import React, { useState, useEffect, useContext, useMemo } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import dynamic from "next/dynamic";
import { AuthContext } from "@/app/AuthContext";
import Spinner from "@/components/ui/Spinner";

// recharts (~150KB) loads lazily, client-only, once this page renders (Phase 5.3).
const ScoreTrendChart = dynamic(
  () => import("./AnalyticsCharts").then((m) => m.ScoreTrendChart),
  { ssr: false, loading: () => <div className="h-[200px]" /> },
);
const SubjectPerformanceChart = dynamic(
  () => import("./AnalyticsCharts").then((m) => m.SubjectPerformanceChart),
  { ssr: false, loading: () => <div className="h-[120px]" /> },
);

// ─────────────────────────────────────────────────────────────
// Palette — reuses this app's own established accent trio (same
// hexes as roadmap/[id]/page.js and the Learning Lounge) instead of
// inventing new ones, so Analytics reads as part of the same product.
// Validated for categorical CVD-safety: ΔE 15.1 protan / 18.2 tritan
// worst-adjacent-pair, both well above the 8 floor.
// ─────────────────────────────────────────────────────────────

const INDIGO = "#6C63FF";

const SOURCE_CONFIG = {
  practice_test: { label: "Practice Test", color: "#6C63FF", bg: "#F0EEFF" },
  roadmap_test: { label: "Roadmap Test", color: "#F7971E", bg: "#FFF8EE" },
  weekly_quiz: { label: "Weekly Quiz", color: "#43C6AC", bg: "#EDFAF5" },
};
const SOURCE_ORDER = ["practice_test", "roadmap_test", "weekly_quiz"];

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

// Derives every dashboard number from the raw attempts[] the backend
// already returns in full — so the source filter re-scopes stats, trend,
// subject performance, and strengths/improvements all at once, and the
// numbers always agree with what's in the attempts list below (dataviz
// interaction rule: "filters scope everything below them").
function deriveStats(attempts) {
  if (attempts.length === 0) {
    return {
      summary: { testsAttempted: 0, totalQuestions: 0, avgScore: 0, bestScore: 0, avgAccuracy: 0 },
      subjectPerf: [], trend: [], strengths: [], improvements: [],
    };
  }

  const total = attempts.length;
  const totalQuestions = attempts.reduce((s, a) => s + (a.correct || 0) + (a.wrong || 0) + (a.skipped || 0), 0);
  const avgScore = Math.round((attempts.reduce((s, a) => s + a.percentage, 0) / total) * 10) / 10;
  const bestScore = Math.round(Math.max(...attempts.map((a) => a.percentage)) * 10) / 10;

  const accuracies = attempts
    .filter((a) => (a.correct || 0) + (a.wrong || 0) > 0)
    .map((a) => (a.correct / (a.correct + a.wrong)) * 100);
  const avgAccuracy = accuracies.length
    ? Math.round((accuracies.reduce((s, v) => s + v, 0) / accuracies.length) * 10) / 10
    : 0;

  const subjectMap = {};
  attempts.forEach((a) => {
    const subj = a.subjectName || "Unknown";
    const m = subjectMap[subj] || (subjectMap[subj] = { scored: 0, total: 0 });
    m.scored += a.scored;
    m.total += a.totalMarks;
  });
  const subjectPerf = Object.entries(subjectMap).map(([subject, v]) => ({
    subject, pct: pct(v.scored, v.total),
  }));

  // Newest-first from the backend — take the most recent 10, then reverse
  // so the chart reads chronologically left-to-right.
  const trend = attempts.slice(0, 10).slice().reverse().map((a, i) => ({
    label: a.date ? a.date.slice(5, 10) : `#${i + 1}`,
    score: a.percentage,
  }));

  const strengths = [];
  const improvements = [];
  Object.entries(subjectMap).forEach(([subject, v]) => {
    const p = pct(v.scored, v.total);
    const entry = { label: subject, detail: `${p}% avg score` };
    if (p >= 75) strengths.push(entry);
    else if (p < 50) improvements.push(entry);
  });

  return {
    summary: { testsAttempted: total, totalQuestions, avgScore, bestScore, avgAccuracy },
    subjectPerf, trend, strengths: strengths.slice(0, 5), improvements: improvements.slice(0, 5),
  };
}

// ─────────────────────────────────────────────────────────────
// Filter Bar — one row, above everything, scopes the whole dashboard
// ─────────────────────────────────────────────────────────────

function PillTabs({ tabs, active, onChange, color }) {
  return (
    <div className="flex gap-1 p-1 bg-gray-100 rounded-xl">
      {tabs.map((t) => (
        <button key={t.value} type="button" onClick={() => onChange(t.value)}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 whitespace-nowrap"
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
// Stat Tile
// ─────────────────────────────────────────────────────────────

function StatCard({ icon, label, value, accent }) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
        style={{ backgroundColor: accent + "15" }}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xl font-bold leading-tight" style={{ color: accent }}>{value}</p>
        <p className="text-xs font-medium text-gray-500 truncate">{label}</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Section Card
// ─────────────────────────────────────────────────────────────

function SectionCard({ title, icon, children, action }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-wrap gap-2">
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

function Empty({ text }) {
  return <div className="text-center py-8 text-gray-400 text-sm">{text}</div>;
}

// ScoreTrendChart / SubjectPerformanceChart (recharts) live in
// ./AnalyticsCharts and are loaded via next/dynamic at the top of this file
// (Phase 5.3).

// ─────────────────────────────────────────────────────────────
// Source Breakdown — part-to-whole, categorical, one segmented bar.
// Segments and legend items are both clickable — set the source filter
// that scopes the rest of the dashboard.
// ─────────────────────────────────────────────────────────────

function SourceBreakdownBar({ breakdown, sourceFilter, onPick }) {
  const total = SOURCE_ORDER.reduce((s, k) => s + (breakdown[k] || 0), 0);
  if (total === 0) return <Empty text="No attempts yet." />;

  const visible = SOURCE_ORDER.filter((k) => (breakdown[k] || 0) > 0);

  return (
    <div>
      <div className="flex w-full h-6 rounded-full overflow-hidden gap-[2px]">
        {visible.map((key) => {
          const cfg = SOURCE_CONFIG[key];
          const count = breakdown[key] || 0;
          const widthPct = (count / total) * 100;
          const isActive = sourceFilter === "all" || sourceFilter === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onPick(sourceFilter === key ? "all" : key)}
              title={`${cfg.label}: ${count}`}
              style={{ width: `${widthPct}%`, backgroundColor: cfg.color, opacity: isActive ? 1 : 0.25 }}
              className="transition-opacity duration-150 hover:opacity-90"
            />
          );
        })}
      </div>
      <div className="flex flex-wrap gap-x-5 gap-y-2 mt-4">
        {visible.map((key) => {
          const cfg = SOURCE_CONFIG[key];
          const isActive = sourceFilter === "all" || sourceFilter === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onPick(sourceFilter === key ? "all" : key)}
              className="flex items-center gap-1.5 text-xs font-semibold transition-opacity duration-150"
              style={{ opacity: isActive ? 1 : 0.4 }}
            >
              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: cfg.color }} />
              <span className="text-gray-600">{cfg.label}</span>
              <span className="text-gray-400">{breakdown[key] || 0}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Attempt Row
// ─────────────────────────────────────────────────────────────

function AttemptRow({ attempt, color, onReview, onDetailedFeedback }) {
  const p = pct(attempt.scored, attempt.totalMarks);
  const { grade, color: gc } = getGrade(p);
  const src = SOURCE_CONFIG[attempt.sourceType] || SOURCE_CONFIG.practice_test;

  return (
    <div className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-0 flex-wrap">
      <div className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
        style={{ backgroundColor: gc }}>{grade}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-semibold text-gray-800 truncate">{attempt.testTitle}</p>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: src.bg, color: src.color }}>
            {src.label}
          </span>
        </div>
        <p className="text-xs text-gray-400">{attempt.subjectName} · {attempt.date ? new Date(attempt.date).toLocaleDateString() : "—"}</p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="text-sm font-bold" style={{ color }}>{attempt.scored}/{attempt.totalMarks}</p>
        <p className="text-xs text-gray-400">{p}%</p>
      </div>
      <div className="flex gap-1.5 flex-shrink-0">
        {attempt.test_id && (
          <button onClick={() => onReview(attempt)}
            className="text-xs px-3 py-1.5 rounded-lg border font-medium"
            style={{ borderColor: color, color }}>
            Review
          </button>
        )}
        <button onClick={() => onDetailedFeedback(attempt)}
          className="text-xs px-3 py-1.5 rounded-lg text-white font-medium"
          style={{ backgroundColor: color }}>
          {attempt.hasInsight ? "View Feedback" : "Get Detailed Feedback"}
        </button>
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
  const [sourceFilter, setSourceFilter] = useState("all");

  useEffect(() => {
    setLoading(true);
    axios.get("/api/self-learner/analytics/overview", {
      params: { range: timeRange },
      withCredentials: true,
    })
      .then((res) => setData(res.data))
      .catch(() => toast.error("Failed to load analytics."))
      .finally(() => setLoading(false));
  }, [timeRange]);

  const handleReview = (attempt) => {
    router.push(`/self-learner/test-engine/test-yourself/${attempt.test_id}/review`);
  };

  const handleDetailedFeedback = (attempt) => {
    // The report page itself calls the insight endpoint on mount (and shows
    // its own loading state) — no need to duplicate that call here, this
    // button just navigates there.
    router.push(`/self-learner/analytics/report/${attempt.sourceType}/${encodeURIComponent(attempt._id)}`);
  };

  const attempts = data?.attempts || [];

  // Backend doesn't hand back a pre-aggregated sourceBreakdown — derived
  // client-side from the same attempts[] the rest of this page uses, so it
  // never disagrees with what's actually being counted below.
  const sourceBreakdown = useMemo(() => {
    const counts = { practice_test: 0, roadmap_test: 0, weekly_quiz: 0 };
    attempts.forEach((a) => { counts[a.sourceType] = (counts[a.sourceType] || 0) + 1; });
    return counts;
  }, [attempts]);

  const filteredAttempts = useMemo(
    () => (sourceFilter === "all" ? attempts : attempts.filter((a) => a.sourceType === sourceFilter)),
    [attempts, sourceFilter]
  );

  const { summary, subjectPerf, trend, strengths, improvements } = useMemo(
    () => deriveStats(filteredAttempts),
    [filteredAttempts]
  );

  if (loading) return (
    <div className="flex items-center justify-center h-screen" style={{ backgroundColor: color }}>
      <div className="bg-white rounded-2xl p-10 flex flex-col items-center gap-4 shadow-xl">
        <Spinner />
        <p className="text-sm text-gray-400">Loading your analytics…</p>
      </div>
    </div>
  );

  const overallPct = summary.avgScore || 0;
  const { grade: overallGrade, color: gradeColor } = getGrade(overallPct);

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: color }}>
      <div className="flex-1 p-4 sm:p-6 space-y-4">

        {/* ── Header + Filter Row (scopes everything below) ── */}
        <div className="bg-white rounded-xl shadow-sm px-5 py-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold" style={{ color }}>Analytics</h2>
            <p className="text-xs text-gray-400">Every scored attempt — tests, roadmap tests, and weekly quizzes — in one place</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <PillTabs
              tabs={[
                { value: "all", label: "All" },
                { value: "practice_test", label: "Practice" },
                { value: "roadmap_test", label: "Roadmap" },
                { value: "weekly_quiz", label: "Weekly Quiz" },
              ]}
              active={sourceFilter} onChange={setSourceFilter} color={color} />
            <PillTabs
              tabs={[{ value: "week", label: "Week" }, { value: "month", label: "Month" }, { value: "all", label: "All Time" }]}
              active={timeRange} onChange={setTimeRange} color={color} />
          </div>
        </div>

        {/* ── Grade + Stats ── */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col items-center justify-center text-center md:col-span-1">
            <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white mb-3 shadow-md"
              style={{ backgroundColor: gradeColor }}>{overallGrade}</div>
            <p className="text-xs text-gray-400 font-medium">Overall Grade</p>
            <p className="text-2xl font-bold mt-1" style={{ color }}>{overallPct}%</p>
            <p className="text-xs text-gray-400 mt-0.5">avg score</p>
          </div>

          <div className="md:col-span-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard icon="📝" label="Attempts" value={summary.testsAttempted} accent={color} />
            <StatCard icon="❓" label="Questions Solved" value={summary.totalQuestions} accent="#3b82f6" />
            <StatCard icon="🎯" label="Avg Accuracy" value={`${summary.avgAccuracy || 0}%`} accent="#22c55e" />
            <StatCard icon="🏆" label="Best Score" value={`${summary.bestScore || 0}%`} accent="#f59e0b" />
          </div>
        </div>

        {/* ── Score Trend + Source Breakdown ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SectionCard title="Score Trend" icon="📈">
            <ScoreTrendChart trend={trend} />
          </SectionCard>

          <SectionCard title="Where Your Attempts Come From" icon="🧩">
            <SourceBreakdownBar breakdown={sourceBreakdown} sourceFilter={sourceFilter} onPick={setSourceFilter} />
          </SectionCard>
        </div>

        {/* ── Subject Performance ── */}
        <SectionCard title="Subject Performance" icon="📚">
          <SubjectPerformanceChart subjectPerf={subjectPerf} />
        </SectionCard>

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

        {/* ── All Attempts (same filtered slice as the charts above) ── */}
        <SectionCard title="All Attempts" icon="🕓">
          {filteredAttempts.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-4xl mb-3">📭</p>
              <p className="text-sm font-medium text-gray-600">No attempts yet.</p>
              <p className="text-xs text-gray-400 mb-4">Start a test or quiz to see your history here.</p>
              <button onClick={() => router.push("/self-learner/test-engine/create-test")}
                className="px-5 py-2 text-white rounded-xl text-sm font-semibold"
                style={{ backgroundColor: color }}>
                Create a Test
              </button>
            </div>
          ) : (
            filteredAttempts.map((a) => (
              <AttemptRow key={a._id} attempt={a} color={color}
                onReview={handleReview}
                onDetailedFeedback={handleDetailedFeedback} />
            ))
          )}
        </SectionCard>

        {/* ── Motivation Banner ── */}
        {summary.testsAttempted > 0 && (
          <div className="rounded-xl p-5 text-center"
            style={{ backgroundColor: "rgba(255, 255, 255, 0.12)", border: "1px solid rgba(255, 255, 255, 0.2)" }}>
            <p className="text-base font-bold text-white">
              {overallPct >= 80
                ? "🌟 Outstanding performance! Keep it up."
                : overallPct >= 60
                  ? "💪 Good progress! A little more practice will get you there."
                  : "📚 Keep practising! Consistency is the key to improvement."}
            </p>
            <p className="text-xs text-white/80 mt-1.5">
              You've made <strong>{summary.testsAttempted}</strong> attempt{summary.testsAttempted !== 1 ? "s" : ""} and solved <strong>{summary.totalQuestions}</strong> questions.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
