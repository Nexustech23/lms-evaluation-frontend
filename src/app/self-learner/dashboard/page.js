"use client";

import { useState, useEffect, useContext } from "react";
import { getRoadmaps } from "../roadmap/api";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/app/AuthContext";
import axios from "axios";

const initialTodos = [
  { id: 1, text: "Complete Chapter 3 - Algebra", done: false, priority: "high" },
  { id: 2, text: "Watch Physics lecture video", done: true, priority: "medium" },
  { id: 3, text: "Practice 20 English vocabulary words", done: false, priority: "high" },
  { id: 4, text: "Solve 10 Math problems", done: false, priority: "low" },
  { id: 5, text: "Read History chapter notes", done: true, priority: "medium" },
];

const studySubjects = [
  { name: "Mathematics", hours: 3.5, color: "#6C63FF", icon: "📐" },
  { name: "Physics", hours: 2.0, color: "#FF6584", icon: "⚛️" },
  { name: "English", hours: 1.5, color: "#43C6AC", icon: "📖" },
  { name: "History", hours: 1.0, color: "#F7971E", icon: "🏛️" },
];

const recentResources = [
  { type: "PDF", label: "PDF", color: "#FF6584", bg: "#FFF0F3", name: "Common English", desc: "Cambridge advanced.pdf", size: "2.4 MB • Today" },
  { type: "A1", label: "A1", color: "#6C63FF", bg: "#F0EEFF", name: "Business English", desc: "English Dictionary.wav", size: "1.8 MB • Yesterday" },
  { type: "C2", label: "C2", color: "#43C6AC", bg: "#EDFAF5", name: "Spanish Grammar", desc: "Easy Learning Book.zip", size: "2.1 MB • 2 days ago" },
];

const totalHours = studySubjects.reduce((a, b) => a + b.hours, 0);
const studyPercent = Math.round((totalHours / 10) * 100);

const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
const getFirstDay = (year, month) => new Date(year, month, 1).getDay();
const studiedDays = [2, 4, 5, 8, 9, 11, 12, 15, 16, 18, 19];


