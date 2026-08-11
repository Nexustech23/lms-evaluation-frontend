"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
import FileUploadBox from "@/components/question-paper/ai-tutor/FileUploadBox";
import axios from "axios";

// const API_BASE = "http://localhost:5050";
const API_BASE = "http://103.192.198.186:5051";
const POLL_INTERVAL = 3000;
const POLL_TIMEOUT  = 180000;

export default function AIAssistedPomodoroPage() {
  const router = useRouter();

  const [file, setFile]                 = useState(null);
  const [totalStudyTime, setTotalStudyTime] = useState(60);
  const [revisionTime, setRevisionTime] = useState(15);
  const [testDuration, setTestDuration] = useState(15);
  const [testFormat, setTestFormat]     = useState("mcq");
  const [noOfTests, setNoOfTests]       = useState(3);
  const [loading, setLoading]           = useState(false);
  const [statusMsg, setStatusMsg]       = useState("");

  // ── Job poller ───────────────────────────────────────────────
  const pollJob = (jobId) => {
    return new Promise((resolve, reject) => {
      const start = Date.now();
      const interval = setInterval(async () => {
        try {
          if (Date.now() - start > POLL_TIMEOUT) {
            clearInterval(interval);
            reject(new Error("Processing timed out. Please try again."));
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
            reject(new Error(job.message || "Processing failed"));
          } else {
            setStatusMsg("AI is reading and sectioning your notes...");
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
    if (!file) {
      toast.error("Please upload study notes to proceed.");
      return;
    }
    setLoading(true);
    setStatusMsg("Uploading your file...");
    try {
      // Build multipart form data
      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", `AI-Assisted: ${file.name}`);
      formData.append("total_study_time", String(totalStudyTime));
      formData.append("revision_time",    String(revisionTime));
      formData.append("test_duration",    String(testDuration));
      formData.append("test_format",      testFormat);
      formData.append("num_tests",        String(noOfTests));

      // 1. Upload file + config
      const res = await axios.post(
        `${API_BASE}/api/pomodoro/ai-assisted/upload`,
        formData,
        { withCredentials: true, headers: { "Content-Type": "multipart/form-data" } }
      );

      const { job_id } = res.data;
      setStatusMsg("AI is reading and sectioning your notes...");

      // 2. Poll until done
      const sessionId = await pollJob(job_id);

      // 3. Redirect
      toast.success("Pomodoro session ready!");
      router.push(`/self-learner/pomodoro/ai-assisted/session?session_id=${sessionId}`);

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
            Create AI-Assisted Pomodoro
          </h1>
          <p className="text-sm text-gray-600 mt-2 font-medium">
            Upload your own study material, and we will divide it into focused study sections and tests.
          </p>
        </div>

        {/* File Upload */}
        <div className="mb-8">
          <FileUploadBox
            file={file}
            setFile={setFile}
            title="Attach Study Material"
            supportedText="PDF, DOCX supported"
          />
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

        {/* Status */}
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
          {loading ? <><Loader2 size={18} className="animate-spin" /> Processing...</> : "Create Pomodoro"}
        </button>

      </div>
    </div>
  );
}