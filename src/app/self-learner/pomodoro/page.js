"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Clock,
  Zap,
  Brain,
  Settings2,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Trophy,
  Flame,
  BarChart2,
  TimerIcon,
  Sparkles,
  FileText,
  Settings,
} from "lucide-react";
import axios from "axios";



const typeConfig = {
  "ai-driven": { label: "AI-Driven", color: "#6C63FF", bg: "#F0EEFF", Icon: Zap },
  "ai-assisted": { label: "AI-Assisted", color: "#43C6AC", bg: "#EDFAF5", Icon: Brain },
  custom: { label: "Custom", color: "#F7971E", bg: "#FFF8EE", Icon: Settings2 },
};

const pomodoroModes = [
  {
    id: "ai-driven",
    icon: <Sparkles size={28} />,
    title: "AI-Driven",
    desc: "Provide a topic prompt and let AI generate structured study notes, timed sections, and auto-tests for you.",
    color: "#6C63FF",
    gradient: "linear-gradient(135deg, #6C63FF 0%, #9B93FF 100%)",
    bg: "#F0EEFF",
    href: "/self-learner/pomodoro/ai-driven",
    tags: ["AI Notes", "Auto Tests", "Smart Timer"],
  },
  {
    id: "ai-assisted",
    icon: <FileText size={28} />,
    title: "AI-Assisted",
    desc: "Upload your own notes and let AI split them into timed study sessions with quizzes after each section.",
    color: "#43C6AC",
    gradient: "linear-gradient(135deg, #43C6AC 0%, #76E8CC 100%)",
    bg: "#EDFAF5",
    href: "/self-learner/pomodoro/ai-assisted",
    tags: ["Upload Notes", "AI Quiz", "Sectioned"],
  },
  {
    id: "custom",
    icon: <Settings size={28} />,
    title: "Custom",
    desc: "Set your own study time, break time, and session count. Full control — no AI involved.",
    color: "#F7971E",
    gradient: "linear-gradient(135deg, #F7971E 0%, #FFC371 100%)",
    bg: "#FFF8EE",
    href: "/self-learner/pomodoro/custom",
    tags: ["Manual Control", "Custom Timer", "No AI"],
  },
];

// Stats computed from real history data (see buildStats helper below)

// const API_BASE = "http://localhost:5050";
const API_BASE = "http://103.192.198.186:5051";

function buildStats(history) {
  const total = history.length;
  const focusMins = history.reduce((acc, s) => acc + (s.total_focused_mins || s.total_study_time_mins || 0), 0);
  const focusHours = (focusMins / 60).toFixed(1);
  const scoreSessions = history.filter(s => s.evaluation?.overall_score != null);
  const avgScore = scoreSessions.length
    ? Math.round(scoreSessions.reduce((a, s) => a + s.evaluation.overall_score, 0) / scoreSessions.length)
    : null;
  return [
    { label: "Total Sessions", value: String(total), Icon: TimerIcon, color: "#6C63FF", bg: "#F0EEFF", prog: Math.min(100, total * 5) },
    { label: "Focused Hours",  value: `${focusHours}h`, Icon: Clock, color: "#43C6AC", bg: "#EDFAF5", prog: Math.min(100, focusMins / 6) },
    { label: "AI Sessions",    value: String(history.filter(s => s.mode !== "custom").length), Icon: Flame, color: "#FF6584", bg: "#FFF0F3", prog: total ? Math.round(history.filter(s => s.mode !== "custom").length / total * 100) : 0 },
    { label: "Avg. Score",     value: avgScore != null ? `${avgScore}%` : "—", Icon: Trophy, color: "#F7971E", bg: "#FFF8EE", prog: avgScore ?? 0 },
  ];
}