export default function Page() {
  const router = useRouter();
  const { user } = useContext(AuthContext);
  const [todos, setTodos] = useState(initialTodos);
  const [newTodo, setNewTodo] = useState("");
  const [priority, setPriority] = useState("medium");
  const [activeTab, setActiveTab] = useState("today");
  const [activeNav, setActiveNav] = useState("Dashboard");
  const [currentDate, setCurrentDate] = useState(new Date());
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const [selectedDate, setSelectedDate] = useState(new Date().getDate());

  const defaultAvatar = "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";
  const [userProfile, setUserProfile] = useState({ profileImage: { url: defaultAvatar } });

  useEffect(() => {
    let cancelled = false;
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`/api/profile`, { withCredentials: true });
        if (!cancelled) {
          setUserProfile({
            profileImage: res.data.profileImage || { url: defaultAvatar, fileId: null }
          });
        }
      } catch (err) {
        console.error("Failed to load profile", err);
      }
    };
    fetchProfile();
    return () => { cancelled = true; };
  }, []);

  // ── Active roadmap (live data from API) ────────────────────────────────────
  const [activeRoadmap, setActiveRoadmap] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getRoadmaps()
      .then((list) => {
        if (cancelled) return;
        const active = (list || []).find((r) => r.active) || list?.[0] || null;
        setActiveRoadmap(active);
      })
      .catch(() => { /* silently ignore — stage cards show locked placeholders */ });
    return () => { cancelled = true; };
  }, []);

  const toggleTodo = (id) => setTodos(todos.map(t => t.id === id ? { ...t, done: !t.done } : t));
  const addTodo = () => {
    if (!newTodo.trim()) return;
    setTodos([...todos, { id: Date.now(), text: newTodo, done: false, priority }]);
    setNewTodo("");
  };
  const deleteTodo = (id) => setTodos(todos.filter(t => t.id !== id));

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDay(year, month); // Wednesday = 3
  

  const doneTasks = todos.filter(t => t.done).length;
  const totalTasks = todos.length;
  const taskPercent = Math.round((doneTasks / totalTasks) * 100);

  const priorityColor = { high: "#FF6584", medium: "#F7971E", low: "#43C6AC" };
  const priorityBg = { high: "#FFF0F3", medium: "#FFF8EE", low: "#EDFAF5" };
  const priorityLabel = { high: "HIGH", medium: "MEDIUM", low: "LOW" };

  // ── Current-week widget: live roadmap data or a locked placeholder ─────────
  // Shows only the ONE in-progress week (the highest unlocked week — every
  // week below it is already passed, by construction of the unlock
  // mechanism) rather than every week — the full week-by-week board lives
  // on the roadmap detail page instead.
  const STATUS_COLORS = { Completed: "#43C6AC", "In Progress": "#6C63FF", Locked: "#CBD5E0" };
  const currentWeekCard = (() => {
    if (!activeRoadmap?.weeks?.length) {
      return { week: null, title: "Create a learning path", subtopics: [{ title: "Create a learning path to see topics", done: false }], color: "#CBD5E0", status: "Locked" };
    }
    const unlocked = activeRoadmap.unlockedWeeks?.length ? activeRoadmap.unlockedWeeks : [1];
    const currentWeekNum = Math.max(...unlocked);
    const wk = activeRoadmap.weeks.find((w) => w.week === currentWeekNum) || activeRoadmap.weeks[0];
    const isPassed = !!(activeRoadmap.progress?.passedQuizzes?.[String(currentWeekNum)]);
    const status = isPassed ? "Completed" : "In Progress";
    const completedSet = new Set(activeRoadmap.progress?.completedSubtopics || []);
    const subtopics = (wk.subtopics || []).slice(0, 5).map((s, idx) => ({
      title: s.title || "",
      done: completedSet.has(`${currentWeekNum}-${idx}-${s.title}`),
    }));
    return { week: currentWeekNum, title: wk.title, subtopics, color: STATUS_COLORS[status], status };
  })();

  return (
    <div style={{
      display: "flex", minHeight: "100vh",
      background: "#F4F6FB",
      fontFamily: "'Nunito', sans-serif",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap" rel="stylesheet" />

      {/* ══════════ MAIN CONTENT ══════════ */}
     <main
  style={{
    flex: 1,
    width: "100%",
    padding: "20px",
    minWidth: 0,
  }}
>
        {/* Content grid: left 2/3, right 1/3 */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 20, alignItems: "start" ,alignSelf: "start",}}>

          {/* ─── LEFT COLUMN ─── */}
         <div
  style={{
    display: "flex",
    flexDirection: "column",
    gap: 18,
    width: "100%",
    justifyContent: "flex-start",
  }}
>

            {/* Welcome Banner */}
            <div style={{
              background: "linear-gradient(120deg, #6C63FF 0%, #8B83FF 50%, #5ECFBE 100%)",
              borderRadius: 20, padding: "28px 32px",
              display: "flex", alignItems: "center", justifyContent: "space-between",
              overflow: "hidden", position: "relative",
              boxShadow: "0 4px 24px rgba(108,99,255,0.25)",
              minHeight: 160,
            }}>
              {/* Decorative circles */}
              <div style={{ position: "absolute", right: 260, top: -30, width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,0.08)", pointerEvents: "none" }} />
              <div style={{ position: "absolute", right: 200, bottom: -40, width: 100, height: 100, borderRadius: "50%", background: "rgba(255,255,255,0.06)", pointerEvents: "none" }} />

              <div>
                <h1 style={{ fontSize: 28, fontWeight: 900, color: "#fff", margin: "0 0 6px", letterSpacing: "-0.5px" }}>
                  Welcome back, <span style={{ color: "#FFE566" }}>{user?.name || user?.fullName || "there"}!</span> 👋
                </h1>
                <p style={{ color: "rgba(255,255,255,0.85)", fontSize: 14, fontWeight: 600, margin: "0 0 14px" }}>
                  Your consistency is paying off! Keep it up.
                </p>
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  background: "rgba(255,255,255,0.18)", borderRadius: 25,
                  padding: "8px 18px", fontSize: 13, fontWeight: 700, color: "#fff",
                  backdropFilter: "blur(4px)",
                }}>
                  Today's goal:&nbsp;
                  <span style={{ color: "#FFE566" }}>Learn</span> •
                  <span style={{ color: "#FFB3C6" }}> Practice</span> •
                  <span style={{ color: "#A0F0E0" }}> Grow</span>
                  &nbsp;🎯
                </div>
              </div>

              <div style={{ flexShrink: 0, marginRight: 20 }}>
                <img
                  src={userProfile.profileImage?.url || defaultAvatar}
                  alt="Profile"
                  className="w-24 h-24 rounded-full border-4 shadow-lg object-cover"
                  style={{ borderColor: user?.color ? `${user.color}33` : '#fed7aa' }}
                  onError={(e) => { e.target.onerror = null; e.target.src = defaultAvatar; }}
                />
              </div>
            </div>

            {/* Stats row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
              {[
                { label: "Study Hours Today", value: `${totalHours}h`, icon: "⏱️", color: "#6C63FF", bg: "#F0EEFF", prog: studyPercent },
                { label: "Tasks Done", value: `${doneTasks}/${totalTasks}`, icon: "✅", color: "#43C6AC", bg: "#EDFAF5", prog: taskPercent },
                { label: "Study Streak", value: "12 Days", icon: "🔥", color: "#FF6584", bg: "#FFF0F3", prog: 60 },
                { label: "Weekly Goal", value: "68%", icon: "🎯", color: "#F7971E", bg: "#FFF8EE", prog: 68 },
              ].map(({ label, value, icon, color, bg, prog }) => (
                <div key={label} style={{
                  background: "#fff", borderRadius: 18, padding: "18px 16px",
                  border: "1.5px solid #E8ECF4",
                  boxShadow: "0 2px 12px rgba(30,27,75,0.05)",
                }}>
                  <div style={{
                    width: 42, height: 42, borderRadius: 12, background: bg,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 20, marginBottom: 10,
                  }}>{icon}</div>
                  <div style={{ fontSize: 24, fontWeight: 900, color: "#1E1B4B", marginBottom: 2 }}>{value}</div>
                  <div style={{ fontSize: 11, color: "#7C8DB5", fontWeight: 700, marginBottom: 8 }}>{label}</div>
                  <div style={{ height: 4, background: "#F0EEFF", borderRadius: 10, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${prog}%`, background: color, borderRadius: 10 }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Study Hours + Working Hours */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

              {/* Study Hours */}
              <div style={{ background: "#fff", borderRadius: 20, padding: 22, border: "1.5px solid #E8ECF4", boxShadow: "0 2px 12px rgba(30,27,75,0.05)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                  <h3 style={{ fontWeight: 900, fontSize: 15, color: "#1E1B4B", margin: 0 }}>Study Hours</h3>
                  <div style={{ display: "flex", gap: 4 }}>
                    {["Today", "Week", "Month"].map(tab => (
                      <button key={tab} onClick={() => setActiveTab(tab.toLowerCase())} style={{
                        padding: "4px 10px", borderRadius: 20, border: "none", cursor: "pointer",
                        fontSize: 11, fontWeight: 700,
                        background: activeTab === tab.toLowerCase() ? "#6C63FF" : "#F4F6FB",
                        color: activeTab === tab.toLowerCase() ? "#fff" : "#7C8DB5",
                        transition: "all 0.2s",
                      }}>{tab}</button>
                    ))}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  {/* Donut */}
                  <div style={{ position: "relative", width: 110, height: 110, flexShrink: 0 }}>
                    <svg width="110" height="110" viewBox="0 0 110 110">
                      <circle cx="55" cy="55" r="40" fill="none" stroke="#F0EEFF" strokeWidth="13" />
                      <circle cx="55" cy="55" r="40" fill="none" stroke="#6C63FF" strokeWidth="13"
                        strokeDasharray={`${2 * Math.PI * 40 * 0.8} ${2 * Math.PI * 40}`}
                        strokeLinecap="round" transform="rotate(-90 55 55)" />
                      <circle cx="55" cy="55" r="40" fill="none" stroke="#43C6AC" strokeWidth="13"
                        strokeDasharray={`${2 * Math.PI * 40 * 0.12} ${2 * Math.PI * 40}`}
                        strokeDashoffset={`-${2 * Math.PI * 40 * 0.8}`}
                        strokeLinecap="round" transform="rotate(-90 55 55)" opacity="0.7" />
                      <circle cx="55" cy="55" r="40" fill="none" stroke="#F7971E" strokeWidth="13"
                        strokeDasharray={`${2 * Math.PI * 40 * 0.05} ${2 * Math.PI * 40}`}
                        strokeDashoffset={`-${2 * Math.PI * 40 * 0.92}`}
                        strokeLinecap="round" transform="rotate(-90 55 55)" opacity="0.6" />
                    </svg>
                    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ fontSize: 18, fontWeight: 900, color: "#1E1B4B" }}>80%</span>
                      <span style={{ fontSize: 9, color: "#7C8DB5", fontWeight: 700 }}>of goal</span>
                    </div>
                  </div>
                  {/* Bars */}
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
                    {studySubjects.map(subj => (
                      <div key={subj.name} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 14 }}>{subj.icon}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                            <span style={{ fontSize: 11, fontWeight: 700, color: "#1E1B4B" }}>{subj.name}</span>
                            <span style={{ fontSize: 11, fontWeight: 800, color: subj.color }}>{subj.hours}h</span>
                          </div>
                          <div style={{ height: 5, borderRadius: 10, background: "#F0EEFF", overflow: "hidden" }}>
                            <div style={{ height: "100%", width: `${(subj.hours / 4) * 100}%`, background: subj.color, borderRadius: 10 }} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

             {/* Study Progress */}
              <div style={{ background: "#fff", borderRadius: 20, padding: 22, border: "1.5px solid #E8ECF4", boxShadow: "0 2px 12px rgba(30,27,75,0.05)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                  <h3 style={{ fontWeight: 900, fontSize: 15, color: "#1E1B4B", margin: 0 }}>Study hours</h3>
                  <div style={{
                    display: "flex", alignItems: "center", gap: 4,
                    background: "#FFF8EE", border: "1px solid #F7971E22",
                    borderRadius: 20, padding: "4px 10px", fontSize: 11, fontWeight: 700, color: "#F7971E",
                  }}>Today ▾</div>
                </div>
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", marginBottom: 16 }}>
                  <div style={{ position: "relative", width: 120, height: 120 }}>
                    <svg width="120" height="120" viewBox="0 0 120 120">
                      <circle cx="60" cy="60" r="46" fill="none" stroke="#F0EEFF" strokeWidth="13" />
                      <circle cx="60" cy="60" r="46" fill="none" stroke="#F7971E" strokeWidth="13"
                        strokeDasharray={`${2 * Math.PI * 46 * 0.84} ${2 * Math.PI * 46}`}
                        strokeLinecap="round" transform="rotate(-90 60 60)" />
                      <circle cx="60" cy="60" r="46" fill="none" stroke="#6C63FF" strokeWidth="13"
                        strokeDasharray={`${2 * Math.PI * 46 * 0.1} ${2 * Math.PI * 46}`}
                        strokeDashoffset={`-${2 * Math.PI * 46 * 0.84}`}
                        strokeLinecap="round" transform="rotate(-90 60 60)" opacity="0.8" />
                    </svg>
                    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ fontSize: 22, fontWeight: 900, color: "#1E1B4B" }}>84%</span>
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "center", gap: 24 }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                      <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#F7971E", display: "inline-block" }} />
                      <span style={{ fontSize: 12, color: "#7C8DB5", fontWeight: 700 }}>
  Study Time
</span>
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 900, color: "#1E1B4B" }}>7.2 Hours</div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                      <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#6C63FF", display: "inline-block" }} />
                     <span style={{ fontSize: 12, color: "#7C8DB5", fontWeight: 700 }}>
  Completed
