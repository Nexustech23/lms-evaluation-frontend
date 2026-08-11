"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Clock, CheckCircle2, Play, AlertCircle, Loader2, Upload, FileImage, Type, X, Eye } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import ReactMarkdown from "react-markdown";  // optional: npm install react-markdown

// const API_BASE = "http://localhost:5050";
const API_BASE = "http://103.192.198.186:5051";

// ── Short Answer Input Component ───────────────────────────────
const ShortAnswerInput = ({ 
  questionNo, 
  mode, 
  setMode, 
  uploaded, 
  answer, 
  onTypeAnswer, 
  onUpload, 
  onRemoveUpload 
}) => {
  const fileInputRef = useRef(null);
  const isImage = uploaded?.type?.startsWith("image/");

  return (
    <div>
      {/* Mode tabs */}
      <div className="flex gap-2 mb-3">
        <button
          onClick={() => setMode("type")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition ${
            mode === "type"
              ? "bg-violet-600 text-white border-violet-600 shadow-sm"
              : "bg-white text-gray-500 border-gray-200 hover:border-violet-300"
          }`}
        >
          <Type size={13} /> Type Answer
        </button>
        <button
          onClick={() => setMode("upload")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition ${
            mode === "upload"
              ? "bg-violet-600 text-white border-violet-600 shadow-sm"
              : "bg-white text-gray-500 border-gray-200 hover:border-violet-300"
          }`}
        >
          <Upload size={13} /> Upload Answer Sheet
        </button>
      </div>

      {/* Type mode */}
      {mode === "type" && (
        <textarea
          value={uploaded ? "" : (answer || "")}
          onChange={(e) => {
            if (uploaded) {
              onRemoveUpload();
            }
            onTypeAnswer(e.target.value);
          }}
          placeholder="Type your answer here..."
          className="w-full border border-gray-200 rounded-2xl bg-white p-4 text-sm text-[#1E1B4B] outline-none focus:ring-2 focus:ring-violet-400 resize-none h-32"
        />
      )}

      {/* Upload mode */}
      {mode === "upload" && (
        <div>
          {!uploaded ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-full border-2 border-dashed border-violet-300 rounded-2xl bg-violet-50 p-8 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-violet-500 hover:bg-violet-100 transition"
            >
              <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center text-violet-600">
                <FileImage size={24} />
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-[#1E1B4B]">Click to upload your answer sheet</p>
                <p className="text-xs text-gray-400 mt-1">PNG, JPG, PDF supported · Max 10MB</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,application/pdf"
                className="hidden"
                onChange={(e) => onUpload(e.target.files?.[0])}
              />
            </div>
          ) : (
            <div className="border border-violet-200 rounded-2xl bg-violet-50 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-violet-100 rounded-xl flex items-center justify-center text-violet-600">
                    <FileImage size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#1E1B4B] truncate max-w-[200px]">{uploaded.name}</p>
                    <p className="text-xs text-green-600 font-semibold">✓ Uploaded successfully</p>
                  </div>
                </div>
                <button
                  onClick={() => onRemoveUpload()}
                  className="w-8 h-8 bg-red-100 text-red-500 rounded-lg flex items-center justify-center hover:bg-red-200 transition"
                >
                  <X size={14} />
                </button>
              </div>
              {/* Preview for images */}
              {isImage && (
                <img
                  src={uploaded.previewUrl}
                  alt="Answer sheet preview"
                  className="w-full max-h-48 object-contain rounded-xl border border-violet-100 bg-white"
                />
              )}
              {!isImage && (
                <div className="flex items-center gap-2 text-xs text-gray-500 font-medium bg-white rounded-xl p-3 border border-violet-100">
                  <Eye size={14} className="text-violet-400" />
                  PDF preview not available — file is ready to submit
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

function SessionContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const sessionId = searchParams.get("session_id");

  // ── Session data from backend ───────────────────────────────
  const [session, setSession]       = useState(null);
  const [fetchError, setFetchError] = useState(null);
  const [fetchLoading, setFetchLoading] = useState(true);

  // ── Local UI state ──────────────────────────────────────────
  const [sessionState, setSessionState]           = useState("not_started"); // not_started | studying | testing | evaluation
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [timeLeft, setTimeLeft]                   = useState(0);
  const [answers, setAnswers]                     = useState({});   // { questionNo: selectedAnswer }
  const [answerMode, setAnswerMode]               = useState({});   // { questionNo: 'type' | 'upload' }
  const [uploadedFiles, setUploadedFiles]         = useState({});   // { questionNo: { name, previewUrl } }
  const [evaluation, setEvaluation]               = useState(null);
  const [evalLoading, setEvalLoading]             = useState(false);
  const [submitLoading, setSubmitLoading]         = useState(false);
  const [sectionResult, setSectionResult]         = useState(null);

  // ── Fetch session on mount ──────────────────────────────────
  useEffect(() => {
    if (!sessionId) { setFetchError("No session ID provided."); setFetchLoading(false); return; }
    const load = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/pomodoro/session/${sessionId}`, { withCredentials: true });
        setSession(res.data);
      } catch (err) {
        setFetchError(err?.response?.data?.error || "Failed to load session.");
      } finally {
        setFetchLoading(false);
      }
    };
    load();
  }, [sessionId]);

  // ── Timer ────────────────────────────────────────────────────
  useEffect(() => {
    if (sessionState === "not_started" || sessionState === "evaluation" || sessionState === "eval_loading") return;
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) { clearInterval(timer); handleTimeUp(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [sessionState, currentSectionIndex, timeLeft]);

  const handleTimeUp = () => {
    if (sessionState === "studying") {
      setSessionState("testing");
      const section = session?.sections?.[currentSectionIndex];
      const testMins = section?.test?.duration_mins || 5;
      setTimeLeft(testMins * 60);
      setSectionResult(null);
      setAnswers({});
      setUploadedFiles({});
      setAnswerMode({});
    } else if (sessionState === "testing") {
      handleSubmitTest(true); // auto-submit on timeout
    }
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  // ── Handle file upload for written answers ──────────────────
  const handleFileUpload = (questionNo, file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      setUploadedFiles((prev) => ({ ...prev, [questionNo]: { name: file.name, previewUrl: dataUrl, type: file.type } }));
      // Store a marker as the answer so the backend knows an image was submitted
      setAnswers((prev) => ({ ...prev, [questionNo]: `[UPLOADED_ANSWER_SHEET: ${file.name}]` }));
    };
    reader.readAsDataURL(file);
  };

  const removeUploadedFile = (questionNo) => {
    setUploadedFiles((prev) => { const n = {...prev}; delete n[questionNo]; return n; });
    setAnswers((prev) => { const n = {...prev}; delete n[questionNo]; return n; });
  };

  const getAnswerMode = (questionNo) => answerMode[questionNo] || "type";
  const setMode = (questionNo, mode) => setAnswerMode((prev) => ({ ...prev, [questionNo]: mode }));


  // ── Start session (fullscreen) ────────────────────────────────
  const handleStartSession = async () => {
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
    } catch (err) { console.warn("Fullscreen failed", err); }
    const firstSection = session?.sections?.[0];
    const studyMins = firstSection?.study_duration_mins || 25;
    setTimeLeft(studyMins * 60);
    setSessionState("studying");
  };

  // ── Select an answer ─────────────────────────────────────────
  const handleSelectAnswer = (questionNo, answer) => {
    setAnswers((prev) => ({ ...prev, [questionNo]: answer }));
  };

  // ── Submit test for current section ─────────────────────────
  const handleSubmitTest = async (autoSubmit = false) => {
    const section   = session?.sections?.[currentSectionIndex];
    const questions = section?.test?.questions || [];
    const payload   = questions.map((q) => {
      const uploaded = uploadedFiles[q.question_no];
      return {
        question_no:       q.question_no,
        user_answer:       answers[q.question_no] || "",
        // Include base64 data if user uploaded an answer sheet for this question
        answer_image_data: uploaded?.previewUrl || null,
        answer_image_name: uploaded?.name || null,
        answer_image_type: uploaded?.type || null,
      };
    });

    setSubmitLoading(true);
    try {
      const res = await axios.post(
        `${API_BASE}/api/pomodoro/session/${sessionId}/submit-test`,
        { section_index: currentSectionIndex, answers: payload },
        { withCredentials: true }
      );
      setSectionResult(res.data);

      // Move to next section or evaluation
      const totalSections = session?.sections?.length || 1;
      if (currentSectionIndex < totalSections - 1) {
        const nextSection   = session.sections[currentSectionIndex + 1];
        const nextStudyMins = nextSection?.study_duration_mins || 25;
        setCurrentSectionIndex((prev) => prev + 1);
        setSessionState("studying");
        setTimeLeft(nextStudyMins * 60);
        setAnswers({});
        setUploadedFiles({});
        setAnswerMode({});
        setSectionResult(null);
      } else {
        // All sections done — fetch evaluation
        setSessionState("eval_loading");
        await fetchEvaluation();
      }
    } catch (err) {
      toast.error("Failed to submit test. Moving on...");
      // Still advance
      const totalSections = session?.sections?.length || 1;
      if (currentSectionIndex < totalSections - 1) {
        setCurrentSectionIndex((prev) => prev + 1);
        setSessionState("studying");
        setAnswers({});
        setUploadedFiles({});
        setAnswerMode({});
      } else {
        setSessionState("eval_loading");
        await fetchEvaluation();
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  // ── Fetch final evaluation ────────────────────────────────────
  const fetchEvaluation = async () => {
    setEvalLoading(true);
    try {
      const res = await axios.get(
        `${API_BASE}/api/pomodoro/session/${sessionId}/evaluation`,
        { withCredentials: true }
      );
      setEvaluation(res.data.evaluation);
      setSessionState("evaluation");
    } catch (err) {
      const msg = err?.response?.data?.error || err.message || "Could not load evaluation.";
      console.error("Evaluation error:", msg);
      toast.error(`Evaluation failed: ${msg}`);
      setSessionState("evaluation"); // still show completion screen
    } finally {
      // Always mark session complete so it doesn't stay as "active" in history
      try {
        const focusedMins = Math.round(
          ((session?.sections || []).reduce((acc, s) => acc + (s.study_duration_mins || 0), 0))
        );
        await axios.patch(
          `${API_BASE}/api/pomodoro/session/${sessionId}/complete`,
          { status: "completed", total_focused_mins: focusedMins || session?.total_study_time_mins || 0 },
          { withCredentials: true }
        );
      } catch (_) { /* non-critical */ }
      setEvalLoading(false);
    }
  };

  const handleReturnToDashboard = async () => {
    if (document.fullscreenElement && document.exitFullscreen) {
      try { await document.exitFullscreen(); } catch (_) {}
    }
    router.push("/self-learner/pomodoro");
  };

  // ── Loading / Error states ───────────────────────────────────
  if (fetchLoading) return (
    <div className="fixed inset-0 z-50 bg-[#F5F7FB] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4 text-[#1E1B4B]">
        <Loader2 size={48} className="animate-spin text-violet-500" />
        <p className="text-lg font-semibold">Loading your session...</p>
      </div>
    </div>
  );

  if (fetchError) return (
    <div className="fixed inset-0 z-50 bg-[#F5F7FB] flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl border shadow-lg p-10 max-w-lg w-full text-center">
        <p className="text-red-500 font-semibold text-lg mb-4">{fetchError}</p>
        <button onClick={() => router.push("/self-learner/pomodoro")}
          className="bg-[#1E1B4B] text-white px-8 py-3 rounded-xl font-bold">
          Back to Pomodoro
        </button>
      </div>
    </div>
  );

  const currentSection = session?.sections?.[currentSectionIndex];
  const totalSections  = session?.sections?.length || 1;

  // ── Not started screen ───────────────────────────────────────
  if (sessionState === "not_started") return (
    <div className="fixed inset-0 z-50 bg-[#F5F7FB] flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl border shadow-lg p-10 max-w-lg w-full text-center">
        <div className="w-20 h-20 bg-violet-100 text-violet-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <Clock size={40} />
        </div>
        <h2 className="text-3xl font-bold text-[#1E1B4B] mb-2">Ready to Focus?</h2>
        <p className="text-gray-500 mb-2 text-sm">{session?.title}</p>
        <p className="text-gray-600 mb-8 text-lg">
          {totalSections} sections · {session?.total_study_time_mins} min study time
        </p>
        <button onClick={handleStartSession}
          className="bg-[#1E1B4B] text-white px-8 py-4 rounded-xl font-bold w-full hover:bg-opacity-90 transition shadow-lg text-lg">
          Enter Full Screen & Start
        </button>
      </div>
    </div>
  );

  // ── Eval loading screen ──────────────────────────────────────
  if (sessionState === "eval_loading") return (
    <div className="fixed inset-0 z-50 bg-[#F5F7FB] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4 text-[#1E1B4B]">
        <Loader2 size={48} className="animate-spin text-violet-500" />
        <p className="text-lg font-semibold">AI is evaluating your performance...</p>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 bg-[#F5F7FB] flex flex-col overflow-auto">
      {/* Header */}
      <header className="bg-white border-b px-6 py-4 flex justify-between items-center shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-[#1E1B4B] capitalize">{session?.title}</h1>
          <p className="text-sm text-gray-500 mt-1 font-medium">
            {sessionState === "evaluation"
              ? "Session Complete"
              : `Section ${currentSectionIndex + 1} of ${totalSections} — ${sessionState === "studying" ? "Study Time" : "Test Time"}`}
          </p>
        </div>
        {sessionState !== "evaluation" && (
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 text-[#1E1B4B] font-mono text-2xl font-bold bg-[#FAFBFF] px-5 py-2.5 rounded-xl border border-gray-200 shadow-inner">
              <Clock size={24} className={sessionState === "testing" ? "text-red-500" : "text-violet-500"} />
              {formatTime(timeLeft)}
            </div>
            {sessionState === "studying" && (
              <button onClick={() => { setSessionState("testing"); setTimeLeft((currentSection?.test?.duration_mins || 5) * 60); setAnswers({}); setUploadedFiles({}); setAnswerMode({}); }}
                className="bg-[#1E1B4B] text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-opacity-90 transition shadow-md">
                Start Test Now
              </button>
            )}
            {sessionState === "testing" && (
              <button onClick={() => handleSubmitTest()} disabled={submitLoading}
                className="bg-[#1E1B4B] text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-opacity-90 transition shadow-md disabled:opacity-60 flex items-center gap-2">
                {submitLoading ? <Loader2 size={16} className="animate-spin" /> : null}
                Submit Test
              </button>
            )}
          </div>
        )}
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto p-6 flex flex-col gap-6">

        {/* STUDY STATE */}
        {sessionState === "studying" && currentSection && (
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-8 flex-1 flex flex-col">
            <h2 className="text-2xl font-bold mb-2 flex items-center gap-3 text-[#1E1B4B]">
              <div className="p-2 bg-violet-100 rounded-lg text-violet-600"><Play size={20} /></div>
              {currentSection.title}
            </h2>
            <p className="text-xs text-gray-400 mb-6 font-semibold uppercase tracking-wider">
              Study for {currentSection.study_duration_mins} minutes
            </p>
            <div className="prose max-w-none text-gray-700 bg-[#FAFBFF] p-8 rounded-2xl flex-1 border border-gray-100 overflow-y-auto">
              <div className="markdown-content text-base leading-relaxed whitespace-pre-wrap">
                <ReactMarkdown>{currentSection.content}</ReactMarkdown>
              </div>
            </div>
          </div>
        )}

        {/* TEST STATE */}
        {sessionState === "testing" && currentSection && (
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-8 flex-1 flex flex-col">
            <h2 className="text-2xl font-bold mb-2 flex items-center gap-3 text-[#1E1B4B]">
              <div className="p-2 bg-red-100 rounded-lg text-red-600"><AlertCircle size={20} /></div>
              Knowledge Check — {currentSection.title}
            </h2>
            {/* Format badge */}
            {currentSection.test?.format && (
              <span className={`self-start mb-5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                currentSection.test.format === "mcq"
                  ? "bg-violet-100 text-violet-600"
                  : currentSection.test.format === "written"
                  ? "bg-amber-100 text-amber-600"
                  : "bg-teal-100 text-teal-600"
              }`}>
                {currentSection.test.format === "mcq" ? "Multiple Choice" :
                 currentSection.test.format === "written" ? "Written / Short Answer" : "Mixed Format"}
              </span>
            )}
            <div className="flex-1 space-y-6 overflow-y-auto">
              {(currentSection.test?.questions || []).map((q, idx) => (
                <div key={q.question_no ?? idx} className="bg-[#FAFBFF] p-6 rounded-2xl border border-gray-100 shadow-sm">
                  <p className="font-semibold text-lg text-[#1E1B4B] mb-5">
                    Q{q.question_no}. {q.question}
                  </p>
                  {/* MCQ */}
                  {q.options && q.options.length > 0 ? (
                    <div className="space-y-3">
                      {q.options.map((opt, oIdx) => (
                        <label key={oIdx}
                          className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition ${
                            answers[q.question_no] === opt
                              ? "border-violet-500 bg-violet-50"
                              : "border-gray-200 bg-white hover:border-violet-300"
                          }`}>
                          <input type="radio" name={`q-${q.question_no}`}
                            checked={answers[q.question_no] === opt}
                            onChange={() => handleSelectAnswer(q.question_no, opt)}
                            className="w-5 h-5 text-violet-600" />
                          <span className="text-gray-700 font-medium">{opt}</span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    /* Short Answer / Written — type or upload */
                    <ShortAnswerInput 
                      questionNo={q.question_no}
                      mode={getAnswerMode(q.question_no)}
                      setMode={(m) => setMode(q.question_no, m)}
                      uploaded={uploadedFiles[q.question_no]}
                      answer={answers[q.question_no]}
                      onTypeAnswer={(val) => handleSelectAnswer(q.question_no, val)}
                      onUpload={(file) => handleFileUpload(q.question_no, file)}
                      onRemoveUpload={() => removeUploadedFile(q.question_no)}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* EVALUATION STATE */}
        {sessionState === "evaluation" && (
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-10 flex-1 flex flex-col items-center text-center">
            <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 shadow-sm">
              <CheckCircle2 size={48} />
            </div>
            <h2 className="text-4xl font-extrabold text-[#1E1B4B] mb-4">Session Complete!</h2>

            {evaluation ? (
              <>
                <div className="grid grid-cols-2 gap-6 w-full max-w-md mb-8">
                  <div className="bg-[#FAFBFF] p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">Overall Score</div>
                    <div className="text-4xl font-black text-violet-600">{evaluation.overall_score}%</div>
                  </div>
                  <div className="bg-[#FAFBFF] p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">Marks</div>
                    <div className="text-4xl font-black text-violet-600">
                      {evaluation.total_marks_obtained}<span className="text-xl text-violet-400">/{evaluation.total_marks_possible}</span>
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 max-w-lg mb-6 text-base">{evaluation.overall_feedback}</p>

                {evaluation.strengths?.length > 0 && (
                  <div className="w-full max-w-lg text-left mb-4">
                    <h3 className="font-bold text-[#1E1B4B] mb-2">✅ Strengths</h3>
                    <ul className="space-y-1">
                      {evaluation.strengths.map((s, i) => <li key={i} className="text-sm text-gray-700 flex gap-2"><span>•</span>{s}</li>)}
                    </ul>
                  </div>
                )}
                {evaluation.recommendations?.length > 0 && (
                  <div className="w-full max-w-lg text-left mb-8">
                    <h3 className="font-bold text-[#1E1B4B] mb-2">🎯 Recommendations</h3>
                    <ul className="space-y-1">
                      {evaluation.recommendations.map((r, i) => <li key={i} className="text-sm text-gray-700 flex gap-2"><span>•</span>{r}</li>)}
                    </ul>
                  </div>
                )}
              </>
            ) : (
              <p className="text-gray-500 mb-8">Session completed successfully!</p>
            )}

            <button onClick={handleReturnToDashboard}
              className="bg-[#1E1B4B] text-white px-10 py-4 rounded-xl font-bold hover:bg-opacity-90 transition shadow-lg text-lg">
              Return to Dashboard
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default function SessionPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#F5F7FB]"><Loader2 className="animate-spin text-violet-500" size={40} /></div>}>
      <SessionContent />
    </Suspense>
  );
}