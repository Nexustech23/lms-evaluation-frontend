"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ChevronDown, Download, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { fetchQuizHistory, getRoadmapById, downloadRoadmapPdf } from "../api";
import RoadmapHeader from "../components/RoadmapHeader";
import RoadmapStats from "../components/RoadmapStats";
import StreakCard from "../components/StreakCard";
import RevisionPlanner from "../components/RevisionPlanner";
import WeakTopicCard from "../components/WeakTopicCard";

export default function RoadmapDetailsPage() {
  const router = useRouter();
  const { id } = useParams();

  const [roadmap, setRoadmap] = useState(null);
  const [quizHistory, setQuizHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [expandedWeeks, setExpandedWeeks] = useState(() => new Set());

  const loadRoadmap = async () => {
    try {
      const [data, historyData] = await Promise.all([
        getRoadmapById(id),
        fetchQuizHistory(id),
      ]);
      setRoadmap(data);
      setQuizHistory(historyData.history || []);
    } catch (err) {
      console.error("Failed to load roadmap details", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) loadRoadmap();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F7FB] p-6 text-center font-bold text-gray-500 py-40">
        Loading curriculum details...
      </div>
    );
  }

  if (!roadmap) {
    return (
      <div className="min-h-screen bg-[#F5F7FB] p-6 text-center py-40 space-y-4">
        <h3 className="text-lg font-black text-red-500">Roadmap Not Found</h3>
        <button
          onClick={() => router.push("/self-learner/roadmap")}
          className="bg-[#1E1B4B] text-white px-5 py-2.5 rounded-xl font-bold text-xs"
        >
          Return to List
        </button>
      </div>
    );
  }

  const weeks = roadmap.weeks || [];

  // Check week status helper.
  // The roadmap itself is never locked visually — every week's title,
  // description and subtopics are always visible here. Access control
  // (unlockedWeeks[]) is only enforced when the student tries to actually
  // enter the Learning Lounge for a week, see handleSelectWeek below.
  const getWeekStatus = (wk) => {
    const isPassed = roadmap.progress?.passedQuizzes?.[wk.week] !== undefined;
    if (isPassed) return "Completed";

    const isUnlocked = (roadmap.unlockedWeeks || [1]).includes(wk.week);
    return isUnlocked ? "In Progress" : "Upcoming";
  };

  // Get completed subtopics count for a specific week
  const getWeekCompletionCount = (wk) => {
    let total = 0;
    let completed = 0;

    (wk.subtopics || []).forEach((sub, sIdx) => {
      total++;
      const subKey = `${wk.week}-${sIdx}-${sub.title}`;
      if ((roadmap.progress?.completedSubtopics || []).includes(subKey)) {
        completed++;
      }
    });

    return { completed, total };
  };

  const handleSelectWeek = (wk) => {
    const isUnlocked = (roadmap.unlockedWeeks || [1]).includes(wk.week);
    if (!isUnlocked) {
      toast.error(`Complete Week ${wk.week - 1} and pass its quiz to unlock Week ${wk.week}.`);
      return;
    }
    router.push(`/self-learner/learning-lounge?roadmapId=${id}&week=${wk.week}`);
  };

  const toggleWeekExpanded = (weekNum) => {
    setExpandedWeeks((prev) => {
      const next = new Set(prev);
      if (next.has(weekNum)) next.delete(weekNum);
      else next.add(weekNum);
      return next;
    });
  };

  const handleLaunchQuiz = () => {
    router.push(`/self-learner/self-review/week-quiz?roadmapId=${id}`);
  };

  const handleReviewWeakTopic = (topicTitle) => {
    for (const wk of weeks) {
      if (!(roadmap.unlockedWeeks || [1]).includes(wk.week)) continue;
      const sub = (wk.subtopics || []).find((s) => s.title === topicTitle);
      if (sub) {
        router.push(`/self-learner/learning-lounge?roadmapId=${id}&week=${wk.week}`);
        return;
      }
    }
  };

  const getCompletedWeeksCount = () => {
    return weeks.filter((wk) => roadmap.progress?.passedQuizzes?.[wk.week] !== undefined).length;
  };

  const allWeeksCompleted = weeks.length > 0 && weeks.every((wk) => getWeekStatus(wk) === "Completed");

  const handleDownloadPdf = async () => {
    if (downloadingPdf) return;
    setDownloadingPdf(true);
    try {
      await downloadRoadmapPdf(id);
    } catch (err) {
      console.error("Failed to download roadmap PDF", err);
      alert("Failed to download PDF. Please try again.");
    } finally {
      setDownloadingPdf(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FB] p-4 md:p-6 text-slate-800 animate-fadeIn">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Navigation and Header */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => router.push("/self-learner/roadmap")}
            className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-[#6C63FF] transition-all duration-200"
          >
            <ArrowLeft size={14} /> Back to all roadmaps
          </button>

          <button
            onClick={handleDownloadPdf}
            disabled={downloadingPdf}
            className="flex items-center gap-1.5 bg-white border border-gray-200 text-[#1E1B4B] px-4 py-2 rounded-xl text-xs font-bold shadow-xs hover:border-[#6C63FF]/40 hover:text-[#6C63FF] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {downloadingPdf ? (
              <><Loader2 size={13} className="animate-spin" /> Preparing PDF…</>
            ) : (
              <><Download size={13} /> Download PDF</>
            )}
          </button>
        </div>

        <RoadmapHeader
          title={`Subject: ${roadmap.subject}`}
          subtitle={`Goal: ${roadmap.goal} • Time Commitment: ${roadmap.daily_study_time || "1 Hour"} Daily`}
          showReset={false}
        />

        {/* Dynamic overall statistics dashboard component */}
        <RoadmapStats
          stats={{ ...roadmap.stats, totalQuizzes: roadmap.weeks?.length || 0 }}
          progress={{
            overallProgress: roadmap.progress?.overallProgress || 0,
            topicsCompleted: (roadmap.progress?.completedSubtopics || []).length,
            quizzesPassed: Object.keys(roadmap.progress?.passedQuizzes || {}).length,
          }}
        />

        {/* Dashboard layouts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

          {/* Left: vertical weekly journey */}
          <div className="lg:col-span-2 space-y-6">

            <div className="bg-[#F5F7FB] rounded-2xl">
              <h3 className="text-sm font-black text-[#1E1B4B] uppercase tracking-wider mb-4 pl-1">
                Your Learning Journey
              </h3>

              {allWeeksCompleted && (
                <div className="bg-white rounded-3xl border border-[#43C6AC]/30 shadow-xs p-6 text-center mb-4">
                  <p className="text-sm font-black text-[#1E1B4B]">Roadmap Complete! 🎉</p>
                  <p className="text-xs font-semibold text-gray-500 mt-1">
                    You've passed every week's quiz. Great work!
                  </p>
                </div>
              )}

              <div className="space-y-4">
                {weeks.map((wk) => {
                  const status = getWeekStatus(wk);
                  const { completed, total } = getWeekCompletionCount(wk);
                  const isFullyLearned = completed === total && total > 0;
                  const isExpanded = expandedWeeks.has(wk.week);

                  let borderStyle = "border-gray-200 shadow-xs hover:border-gray-300 bg-white";
                  let leftColor = "bg-gray-300";
                  let badgeStyle = "";
                  let weekLabelColor = "text-[#6C63FF]";

                  if (status === "Completed") {
                    borderStyle = "border-emerald-200 bg-white shadow-xs hover:border-emerald-300";
                    leftColor = "bg-[#43C6AC]";
                    badgeStyle = "bg-[#EDFAF5] text-[#43C6AC]";
                  } else if (status === "In Progress") {
                    borderStyle = "border-indigo-200 bg-white shadow-sm hover:border-indigo-300 hover:shadow-md";
                    leftColor = "bg-[#6C63FF]";
                    badgeStyle = "bg-[#F0EEFF] text-[#6C63FF]";
                  } else {
                    // Upcoming — visible and browsable, just not enterable yet.
                    borderStyle = "border-gray-200 bg-white shadow-xs hover:border-gray-300";
                    leftColor = "bg-gray-300";
                    badgeStyle = "bg-gray-100 text-gray-500";
                    weekLabelColor = "text-gray-400";
                  }

                  return (
                    <div
                      key={wk.week}
                      onClick={() => toggleWeekExpanded(wk.week)}
                      className={`relative rounded-3xl border p-5 overflow-hidden transition-all duration-300 flex cursor-pointer ${borderStyle}`}
                    >
                      {/* Accent Left Line */}
                      <div className={`absolute top-0 left-0 bottom-0 w-1.5 ${leftColor}`} />

                      <div className="pl-3 flex-1">
                        <div className="flex justify-between items-center">
                          <span className={`text-[10px] font-black uppercase tracking-wider block ${weekLabelColor}`}>
                            Week {wk.week}
                          </span>
                          <ChevronDown
                            size={16}
                            className={`text-gray-400 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}
                          />
                        </div>

                        <h4 className="text-base font-black text-[#1E1B4B] mt-1 leading-snug">
                          {wk.title}
                        </h4>

                        {/* Collapsible description + subtopics — animated dropdown */}
                        <div
                          className={`grid transition-all duration-300 ease-in-out ${isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                            }`}
                        >
                          <div className="overflow-hidden">
                            {wk.introDescription && (
                              <p className="text-xs font-semibold text-gray-500 mt-1.5 leading-relaxed">
                                {wk.introDescription}
                              </p>
                            )}

                            {/* Subtopics list */}
                            <div className="space-y-2 mt-4">
                              {(wk.subtopics || []).map((sub, subIdx) => {
                                const subKey = `${wk.week}-${subIdx}-${sub.title}`;
                                const subDone = (roadmap.progress?.completedSubtopics || []).includes(subKey);
                                return (
                                  <div
                                    key={subIdx}
                                    className="bg-[#FAFBFF] border border-gray-100 rounded-xl px-3 py-2.5 text-xs font-semibold text-gray-600 flex items-center justify-between"
                                  >
                                    <span className="truncate">
                                      {subDone ? "✓ " : "• "}{sub.title}
                                    </span>
                                    <span className="text-[10px] text-gray-400">{sub.difficulty}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>

                        {/* Bottom Controls */}
                        <div className="pt-4 border-t border-gray-50 flex items-center justify-between mt-4">
                          <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase ${badgeStyle}`}>
                            {status}
                          </span>

                          {status === "In Progress" && isFullyLearned && (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSelectWeek(wk);
                                }}
                                className="flex items-center gap-1 px-4 py-2 rounded-xl text-[10px] font-extrabold shadow-2xs transition-all duration-200 hover:scale-102 bg-indigo-50 text-[#6C63FF] hover:bg-indigo-100"
                              >
                                Go to Learning Lounge
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleLaunchQuiz();
                                }}
                                className="flex items-center gap-1 px-4 py-2 rounded-xl text-[10px] font-extrabold shadow-2xs transition-all duration-200 hover:scale-102 bg-[#1E1B4B] text-white hover:bg-black"
                              >
                                Take Weekly Quiz
                              </button>
                            </div>
                          )}

                          {(status === "In Progress" && !isFullyLearned || status === "Upcoming") && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectWeek(wk);
                              }}
                              className="flex items-center gap-1 px-4 py-2 rounded-xl text-[10px] font-extrabold shadow-2xs transition-all duration-200 hover:scale-102 bg-indigo-50 text-[#6C63FF] hover:bg-indigo-100"
                            >
                              Go to Learning Lounge
                            </button>
                          )}

                          {status === "Completed" && (
                            <span className="text-[10px] font-bold text-gray-400">
                              Passed ({roadmap.progress?.passedQuizzes?.[wk.week]}%)
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>

          </div>

          {/* Right Sidebar widgets */}
          <div className="space-y-6">
            <StreakCard
              streakDays={roadmap.progress?.streakDays || 0}
              completedLevelsCount={getCompletedWeeksCount()}
              activityDates={roadmap.progress?.activityDates || []}
            />

            <RevisionPlanner initialFrequency={roadmap.revision_frequency} />

            <WeakTopicCard
              weakTopics={roadmap.progress?.weakTopics || []}
              onReviewTopic={handleReviewWeakTopic}
            />

            <div className="bg-white rounded-3xl border border-gray-200 p-5 shadow-xs">
              <h4 className="text-xs font-black text-[#1E1B4B] uppercase tracking-wider mb-4">
                Quiz History
              </h4>
              {quizHistory.length === 0 ? (
                <p className="text-xs font-semibold text-gray-500 leading-relaxed">
                  No quiz attempts yet. Complete a week quiz to see attempts here.
                </p>
              ) : (
                <div className="space-y-3">
                  {quizHistory.slice(0, 5).map((attempt, idx) => (
                    <div
                      key={`${attempt.submittedAt}-${idx}`}
                      className="border border-gray-100 rounded-2xl p-3 bg-[#FAFBFF]"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-gray-400 uppercase">
                          Week {attempt.week}
                        </span>
                        <span className={`text-[10px] font-black ${attempt.passed ? "text-[#43C6AC]" : "text-[#FF6584]"}`}>
                          {attempt.passed ? "Passed" : "Failed"}
                        </span>
                      </div>
                      <div className="flex items-end justify-between mt-1">
                        <span className="text-lg font-black text-[#1E1B4B]">{attempt.score}%</span>
                        <span className="text-[10px] font-bold text-gray-400">
                          {attempt.correctCount}/{attempt.totalQuestions} correct
                        </span>
                      </div>
                      {attempt.submittedAt && (
                        <p className="text-[10px] font-semibold text-gray-400 mt-1">
                          {new Date(attempt.submittedAt).toLocaleString()}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