</span>
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 900, color: "#1E1B4B" }}>5 Modules</div>
                  </div>
                </div>
              </div>
            </div>

          {/* Current Week Widget */}
          {/* Header row */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div>
              <h3 style={{ fontWeight: 900, fontSize: 15, color: "#1E1B4B", margin: 0 }}>🗺️ My Learning Path</h3>
              {activeRoadmap && (
                <p style={{ fontSize: 11, color: "#7C8DB5", fontWeight: 700, margin: "3px 0 0" }}>
                  {activeRoadmap.subject} · {activeRoadmap.progress?.overallProgress ?? 0}% complete
                </p>
              )}
            </div>
            {activeRoadmap ? (
              <button
                onClick={() => router.push(`/self-learner/roadmap/${activeRoadmap._id}`)}
                style={{ background: "#F0EEFF", border: "none", borderRadius: 10, padding: "6px 14px", fontSize: 11, fontWeight: 800, color: "#6C63FF", cursor: "pointer" }}
              >
                Continue →
              </button>
            ) : (
              <button
                onClick={() => router.push("/self-learner/roadmap/create")}
                style={{ background: "#1E1B4B", border: "none", borderRadius: 10, padding: "6px 14px", fontSize: 11, fontWeight: 800, color: "#fff", cursor: "pointer" }}
              >
                Create Path
              </button>
            )}
          </div>

          {/* Single current-in-progress-week card (full week-by-week board lives on the roadmap detail page) */}
          <div style={{ background: "#FAFBFF", border: "1.5px solid #E8ECF4", borderRadius: 18, padding: 20, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: 5, background: currentWeekCard.color }} />

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 800, color: currentWeekCard.color, marginBottom: 6 }}>
                  {currentWeekCard.week ? `Week ${currentWeekCard.week}` : "No Active Week"}
                </div>
                <h4 style={{ margin: 0, fontSize: 17, fontWeight: 900, color: "#1E1B4B" }}>{currentWeekCard.title}</h4>
              </div>
              <div
                style={{
                  display: "inline-flex", alignItems: "center", padding: "6px 12px", borderRadius: 30,
                  fontSize: 10, fontWeight: 800, whiteSpace: "nowrap",
                  background: currentWeekCard.status === "Completed" ? "#EDFAF5" : currentWeekCard.status === "In Progress" ? "#F0EEFF" : "#FFF4F4",
                  color: currentWeekCard.status === "Completed" ? "#43C6AC" : currentWeekCard.status === "In Progress" ? "#6C63FF" : "#FF6584",
                }}
              >
                {currentWeekCard.status}
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 16, marginBottom: 16 }}>
              {currentWeekCard.subtopics.map((sub, i) => (
                <div
                  key={i}
                  style={{
                    background: "#fff", border: "1px solid #E8ECF4", borderRadius: 10, padding: "8px 10px",
                    fontSize: 11, fontWeight: 700, color: sub.done ? "#43C6AC" : "#4A5678",
                  }}
                >
                  {sub.done ? "✓" : "•"} {sub.title}
                </div>
              ))}
            </div>

            {activeRoadmap && currentWeekCard.week && (
              <button
                onClick={() => router.push(`/self-learner/learning-lounge?roadmapId=${activeRoadmap._id}&week=${currentWeekCard.week}`)}
                style={{ background: "#1E1B4B", border: "none", borderRadius: 10, padding: "10px 16px", fontSize: 11, fontWeight: 800, color: "#fff", cursor: "pointer" }}
              >
                Go to Learning Lounge →
              </button>
            )}
          </div>
          </div>

         {/* ─── RIGHT COLUMN ─── */}
