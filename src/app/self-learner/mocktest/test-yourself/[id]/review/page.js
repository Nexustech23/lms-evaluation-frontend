"use client";

import React, { useState, useEffect, useContext } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { AuthContext } from "@/app/AuthContext";
import Spinner from "@/components/ui/Spinner";

// ─── Status config ────────────────────────────────────────────
const STATUS = {
    correct: { bg: "#f0fdf4", border: "#22c55e", badge: "#22c55e", label: "Correct", icon: "✓" },
    wrong: { bg: "#fef2f2", border: "#ef4444", badge: "#ef4444", label: "Wrong", icon: "✗" },
    skipped: { bg: "#f9fafb", border: "#d1d5db", badge: "#6b7280", label: "Skipped", icon: "—" },
};

// ─── Palette Dot ──────────────────────────────────────────────
function PDot({ index, status, active, onClick }) {
    const s = STATUS[status] || STATUS.skipped;
    return (
        <button
            onClick={onClick}
            className="w-9 h-9 rounded-lg text-xs font-bold border-2 flex items-center justify-center transition-all"
            style={{
                backgroundColor: active ? s.badge : s.bg,
                borderColor: s.badge,
                color: active ? "#fff" : s.badge,
            }}
        >
            {index + 1}
        </button>
    );
}

// ─── Option Row ───────────────────────────────────────────────
function OptionRow({ label, text, isCorrect, isChosen, isWrong }) {
    let bg = "#f9fafb", border = "#e5e7eb", textColor = "#374151", icon = null;

    if (isCorrect) {
        bg = "#f0fdf4"; border = "#22c55e"; textColor = "#15803d";
        icon = <span className="text-green-500 font-bold text-base">✓</span>;
    } else if (isWrong) {
        bg = "#fef2f2"; border = "#ef4444"; textColor = "#b91c1c";
        icon = <span className="text-red-500 font-bold text-base">✗</span>;
    }

    return (
        <div
            className="flex items-start gap-3 px-4 py-3 rounded-xl border text-sm transition-all"
            style={{ backgroundColor: bg, borderColor: border, color: textColor }}
        >
            <span
                className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold border"
                style={{
                    backgroundColor: isCorrect ? "#22c55e" : isWrong ? "#ef4444" : "#fff",
                    borderColor: isCorrect ? "#22c55e" : isWrong ? "#ef4444" : "#d1d5db",
                    color: isCorrect || isWrong ? "#fff" : "#6b7280",
                }}
            >
                {label}
            </span>
            <span className="mt-0.5 flex-1 leading-relaxed">{text}</span>
            {icon && <span className="flex-shrink-0 mt-0.5">{icon}</span>}
        </div>
    );
}