export default function PomodoroPage() {
  const router = useRouter();
  const [hoveredMode, setHoveredMode] = useState(null);
  const [hoveredRow, setHoveredRow]   = useState(null);
  const [history, setHistory]         = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages]   = useState(1);
  const [total, setTotal]             = useState(0);
  const LIMIT = 10;

  const fetchHistory = async (page = 1) => {
    setHistoryLoading(true);
    try {
      const res = await axios.get(
        `${API_BASE}/api/pomodoro/history?limit=${LIMIT}&page=${page}`,
        { withCredentials: true }
      );
      setHistory(res.data.sessions || []);
      setTotal(res.data.total || 0);
      setTotalPages(res.data.total_pages || 1);
    } catch (err) {
      console.error("Failed to load history:", err);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => { fetchHistory(1); }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F4F6FB",
        fontFamily: "'Nunito', sans-serif",
        padding: "24px",
      }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap"
        rel="stylesheet"
      />

      {/* ── Hero Banner ── */}
      <div
        style={{
          background: "linear-gradient(120deg, #6C63FF 0%, #8B83FF 50%, #43C6AC 100%)",
          borderRadius: 24,
          padding: "32px 36px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          overflow: "hidden",
          position: "relative",
          boxShadow: "0 8px 32px rgba(108,99,255,0.28)",
          marginBottom: 24,
          minHeight: 160,
        }}
      >
        {/* Decorative blobs */}
        <div style={{ position: "absolute", right: 280, top: -40, width: 160, height: 160, borderRadius: "50%", background: "rgba(255,255,255,0.07)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", right: 180, bottom: -50, width: 130, height: 130, borderRadius: "50%", background: "rgba(255,255,255,0.05)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", left: "50%", top: -20, width: 80, height: 80, borderRadius: "50%", background: "rgba(255,255,255,0.04)", pointerEvents: "none" }} />

        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <div style={{ background: "rgba(255,255,255,0.2)", borderRadius: 12, padding: "10px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <TimerIcon size={20} color="#fff" />
            </div>
            <span style={{ color: "rgba(255,255,255,0.8)", fontWeight: 700, fontSize: 13, letterSpacing: "0.05em", textTransform: "uppercase" }}>Pomodoro Timer</span>
          </div>
          <h1
            style={{
              fontSize: 32,
              fontWeight: 900,
              color: "#fff",
              margin: "0 0 8px",
              letterSpacing: "-0.5px",
            }}
          >
            Focus. Study. <span style={{ color: "#FFE566" }}>Excel.</span>
          </h1>
          <p style={{ color: "rgba(255,255,255,0.85)", fontSize: 15, fontWeight: 600, margin: "0 0 20px" }}>
            Choose your study mode and start a distraction-free focus session.
          </p>
          <button
            onClick={() => router.push("/self-learner/pomodoro/ai-driven")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "#fff",
              color: "#6C63FF",
              border: "none",
              borderRadius: 30,
              padding: "12px 24px",
              fontWeight: 900,
              fontSize: 14,
              cursor: "pointer",
              boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
              transition: "transform 0.2s, box-shadow 0.2s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.18)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.12)"; }}
          >
            <Plus size={18} />
            Create Pomodoro
          </button>
        </div>

        {/* Right Illustration */}
        <div style={{ flexShrink: 0, marginRight: 8, opacity: 0.95 }}>
          <svg width="200" height="150" viewBox="0 0 200 150" fill="none">
            {/* Timer base */}
            <circle cx="100" cy="75" r="55" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.25)" strokeWidth="2" />
            <circle cx="100" cy="75" r="42" fill="rgba(255,255,255,0.08)" />
            {/* Timer arc - progress */}
            <circle cx="100" cy="75" r="42" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="6" strokeDasharray={`${2*Math.PI*42*0.72} ${2*Math.PI*42}`} strokeLinecap="round" transform="rotate(-90 100 75)" />
            {/* Timer hands */}
            <line x1="100" y1="75" x2="100" y2="42" stroke="rgba(255,255,255,0.8)" strokeWidth="3" strokeLinecap="round" />
            <line x1="100" y1="75" x2="120" y2="82" stroke="rgba(255,255,255,0.6)" strokeWidth="2" strokeLinecap="round" />
            <circle cx="100" cy="75" r="4" fill="white" opacity="0.9" />
            {/* Top knob */}
            <rect x="93" y="18" width="14" height="8" rx="4" fill="rgba(255,255,255,0.5)" />
            {/* Bell ears */}
            <path d="M78 28 Q75 22 80 18" stroke="rgba(255,255,255,0.4)" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            <path d="M122 28 Q125 22 120 18" stroke="rgba(255,255,255,0.4)" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            {/* Sparkles */}
            <text x="148" y="40" fontSize="16" fill="rgba(255,255,255,0.6)">✦</text>
            <text x="35" y="55" fontSize="10" fill="rgba(255,255,255,0.45)">✦</text>
            <text x="155" y="105" fontSize="12" fill="rgba(255,255,255,0.35)">✦</text>
            {/* Time text */}
            <text x="100" y="80" textAnchor="middle" fontSize="13" fontWeight="900" fill="rgba(255,255,255,0.85)" fontFamily="Nunito, sans-serif">25:00</text>
          </svg>
        </div>
      </div>

      {/* ── Stats Row ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 24 }}>
        {buildStats(history).map(({ label, value, Icon, color, bg, prog }) => (
          <div
            key={label}
            style={{
              background: "#fff",
              borderRadius: 18,
              padding: "18px 16px",
              border: "1.5px solid #E8ECF4",
              boxShadow: "0 2px 12px rgba(30,27,75,0.05)",
              transition: "transform 0.2s, box-shadow 0.2s",
              cursor: "default",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(30,27,75,0.1)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 2px 12px rgba(30,27,75,0.05)"; }}
          >
            <div style={{ width: 42, height: 42, borderRadius: 12, background: bg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 10, color }}><Icon size={20} /></div>
            <div style={{ fontSize: 24, fontWeight: 900, color: "#1E1B4B", marginBottom: 2 }}>{value}</div>
            <div style={{ fontSize: 11, color: "#7C8DB5", fontWeight: 700, marginBottom: 8 }}>{label}</div>
            <div style={{ height: 4, background: "#F0EEFF", borderRadius: 10, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${prog}%`, background: color, borderRadius: 10, transition: "width 1s ease" }} />
            </div>
          </div>
        ))}
      </div>

      {/* ── Mode Cards ── */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <h2 style={{ fontSize: 18, fontWeight: 900, color: "#1E1B4B", margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
            <Trophy size={20} color="#F7971E" />
            Choose Your Study Mode
          </h2>
          <span style={{ fontSize: 12, color: "#7C8DB5", fontWeight: 600 }}>Pick a mode to get started</span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18 }}>
          {pomodoroModes.map((mode) => (
            <div
              key={mode.id}
              onClick={() => router.push(mode.href)}
              onMouseEnter={() => setHoveredMode(mode.id)}
              onMouseLeave={() => setHoveredMode(null)}
              style={{
                background: "#fff",
                borderRadius: 20,
                border: `1.5px solid ${hoveredMode === mode.id ? mode.color + "60" : "#E8ECF4"}`,
                padding: 24,
                cursor: "pointer",
                position: "relative",
                overflow: "hidden",
                transition: "all 0.25s ease",
                transform: hoveredMode === mode.id ? "translateY(-4px)" : "translateY(0)",
                boxShadow: hoveredMode === mode.id
                  ? `0 16px 40px ${mode.color}22`
                  : "0 2px 12px rgba(30,27,75,0.05)",
              }}
            >
              {/* Top color accent bar */}
              <div
                style={{
                  position: "absolute",
                  top: 0, left: 0, right: 0,
                  height: 4,
                  background: mode.gradient,
                  borderRadius: "20px 20px 0 0",
                  opacity: hoveredMode === mode.id ? 1 : 0.7,
                  transition: "opacity 0.25s",
                }}
              />

              {/* Icon */}
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 16,
                  background: mode.bg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: mode.color,
                  marginBottom: 16,
                  fontSize: 24,
                  transition: "transform 0.25s",
                  transform: hoveredMode === mode.id ? "scale(1.1)" : "scale(1)",
                }}
              >
                {mode.icon}
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 900, color: "#1E1B4B", margin: "0 0 8px" }}>
                {mode.title}
              </h3>
              <p style={{ fontSize: 13, color: "#7C8DB5", fontWeight: 600, margin: "0 0 16px", lineHeight: 1.6 }}>
                {mode.desc}
              </p>

              {/* Tags */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
                {mode.tags.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      background: mode.bg,
                      color: mode.color,
                      fontSize: 10,
                      fontWeight: 800,
                      padding: "4px 10px",
                      borderRadius: 20,
                      letterSpacing: "0.03em",
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* CTA */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingTop: 14,
                  borderTop: "1.5px solid #F0F0F8",
                }}
              >
                <span style={{ fontSize: 13, fontWeight: 800, color: mode.color }}>
                  Start Session
                </span>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 10,
                    background: mode.bg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: mode.color,
                    transition: "transform 0.2s",
                    transform: hoveredMode === mode.id ? "translateX(4px)" : "translateX(0)",
                  }}
                >
                  <ChevronRight size={18} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Session History ── */}
      <div
        style={{
          background: "#fff",
          borderRadius: 20,
          border: "1.5px solid #E8ECF4",
          boxShadow: "0 2px 12px rgba(30,27,75,0.05)",
          overflow: "hidden",
        }}
      >
        {/* Table Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "20px 24px 16px",
            borderBottom: "1.5px solid #F0F0F8",
          }}
        >
          <h2 style={{ fontSize: 16, fontWeight: 900, color: "#1E1B4B", margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
            <Clock size={18} color="#6C63FF" />
            Session History
          </h2>
          <span style={{ fontSize: 12, color: "#6C63FF", fontWeight: 700, cursor: "pointer" }}>View All</span>
        </div>

        {/* Table */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#FAFBFF" }}>
                {["Session Title", "Type", "Date", "Sections", "Duration", "Score", "Status"].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "12px 20px",
                      textAlign: "left",
                      fontSize: 11,
                      fontWeight: 800,
                      color: "#7C8DB5",
                      letterSpacing: "0.05em",
                      textTransform: "uppercase",
                      borderBottom: "1.5px solid #F0F0F8",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {historyLoading ? (
                <tr><td colSpan={7} style={{ padding: "48px 24px", textAlign: "center", color: "#7C8DB5", fontWeight: 700 }}>Loading...</td></tr>
              ) : history.map((session, idx) => {
                const tc = typeConfig[session.mode] || typeConfig["custom"];
                const score = session.evaluation?.overall_score ?? null;
                const date = session.created_at
                  ? new Date(session.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
                  : "—";
                const sections = session.sections?.length ?? session.num_sessions ?? "—";
                const duration = session.total_focused_mins ?? session.total_study_time_mins ?? session.study_time_mins ?? "—";
                return (
                  <tr
                    key={session._id || session.id || idx}
                    onMouseEnter={() => setHoveredRow(session._id || session.id)}
                    onMouseLeave={() => setHoveredRow(null)}
                    style={{
                      borderBottom: "1.5px solid #F0F0F8",
                      background: hoveredRow === (session._id || session.id) ? "#FAFBFF" : "#fff",
                      transition: "background 0.15s",
                      cursor: "default",
                    }}
                  >
                    {/* Title */}
                    <td style={{ padding: "16px 20px" }}>
                      <div style={{ fontWeight: 800, color: "#1E1B4B", fontSize: 13 }}>{session.title || "Untitled"}</div>
                    </td>

                    {/* Type badge */}
                    <td style={{ padding: "16px 20px" }}>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 5,
                          background: tc.bg,
                          color: tc.color,
                          fontSize: 11,
                          fontWeight: 800,
                          padding: "5px 10px",
                          borderRadius: 20,
                        }}
                      >
                        <tc.Icon size={12} /> {tc.label}
                      </span>
                    </td>

                    {/* Date */}
                    <td style={{ padding: "16px 20px", color: "#7C8DB5", fontSize: 13, fontWeight: 600 }}>
                      {date}
                    </td>

                    {/* Sections */}
                    <td style={{ padding: "16px 20px", color: "#1E1B4B", fontSize: 13, fontWeight: 700 }}>
                      {sections}
                    </td>

                    {/* Duration */}
                    <td style={{ padding: "16px 20px", color: "#1E1B4B", fontSize: 13, fontWeight: 700 }}>
                      {duration !== "—" ? `${duration} min` : "—"}
                    </td>

                    {/* Score */}
                    <td style={{ padding: "16px 20px" }}>
                      {score !== null ? (
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <div
                            style={{
                              height: 6,
                              width: 60,
                              background: "#F0EEFF",
                              borderRadius: 10,
                              overflow: "hidden",
                            }}
                          >
                            <div
                              style={{
                                height: "100%",
                                width: `${score}%`,
                                background: score >= 80 ? "#43C6AC" : "#F7971E",
                                borderRadius: 10,
                              }}
                            />
                          </div>
                          <span
                            style={{
                              fontSize: 12,
                              fontWeight: 900,
                              color: score >= 80 ? "#43C6AC" : "#F7971E",
                            }}
                          >
                            {score}%
                          </span>
                        </div>
                      ) : (
                        <span style={{ color: "#CBD5E0", fontSize: 12, fontWeight: 600 }}>—</span>
                      )}
                    </td>

                    {/* Status */}
                    <td style={{ padding: "16px 20px" }}>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 5,
                          padding: "5px 12px",
                          borderRadius: 20,
                          fontSize: 11,
                          fontWeight: 800,
                          background:
                            session.status === "completed" ? "#EDFAF5" : "#FFF8EE",
                          color:
                            session.status === "completed" ? "#43C6AC" : "#F7971E",
                        }}
                      >
                        {session.status === "completed" ? (
                          <CheckCircle2 size={12} />
                        ) : (
                          <XCircle size={12} />
                        )}
                        {(session.status || "active").charAt(0).toUpperCase() + (session.status || "active").slice(1)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {!historyLoading && history.length === 0 && (
            <div
              style={{
                textAlign: "center",
                padding: "48px 24px",
                color: "#7C8DB5",
              }}
            >
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
                <TimerIcon size={40} className="text-[#CBD5E0]" />
              </div>
              <p style={{ fontWeight: 800, fontSize: 15, color: "#1E1B4B", marginBottom: 6 }}>
                No sessions yet
              </p>
              <p style={{ fontSize: 13, fontWeight: 600 }}>
                Click &quot;Create Pomodoro&quot; to start your first focus session!
              </p>
            </div>
          )}
        </div>

        {/* Table Footer — real pagination */}
        <div
          style={{
            padding: "12px 24px",
            borderTop: "1.5px solid #F0F0F8",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "#FAFBFF",
          }}
        >
          <span style={{ fontSize: 12, color: "#7C8DB5", fontWeight: 600 }}>
            Showing {history.length} of {total} sessions
          </span>
          <div style={{ display: "flex", gap: 6 }}>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => { setCurrentPage(p); fetchHistory(p); }}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  border: "1.5px solid #E8ECF4",
                  background: p === currentPage ? "#6C63FF" : "#fff",
                  color: p === currentPage ? "#fff" : "#7C8DB5",
                  fontSize: 12,
                  fontWeight: 800,
                  cursor: "pointer",
                  fontFamily: "Nunito, sans-serif",
                }}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
