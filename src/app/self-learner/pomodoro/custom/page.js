"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
import axios from "axios";

// const API_BASE = "http://localhost:5050";
const API_BASE = "http://103.192.198.186:5051";

export default function CustomPomodoroPage() {
  const router = useRouter();

  const [title, setTitle]               = useState("");
  const [studyTime, setStudyTime]       = useState(25);
  const [breakTime, setBreakTime]       = useState(5);
  const [noOfSessions, setNoOfSessions] = useState(4);
  const [loading, setLoading]           = useState(false);

  const handleCreatePomodoro = async () => {
    if (!title.trim()) {
      toast.error("Please enter a session title.");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(
        `${API_BASE}/api/pomodoro/custom/create`,
        {
          title,
          study_time_mins: Number(studyTime),
          break_time_mins: Number(breakTime),
          num_sessions:    Number(noOfSessions),
        },
        { withCredentials: true }
      );

      const { session_id } = res.data;
      
      router.push(`/self-learner/pomodoro/custom/session?session_id=${session_id}&title=${encodeURIComponent(title)}&studyTime=${studyTime}&breakTime=${breakTime}&noOfSessions=${noOfSessions}`);

    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.error || "Failed to create session.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FB] p-4 md:p-6">
      <div className="max-w-5xl mx-auto bg-white rounded-3xl border border-gray-200 shadow-sm p-5 md:p-8">

        {/* Header */}
        <div className="mb-7">
          <h1 className="text-2xl md:text-3xl font-bold text-[#1E1B4B]">
            Create Custom Pomodoro
          </h1>
          <p className="text-sm text-gray-600 mt-2 font-medium">
            Set up your own manual study and break timers. No AI involved.
          </p>
        </div>

        {/* Configurations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-8">
          
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-[#1E1B4B] mb-2">Session Title</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Math Homework, Reading Chapter 4"
              className="w-full border border-gray-200 rounded-2xl bg-[#FAFBFF] p-4 text-sm text-[#1E1B4B] outline-none focus:ring-2 focus:ring-violet-400" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#1E1B4B] mb-2">Study Time (mins)</label>
            <input type="number" value={studyTime} onChange={(e) => setStudyTime(e.target.value)}
              className="w-full border border-gray-200 rounded-2xl bg-[#FAFBFF] p-4 text-sm text-[#1E1B4B] outline-none focus:ring-2 focus:ring-violet-400" min="1" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#1E1B4B] mb-2">Break Time (mins)</label>
            <input type="number" value={breakTime} onChange={(e) => setBreakTime(e.target.value)}
              className="w-full border border-gray-200 rounded-2xl bg-[#FAFBFF] p-4 text-sm text-[#1E1B4B] outline-none focus:ring-2 focus:ring-violet-400" min="1" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#1E1B4B] mb-2">Number of Sessions</label>
            <input type="number" value={noOfSessions} onChange={(e) => setNoOfSessions(e.target.value)}
              className="w-full border border-gray-200 rounded-2xl bg-[#FAFBFF] p-4 text-sm text-[#1E1B4B] outline-none focus:ring-2 focus:ring-violet-400" min="1" />
          </div>

        </div>

        {/* Submit Button */}
        <button
          onClick={handleCreatePomodoro}
          disabled={loading}
          className="w-full mt-8 h-14 rounded-2xl bg-[#1E1B4B] text-white text-sm font-semibold hover:bg-opacity-90 transition shadow-sm disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? <><Loader2 size={18} className="animate-spin" /> Creating...</> : "Start Custom Pomodoro"}
        </button>

      </div>
    </div>
  );
}