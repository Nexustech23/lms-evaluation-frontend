"use client";
import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import Navbar from "@/components/ui/Navbar";
import Spinner from "@/components/ui/Spinner";
import { IconDownload, IconEye, IconPlayerPlay } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useParams } from "next/navigation";
import { useContext } from "react";
import { AuthContext } from "@/app/AuthContext";
import { FaArrowLeft } from "react-icons/fa";
import { useTranslations } from "next-intl";

const POLL_INTERVAL_MS = 4000;

function withAlpha(hex = "#ff7f10", alpha = 1) {
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function darkenColor(hex = "#ff7f10", amount = 0.25) {
  const h = hex.replace("#", "");
  const r = Math.max(0, Math.floor(parseInt(h.substring(0, 2), 16) * (1 - amount)));
  const g = Math.max(0, Math.floor(parseInt(h.substring(2, 4), 16) * (1 - amount)));
  const b = Math.max(0, Math.floor(parseInt(h.substring(4, 6), 16) * (1 - amount)));
  return `rgb(${r}, ${g}, ${b})`;
}

export default function SavedResult() {
  const params = useParams();
  const { user } = useContext(AuthContext);
  const color = user?.color || "#ff7f10";

  const folderId = params?.examId || null;
  const [selectedFolder, setSelectedFolder] = useState("");
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [selectedEvaluation, setSelectedEvaluation] = useState(null);
  const [selectedAnswerscriptId, setSelectedAnswerscriptId] = useState(null);
  const [loadExcel, setLoadExcel] = useState(false);
  const [total, setTotal] = useState(0);
  const [isEvaluatingAll, setIsEvaluatingAll] = useState(false);
  const [generateTranscriptPdf, setGenerateTranscriptPdf] = useState(false);

  const router = useRouter();
  const ta  = useTranslations("evaluateAnswerScriptsPage");
  const t   = useTranslations("uploadedAnswerScripts");
  const tc  = useTranslations("common");
  const tcw = useTranslations("evaluationwithoutCO");

  const [evaluatingStates, setEvaluatingStates] = useState({});
  const pollingRefs = useRef({});

  useEffect(() => {
    return () => { Object.values(pollingRefs.current).forEach(clearInterval); };
  }, []);

  // ─── helpers ─────────────────────────────────────────────────────────────────

  const setEvalState = (answerId, patch) =>
    setEvaluatingStates((prev) => ({
      ...prev,
      [answerId]: { ...(prev[answerId] || {}), ...patch },
    }));

  const clearEvalState = (answerId) =>
    setEvaluatingStates((prev) => {
      const next = { ...prev };
      delete next[answerId];
      return next;
    });

  const stopPolling = (answerId) => {
    if (pollingRefs.current[answerId]) {
      clearInterval(pollingRefs.current[answerId]);
      delete pollingRefs.current[answerId];
    }
  };

  // ─── data fetching ────────────────────────────────────────────────────────────

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/get-answer-scripts/${folderId}`, { withCredentials: true });
      setFiles(res.data.answer_scripts || []);
      setSelectedFolder(res.data.foldername || "Evaluated Answer Sheets");
    } catch {
      toast.error("Failed to load folder");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDetails(); }, []);

  // ─── evaluate single ─────────────────────────────────────────────────────────

  const handleEvaluate = async (answerscriptId) => {
    if (evaluatingStates[answerscriptId]?.isEvaluating) return;

    setEvalState(answerscriptId, { isEvaluating: true, progress: 0, step: "Starting evaluation…", jobId: null });

    try {
      const kickoff = await axios.post(
        `/api/evaluate-answer-script`,
        { folderId, answerId: answerscriptId, generateTranscriptPdf },
        { withCredentials: true }
      );

      if (kickoff.data?.token_warnings?.length) {
        toast(
          "Your institute is running low on AI tokens — contact your administrator to top up soon.",
          { icon: "⚠️" },
        );
      }

      const jobId = kickoff.data?.job_id;
      if (!jobId) throw new Error("Server did not return a job_id");

      setEvalState(answerscriptId, { jobId, progress: 5, step: "Job queued…" });

      pollingRefs.current[answerscriptId] = setInterval(async () => {
        try {
          const statusRes = await axios.get(
            `/api/evaluate-answer-script/status/${jobId}`,
            { withCredentials: true }
          );
          const { status, progress, step, result, message } = statusRes.data;

          if (status === "processing") {
            setEvalState(answerscriptId, { progress: progress ?? 0, step: step ?? "Processing…" });
            return;
          }

          stopPolling(answerscriptId);

          if (status === "done" && result?.success) {
            toast.success(`Evaluation completed! Score: ${result.total_ai_marks}/${result.total_max_marks}`);
            setFiles((prev) =>
              prev.map((file) =>
                file.answer_id === answerscriptId
                  ? { ...file, ...result, content: true }
                  : file
              )
            );
            setEvalState(answerscriptId, { progress: 100, step: "Done!" });
            setTimeout(() => clearEvalState(answerscriptId), 800);
          } else {
            throw new Error(message || "Evaluation failed");
          }
        } catch (pollErr) {
          stopPolling(answerscriptId);
          clearEvalState(answerscriptId);
          toast.error(pollErr?.response?.data?.error || pollErr?.message || "Evaluation failed");
        }
      }, POLL_INTERVAL_MS);
    } catch (err) {
      stopPolling(answerscriptId);
      clearEvalState(answerscriptId);
      toast.error(err?.response?.data?.error || "Failed to start evaluation");
    }
  };

  // ─── evaluate ALL in parallel ─────────────────────────────────────────────────

  const handleEvaluateAll = async () => {
    const unevaluated = files.filter(
      (f) => !evaluatingStates[f.answer_id]?.isEvaluating
    );

    if (unevaluated.length === 0) {
      toast("All scripts are already being evaluated or done.");
      return;
    }

    setIsEvaluatingAll(true);
    toast.success(`Starting evaluation for ${unevaluated.length} script(s)…`);

    // Fire all evaluations in parallel — each one self-manages its own polling
    await Promise.allSettled(unevaluated.map((f) => handleEvaluate(f.answer_id)));

    setIsEvaluatingAll(false);
  };

  // ─── file helpers ─────────────────────────────────────────────────────────────

  const previewFile = (url) => {
    if (!url) { toast.error("No evaluation report available"); return; }
    window.open(url, "_blank");
  };

  const downloadFile = async (url, fileName) => {
    if (!url) { toast.error("No evaluation report available"); return; }
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = fileName || "Result.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch {
      toast.error("Failed to download file");
    }
  };

  // ─── self-evaluation save ─────────────────────────────────────────────────────

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const payload = selectedEvaluation.map((q) => ({
        ...q,
        cos: q.cos?.map((co) => ({
          co_code: co.co_code, ai_marks: co.ai_marks, grace_marks: co.grace_marks,
          max_marks: co.max_marks, final_co_marks: (co.ai_marks || 0) + (co.grace_marks || 0), remarks: co.remarks,
        })),
      }));
      await axios.post(
        `/api/save-self-evaluation`,
        { answer_id: selectedAnswerscriptId, questionwise_marking: payload },
        { withCredentials: true }
      );
      await fetchDetails();
      toast.success("Self evaluation saved successfully ✅");
      setOpen(false);
    } catch (err) {
      toast.error(err?.response?.data?.error || "Failed to save self evaluation");
    } finally {
      setLoading(false);
    }
  };

  // ─── excel download ───────────────────────────────────────────────────────────

  const handleDownloadExcel = async () => {
    try {
      setLoadExcel(true);
      const response = await axios.get(`/api/download-detailed-excel/${folderId}`,
        { withCredentials: true, responseType: "blob" });
      const blob = new Blob([response.data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      const url  = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const cd = response.headers["content-disposition"];
      let filename = `Evaluation_Report_${Date.now()}.xlsx`;
      if (cd) { const m = cd.match(/filename="?(.+)"?/i); if (m?.[1]) filename = m[1]; }
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Excel report downloaded successfully!");
    } catch (err) {
      toast.error(err?.response?.data?.error || "Failed to download Excel report");
    } finally {
      setLoadExcel(false);
    }
  };

  // ─── derived state ────────────────────────────────────────────────────────────

  const anyEvaluating = Object.values(evaluatingStates).some((s) => s.isEvaluating);
  const unevaluatedCount = files.filter((f) => !evaluatingStates[f.answer_id]?.isEvaluating).length;

  // ─── render ───────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: withAlpha(color) }}>
      <Navbar title={ta("title")} />

      {/* Top action bar */}
      <div className="flex justify-between items-center px-6 py-3 gap-3 flex-wrap">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 px-4 py-2 rounded text-sm font-medium bg-white border transition"
          style={{ color: darkenColor(color), borderColor: withAlpha(color, 0.3) }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = withAlpha(color, 0.07))}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#fff")}
        >
          <FaArrowLeft size={12} />
          {tc("back")}
        </button>

        <div className="flex items-center gap-3 ml-auto flex-wrap">

          {/* ✅ Generate Transcript PDF Toggle */}
          <button
            onClick={() => setGenerateTranscriptPdf((prev) => !prev)}
            className={`flex items-center gap-2 px-4 py-2 rounded text-sm font-semibold border transition select-none ${
              generateTranscriptPdf
                ? "text-white border-transparent"
                : "bg-white border-gray-300 text-gray-600 hover:border-gray-400"
            }`}
            style={
              generateTranscriptPdf
                ? { backgroundColor: color, borderColor: color }
                : {}
            }
            title="Toggle transcript PDF generation for evaluations"
          >
            {/* Checkbox icon */}
            <span
              className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition ${
                generateTranscriptPdf ? "border-white bg-white" : "border-gray-400 bg-white"
              }`}
            >
              {generateTranscriptPdf && (
                <svg className="w-2.5 h-2.5" viewBox="0 0 10 10" fill="none">
                  <path
                    d="M1.5 5L4 7.5L8.5 2.5"
                    stroke={color}
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </span>
            Generate Transcript PDF
          </button>

          {/* ✅ Evaluate All button */}
          <button
            onClick={handleEvaluateAll}
            disabled={isEvaluatingAll || files.length === 0}
            className="flex items-center border border-white/20 gap-2 px-4 py-2 rounded text-sm font-semibold text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: color }}
            onMouseEnter={e => { if (!isEvaluatingAll) e.currentTarget.style.backgroundColor = darkenColor(color); }}
            onMouseLeave={e => { if (!isEvaluatingAll) e.currentTarget.style.backgroundColor = color; }}
          >
            {anyEvaluating ? (
              <><Spinner className="h-4 w-4" /> Evaluating {Object.values(evaluatingStates).filter(s => s.isEvaluating).length} script(s)…</>
            ) : (
              <><IconPlayerPlay size={16} /> Evaluate All ({unevaluatedCount})</>
            )}
          </button>

          {/* Download Excel */}
          <button
            onClick={handleDownloadExcel}
            disabled={loadExcel || files.length === 0}
            className="flex items-center gap-2 px-4 py-2 rounded text-sm font-semibold text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {loadExcel ? (
              <><Spinner className="h-4 w-4" />{t("generating")}</>
            ) : (
              <><IconDownload size={16} />{t("downloadExcel")}</>
            )}
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 px-6 pb-6">
        <div className="bg-white rounded-xl overflow-hidden shadow-sm">
          {loading ? (
            <div className="flex justify-center py-8">
              <Spinner className="h-8 w-8" style={{ color }} />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border">
                <thead>
                  <tr style={{ backgroundColor: withAlpha(color, 0.1) }} className="text-left">
                    <th className="p-3">{t("fileName")}</th>
                    <th className="p-3">{t("status")}</th>
                    <th className="p-3">{t("score")}</th>
                    <th className="p-3">{t("evaluateByFaculty")}</th>
                    <th className="p-3">{t("transcript")}</th>
                    <th className="p-3">Transcript PDF</th>
                    <th className="p-3">{t("lastUpdated")}</th>
                    <th className="p-3 text-right">{t("actions")}</th>
                  </tr>
                </thead>

                <tbody>
                  {files.length > 0 ? (
                    files.map((file, index) => {
                      const evalState   = evaluatingStates[file.answer_id];
                      const isEvaluating = evalState?.isEvaluating ?? false;
                      const progress    = evalState?.progress ?? 0;
                      const step        = evalState?.step ?? "";

                      return (
                        <tr key={file.answer_id} className="border-t hover:bg-gray-50">

                          {/* File Name */}
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              📄 <span className="font-medium">{file.filename}</span>
                            </div>
                          </td>

                          {/* Status */}
                          <td className="p-3">
                            {isEvaluating ? (
                              <span className="px-3 py-1 rounded-full text-sm font-medium"
                                style={{ backgroundColor: withAlpha(color, 0.12), color: darkenColor(color) }}>
                                ⚙️ {Math.round(progress)}%
                              </span>
                            ) : (
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                file.evaluated_report_url
                                  ? "bg-green-100 text-green-700"
                                  : "bg-yellow-100 text-yellow-700"
                              }`}>
                                {file.evaluated_report_url ? `✓ ${t("evaluated")}` : `⏳ ${t("pending")}`}
                              </span>
                            )}
                          </td>

                          {/* Score */}
                          <td className="p-3">
                            {file.total_ai_marks !== 0 && file.total_max_marks !== 0 ? (
                              <span className="font-semibold">
                                {file.total_final_marks || file.total_ai_marks} / {file.total_max_marks}
                              </span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>

                          {/* Self Evaluate */}
                          <td className="p-3">
                            <button
                              className="px-4 py-1 text-white rounded text-sm disabled:bg-gray-300 disabled:cursor-not-allowed"
                              style={{ backgroundColor: color }}
                              disabled={!file.questionwise_marking || file.questionwise_marking.length === 0}
                              onClick={() => {
                                setSelectedEvaluation(file.questionwise_marking);
                                setSelectedAnswerscriptId(file.answer_id);
                                setTotal(file.total_max_marks);
                                setOpen(true);
                              }}
                            >
                              {t("selfEvaluate")}
                            </button>
                          </td>

                          {/* Transcript */}
                          <td className="p-3">
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => downloadFile(file.html_content, `Transcript_${file.filename || `Transcript_${index + 1}.pdf`}`)}
                                disabled={!file.html_content}
                                className="p-2 rounded text-green-600 hover:text-green-800 disabled:opacity-30 disabled:cursor-not-allowed"
                                title="Download Transcript"
                              >
                                <IconDownload size={20} />
                              </button>
                              <button
                                onClick={() => previewFile(file.html_content)}
                                disabled={!file.html_content}
                                className="p-2 rounded text-blue-600 hover:text-blue-800 disabled:opacity-30 disabled:cursor-not-allowed"
                                title="Preview Transcript"
                              >
                                <IconEye size={20} />
                              </button>
                            </div>
                          </td>

                          {/* Transcript PDF indicator */}
                          <td className="p-3">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                                generateTranscriptPdf
                                  ? "bg-green-100 text-green-700"
                                  : "bg-gray-100 text-gray-500"
                              }`}
                            >
                              <span
                                className={`w-2 h-2 rounded-full flex-shrink-0 ${
                                  generateTranscriptPdf ? "bg-green-500" : "bg-gray-400"
                                }`}
                              />
                              {generateTranscriptPdf ? "Enabled" : "Disabled"}
                            </span>
                          </td>

                          {/* Last Updated */}
                          <td className="p-3">
                            {file.evaluated_at ? (
                              <span className="text-sm">
                                {new Date(file.evaluated_at).toLocaleString("en-US", { day: "2-digit", month: "short", year: "numeric" })}
                              </span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="p-3">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => downloadFile(file.evaluated_report_url, `Evaluated_${file.filename || `Result_${index + 1}.pdf`}`)}
                                disabled={!file.evaluated_report_url}
                                className="p-2 rounded text-green-600 hover:text-green-800 disabled:opacity-30 disabled:cursor-not-allowed"
                                title="Download Report"
                              >
                                <IconDownload size={20} />
                              </button>

                              <button
                                onClick={() => previewFile(file.evaluated_report_url)}
                                disabled={!file.evaluated_report_url}
                                className="p-2 rounded text-blue-600 hover:text-blue-800 disabled:opacity-30 disabled:cursor-not-allowed"
                                title="Preview Report"
                              >
                                <IconEye size={20} />
                              </button>

                              {/* Evaluate / Re-evaluate button */}
                              <div className="relative">
                                <button
                                  disabled={isEvaluating}
                                  onClick={() => handleEvaluate(file.answer_id)}
                                  className="px-4 py-2 rounded text-white flex items-center gap-2 min-w-[130px] justify-center text-sm font-medium transition disabled:cursor-not-allowed"
                                  style={{
                                    backgroundColor: isEvaluating
                                      ? "#9ca3af"
                                      : file.evaluated_report_url
                                        ? "#2563eb"
                                        : color,
                                  }}
                                >
                                  {isEvaluating ? (
                                    <><Spinner className="h-4 w-4 text-white" />{progress < 100 ? `${Math.round(progress)}%` : "Done!"}</>
                                  ) : file.evaluated_report_url ? (
                                    t("reEvaluate")
                                  ) : (
                                    "Evaluate"
                                  )}
                                </button>

                                {/* Progress bar */}
                                {isEvaluating && (
                                  <>
                                    <div className="absolute -bottom-1 left-0 right-0 h-1 bg-gray-200 rounded-full overflow-hidden">
                                      <div
                                        className="h-full transition-all duration-500"
                                        style={{ width: `${progress}%`, backgroundColor: color }}
                                      />
                                    </div>
                                    {step && (
                                      <p className="absolute -bottom-5 left-0 right-0 text-center text-[10px] text-gray-500 whitespace-nowrap truncate">
                                        {step}
                                      </p>
                                    )}
                                  </>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="8" className="p-8 text-center text-gray-500">
                        <div className="flex flex-col items-center gap-2">
                          <span className="text-4xl">📭</span>
                          <span>{t("noFiles")}</span>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Self Evaluation Modal */}
      {open && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white w-[90%] max-w-5xl max-h-[90vh] overflow-y-auto rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold" style={{ color }}>{t("evaluationTitle")}</h2>
              <button onClick={() => setOpen(false)} className="text-gray-500 text-xl hover:text-gray-700">✕</button>
            </div>

            {selectedEvaluation?.map((q, idx) => (
              <div key={idx} className="border rounded mb-4 p-4 bg-gray-50">
                <h3 className="font-semibold mb-3 text-lg">
                  {tcw("question")} {q.question_no} (Max {q.max_marks} marks)
                </h3>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  {[
                    { label: t("aiMarks"), value: q.ai_awarded_marks, disabled: true },
                    {
                      label: t("facultyAdjustment"),
                      value: q.grace_marks ?? 0,
                      disabled: false,
                      onChange: (e) => {
                        let grace = Number(e.target.value);
                        grace = Math.max(-q.ai_awarded_marks, Math.min(q.max_marks - q.ai_awarded_marks, grace));
                        setSelectedEvaluation((prev) =>
                          prev.map((item, i) => i === idx ? { ...item, grace_marks: grace, final_marks: item.ai_awarded_marks + grace } : item)
                        );
                      },
                      min: -q.ai_awarded_marks,
                      max: q.max_marks - q.ai_awarded_marks,
                    },
                    { label: t("finalMarks"), value: q.final_marks ?? q.ai_awarded_marks, disabled: true, extraClass: "bg-green-50 font-semibold" },
                  ].map(({ label, value, disabled, onChange, min, max, extraClass = "" }) => (
                    <div key={label}>
                      <p className="text-sm font-medium text-gray-600 mb-1">{label}</p>
                      <input
                        type="number" value={value} disabled={disabled}
                        onChange={onChange} min={min} max={max}
                        className={`w-full border rounded p-2 ${disabled ? "bg-gray-100" : ""} ${extraClass}`}
                      />
                    </div>
                  ))}
                </div>

                {/* CO Mapping */}
                {user?.hasCOAccess && q.cos && q.cos.length > 0 && (
                  <div className="mb-4">
                    <p className="font-medium mb-2" style={{ color }}>{t("COMapping")}</p>
                    <div className="overflow-x-auto">
                      <table className="w-full border border-gray-300 text-sm">
                        <thead style={{ backgroundColor: withAlpha(color, 0.1) }}>
                          <tr>
                            {[t("coCode"), t("aiCOMarks"), t("facultyAdjustments"), t("finalCOMarks"), t("remark")].map(h => (
                              <th key={h} className="border p-2 text-left">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {q.cos.map((co, coIdx) => (
                            <tr key={coIdx}>
                              <td className="border p-2 font-semibold">{co.co_code}</td>
                              <td className="border p-2 text-center">{co.ai_marks}</td>
                              <td className="border p-2 text-center">
                                <input
                                  type="number" value={co.grace_marks ?? 0}
                                  min={-co.ai_marks} max={co.max_marks - co.ai_marks}
                                  onChange={(e) => {
                                    let grace = Number(e.target.value);
                                    grace = Math.max(-co.ai_marks, Math.min(q.max_marks - co.ai_marks, grace));
                                    setSelectedEvaluation((prev) =>
                                      prev.map((item, i) =>
                                        i === idx ? {
                                          ...item,
                                          cos: item.cos.map((c, j) =>
                                            j === coIdx ? { ...c, grace_marks: grace, final_co_marks: c.ai_marks + grace } : c
                                          ),
                                        } : item
                                      )
                                    );
                                  }}
                                  className="w-20 border rounded p-1 text-center"
                                />
                              </td>
                              <td className="border p-2 text-center font-semibold text-green-600">
                                {co.final_co_marks || co.ai_marks}
                              </td>
                              <td className="border p-2 text-gray-600">{co.remarks}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Parameters */}
                <div className="mb-4">
                  <p className="font-medium mb-2">{t("parameters")}</p>
                  <div className="overflow-x-auto">
                    <table className="w-full border border-gray-300 text-sm">
                      <thead className="bg-gray-100">
                        <tr>
                          {[t("parameter"), `${t("percentage")} (%)`, t("marksAllotted"), t("remark")].map(h => (
                            <th key={h} className="border p-2 text-left">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {q.parameters?.map((p, pIdx) => (
                          <tr key={pIdx}>
                            <td className="border p-2 font-medium">{p.name}</td>
                            <td className="border p-2 text-center">{p.weight_percentage}</td>
                            <td className="border p-2 text-center">{p.ai_score}</td>
                            <td className="border p-2 text-gray-600">{p.remarks}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Reasoning / Feedback / Improvement */}
                {[
                  { label: t("reasoning"),    value: q.reasoning    },
                  { label: t("feedback"),     value: q.feedback     },
                  { label: t("improvement"),  value: q.improvement  },
                ].filter(x => x.value).map(({ label, value }) => (
                  <div key={label} className="mb-3">
                    <p className="text-sm font-semibold mb-1">{label}</p>
                    <p className="text-sm text-gray-700 bg-white p-2 rounded border">{value}</p>
                  </div>
                ))}
              </div>
            ))}

            {/* Summary Footer */}
            <div className="grid grid-cols-4 gap-4 bg-gray-800 text-white p-4 rounded">
              {[
                { label: t("aiMarks"),    value: selectedEvaluation?.reduce((s, q) => s + (Number(q.ai_awarded_marks) || 0), 0), cls: "" },
                { label: t("adjustment"), value: selectedEvaluation?.reduce((s, q) => s + (Number(q.grace_marks) || 0), 0),       cls: "" },
                { label: t("finalScore"), value: selectedEvaluation?.reduce((s, q) => s + (Number(q.ai_awarded_marks) || 0) + (Number(q.grace_marks) || 0), 0), cls: "text-green-400" },
                { label: t("totalMarks"), value: total, cls: "" },
              ].map(({ label, value, cls }) => (
                <div key={label} className="text-center">
                  <p className="text-xs text-gray-300 mb-1">{label}</p>
                  <p className={`text-lg font-bold ${cls}`}>{value}</p>
                </div>
              ))}
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setOpen(false)} className="px-6 py-2 bg-gray-200 rounded hover:bg-gray-300">
                {tc("cancel")}
              </button>
              <button
                onClick={handleSubmit}
                className="px-6 py-2 text-white rounded"
                style={{ backgroundColor: color }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = darkenColor(color))}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = color)}
              >
                {t("saveEvaluation")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}