"use client";

import React, { useState, useEffect, useContext, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import { AuthContext } from "@/app/AuthContext";
import Spinner from "@/components/ui/Spinner";

// ─────────────────────────────────────────────────────────────
// Timer Hook
// ─────────────────────────────────────────────────────────────

function useCountdown(totalSeconds, onExpire) {
    const [remaining, setRemaining] = useState(totalSeconds);
    const intervalRef = useRef(null);
    const expiredRef = useRef(false);

    useEffect(() => {
        if (!totalSeconds) return;
        setRemaining(totalSeconds);
        expiredRef.current = false;
        intervalRef.current = setInterval(() => {
            setRemaining((prev) => {
                if (prev <= 1) {
                    clearInterval(intervalRef.current);
                    if (!expiredRef.current) { expiredRef.current = true; onExpire?.(); }
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(intervalRef.current);
    }, [totalSeconds]);

    const h = Math.floor(remaining / 3600);
    const m = Math.floor((remaining % 3600) / 60);
    const s = remaining % 60;
    const label = h > 0
        ? `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
        : `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;

    const pct = totalSeconds ? Math.round((remaining / totalSeconds) * 100) : 100;
    const urgency = pct < 20 ? "red" : pct < 40 ? "amber" : "normal";

    return { remaining, label, pct, urgency };
}

// ─────────────────────────────────────────────────────────────
// Question Palette Dot
// ─────────────────────────────────────────────────────────────

function QDot({ index, current, answered, flagged, color, onClick }) {
    let bg = "#f3f4f6", border = "#d1d5db", textColor = "#6b7280";
    if (flagged) { bg = "#fef3c7"; border = "#f59e0b"; textColor = "#92400e"; }
    if (answered) { bg = color + "20"; border = color; textColor = color; }
    if (index === current) { bg = color; border = color; textColor = "#ffffff"; }

    return (
        <button type="button" onClick={onClick}
            className="w-8 h-8 rounded-lg text-xs font-bold border-2 flex items-center justify-center transition-all duration-150"
            style={{ backgroundColor: bg, borderColor: border, color: textColor }}>
            {index + 1}
        </button>
    );
}

// ─────────────────────────────────────────────────────────────
// MCQ Option
// ─────────────────────────────────────────────────────────────

function MCQOption({ option, label, selected, onSelect, color }) {
    return (
        <button type="button" onClick={onSelect}
            className="w-full flex items-start gap-3 p-3 rounded-xl border text-left text-sm transition-all duration-150"
            style={{
                backgroundColor: selected ? color + "12" : "#f9fafb",
                borderColor: selected ? color : "#e5e7eb",
                color: selected ? color : "#374151",
                fontWeight: selected ? 600 : 400,
            }}>
            <span className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold border"
                style={{
                    backgroundColor: selected ? color : "#ffffff",
                    borderColor: selected ? color : "#d1d5db",
                    color: selected ? "#ffffff" : "#6b7280",
                }}>
                {label}
            </span>
            <span className="mt-0.5 leading-relaxed">{option}</span>
        </button>
    );
}

// ─────────────────────────────────────────────────────────────
// Pill (info)
// ─────────────────────────────────────────────────────────────

function InfoPill({ icon, label, value, color }) {
    return (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
            style={{ backgroundColor: color + "0d", border: `1px solid ${color}25` }}>
            <span className="text-base">{icon}</span>
            <div>
                <p className="text-xs text-gray-400 leading-none">{label}</p>
                <p className="text-sm font-bold leading-tight" style={{ color }}>{value}</p>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────
// Result Stat Card
// ─────────────────────────────────────────────────────────────

function ResultCard({ icon, label, value, accent }) {
    return (
        <div className="rounded-xl p-4 text-center border"
            style={{ borderColor: accent + "30", backgroundColor: accent + "08" }}>
            <p className="text-xl mb-1">{icon}</p>
            <p className="text-xl font-bold" style={{ color: accent }}>{value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{label}</p>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────
// Horizontal Bar (analytics)
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
// Grade helper
// ─────────────────────────────────────────────────────────────

function getGrade(pct) {
    if (pct >= 90) return { grade: "A+", color: "#16a34a" };
    if (pct >= 80) return { grade: "A", color: "#22c55e" };
    if (pct >= 70) return { grade: "B+", color: "#3b82f6" };
    if (pct >= 60) return { grade: "B", color: "#2563eb" };
    if (pct >= 50) return { grade: "C", color: "#f59e0b" };
    if (pct >= 40) return { grade: "D", color: "#f97316" };
    return { grade: "F", color: "#ef4444" };
}

// ─────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────

export default function TestAttemptPage() {
    const { user } = useContext(AuthContext);
    const params = useParams();
    const router = useRouter();
    const testId = params?.id; // ✅ [id] folder se match karta hai
    const color = user?.color || "#9b1b30";

    // phase: loading | briefing | attempt | submitting | result | error
    const [phase, setPhase] = useState("loading");
    const [testData, setTestData] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [current, setCurrent] = useState(0);
    const [answers, setAnswers] = useState({});
    const [flagged, setFlagged] = useState({});
    const [result, setResult] = useState(null);
    const [submitConfirm, setSubmitConfirm] = useState(false);
    const [fullscreenRequired, setFullscreenRequired] =
        useState(false);
    const [violations, setViolations] = useState(0);

    const totalSeconds = testData ? testData.duration * 60 : 0;
    const { label: timerLabel, pct: timerPct, urgency } = useCountdown(
        phase === "attempt" ? totalSeconds : 0,
        () => { if (phase === "attempt") handleAutoSubmit(); }
    );
    const timerColor = urgency === "red" ? "#ef4444" : urgency === "amber" ? "#f59e0b" : color;

    // ── Fetch single test (with polling if questions not ready yet) ──
    useEffect(() => {
        if (!testId) {
            setPhase("error");
            return;
        }

        let attempts = 0;
        const MAX_ATTEMPTS = 20;
        const POLL_INTERVAL = 2000;

        const tryFetch = async () => {
            try {
                const res = await axios.get(`/api/mock-tests/${testId}`, { withCredentials: true });
                const qs = res.data.questions || [];

                if (qs.length === 0 && attempts < MAX_ATTEMPTS) {
                    attempts++;
                    setTimeout(tryFetch, POLL_INTERVAL);
                    return;
                }

                setTestData(res.data.test);
                setQuestions(qs);
                setPhase(qs.length > 0 ? "briefing" : "error");
            } catch {
                toast.error("Failed to load test.");
                setPhase("error");
            }
        };

        setPhase("loading");
        tryFetch();
    }, [testId]);

    const answeredCount = Object.keys(answers).length;
    const flaggedCount = Object.values(flagged).filter(Boolean).length;
    const unanswered = questions.length - answeredCount;
    const q = questions[current] || null;

    const setAnswer = (qId, val) => setAnswers((p) => ({ ...p, [qId]: val }));
    const toggleFlag = (qId) => setFlagged((p) => ({ ...p, [qId]: !p[qId] }));

    // ── Submit ──────────────────────────────────────────────────
    const doSubmit = useCallback(async () => {
        setPhase("submitting");
        setSubmitConfirm(false);
        try {
            const res = await axios.post(
                `/api/mock-tests/${testId}/submit`,
                { answers },
                { withCredentials: true }
            );
            setResult(res.data.result);
            setPhase("result");
        } catch {
            toast.error("Submission failed. Please retry.");
            setPhase("attempt");
        }
    }, [testId, answers]);

    const handleAutoSubmit = useCallback(() => {
        toast("Time's up! Submitting…", { icon: "⏰" });
        doSubmit();
    }, [doSubmit]);

    const handleSubmitClick = () => {
        if (unanswered > 0) { setSubmitConfirm(true); return; }
        doSubmit();
    };

    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden && phase === "attempt") {

                const nextCount = violations + 1;
                setViolations(nextCount);

                toast.error(
                    `Tab switching detected (${nextCount}/3)`
                );

                if (nextCount >= 3) {
                    toast.error(
                        "3 violations detected. Test submitted automatically."
                    );
                    doSubmit();
                }
            }
        };

        document.addEventListener(
            "visibilitychange",
            handleVisibilityChange
        );

        return () => {
            document.removeEventListener(
                "visibilitychange",
                handleVisibilityChange
            );
        };
    }, [phase, violations, doSubmit]);

    useEffect(() => {
        const handleFullscreenChange = () => {
            if (
                phase === "attempt" &&
                !document.fullscreenElement
            ) {
                const nextCount = violations + 1;

                setViolations(nextCount);

                setFullscreenRequired(true);

                toast.error(
                    `Fullscreen exited (${nextCount}/3)`
                );

                if (nextCount >= 3) {
                    doSubmit();
                }
            }
        };

        document.addEventListener(
            "fullscreenchange",
            handleFullscreenChange
        );

        return () => {
            document.removeEventListener(
                "fullscreenchange",
                handleFullscreenChange
            );
        };
    }, [phase, violations, doSubmit]);

    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (phase === "attempt") {
                e.preventDefault();
                e.returnValue = "";
            }
        };

        window.addEventListener(
            "beforeunload",
            handleBeforeUnload
        );

        return () => {
            window.removeEventListener(
                "beforeunload",
                handleBeforeUnload
            );
        };
    }, [phase]);

    // ─────────────────────────────────────────────────────────────
    // PHASE: loading
    // ─────────────────────────────────────────────────────────────
    if (phase === "loading") return (
        <div className="flex items-center justify-center h-screen" style={{ backgroundColor: color }}>
            <div className="bg-white rounded-2xl px-10 py-8 flex flex-col items-center gap-4 shadow-xl text-center max-w-xs w-full mx-4">
                <Spinner />
                <div>
                    <p className="text-sm font-semibold text-gray-700">Preparing your test…</p>
                    <p className="text-xs text-gray-400 mt-1">AI is generating your questions. This may take a few seconds.</p>
                </div>
                <div className="flex gap-1.5">
                    {[0, 1, 2].map((i) => (
                        <div key={i} className="w-2 h-2 rounded-full animate-bounce"
                            style={{ backgroundColor: color, animationDelay: `${i * 0.15}s` }} />
                    ))}
                </div>
            </div>
        </div>
    );

    // ─────────────────────────────────────────────────────────────
    // PHASE: error
    // ─────────────────────────────────────────────────────────────
    if (phase === "error") return (
        <div className="flex items-center justify-center h-screen" style={{ backgroundColor: color }}>
            <div className="bg-white rounded-2xl p-10 flex flex-col items-center gap-4 shadow-xl text-center max-w-sm">
                <p className="text-4xl">⚠️</p>
                <p className="text-lg font-bold text-gray-800">Test not found</p>
                <p className="text-sm text-gray-400">This test may have expired or doesn't exist.</p>
                <button onClick={() => router.push("/self-learner/test-engine/test-yourself")}
                    className="mt-2 px-6 py-2 text-white rounded-xl font-medium"
                    style={{ backgroundColor: color }}>
                    Back to Tests
                </button>
            </div>
        </div>
    );

    // ─────────────────────────────────────────────────────────────
    // PHASE: briefing
    // ─────────────────────────────────────────────────────────────
    if (phase === "briefing") return (
        <div className="flex items-center justify-center min-h-screen p-5" style={{ backgroundColor: color }}>
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">

                <div className="px-6 py-5 text-center" style={{ borderBottom: "1.5px solid #f3f4f6" }}>
                    <div className="w-14 h-14 rounded-xl mx-auto flex items-center justify-center text-2xl mb-3"
                        style={{ backgroundColor: color + "18" }}>📝</div>
                    <h2 className="text-xl font-bold text-gray-900">{testData?.testTitle || "Mock Test"}</h2>
                    <p className="text-sm text-gray-400 mt-1">{testData?.subjectName}</p>
                </div>

                <div className="p-5 grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <InfoPill icon="❓" label="Questions" value={questions.length} color={color} />
                    <InfoPill icon="🏆" label="Total Marks" value={testData?.totalMarks || "—"} color={color} />
                    <InfoPill icon="⏱️" label="Duration" value={`${testData?.duration || 0} min`} color={color} />
                    <InfoPill icon="📊" label="Difficulty" value={testData?.difficulty || "Mixed"} color={color} />
                    <InfoPill icon="📉" label="Neg. Marking" value={testData?.negativeMarking ? `−${testData.negativeMarks}` : "None"} color={color} />
                    <InfoPill icon="📅" label="Starts" value={testData?.scheduleDate ? new Date(testData.scheduleDate).toLocaleDateString() : "Now"} color={color} />
                </div>

                {testData?.instructions && (
                    <div className="mx-5 mb-4 rounded-xl p-4 text-sm text-gray-600"
                        style={{ backgroundColor: "#fffbeb", border: "1px solid #fde68a" }}>
                        <p className="font-semibold text-amber-800 mb-1">📋 Instructions</p>
                        <p className="whitespace-pre-line text-xs leading-relaxed">{testData.instructions}</p>
                    </div>
                )}

                <div className="px-5 pb-5 flex flex-col gap-2">
                    <button
                        onClick={async () => {
                            try {
                                await document.documentElement.requestFullscreen();
                            } catch (e) {
                                console.log(e);
                            }

                            setPhase("attempt");
                        }}
                    >
                        Start Test →
                    </button>
                    {/* ✅ BUG FIX: test._id → testId (test variable exist nahi karta tha) */}
                    <button
                        onClick={() => router.push("/self-learner/test-engine/test-yourself")}
                        className="w-full py-2 text-sm text-gray-400 hover:text-gray-600">
                        Go Back
                    </button>
                </div>
            </div>
        </div>
    );

    // ─────────────────────────────────────────────────────────────
    // PHASE: submitting
    // ─────────────────────────────────────────────────────────────
    if (phase === "submitting") return (
        <div className="flex items-center justify-center h-screen" style={{ backgroundColor: color }}>
            <div className="bg-white rounded-2xl p-12 flex flex-col items-center gap-4 shadow-xl text-center">
                <Spinner />
                <p className="text-lg font-semibold text-gray-700">Evaluating your answers…</p>
                <p className="text-sm text-gray-400">Please wait, do not close this tab.</p>
            </div>
        </div>
    );

    // ─────────────────────────────────────────────────────────────
    // PHASE: result (with merged analytics)
    // ─────────────────────────────────────────────────────────────
    if (phase === "result" && result) {
        const scorePct = result.totalMarks > 0 ? Math.round((result.scored / result.totalMarks) * 100) : 0;
        const { grade, color: gradeColor } = getGrade(scorePct);

        const diffBreak = result.difficultyBreakdown || { easy: { correct: 0, total: 0 }, medium: { correct: 0, total: 0 }, hard: { correct: 0, total: 0 } };
        const qTypes = result.questionTypeBreakdown || [];
        const strengths = result.strengths || [];
        const improvements = result.improvements || [];

        const typeColors = {
            mcq: "#3b82f6", true_false: "#22c55e", short_answer: "#8b5cf6",
            descriptive: "#f59e0b", fill_blanks: "#06b6d4", match_following: "#f97316",
        };

        return (

            <div className="flex flex-col min-h-screen p-5" style={{ backgroundColor: color }}>

                <div className="bg-white rounded-2xl shadow-xl max-w-3xl mx-auto w-full overflow-hidden">

                    {/* Grade hero */}
                    <div className="px-6 py-8 text-center" style={{ borderBottom: "1.5px solid #f3f4f6" }}>
                        <div className="w-20 h-20 rounded-full mx-auto flex items-center justify-center text-3xl font-bold text-white mb-4 shadow-lg"
                            style={{ backgroundColor: gradeColor }}>{grade}</div>
                        <h2 className="text-2xl font-bold text-gray-900">Test Completed!</h2>
                        <p className="text-sm text-gray-400 mt-1">{testData?.testTitle}</p>

                        <div className="mt-5 max-w-xs mx-auto">
                            <div className="flex justify-between text-sm font-medium mb-1.5">
                                <span className="text-gray-500">Score</span>
                                <span style={{ color: gradeColor }}>{scorePct}%</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-3">
                                <div className="h-3 rounded-full transition-all duration-700"
                                    style={{ width: `${scorePct}%`, backgroundColor: gradeColor }} />
                            </div>
                        </div>
                    </div>

                    {/* Stats grid */}
                    <div className="p-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <ResultCard icon="🏆" label="Score" value={`${result.scored}/${result.totalMarks}`} accent={color} />
                        <ResultCard icon="✅" label="Correct" value={result.correct} accent="#22c55e" />
                        <ResultCard icon="❌" label="Wrong" value={result.wrong} accent="#ef4444" />
                        <ResultCard icon="⏭️" label="Skipped" value={result.skipped} accent="#6b7280" />
                        <ResultCard icon="🎯" label="Accuracy" value={`${result.accuracy || 0}%`} accent="#3b82f6" />
                        <ResultCard icon="📊" label="Percentage" value={`${scorePct}%`} accent={color} />
                        <ResultCard icon="⏱️" label="Time Taken" value={result.timeTaken || "—"} accent="#8b5cf6" />
                        <ResultCard icon="🥇" label="Rank" value={result.rank || "—"} accent="#f59e0b" />
                    </div>

                    {/* Motivational message */}
                    <div className="mx-5 mb-4 rounded-xl p-4 text-center text-sm font-medium"
                        style={{ backgroundColor: color + "0d", border: `1px solid ${color}25`, color }}>
                        {scorePct >= 80
                            ? "🌟 Outstanding! You've mastered this topic."
                            : scorePct >= 60
                                ? "💪 Good job! A bit more practice and you'll ace it."
                                : "📚 Keep going! Every attempt makes you stronger."}
                    </div>

                    {/* ── Analytics: Difficulty Breakdown ── */}
                    <div className="mx-5 mb-4 rounded-xl border border-gray-100 p-4">
                        <h3 className="text-sm font-bold text-gray-800 mb-3">⚡ Difficulty Breakdown</h3>
                        {["easy", "medium", "hard"].map((level) => {
                            const d = diffBreak[level] || { correct: 0, total: 0 };
                            const c = { easy: "#22c55e", medium: "#f59e0b", hard: "#ef4444" }[level];
                            const lbl = { easy: "Easy", medium: "Medium", hard: "Hard" }[level];
                            const p = d.total > 0 ? Math.round((d.correct / d.total) * 100) : 0;
                            return <HBar key={level} label={lbl} value={p} max={100} color={c} sub="%" />;
                        })}
                        <div className="mt-2 flex flex-wrap gap-3 text-xs text-gray-400">
                            {["easy", "medium", "hard"].map((l) => {
                                const d = diffBreak[l] || { correct: 0, total: 0 };
                                return <span key={l}>{l[0].toUpperCase() + l.slice(1)}: {d.correct}/{d.total}</span>;
                            })}
                        </div>
                    </div>

                    {/* ── Analytics: Question Type Accuracy ── */}
                    {qTypes.length > 0 && (
                        <div className="mx-5 mb-4 rounded-xl border border-gray-100 p-4">
                            <h3 className="text-sm font-bold text-gray-800 mb-3">❓ Question Type Accuracy</h3>
                            {qTypes.map((qt) => {
                                const p = qt.total > 0 ? Math.round((qt.correct / qt.total) * 100) : 0;
                                return (
                                    <HBar key={qt.type}
                                        label={qt.type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                                        value={p} max={100}
                                        color={typeColors[qt.type] || color} sub="%" />
                                );
                            })}
                        </div>
                    )}

                    {/* ── Analytics: Strengths & Improvements ── */}
                    {(strengths.length > 0 || improvements.length > 0) && (
                        <div className="mx-5 mb-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {strengths.length > 0 && (
                                <div className="rounded-xl border border-gray-100 p-4">
                                    <h3 className="text-sm font-bold text-gray-800 mb-3">💪 Your Strengths</h3>
                                    <ul className="space-y-2">
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
                                </div>
                            )}
                            {improvements.length > 0 && (
                                <div className="rounded-xl border border-gray-100 p-4">
                                    <h3 className="text-sm font-bold text-gray-800 mb-3">🎯 Areas to Improve</h3>
                                    <ul className="space-y-2">
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
                                </div>
                            )}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="px-5 pb-6 flex flex-wrap gap-3 justify-center">
                        <button onClick={() => router.push(`/self-learner/test-engine/test-yourself/${testId}/review`)}
                            className="px-5 py-2 rounded-xl border text-sm font-medium"
                            style={{ borderColor: color, color }}>
                            Review Answers
                        </button>
                        <button onClick={() => router.push("/self-learner/test-engine/test-yourself")}
                            className="px-5 py-2 rounded-xl text-white text-sm font-medium"
                            style={{ backgroundColor: color }}>
                            Back to Tests
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ─────────────────────────────────────────────────────────────
    // PHASE: attempt
    // ─────────────────────────────────────────────────────────────
    if (phase !== "attempt" || !q) return null;

    const qId = q._id || current;
    // Roadmap-mode questions (from the week-range Test Engine flow) are
    // Auto-Test-shaped: MCQ answers must be the 0-indexed option position,
    // not the option text subject-mode uses — the two schemas store/grade
    // MCQ answers differently, so this must branch by mode, not by field
    // presence (the answer key itself is always stripped before this page
    // ever sees the question).
    const isRoadmapMode = testData?.mode === "roadmap";

    return (
        <>
            {fullscreenRequired && (
                <div className="fixed inset-0 z-[9999] bg-black/80 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-xl text-center">
                        <h2 className="text-xl font-bold mb-3">
                            Fullscreen Required
                        </h2>

                        <p className="mb-4">
                            Please return to fullscreen mode to continue the test.
                        </p>

                        <button
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                            onClick={async () => {
                                try {
                                    await document.documentElement.requestFullscreen();
                                    setFullscreenRequired(false);
                                } catch (err) {
                                    console.log(err);
                                }
                            }}
                        >
                            Continue Test
                        </button>
                    </div>
                </div>
            )}

            <div className="flex flex-col h-screen overflow-hidden bg-gray-50">

                {/* Top Bar */}
                <div className="flex items-center justify-between px-5 py-3 bg-white shadow-sm border-b border-gray-200 flex-shrink-0">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                            style={{ backgroundColor: color }}>T</div>
                        <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-800 truncate leading-none">{testData?.testTitle}</p>
                            <p className="text-xs text-gray-400 truncate">{testData?.subjectName}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl font-mono font-bold text-sm flex-shrink-0"
                        style={{ backgroundColor: timerColor + "12", color: timerColor, border: `1.5px solid ${timerColor}35` }}>
                        ⏱ {timerLabel}
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                        <span className="text-xs text-gray-400 hidden sm:block">
                            Q <strong className="text-gray-700">{current + 1}</strong>/{questions.length}
                        </span>
                        <button onClick={handleSubmitClick}
                            className="px-4 py-1.5 text-white rounded-lg text-sm font-medium"
                            style={{ backgroundColor: color }}>
                            Submit
                        </button>
                    </div>
                </div>

                <div className="w-full h-1 bg-gray-200 flex-shrink-0">
                    <div className="h-1 transition-all duration-1000"
                        style={{ width: `${timerPct}%`, backgroundColor: timerColor }} />
                </div>

                <div className="flex flex-1 overflow-hidden">

                    <div className="flex-1 flex flex-col overflow-hidden">

                        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
                            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">

                                <div className="flex items-center gap-2 flex-wrap mb-4">
                                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                                        style={{ backgroundColor: color + "18", color }}>
                                        Q{current + 1}
                                    </span>
                                    {q.type && (
                                        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full capitalize">
                                            {q.type.replace(/_/g, " ")}
                                        </span>
                                    )}
                                    {q.marks && (
                                        <span className="text-xs text-gray-400 ml-auto">
                                            {q.marks} mark{q.marks !== 1 ? "s" : ""}
                                        </span>
                                    )}
                                    <button onClick={() => toggleFlag(qId)}
                                        className="text-xs px-2 py-0.5 rounded-full border transition-all"
                                        style={
                                            flagged[qId]
                                                ? { backgroundColor: "#fef3c7", borderColor: "#f59e0b", color: "#92400e" }
                                                : { backgroundColor: "transparent", borderColor: "#d1d5db", color: "#9ca3af" }
                                        }>
                                        {flagged[qId] ? "🚩 Flagged" : "🏳 Flag"}
                                    </button>
                                </div>

                                <p className="text-gray-800 text-base leading-relaxed font-medium mb-5">
                                    {q.questionText || q.text || q.question || "Question text unavailable"}
                                </p>

                                {(q.type === "mcq" || q.options?.length > 0) && (
                                    <div className="space-y-2">
                                        {(q.options || []).map((opt, i) => (
                                            <MCQOption key={i} option={opt} label={String.fromCharCode(65 + i)}
                                                selected={isRoadmapMode ? answers[qId] === i : answers[qId] === opt}
                                                onSelect={() => setAnswer(qId, isRoadmapMode ? i : opt)}
                                                color={color} />
                                        ))}
                                    </div>
                                )}

                                {q.type === "true_false" && (
                                    <div className="flex gap-3">
                                        {["True", "False"].map((opt) => (
                                            <MCQOption key={opt} option={opt} label={opt[0]}
                                                selected={answers[qId] === opt}
                                                onSelect={() => setAnswer(qId, opt)}
                                                color={color} />
                                        ))}
                                    </div>
                                )}

                                {(q.type === "short_answer" || q.type === "fill_blanks") && (
                                    <input type="text" placeholder="Type your answer here…"
                                        value={answers[qId] || ""}
                                        onChange={(e) => setAnswer(qId, e.target.value)}
                                        className="w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none"
                                        style={{ borderColor: answers[qId] ? color : "#d1d5db" }} />
                                )}

                                {(q.type === "descriptive" || q.type === "subjective" || q.type === "practical") && (
                                    <textarea rows={5} placeholder="Write your answer here…"
                                        value={answers[qId] || ""}
                                        onChange={(e) => setAnswer(qId, e.target.value)}
                                        className="w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none resize-none"
                                        style={{ borderColor: answers[qId] ? color : "#d1d5db" }} />
                                )}
                            </div>
                        </div>

                        <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 flex-shrink-0">
                            <button onClick={() => setCurrent((p) => Math.max(0, p - 1))}
                                disabled={current === 0}
                                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border text-sm font-medium disabled:opacity-40 transition-all"
                                style={{ borderColor: color, color }}>
                                ← Prev
                            </button>

                            <div className="text-xs text-gray-400 text-center">
                                <span className="font-semibold" style={{ color }}>{answeredCount}</span> answered
                                {flaggedCount > 0 && (
                                    <span className="ml-2 text-amber-600">🚩 {flaggedCount}</span>
                                )}
                            </div>

                            {current < questions.length - 1 ? (
                                <button onClick={() => setCurrent((p) => Math.min(questions.length - 1, p + 1))}
                                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-sm font-medium"
                                    style={{ backgroundColor: color }}>
                                    Next →
                                </button>
                            ) : (
                                <button onClick={handleSubmitClick}
                                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-sm font-semibold"
                                    style={{ backgroundColor: "#22c55e" }}>
                                    Finish ✓
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Question Palette */}
                    <div className="w-56 bg-white border-l border-gray-200 flex flex-col flex-shrink-0 overflow-hidden hidden sm:flex">
                        <div className="px-4 py-3 border-b border-gray-100" style={{ backgroundColor: color + "08" }}>
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Palette</p>
                        </div>

                        <div className="flex-1 overflow-y-auto p-3">
                            <div className="flex flex-wrap gap-1.5">
                                {questions.map((question, idx) => (
                                    <QDot key={idx} index={idx} current={current}
                                        answered={!!answers[question._id || idx]}
                                        flagged={!!flagged[question._id || idx]}
                                        color={color}
                                        onClick={() => setCurrent(idx)} />
                                ))}
                            </div>
                        </div>

                        <div className="p-3 border-t border-gray-100 space-y-1.5">
                            {[
                                { bg: color, border: color, label: "Current" },
                                { bg: color + "20", border: color, label: "Answered" },
                                { bg: "#fef3c7", border: "#f59e0b", label: "Flagged" },
                                { bg: "#f3f4f6", border: "#d1d5db", label: "Unvisited" },
                            ].map((l) => (
                                <div key={l.label} className="flex items-center gap-2 text-xs text-gray-500">
                                    <div className="w-4 h-4 rounded border-2 flex-shrink-0"
                                        style={{ backgroundColor: l.bg, borderColor: l.border }} />
                                    {l.label}
                                </div>
                            ))}
                        </div>

                        <div className="p-3 border-t border-gray-100 grid grid-cols-2 gap-2 text-center text-xs">
                            <div className="rounded-lg p-2" style={{ backgroundColor: color + "10" }}>
                                <p className="font-bold text-base" style={{ color }}>{answeredCount}</p>
                                <p className="text-gray-400">Done</p>
                            </div>
                            <div className="rounded-lg p-2 bg-gray-50">
                                <p className="font-bold text-base text-gray-600">{unanswered}</p>
                                <p className="text-gray-400">Left</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Submit Confirm Modal */}
                {submitConfirm && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center">
                            <p className="text-3xl mb-3">⚠️</p>
                            <h3 className="text-lg font-bold text-gray-800 mb-2">Submit Test?</h3>
                            <p className="text-sm text-gray-500 mb-1">
                                You have <strong className="text-red-500">{unanswered} unanswered</strong> question{unanswered !== 1 ? "s" : ""}.
                            </p>
                            <p className="text-xs text-gray-400 mb-5">Once submitted, you cannot change your answers.</p>
                            <div className="flex gap-3">
                                <button onClick={() => setSubmitConfirm(false)}
                                    className="flex-1 py-2 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium">
                                    Continue
                                </button>
                                <button onClick={doSubmit}
                                    className="flex-1 py-2 rounded-xl text-white text-sm font-semibold"
                                    style={{ backgroundColor: color }}>
                                    Submit Now
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
