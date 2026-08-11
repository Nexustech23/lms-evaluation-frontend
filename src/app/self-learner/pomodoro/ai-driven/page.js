"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mic, Square, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";

// const API_BASE = "http://localhost:5050";
const API_BASE = "http://103.192.198.186:5051";
const POLL_INTERVAL = 3000;   // 3 seconds between polls
const POLL_TIMEOUT  = 180000; // 3 minutes max wait

export default function AIDrivenPomodoroPage() {
  const router = useRouter();

  const [prompt, setPrompt]             = useState("");
  const [isListening, setIsListening]   = useState(false);
  const [totalStudyTime, setTotalStudyTime] = useState(60);
  const [revisionTime, setRevisionTime] = useState(15);
  const [testDuration, setTestDuration] = useState(15);
  const [testFormat, setTestFormat]     = useState("mcq");
  const [noOfTests, setNoOfTests]       = useState(3);
  const [loading, setLoading]           = useState(false);
  const [statusMsg, setStatusMsg]       = useState("");

  // ── Voice input ─────────────────────────────────────────────
  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) { toast.error("Speech Recognition not supported"); return; }
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event) => {
      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setPrompt(transcript);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend   = () => setIsListening(false);
    recognition.start();
    window.recognitionRef = recognition;
  };

  const stopListening = () => {
    if (window.recognitionRef) window.recognitionRef.stop();
  };

  // ── Job poller ───────────────────────────────────────────────
  const pollJob = (jobId) => {
    return new Promise((resolve, reject) => {
      const start = Date.now();
      const interval = setInterval(async () => {
        try {
          if (Date.now() - start > POLL_TIMEOUT) {
            clearInterval(interval);
            reject(new Error("Generation timed out. Please try again."));
            return;
          }
          const res = await axios.get(
            `${API_BASE}/api/pomodoro/job/${jobId}`,
            { withCredentials: true }
          );
          const job = res.data;
          if (job.status === "done") {
            clearInterval(interval);
            resolve(job.session_id);
          } else if (job.status === "error") {
            clearInterval(interval);
            reject(new Error(job.message || "Generation failed"));
          } else {
            setStatusMsg("AI is generating your notes and tests...");
          }
        } catch (err) {
          clearInterval(interval);
          reject(err);
        }
      }, POLL_INTERVAL);
    });
  };

  // ── Main handler ─────────────────────────────────────────────
  const handleCreatePomodoro = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt to generate notes.");
      return;
    }
    setLoading(true);
    setStatusMsg("Submitting your request...");
    try {
      // 1. Send generation request
      const res = await axios.post(
        `${API_BASE}/api/pomodoro/ai-driven/generate`,
        {
          prompt,
          title:            `AI-Driven: ${prompt.slice(0, 50)}`,
          total_study_time: Number(totalStudyTime),
          revision_time:    Number(revisionTime),
          test_duration:    Number(testDuration),
          test_format:      testFormat,
          num_tests:        Number(noOfTests),
        },
        { withCredentials: true }
      );

      const { job_id } = res.data;
      setStatusMsg("AI is generating your notes and tests...");

      // 2. Poll until done
      const sessionId = await pollJob(job_id);

      // 3. Redirect to session page with session_id
      toast.success("Pomodoro session ready!");
      router.push(`/self-learner/pomodoro/ai-driven/session?session_id=${sessionId}`);

    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.error || err.message || "Something went wrong.");
    } finally {
      setLoading(false);
      setStatusMsg("");
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FB] p-4 md:p-6">
      <div className="max-w-5xl mx-auto bg-white rounded-3xl border border-gray-200 shadow-sm p-5 md:p-8">
        
        {/* Header */}
        <div className="mb-7">
          <h1 className="text-2xl md:text-3xl font-bold text-[#1E1B4B]">
            Create AI-Driven Pomodoro
          </h1>
          <p className="text-sm text-gray-600 mt-2 font-medium">
            Generate smart notes divided into focused study sections and tests.
          </p>
        </div>

        {/* Prompt Textarea */}
        <div className="relative">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={`Examples:\n\n• Create detailed notes for Operating Systems.\n• Generate React interview preparation notes.\n• Create short notes for DBMS with examples.`}
            className="w-full h-[260px] rounded-3xl border border-gray-200 bg-[#FAFBFF] p-6 pr-24 md:pr-32 text-sm text-[#1E1B4B] placeholder:text-gray-400 outline-none resize-none focus:ring-2 focus:ring-violet-400"
          />
          <div className="absolute bottom-6 right-6">
            <button
              onClick={isListening ? stopListening : startListening}
              className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition text-white ${
                isListening ? "bg-red-500 hover:bg-red-600" : "bg-violet-500 hover:bg-violet-600"
              }`}
            >
              {isListening ? <Square size={16} /> : <Mic size={18} />}
            </button>
          </div>
        </div>

        {/* Configurations */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-8">
          
          <div>
            <label className="block text-sm font-semibold text-[#1E1B4B] mb-2">Total Study Time (mins)</label>
            <input type="number" value={totalStudyTime} onChange={(e) => setTotalStudyTime(e.target.value)}
              className="w-full border border-gray-200 rounded-2xl bg-[#FAFBFF] p-4 text-sm text-[#1E1B4B] outline-none focus:ring-2 focus:ring-violet-400" min="1" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#1E1B4B] mb-2">Revision Time (mins)</label>
            <input type="number" value={revisionTime} onChange={(e) => setRevisionTime(e.target.value)}
              className="w-full border border-gray-200 rounded-2xl bg-[#FAFBFF] p-4 text-sm text-[#1E1B4B] outline-none focus:ring-2 focus:ring-violet-400" min="0" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#1E1B4B] mb-2">Test Duration (mins)</label>
            <input type="number" value={testDuration} onChange={(e) => setTestDuration(e.target.value)}
              className="w-full border border-gray-200 rounded-2xl bg-[#FAFBFF] p-4 text-sm text-[#1E1B4B] outline-none focus:ring-2 focus:ring-violet-400" min="1" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#1E1B4B] mb-2">Test Format</label>
            <select value={testFormat} onChange={(e) => setTestFormat(e.target.value)}
              className="w-full border border-gray-200 rounded-2xl bg-[#FAFBFF] p-4 text-sm text-[#1E1B4B] outline-none focus:ring-2 focus:ring-violet-400">
              <option value="mcq">MCQ</option>
              <option value="written">Short Answer</option>
              <option value="mixed">Mixed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#1E1B4B] mb-2">No. of Tests</label>
            <input type="number" value={noOfTests} onChange={(e) => setNoOfTests(e.target.value)}
              className="w-full border border-gray-200 rounded-2xl bg-[#FAFBFF] p-4 text-sm text-[#1E1B4B] outline-none focus:ring-2 focus:ring-violet-400" min="1" />
          </div>

        </div>

        {/* Status message while loading */}
        {loading && statusMsg && (
          <div className="mt-6 flex items-center gap-3 text-violet-700 bg-violet-50 border border-violet-200 rounded-2xl px-5 py-4 text-sm font-semibold">
            <Loader2 size={18} className="animate-spin" />
            {statusMsg}
          </div>
        )}

        {/* Submit Button */}
        <button
          onClick={handleCreatePomodoro}
          disabled={loading}
          className="w-full mt-8 h-14 rounded-2xl bg-[#1E1B4B] text-white text-sm font-semibold hover:bg-opacity-90 transition shadow-sm disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? <><Loader2 size={18} className="animate-spin" /> Generating...</> : "Create Pomodoro"}
        </button>

      </div>
    </div>
  );
}