<div
  style={{
    display: "flex",
    flexDirection: "column",
    gap: 18,
    alignSelf: "stretch",
  }}
>

            {/* Calendar */}
            <div style={{ background: "#fff", borderRadius: 20, padding: 22, border: "1.5px solid #E8ECF4", boxShadow: "0 2px 12px rgba(30,27,75,0.05)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
               <h3
  style={{
    fontWeight: 900,
    fontSize: 15,
    color: "#1E1B4B",
    margin: 0,
  }}
>
  {currentDate.toLocaleString("default", {
    month: "long",
  })}{" "}
  {year}
</h3>
             <div style={{ display: "flex", gap: 6 }}>
  <button
    onClick={() =>
      setCurrentDate(new Date(year, month - 1, 1))
    }
    style={{
      background: "#F4F6FB",
      border: "none",
      borderRadius: 8,
      width: 28,
      height: 28,
      cursor: "pointer",
      fontWeight: 800,
      color: "#1E1B4B",
      fontSize: 14,
    }}
  >
    ←
  </button>

  <button
    onClick={() =>
      setCurrentDate(new Date(year, month + 1, 1))
    }
    style={{
      background: "#F4F6FB",
      border: "none",
      borderRadius: 8,
      width: 28,
      height: 28,
      cursor: "pointer",
      fontWeight: 800,
      color: "#1E1B4B",
      fontSize: 14,
    }}
  >
    →
  </button>
</div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 2, textAlign: "center" }}>
                {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map(d => (
                  <div key={d} style={{ fontSize: 10, fontWeight: 800, color: "#7C8DB5", padding: "4px 0" }}>{d}</div>
                ))}
                {/* Jan 2025 starts on Wednesday = index 2 */}
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={`prev-${i}`} style={{ fontSize: 11, color: "#CBD5E0", fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", height: 30 }}>
                    {30 + i}
                  </div>
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const isToday = day === selectedDate;
                  const studied = studiedDays.includes(day);
                  return (
                    <div key={day} onClick={() => setSelectedDate(day)} style={{
                      fontSize: 11, fontWeight: isToday ? 900 : 600,
                      width: 30, height: 30, borderRadius: "50%",
                      display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto",
                      cursor: "pointer",
                      background: isToday ? "#6C63FF" : "transparent",
                      color: isToday ? "#fff" : studied ? "#6C63FF" : "#1E1B4B",
                      position: "relative",
                    }}>
                      {day}
                      {studied && !isToday && (
                        <span style={{
                          position: "absolute", bottom: 2, left: "50%",
                          transform: "translateX(-50%)",
                          width: 4, height: 4, borderRadius: "50%",
                          background: "#6C63FF",
                        }} />
                      )}
                    </div>
                  );
                })}
              </div>
              <div style={{ display: "flex", gap: 16, marginTop: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#7C8DB5", fontWeight: 600 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#6C63FF", display: "inline-block" }} /> Studied 
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#7C8DB5", fontWeight: 600 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: "rgba(108,99,255,0.3)", display: "inline-block" }} /> Today
                </div>
              </div>
            </div>

            {/* Tasks */}
            <div style={{ background: "#fff", borderRadius: 20, padding: 22, border: "1.5px solid #E8ECF4", boxShadow: "0 2px 12px rgba(30,27,75,0.05)"  }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <h3 style={{ fontWeight: 900, fontSize: 15, color: "#1E1B4B", margin: 0 }}>📝 Today's Tasks</h3>
                <span style={{ fontSize: 12, color: "#6C63FF", fontWeight: 700, cursor: "pointer" }}>View All</span>
              </div>

              {/* Add task */}
              <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                <select
  value={priority}
  onChange={(e) => setPriority(e.target.value)}
  style={{
    border: "1.5px solid #E8ECF4",
    borderRadius: 10,
    padding: "8px 10px",
    fontSize: 11,
    fontWeight: 700,
    background: "#FAFBFF",
    color: "#1E1B4B",
    outline: "none",
    cursor: "pointer",
  }}
>
  <option value="high">High</option>
  <option value="medium">Medium</option>
  <option value="low">Low</option>
</select>
                <input
                  value={newTodo}
                  onChange={e => setNewTodo(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && addTodo()}
                  placeholder=" Add a new task..."
                  style={{
                    flex: 1, border: "1.5px solid #E8ECF4", borderRadius: 10,
                    padding: "8px 12px", fontSize: 12, fontFamily: "inherit",
                    outline: "none", color: "#1E1B4B", fontWeight: 600,
                    background: "#FAFBFF",
                  }}
                />
                <button onClick={addTodo} style={{
                  background: "#6C63FF", color: "#fff", border: "none",
                  borderRadius: 10, padding: "8px 14px",
                  fontWeight: 900, fontSize: 18, cursor: "pointer",
                }}>+</button>
              </div>

              {/* Todo list */}
            <div
  style={{
    display: "flex",
    flexDirection: "column",
    gap: 8,
    flex: 1,
  }}
>
                {todos.map(todo => (
                  <div key={todo.id} style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "10px 12px", borderRadius: 12,
                    background: todo.done ? "#F9FAF9" : priorityBg[todo.priority],
                    border: `1.5px solid ${todo.done ? "#E8ECF4" : priorityColor[todo.priority]}30`,
                    transition: "all 0.2s",
                  }}>
                    <div
                      onClick={() => toggleTodo(todo.id)}
                      style={{
                        width: 18, height: 18, borderRadius: 5, border: `2px solid ${todo.done ? "#43C6AC" : "#CBD5E0"}`,
                        background: todo.done ? "#43C6AC" : "transparent",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        cursor: "pointer", flexShrink: 0, fontSize: 10, color: "#fff", fontWeight: 900,
                      }}
                    >{todo.done ? "✓" : ""}</div>
                    <span style={{
                      flex: 1, fontSize: 12, fontWeight: 700,
                      color: todo.done ? "#A0AEC0" : "#1E1B4B",
                      textDecoration: todo.done ? "line-through" : "none",
                    }}>{todo.text}</span>
                    <span style={{
                      fontSize: 9, fontWeight: 900, color: priorityColor[todo.priority],
                      background: `${priorityColor[todo.priority]}18`,
                      padding: "2px 7px", borderRadius: 20, flexShrink: 0,
                    }}>{priorityLabel[todo.priority]}</span>
                    <button onClick={() => deleteTodo(todo.id)} style={{
                      background: "none", border: "none", cursor: "pointer",
                      color: "#CBD5E0", fontSize: 14, lineHeight: 1, flexShrink: 0,
                    }}>✕</button>
                  </div>
                ))}
              </div>

              {/* Progress bar */}
              <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1.5px solid #F0F0F8" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 800, color: "#7C8DB5" }}>{doneTasks}/{totalTasks} done</span>
                  <span style={{ fontSize: 12, fontWeight: 900, color: "#43C6AC" }}>{taskPercent}%</span>
                </div>
                <div style={{ height: 6, background: "#F0EEFF", borderRadius: 20, overflow: "hidden" }}>
                  <div style={{
                    height: "100%", width: `${taskPercent}%`,
                    background: "linear-gradient(90deg,#6C63FF,#43C6AC)",
                    borderRadius: 20, transition: "width 0.5s ease",
                  }} />
                </div>
              </div>
            </div>
          </div>
        </div>


      </main>
    </div>
  );
}