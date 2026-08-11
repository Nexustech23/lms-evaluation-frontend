"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Play, Award, CheckCircle, HelpCircle, Lock, AlertCircle } from "lucide-react";
import { fetchQuizHistory, getRoadmapById } from "../api";
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

  // Check level status helper
  const getLevelStatus = (lvl) => {
    const isUnlocked = (roadmap.unlockedLevels || [1]).includes(lvl.level);
    if (!isUnlocked) return "Locked";
    
    const isPassed = roadmap.progress?.passedQuizzes?.[lvl.level] !== undefined;
    if (isPassed) return "Completed";
    
    return "In Progress";
  };

  // Get completed subtopics count for a specific level
  const getLevelCompletionCount = (lvl) => {
    let total = 0;
    let completed = 0;
    
    lvl.topics.forEach((topic, tIdx) => {
      topic.subtopics.forEach((sub) => {
        total++;
        const subKey = `${lvl.level}-${tIdx}-${sub.title}`;
        if ((roadmap.progress?.completedSubtopics || []).includes(subKey)) {
          completed++;
        }
      });
    });
    
    return { completed, total };
  };

  const handleSelectStage = (lvl) => {
    const status = getLevelStatus(lvl);
    if (status === "Locked") {
      alert("🔒 This Stage is locked! Complete preceding stages and pass their quizzes to unlock.");
      return;
    }
    // Route to dedicated study notes page
    router.push(`/self-learner/roadmap/${id}/notes?level=${lvl.level}`);
  };

  const handleLaunchQuiz = (levelNum) => {
    // Open the quiz page in a new tab as requested
    window.open(`/self-learner/roadmap/${id}/quiz?level=${levelNum}`, "_blank");
  };

  const handleReviewWeakTopic = (topicTitle) => {
    // Locate the topic level
    for (let lvl of roadmap.levels) {
      if ((roadmap.unlockedLevels || [1]).includes(lvl.level)) {
        for (let tIdx = 0; tIdx < lvl.topics.length; tIdx++) {
          const t = lvl.topics[tIdx];
          const sub = t.subtopics.find((s) => s.title === topicTitle);
          if (sub) {
            router.push(`/self-learner/roadmap/${id}/notes?level=${lvl.level}&topic=${tIdx}`);
            return;
          }
        }
      }
    }
  };

  // Compute active roadmap stats percentages
  const getCompletedLevelsCount = () => {
    let count = 0;
    [1, 2, 3, 4].forEach((lvl) => {
      if (roadmap.progress?.passedQuizzes?.[lvl]) count++;
    });
    return count;
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
        </div>

        <RoadmapHeader
          title={`Subject: ${roadmap.subject}`}
          subtitle={`Goal: ${roadmap.goal} • Time Commitment: ${roadmap.daily_study_time || "1 Hour"} Daily`}
          showReset={false}
        />

        {/* Dynamic overall statistics dashboard component */}
        <RoadmapStats
          stats={roadmap.stats}
          progress={{
            overallProgress: roadmap.progress?.overallProgress || 0,
            topicsCompleted: (roadmap.progress?.completedSubtopics || []).length,
            quizzesPassed: Object.keys(roadmap.progress?.passedQuizzes || {}).length,
          }}
        />

        {/* Dashboard layouts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Left Grid: Curriculum Board stages (Snapshot 1 horizontal cards) */}
          <div className="lg:col-span-2 space-y-6">
            
            <div className="bg-[#F5F7FB] rounded-2xl">
              <h3 className="text-sm font-black text-[#1E1B4B] uppercase tracking-wider mb-4 pl-1">
                Curriculum Board Stages
              </h3>

              {/* Stage cards horizontal/grid wrap matching Snapshot 1 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {roadmap.levels.map((lvl) => {
                  const status = getLevelStatus(lvl);
                  const { completed, total } = getLevelCompletionCount(lvl);
                  const isFullyLearned = completed === total && total > 0;
                  const quizPassed = roadmap.progress?.passedQuizzes?.[lvl.level] !== undefined;

                  // Define cards styling depending on stage lock status
                  let borderStyle = "border-gray-200 shadow-xs hover:border-gray-300 bg-white";
                  let topColor = "bg-gray-300";
                  let badgeStyle = "";
                  
                  if (status === "Completed") {
                    borderStyle = "border-emerald-200 bg-white shadow-xs hover:border-emerald-300";
                    topColor = "bg-[#43C6AC]";
                    badgeStyle = "bg-[#EDFAF5] text-[#43C6AC]";
                  } else if (status === "In Progress") {
                    borderStyle = "border-indigo-200 bg-white shadow-sm hover:border-indigo-300 hover:shadow-md";
                    topColor = "bg-[#6C63FF]";
                    badgeStyle = "bg-[#F0EEFF] text-[#6C63FF]";
                  } else {
                    // Locked
                    borderStyle = "border-gray-150 bg-gray-50/50 opacity-80 cursor-not-allowed";
                    topColor = "bg-gray-300";
                    badgeStyle = "bg-gray-100 text-gray-400";
                  }

                  return (
                    <div
                      key={lvl.level}
                      onClick={() => handleSelectStage(lvl)}
                      className={`relative rounded-3xl border p-5 overflow-hidden transition-all duration-300 flex flex-col justify-between h-[360px] ${borderStyle}`}
                    >
                      {/* Accent Top Line */}
                      <div className={`absolute top-0 left-0 right-0 h-1.5 ${topColor}`} />

                      <div>
                        {/* Meta info */}
                        <div className="flex justify-between items-start">
                          <span className={`text-[10px] font-black uppercase tracking-wider block ${status === "Locked" ? "text-gray-400" : "text-[#6C63FF]"}`}>
                            Stage {lvl.level}
                          </span>
                          {status === "Locked" && <Lock size={12} className="text-gray-400" />}
                        </div>

                        <h4 className="text-base font-black text-[#1E1B4B] mt-1 leading-snug">
                          {lvl.title}
                        </h4>

                        {/* Bullet point topics list exactly as Snapshot 1 */}
                        <div className="space-y-2 mt-4">
                          {lvl.topics.map((topic, tIdx) => (
                            <div
                              key={tIdx}
                              className="bg-[#FAFBFF] border border-gray-100 rounded-xl px-3 py-2.5 text-xs font-semibold text-gray-600 flex items-center justify-between"
                            >
                              <span className="truncate">• {topic.title}</span>
                              {status !== "Locked" && (
                                <span className="text-[10px] text-gray-400">
                                  {topic.subtopics.length} items
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Bottom Controls */}
                      <div className="pt-4 border-t border-gray-50 flex items-center justify-between mt-auto">
                        <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase ${badgeStyle}`}>
                          {status}
                        </span>

                        {/* If in progress and ready to take quiz */}
                        {status === "In Progress" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (isFullyLearned) {
                                handleLaunchQuiz(lvl.level);
                              } else {
                                handleSelectStage(lvl);
                              }
                            }}
                            className={`flex items-center gap-1 px-4 py-2 rounded-xl text-[10px] font-extrabold shadow-2xs transition-all duration-200 hover:scale-102 ${
                              isFullyLearned
                                ? "bg-[#1E1B4B] text-white hover:bg-black"
                                : "bg-indigo-50 text-[#6C63FF] hover:bg-indigo-100"
                            }`}
                          >
                            {isFullyLearned ? "Take Stage Quiz" : "Study Topics"}
                          </button>
                        )}

                        {status === "Completed" && (
                          <span className="text-[10px] font-bold text-gray-400">
                            Passed ({roadmap.progress?.passedQuizzes?.[lvl.level]}%)
                          </span>
                        )}
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
              streakDays={roadmap.progress?.streakDays || 7}
              completedLevelsCount={getCompletedLevelsCount()}
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
                  No quiz attempts yet. Complete a stage quiz to see attempts here.
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
                          Stage {attempt.level}
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
