"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { createRoadmap, getRoadmapCreationStatus } from "../api";
import RoadmapHeader from "../components/RoadmapHeader";
import RoadmapGeneratorForm from "../components/RoadmapGeneratorForm";
import SkillAssessmentModal from "../components/SkillAssessmentModal";
import AssessmentResultCard from "../components/AssessmentResultCard";

export default function CreateRoadmapPage() {
  const router = useRouter();
  const [step, setStep] = useState("form"); // 'form' | 'result' | 'generating'

  // Creation parameters
  const [subject, setSubject] = useState("");
  const [goal, setGoal] = useState("");
  const [skillLevel, setSkillLevel] = useState("");
  const [dailyTime, setDailyTime] = useState("");
  const [revisionFrequency, setRevisionFrequency] = useState("");

  const [showAssessment, setShowAssessment] = useState(false);
  const [assessmentResults, setAssessmentResults] = useState(null);
  const [pendingAssessmentScore, setPendingAssessmentScore] = useState(null);
  const [generatingError, setGeneratingError] = useState(null);
  const [generatingStep, setGeneratingStep] = useState("Starting…");

  // ── Helpers ──────────────────────────────────────────────────────────────
  const buildPayload = (overrides = {}) => ({
    subject:            subject,
    goal:               goal,
    skill_level:        skillLevel,
    daily_study_time:   dailyTime,
    revision_frequency: revisionFrequency,
    ...overrides,
  });

  // ── Step 1: Form submitted ────────────────────────────────────────────────
  const handleFormSubmit = (formData) => {
    setSubject(formData.subject);
    setGoal(formData.goal);
    setSkillLevel(formData.skillLevel);
    setDailyTime(formData.dailyTime);
    setRevisionFrequency(formData.revisionFrequency);

    if (formData.assessmentMode) {
      // Show the skill assessment quiz first
      setShowAssessment(true);
    } else {
      // Immediately send to backend for AI generation
      handleSaveRoadmap({
        subject:            formData.subject,
        goal:               formData.goal,
        skill_level:        formData.skillLevel,
        daily_study_time:   formData.dailyTime,
        revision_frequency: formData.revisionFrequency,
      });
    }
  };

  // ── Step 2a: Assessment finished ─────────────────────────────────────────
  const handleAssessmentFinish = (results) => {
    setAssessmentResults(results);
    setPendingAssessmentScore(results.score);
    setShowAssessment(false);
    setStep("result"); // show AssessmentResultCard
  };

  // ── Step 3: Save / trigger AI generation ─────────────────────────────────
  const handleSaveRoadmap = async (payload) => {
    setGeneratingError(null);
    setGeneratingStep("Starting…");
    setStep("generating");
    try {
      // Kick off the background job — returns immediately with a job_id
      const { job_id } = await createRoadmap(payload);

      // Poll until done (no timeout — we wait as long as it takes)
      const POLL_INTERVAL = 2500;
      await new Promise((resolve, reject) => {
        const interval = setInterval(async () => {
          try {
            const status = await getRoadmapCreationStatus(job_id);
            if (status.step) setGeneratingStep(status.step);
            if (status.status === "done") {
              clearInterval(interval);
              resolve(status.roadmap_id);
            } else if (status.status === "error") {
              clearInterval(interval);
              reject(new Error(status.error || "AI generation failed. Please try again."));
            }
          } catch (pollErr) {
            clearInterval(interval);
            reject(pollErr);
          }
        }, POLL_INTERVAL);
      }).then((roadmapId) => {
        router.push(`/self-learner/roadmap/${roadmapId}`);
      });
    } catch (e) {
      console.error("Failed to generate roadmap", e);
      const msg =
        e?.message || e?.response?.data?.error || "AI generation failed. Please try again.";
      setGeneratingError(msg);
      setStep(assessmentResults ? "result" : "form");
    }
  };

  const handleProceedAfterAssessment = () => {
    handleSaveRoadmap(
      buildPayload({ assessment_score: pendingAssessmentScore })
    );
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#F5F7FB] p-4 md:p-6 text-slate-800 animate-fadeIn">

      {/* Skill Assessment overlay modal */}
      {showAssessment && (
        <SkillAssessmentModal
          subject={subject}
          onClose={() => setShowAssessment(false)}
          onFinish={handleAssessmentFinish}
        />
      )}

      <div className="max-w-4xl mx-auto space-y-6">

        {/* Back navigation */}
        <button
          onClick={() => router.push("/self-learner/roadmap")}
          className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-[#6C63FF] transition-all duration-200"
        >
          <ArrowLeft size={14} /> Back to list
        </button>

        {/* ── AI Generating Spinner ── */}
        {step === "generating" && (
          <div className="bg-white rounded-3xl border border-gray-200 shadow-md p-10 flex flex-col items-center gap-5 text-center">
            <Loader2 size={48} className="animate-spin text-[#6C63FF]" />
            <div>
              <h3 className="text-lg font-black text-[#1E1B4B]">
                Building Your Learning Path…
              </h3>
              <p className="text-xs text-gray-500 font-semibold mt-2 leading-relaxed max-w-sm">
                A detailed, personalised curriculum for{" "}
                <span className="text-[#6C63FF]">{subject}</span> is being built.
                This may take 20–40 seconds.
              </p>
              <p className="text-[10px] text-[#6C63FF] font-bold mt-3 tracking-wide uppercase">
                {generatingStep}
              </p>
            </div>
          </div>
        )}

        {/* ── Form Step ── */}
        {step === "form" && (
          <>
            <RoadmapHeader
              title="My Learning Lounge"
              subtitle="Design your personalised learning path, track your progress, and master topics at your own pace."
              showReset={false}
            />
            {generatingError && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-xs font-bold text-red-600">
                ⚠️ {generatingError}
              </div>
            )}
            <RoadmapGeneratorForm onSubmit={handleFormSubmit} />
          </>
        )}

        {/* ── Assessment Result Step ── */}
        {step === "result" && assessmentResults && (
          <>
            <RoadmapHeader
              title="Knowledge Check Results"
              subtitle="Here's your skill snapshot — your learning path has been tailored to your level."
              showReset={false}
            />
            {generatingError && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-xs font-bold text-red-600">
                ⚠️ {generatingError}
              </div>
            )}
            <AssessmentResultCard
              results={assessmentResults}
              onProceed={handleProceedAfterAssessment}
            />
          </>
        )}

      </div>
    </div>
  );
}
