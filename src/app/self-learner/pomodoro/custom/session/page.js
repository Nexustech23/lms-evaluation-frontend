"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Clock, CheckCircle2, Coffee, BookOpen } from "lucide-react";
import axios from "axios";

// const API_BASE = "http://localhost:5050";
const API_BASE = "http://103.192.198.186:5051";

function SessionContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Configuration
  const title = searchParams.get("title") || "Custom Pomodoro";
  const studyTime = parseInt(searchParams.get("studyTime") || "25");
  const breakTime = parseInt(searchParams.get("breakTime") || "5");
  const noOfSessions = parseInt(searchParams.get("noOfSessions") || "4");

  // State: 'not_started', 'studying', 'break', 'evaluation'
  const [sessionState, setSessionState] = useState("not_started");
  const [currentSessionIndex, setCurrentSessionIndex] = useState(0);

  // Timers (in seconds)
  const studyTimeSecs = studyTime * 60;
  const breakTimeSecs = breakTime * 60;

  const [timeLeft, setTimeLeft] = useState(studyTimeSecs);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (sessionState === "not_started" || sessionState === "evaluation" || isPaused) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [sessionState, currentSessionIndex, isPaused]);

  const handleTimeUp = () => {
    if (sessionState === "studying") {
      if (currentSessionIndex < noOfSessions - 1) {
        setSessionState("break");
        setTimeLeft(breakTimeSecs);
      } else {
        setSessionState("evaluation");
      }
    } else if (sessionState === "break") {
      setCurrentSessionIndex(prev => prev + 1);
      setSessionState("studying");
      setTimeLeft(studyTimeSecs);
    }
  };

  const handleManualSkip = () => {
    handleTimeUp();
  };

  const handleTogglePause = () => {
    setIsPaused(prev => !prev);
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleStartSession = async () => {
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
    } catch (err) {
      console.warn("Fullscreen request failed", err);
    }
    setSessionState("studying");
  };

  const handleReturnToDashboard = async () => {
    const sessionId = searchParams.get("session_id");
    if (sessionId) {
      try {
        await axios.patch(
          `${API_BASE}/api/pomodoro/session/${sessionId}/complete`,
          { status: "completed", total_focused_mins: completedStudyMins },
          { withCredentials: true }
        );
      } catch (_) { }
    }
    if (document.fullscreenElement && document.exitFullscreen) {
      try { await document.exitFullscreen(); } catch (_) {}
    }
    router.push("/self-learner/pomodoro");
  };

  if (sessionState === "not_started") {
    return (
      <div className="fixed inset-0 z-50 bg-[#F5F7FB] flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl border shadow-lg p-10 max-w-lg w-full text-center">
          <div className="w-20 h-20 bg-violet-100 text-violet-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Clock size={40} />
          </div>
          <h2 className="text-3xl font-bold text-[#1E1B4B] mb-4">Ready for {title}?</h2>
          <p className="text-gray-600 mb-8 text-lg">
            This custom pomodoro session will launch in full-screen mode to help you stay free from distractions.
          </p>
          <button
            onClick={handleStartSession}
            className="bg-[#1E1B4B] text-white px-8 py-4 rounded-xl font-bold w-full hover:bg-opacity-90 transition shadow-lg text-lg"
          >
            Enter Full Screen & Start
          </button>
        </div>
      </div>
    );
  }

  // Calculate total time completed for evaluation
  const completedStudyMins = (currentSessionIndex + (sessionState === 'evaluation' ? 1 : 0)) * studyTime;

  return (
    <div className="fixed inset-0 z-50 bg-[#F5F7FB] flex flex-col overflow-auto">
      {/* Top Header */}
      <header className="bg-white border-b px-6 py-4 flex justify-between items-center shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-[#1E1B4B] capitalize">{title}</h1>
          <p className="text-sm text-gray-500 mt-1 font-medium">
            {sessionState === "evaluation"
              ? "Session Complete"
              : `Session ${currentSessionIndex + 1} of ${noOfSessions} — ${sessionState === 'studying' ? 'Focus Time' : 'Break Time'}`}
          </p>
        </div>

        {sessionState !== "evaluation" && (
          <div className="flex items-center gap-4">
            <button
              onClick={handleTogglePause}
              className="bg-gray-100 text-gray-700 px-6 py-3 rounded-xl text-sm font-semibold hover:bg-gray-200 transition"
            >
              {isPaused ? "Resume" : "Pause"}
            </button>
            <button
              onClick={handleManualSkip}
              className="bg-[#1E1B4B] text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-opacity-90 transition shadow-md"
            >
              Skip
            </button>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-6 flex flex-col items-center justify-center gap-6">

        {sessionState === "studying" && (
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-12 w-full flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-300 py-24">
            <div className="p-4 bg-violet-100 rounded-2xl text-violet-600 mb-8">
              <BookOpen size={48} />
            </div>
            <h2 className="text-3xl font-bold mb-4 text-[#1E1B4B]">Focus Time</h2>
            <p className="text-gray-500 mb-10 text-lg">Stay completely focused on your task.</p>

            <div className="text-8xl font-black text-violet-600 font-mono tracking-tighter tabular-nums drop-shadow-sm">
              {formatTime(timeLeft)}
            </div>
          </div>
        )}

        {sessionState === "break" && (
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-12 w-full flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-300 py-24">
            <div className="p-4 bg-green-100 rounded-2xl text-green-600 mb-8">
              <Coffee size={48} />
            </div>
            <h2 className="text-3xl font-bold mb-4 text-[#1E1B4B]">Take a Break</h2>
            <p className="text-gray-500 mb-10 text-lg">Relax, stretch, and grab some water.</p>

            <div className="text-8xl font-black text-green-600 font-mono tracking-tighter tabular-nums drop-shadow-sm">
              {formatTime(timeLeft)}
            </div>
          </div>
        )}

        {sessionState === "evaluation" && (
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-12 w-full flex flex-col items-center justify-center text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 shadow-sm">
              <CheckCircle2 size={48} />
            </div>
            <h2 className="text-4xl font-extrabold text-[#1E1B4B] mb-4">You Did It!</h2>
            <p className="text-gray-600 max-w-lg mb-10 text-lg font-medium">
              You've successfully completed all {noOfSessions} Pomodoro sessions for <span className="text-[#1E1B4B] font-bold">"{title}"</span>. Great job staying focused.
            </p>

            <div className="grid grid-cols-2 gap-6 w-full max-w-md mb-10">
              <div className="bg-[#FAFBFF] p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wider">Total Sessions</div>
                <div className="text-4xl font-black text-violet-600">{noOfSessions}</div>
              </div>
              <div className="bg-[#FAFBFF] p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wider">Total Study Time</div>
                <div className="text-4xl font-black text-violet-600">{completedStudyMins} <span className="text-xl font-bold text-violet-400">min</span></div>
              </div>
            </div>

            <button
              onClick={handleReturnToDashboard}
              className="bg-[#1E1B4B] text-white px-10 py-4 rounded-xl font-bold hover:bg-opacity-90 transition shadow-lg flex items-center gap-2 text-lg"
            >
              Exit & Return to Dashboard
            </button>
          </div>
        )}

      </main>
    </div>
  );
}

export default function SessionPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#F5F7FB]">Loading Custom Session...</div>}>
      <SessionContent />
    </Suspense>
  );
}
