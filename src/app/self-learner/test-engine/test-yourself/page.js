"use client";

import React, { useState, useEffect, useContext, useCallback } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import { AuthContext } from "@/app/AuthContext";
import Spinner from "@/components/ui/Spinner";

// ─────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────

const DIFFICULTY_COLORS = {
  easy: "#22c55e",
  medium: "#f59e0b",
  hard: "#ef4444",
  mixed: "#8b5cf6",
};

const STATUS_CONFIG = {
  pending: { label: "Not Started", bg: "#f0fdf4", color: "#16a34a", border: "#bbf7d0" },
  submitted: { label: "Completed", bg: "#eff6ff", color: "#2563eb", border: "#bfdbfe" },
  archived: { label: "Archived", bg: "#f9fafb", color: "#6b7280", border: "#e5e7eb" },
};

// ─────────────────────────────────────────────────────────────
// TestCard
// ─────────────────────────────────────────────────────────────

function TestCard({ test, color, onAttempt, onDelete }) {
  const status = STATUS_CONFIG[test.status] || STATUS_CONFIG.pending;
  const diffColor = DIFFICULTY_COLORS[test.difficulty] || "#8b5cf6";
  const isScheduled = test.scheduleDate && new Date(test.scheduleDate) > new Date();

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
      <div className="h-1.5 w-full" style={{ backgroundColor: diffColor }} />
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="min-w-0">
            <h3 className="text-base font-bold text-gray-900 truncate">
              {test.subjectName || "Untitled Test"}
            </h3>
            {test.topic && (
              <p className="text-xs text-gray-400 mt-0.5 truncate">📌 {test.topic}</p>
            )}
          </div>
          <span className="flex-shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full"
            style={{ backgroundColor: status.bg, color: status.color, border: `1px solid ${status.border}` }}>
            {status.label}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            { icon: "❓", label: "Questions", value: test.questionCount },
            { icon: "⏱️", label: "Duration", value: `${test.duration}m` },
            { icon: "🏆", label: "Marks", value: test.totalMarks },
          ].map((s) => (
            <div key={s.label} className="rounded-xl p-2.5 text-center"
              style={{ backgroundColor: color + "08" }}>
              <p className="text-base">{s.icon}</p>
              <p className="text-sm font-bold text-gray-800">{s.value}</p>
              <p className="text-xs text-gray-400">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-1.5 mb-4">
          <span className="text-xs px-2 py-0.5 rounded-full font-medium"
            style={{ backgroundColor: diffColor + "18", color: diffColor }}>
            {test.difficulty?.charAt(0).toUpperCase() + test.difficulty?.slice(1)}
          </span>
          {test.negativeMarking && (
            <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-red-50 text-red-500">
              −{test.negativeMarks} neg
            </span>
          )}
          {test.questionTypes?.slice(0, 2).map((qt) => (
            <span key={qt} className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 capitalize">
              {qt.replace(/_/g, " ")}
            </span>
          ))}
          {test.questionTypes?.length > 2 && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
              +{test.questionTypes.length - 2} more
            </span>
          )}
        </div>

        {isScheduled && (
          <div className="mb-3 rounded-xl px-3 py-2 text-xs text-amber-700 bg-amber-50 border border-amber-100">
            📅 Scheduled: {new Date(test.scheduleDate).toLocaleString()}
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={() => onAttempt(test._id)}
            disabled={isScheduled}
            className="flex-1 py-2 rounded-xl text-white text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: isScheduled ? "#9ca3af" : color }}>
            {test.status === "submitted" ? "Attempt Again" : "Start Test →"}
          </button>
          <button
            onClick={() => onDelete(test._id)}
            className="px-3 py-2 rounded-xl border border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-200 text-sm transition-all">
            🗑
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Empty State
// ─────────────────────────────────────────────────────────────

function EmptyListState({ color, onCreate }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl mb-5"
        style={{ backgroundColor: color + "15" }}>📝</div>
      <h3 className="text-lg font-bold text-gray-800 mb-2">No tests yet</h3>
      <p className="text-sm text-gray-400 mb-6 max-w-xs leading-relaxed">
        Create your first practice test and start preparing smarter with AI-generated questions.
      </p>
      <button onClick={onCreate}
        className="px-6 py-2.5 text-white rounded-xl font-semibold text-sm shadow-md"
        style={{ backgroundColor: color }}>
        + Create Your First Test
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────

export default function TestYourselfList() {
  const { user } = useContext(AuthContext);
  const router = useRouter();
  const color = user?.color || "#9b1b30";

  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [deleteId, setDeleteId] = useState(null);

  const fetchTests = useCallback(async () => {
    try {
      const res = await axios.get("/api/mock-tests", { withCredentials: true });
      setTests(res.data.tests || []);
    } catch {
      toast.error("Failed to load tests.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTests();
  }, [fetchTests]);

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await axios.delete(`/api/mock-tests/${deleteId}`, { withCredentials: true });
      toast.success("Test deleted.");
      setTests((p) => p.filter((t) => t._id !== deleteId));
    } catch {
      toast.error("Failed to delete test.");
    } finally {
      setDeleteId(null);
    }
  };

  const filtered = filter === "all" ? tests : tests.filter((t) => t.status === filter);
  const counts = {
    all: tests.length,
    pending: tests.filter((t) => t.status === "pending").length,
    submitted: tests.filter((t) => t.status === "submitted").length,
  };

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: color }}>
      <div className="flex-1 p-4 sm:p-6">

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm px-5 py-4 flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-xl font-bold" style={{ color }}>Evaluate Yourself</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {tests.length} test{tests.length !== 1 ? "s" : ""} created
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex gap-1 p-1 bg-gray-100 rounded-xl">
              {[
                { value: "all", label: `All (${counts.all})` },
                { value: "pending", label: `New (${counts.pending})` },
                { value: "submitted", label: `Done (${counts.submitted})` },
              ].map((tab) => (
                <button key={tab.value} onClick={() => setFilter(tab.value)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                  style={
                    filter === tab.value
                      ? { backgroundColor: "#fff", color, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }
                      : { color: "#9ca3af" }
                  }>
                  {tab.label}
                </button>
              ))}
            </div>
            <button
              onClick={() => router.push("/self-learner/test-engine/create-test")}
              className="px-4 py-2 text-white rounded-xl text-sm font-semibold shadow-sm"
              style={{ backgroundColor: color }}>
              + New Test
            </button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="bg-white rounded-2xl p-10 flex flex-col items-center gap-4 shadow-xl">
              <Spinner />
              <p className="text-sm text-gray-400">Loading your tests…</p>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm">
            <EmptyListState
              color={color}
              onCreate={() => router.push("/self-learner/test-engine/create-test")}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((test) => (
              <TestCard
                key={test._id}
                test={test}
                color={color}
                onAttempt={(id) => router.push(`/self-learner/test-engine/test-yourself/${id}`)}
                onDelete={(id) => setDeleteId(id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirm Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center">
            <p className="text-3xl mb-3">🗑️</p>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Delete this test?</h3>
            <p className="text-sm text-gray-400 mb-5">
              This action cannot be undone. All data for this test will be permanently deleted.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)}
                className="flex-1 py-2 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium">
                Cancel
              </button>
              <button onClick={confirmDelete}
                className="flex-1 py-2 rounded-xl bg-red-500 text-white text-sm font-semibold">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}