"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, BookOpen, Clock, Target, ArrowRight, Activity, Calendar, Trash2 } from "lucide-react";
import { getRoadmaps, deleteRoadmap } from "./api";
import RoadmapHeader from "./components/RoadmapHeader";

export default function RoadmapsListPage() {
  const router = useRouter();
  const [roadmaps, setRoadmaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const list = await getRoadmaps();
        setRoadmaps(list);
      } catch (err) {
        console.error("Failed to load roadmaps", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleDelete = async (e, roadmapId, subject) => {
    e.stopPropagation();
    if (!window.confirm(`Delete the "${subject}" roadmap? This can't be undone.`)) return;

    setDeletingId(roadmapId);
    try {
      await deleteRoadmap(roadmapId);
      setRoadmaps((prev) => prev.filter((r) => (r._id || r.id) !== roadmapId));
    } catch (err) {
      console.error("Failed to delete roadmap", err);
      alert("Failed to delete roadmap. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  const getUnlockedWeeksCount = (r) => {
    return (r.unlockedWeeks || [1]).length;
  };

  const getCompletedSubtopicsCount = (r) => {
    return (r.progress?.completedSubtopics || []).length;
  };

  return (
    <div className="min-h-screen bg-[#F5F7FB] p-4 md:p-6 text-slate-800">
      <RoadmapHeader
        title="My Learning Roadmaps"
        subtitle="Manage and track your personalized learning paths. You can generate multiple roadmaps for different subjects."
        showReset={false}
      />

      <div className="max-w-6xl mx-auto space-y-6">

        {/* Create new CTA Bar */}
        <div className="flex justify-between items-center bg-white rounded-2xl border border-[#E2E8F0] shadow-[0_1px_3px_rgba(22,31,76,0.06),0_4px_12px_rgba(22,31,76,0.04)] px-6 py-4 gap-4">
          <div>
            <h3 className="text-sm font-black text-[#161F4C]">Need to learn a new skill?</h3>
            <p className="text-xs font-semibold text-[#475569] mt-0.5">Generate a custom structured curriculum path in seconds.</p>
          </div>
          <button
            onClick={() => router.push("/self-learner/roadmap/create")}
            className="flex items-center justify-center gap-1.5 bg-[#161F4C] hover:bg-[#252F6B] text-white h-[42px] px-5 rounded-xl text-xs font-semibold shadow-sm transition-colors duration-200 shrink-0"
          >
            <Plus size={14} />
            Create Roadmap
          </button>
        </div>

        {/* Loading display */}
        {loading ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-[#E2E8F0] shadow-[0_1px_3px_rgba(22,31,76,0.06),0_4px_12px_rgba(22,31,76,0.04)] font-bold text-sm text-gray-500">
            Loading your learning paths...
          </div>
        ) : roadmaps.length === 0 ? (
          /* Empty state */
          <div className="text-center py-20 bg-white rounded-2xl border border-[#E2E8F0] shadow-[0_1px_3px_rgba(22,31,76,0.06),0_4px_12px_rgba(22,31,76,0.04)] space-y-4">
            <div className="w-16 h-16 bg-[#F0EEFF] text-[#6C63FF] rounded-full flex items-center justify-center mx-auto">
              <BookOpen size={28} />
            </div>
            <div>
              <h4 className="text-base font-black text-[#161F4C]">No Roadmaps Generated Yet</h4>
              <p className="text-xs font-semibold text-[#475569] mt-1 max-w-sm mx-auto leading-relaxed">
                Provide a subject prompt like &quot;Python&quot; or &quot;Data Structures&quot; to build your first tailored study path.
              </p>
            </div>
            <button
              onClick={() => router.push("/self-learner/roadmap/create")}
              className="inline-flex items-center justify-center gap-1.5 bg-[#161F4C] hover:bg-[#252F6B] text-white h-[44px] px-6 rounded-xl text-xs font-semibold shadow-sm transition-colors duration-200"
            >
              Get Started
            </button>
          </div>
        ) : (
          /* Grid of Roadmaps */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {roadmaps.map((r) => {
              const roadmapId = r._id || r.id;
              const overallProg = r.progress?.overallProgress || 0;
              const isUserActive = r.active;

              return (
                <div
                  key={roadmapId}
                  onClick={() => router.push(`/self-learner/roadmap/${roadmapId}`)}
                  className={`bg-white rounded-2xl border cursor-pointer hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden flex flex-col justify-between px-[22px] py-5 min-h-[240px] ${isUserActive
                      ? "border-[#6C63FF]/50 shadow-md ring-1 ring-[#6C63FF]/20"
                      : "border-[#E2E8F0] shadow-[0_1px_3px_rgba(22,31,76,0.06)] hover:border-[#CBD5E1] hover:shadow-md"
                    }`}
                >
                  {/* Active Indicator Top Tag */}
                  {isUserActive && (
                    <div className="absolute top-0 right-6 bg-[#6C63FF] text-white text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-b-lg">
                      Active
                    </div>
                  )}

                  {/* Delete button */}
                  <button
                    onClick={(e) => handleDelete(e, roadmapId, r.subject)}
                    disabled={deletingId === roadmapId}
                    aria-label="Delete roadmap"
                    className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-[#FF6584] hover:bg-[#FFF0F3] transition-all duration-200 disabled:opacity-40"
                  >
                    <Trash2 size={15} />
                  </button>

                  <div>
                    {/* Meta info */}
                    <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block pr-12 truncate">
                      {r.goal}
                    </span>
                    <h3 className="text-lg font-black text-[#161F4C] mt-1 leading-snug truncate pr-12">
                      {r.subject}
                    </h3>

                    {/* Progress details */}
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div className="flex items-center gap-2 text-xs font-semibold text-[#475569]">
                        <Activity size={14} className="text-[#43C6AC] shrink-0" />
                        <span>Week {getUnlockedWeeksCount(r)}/{r.weeks?.length || 1} Unlocked</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-semibold text-[#475569]">
                        <Clock size={14} className="text-[#FF6584] shrink-0" />
                        <span>{r.daily_study_time || "1 Hour"} Daily</span>
                      </div>
                    </div>
                  </div>

                  {/* Progress Slider at bottom */}
                  <div className="space-y-3 mt-auto">
                    <div>
                      <div className="flex justify-between items-center text-[10px] font-bold text-gray-400 mb-1">
                        <span>OVERALL PROGRESS</span>
                        <span className="text-[#6C63FF]">{overallProg}%</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#6C63FF] to-[#43C6AC] rounded-full transition-all duration-500"
                          style={{ width: `${overallProg}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-[#EEF2F7]">
                      <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1">
                        <Calendar size={10} />
                        {getCompletedSubtopicsCount(r)} topics read
                      </span>
                      <span className="text-xs font-extrabold text-[#6C63FF] hover:text-[#161F4C] flex items-center gap-0.5 transition-all duration-200">
                        Resume Study
                        <ArrowRight size={12} className="mt-0.5" />
                      </span>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