// ─── Main ─────────────────────────────────────────────────────
export default function ReviewPage() {
    const { user } = useContext(AuthContext);
    const params = useParams();
    const router = useRouter();
    const testId = params?.id;
    const color = user?.color || "#9b1b30";

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [attempt, setAttempt] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [testInfo, setTestInfo] = useState({});
    const [current, setCurrent] = useState(0);
    const [filter, setFilter] = useState("all"); // all | correct | wrong | skipped

    useEffect(() => {
        if (!testId) return;
        axios
            .get(`/api/mock-tests/${testId}/review`, { withCredentials: true })
            .then((res) => {
                setAttempt(res.data.attempt);
                setQuestions(res.data.questions || []);
                setTestInfo(res.data.testInfo || {});
            })
            .catch(() => setError("Failed to load review."))
            .finally(() => setLoading(false));
    }, [testId]);

    if (loading) return (
        <div className="flex items-center justify-center h-screen" style={{ backgroundColor: color }}>
            <div className="bg-white rounded-2xl px-10 py-8 flex flex-col items-center gap-4 shadow-xl">
                <Spinner />
                <p className="text-sm text-gray-500">Loading review…</p>
            </div>
        </div>
    );

    if (error || !attempt) return (
        <div className="flex items-center justify-center h-screen" style={{ backgroundColor: color }}>
            <div className="bg-white rounded-2xl p-10 text-center shadow-xl max-w-sm">
                <p className="text-4xl mb-3">⚠️</p>
                <p className="text-lg font-bold text-gray-800 mb-2">Review not available</p>
                <p className="text-sm text-gray-400 mb-5">{error || "No attempt found."}</p>
                <button onClick={() => router.push("/self-learner/mocktest/test-yourself")}
                    className="px-6 py-2 text-white rounded-xl font-medium"
                    style={{ backgroundColor: color }}>
                    Back to Tests
                </button>
            </div>
        </div>
    );

    const qwise = attempt.questionwise || [];

    // Build status map: question_id → status
    const statusMap = {};
    qwise.forEach((qw) => { statusMap[qw.question_id] = qw.status; });

    // Filter palette indices
    const filteredIndices = qwise
        .map((_, i) => i)
        .filter((i) => filter === "all" || qwise[i]?.status === filter);

    const counts = {
        correct: qwise.filter((q) => q.status === "correct").length,
        wrong: qwise.filter((q) => q.status === "wrong").length,
        skipped: qwise.filter((q) => q.status === "skipped").length,
    };

    const currentQW = qwise[current];
    if (!currentQW) return null;

    const studentAns = currentQW.student_answer || "";
    const correctAns = currentQW.correct_answer || "";
    const options = currentQW.options || [];
    const qStatus = currentQW.status || "skipped";
    const sc = STATUS[qStatus] || STATUS.skipped;

    return (
        <div className="flex flex-col min-h-screen" style={{ backgroundColor: color }}>

            {/* ── Top Bar ── */}
            <div className="bg-white border-b border-gray-200 px-5 py-3 flex items-center justify-between shadow-sm flex-shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold"
                        style={{ backgroundColor: color }}>R</div>
                    <div className="min-w-0">
                        <p className="text-sm font-bold text-gray-800 truncate leading-none">
                            {testInfo.testTitle || attempt.testTitle || attempt.subjectName || "Review"}
                        </p>
                        <p className="text-xs text-gray-400">{attempt.subjectName}</p>
                    </div>
                </div>

                {/* Score strip */}
                <div className="flex items-center gap-4 flex-shrink-0">
                    <div className="flex items-center gap-3 text-xs font-semibold">
                        <span className="flex items-center gap-1 text-green-600">
                            <span className="w-5 h-5 rounded bg-green-100 flex items-center justify-center">✓</span>
                            {counts.correct}
                        </span>
                        <span className="flex items-center gap-1 text-red-500">
                            <span className="w-5 h-5 rounded bg-red-100 flex items-center justify-center">✗</span>
                            {counts.wrong}
                        </span>
                        <span className="flex items-center gap-1 text-gray-400">
                            <span className="w-5 h-5 rounded bg-gray-100 flex items-center justify-center">—</span>
                            {counts.skipped}
                        </span>
                    </div>
                    <button
                        onClick={() => router.push("/self-learner/mocktest/test-yourself")}
                        className="px-3 py-1.5 text-xs text-white rounded-lg font-medium"
                        style={{ backgroundColor: color }}>
                        ← Back
                    </button>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">

                {/* ── Main Question Area ── */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    <div className="flex-1 overflow-y-auto p-4 sm:p-5">

                        {/* Question card */}
                        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden mb-4"
                            style={{ borderColor: sc.border }}>

                            {/* Question header */}
                            <div className="px-5 py-3 flex items-center justify-between flex-wrap gap-2"
                                style={{ backgroundColor: sc.bg, borderBottom: `1.5px solid ${sc.border}` }}>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-xs font-bold px-2.5 py-1 rounded-full text-white"
                                        style={{ backgroundColor: sc.badge }}>
                                        {sc.icon} {sc.label}
                                    </span>
                                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                                        style={{ backgroundColor: color + "18", color }}>
                                        Q{current + 1} of {qwise.length}
                                    </span>
                                    {currentQW.type && (
                                        <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full capitalize">
                                            {currentQW.type.replace(/_/g, " ")}
                                        </span>
                                    )}
                                    {currentQW.difficulty && (
                                        <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full capitalize">
                                            {currentQW.difficulty}
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 text-xs">
                                    <span className="text-gray-400">Marks:</span>
                                    <span className="font-bold" style={{ color: currentQW.marks_awarded > 0 ? "#22c55e" : currentQW.marks_awarded < 0 ? "#ef4444" : "#6b7280" }}>
                                        {currentQW.marks_awarded > 0 ? `+${currentQW.marks_awarded}` : currentQW.marks_awarded}
                                    </span>
                                    <span className="text-gray-300">/</span>
                                    <span className="text-gray-500">{currentQW.marks || 1}</span>
                                </div>
                            </div>

                            {/* Question text */}
                            <div className="px-5 py-5">
                                <p className="text-gray-800 text-base font-medium leading-relaxed mb-5">
                                    {currentQW.questionText || "Question text unavailable"}
                                </p>

                                {/* Options (MCQ / true_false) */}
                                {options.length > 0 && (
                                    <div className="space-y-2.5 mb-5">
                                        {options.map((opt, i) => {
                                            const label = String.fromCharCode(65 + i);
                                            const optLower = opt.toLowerCase();
                                            const isCorrect = optLower === correctAns;
                                            const isWrong = optLower === studentAns && studentAns !== correctAns;
                                            return (
                                                <OptionRow
                                                    key={i}
                                                    label={label}
                                                    text={opt}
                                                    isCorrect={isCorrect}
                                                    isChosen={optLower === studentAns}
                                                    isWrong={isWrong}
                                                />
                                            );
                                        })}
                                    </div>
                                )}

                                {/* Short / descriptive answer */}
                                {options.length === 0 && (
                                    <div className="space-y-3 mb-5">
                                        <div className="rounded-xl p-3 border"
                                            style={{ backgroundColor: "#fef2f2", borderColor: "#ef4444" }}>
                                            <p className="text-xs text-red-400 font-semibold mb-1">Your Answer</p>
                                            <p className="text-sm text-red-700 font-medium">
                                                {studentAns || <span className="italic text-gray-400">Not attempted</span>}
                                            </p>
                                        </div>
                                        <div className="rounded-xl p-3 border"
                                            style={{ backgroundColor: "#f0fdf4", borderColor: "#22c55e" }}>
                                            <p className="text-xs text-green-600 font-semibold mb-1">Correct Answer</p>
                                            <p className="text-sm text-green-700 font-medium">{correctAns}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Answer summary pill */}
                                <div className="flex flex-wrap gap-3 mb-5 text-xs">
                                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                                        style={{ backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0" }}>
                                        <span className="text-green-500 font-bold">✓</span>
                                        <span className="text-green-700 font-semibold">Correct: </span>
                                        <span className="text-green-600">{correctAns || "—"}</span>
                                    </div>
                                    {qStatus !== "skipped" && (
                                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                                            style={{
                                                backgroundColor: qStatus === "correct" ? "#f0fdf4" : "#fef2f2",
                                                border: `1px solid ${qStatus === "correct" ? "#bbf7d0" : "#fecaca"}`,
                                            }}>
                                            <span style={{ color: qStatus === "correct" ? "#22c55e" : "#ef4444" }} className="font-bold">
                                                {qStatus === "correct" ? "✓" : "✗"}
                                            </span>
                                            <span style={{ color: qStatus === "correct" ? "#15803d" : "#b91c1c" }} className="font-semibold">
                                                You:
                                            </span>
                                            <span style={{ color: qStatus === "correct" ? "#16a34a" : "#dc2626" }}>
                                                {studentAns || "—"}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Explanation */}
                                {currentQW.explanation && (
                                    <div className="rounded-xl p-4 border"
                                        style={{ backgroundColor: "#fffbeb", borderColor: "#fde68a" }}>
                                        <p className="text-xs font-bold text-amber-700 mb-1.5">💡 Explanation</p>
                                        <p className="text-sm text-amber-900 leading-relaxed">{currentQW.explanation}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ── Bottom Nav ── */}
                    <div className="bg-white border-t border-gray-200 px-4 py-3 flex items-center justify-between flex-shrink-0">
                        <button
                            onClick={() => setCurrent((p) => Math.max(0, p - 1))}
                            disabled={current === 0}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border text-sm font-medium disabled:opacity-40"
                            style={{ borderColor: color, color }}>
                            ← Prev
                        </button>

                        <span className="text-xs text-gray-400">
                            <strong style={{ color }}>{current + 1}</strong> / {qwise.length}
                        </span>

                        <button
                            onClick={() => setCurrent((p) => Math.min(qwise.length - 1, p + 1))}
                            disabled={current === qwise.length - 1}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-sm font-medium disabled:opacity-40"
                            style={{ backgroundColor: color }}>
                            Next →
                        </button>
                    </div>
                </div>

                {/* ── Right Palette ── */}
                <div className="w-56 bg-white border-l border-gray-200 flex flex-col flex-shrink-0 hidden sm:flex">

                    {/* Filter tabs */}
                    <div className="p-3 border-b border-gray-100">
                        <div className="flex gap-1 p-1 bg-gray-100 rounded-xl">
                            {[
                                { value: "all", label: "All" },
                                { value: "correct", label: "✓" },
                                { value: "wrong", label: "✗" },
                                { value: "skipped", label: "—" },
                            ].map((f) => (
                                <button key={f.value} onClick={() => setFilter(f.value)}
                                    className="flex-1 py-1 rounded-lg text-xs font-semibold transition-all"
                                    style={
                                        filter === f.value
                                            ? { backgroundColor: "#fff", color, boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }
                                            : { color: "#9ca3af" }
                                    }>
                                    {f.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Dots */}
                    <div className="flex-1 overflow-y-auto p-3">
                        <div className="flex flex-wrap gap-1.5">
                            {(filter === "all" ? qwise : qwise.filter((q) => q.status === filter))
                                .map((qw, displayIdx) => {
                                    const realIdx = filter === "all"
                                        ? displayIdx
                                        : qwise.findIndex((q, i) => q.status === filter && i >= (displayIdx === 0 ? 0 : qwise.findIndex((qq, ii) => qq.status === filter && ii > -1)));

                                    // Simpler: always show all, filtered by filter
                                    return null;
                                })}
                            {qwise.map((qw, idx) => {
                                if (filter !== "all" && qw.status !== filter) return null;
                                return (
                                    <PDot
                                        key={idx}
                                        index={idx}
                                        status={qw.status}
                                        active={current === idx}
                                        onClick={() => setCurrent(idx)}
                                    />
                                );
                            })}
                        </div>
                    </div>

                    {/* Legend */}
                    <div className="p-3 border-t border-gray-100 space-y-1.5">
                        {[
                            { color: "#22c55e", bg: "#f0fdf4", label: `Correct (${counts.correct})` },
                            { color: "#ef4444", bg: "#fef2f2", label: `Wrong (${counts.wrong})` },
                            { color: "#6b7280", bg: "#f9fafb", label: `Skipped (${counts.skipped})` },
                        ].map((l) => (
                            <div key={l.label} className="flex items-center gap-2 text-xs text-gray-500">
                                <div className="w-4 h-4 rounded border-2 flex-shrink-0"
                                    style={{ backgroundColor: l.bg, borderColor: l.color }} />
                                {l.label}
                            </div>
                        ))}
                    </div>

                    {/* Score summary */}
                    <div className="p-3 border-t border-gray-100">
                        <div className="rounded-xl p-3 text-center"
                            style={{ backgroundColor: color + "0d", border: `1px solid ${color}25` }}>
                            <p className="text-xs text-gray-400 mb-0.5">Final Score</p>
                            <p className="text-lg font-bold" style={{ color }}>
                                {attempt.scored}/{attempt.totalMarks}
                            </p>
                            <p className="text-xs font-semibold" style={{ color }}>
                                {attempt.percentage}%
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}