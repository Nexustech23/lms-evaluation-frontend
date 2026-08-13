"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useParams, usePathname } from "next/navigation";
import axios from "axios";
import Navbar from "@/components/ui/Navbar";
import Spinner from "@/components/ui/Spinner";
import toast from "react-hot-toast";
import { FaArrowLeft } from "react-icons/fa";
import { useTranslations } from "next-intl";
import { useContext } from "react";
import { AuthContext } from "@/app/AuthContext";

const MARK_PARAMETERS = [
  "Accuracy of answer",
  "Accuracy of calculations",
  "Logical flow of answer",
  "Grammar",
  "Correctness of formulae",
  "Logical arguments and conclusion",
];

const EMPTY_QUESTION = (maxMarks = "", cos = []) => ({
  minMarks: 0,
  maxMarks,
  parameters: [],
  cos, // [{ co_code, description, marks }]
});

// Pulls each question's marks (e.g. "Q1. ... [5 Marks] [CO1]") from the raw
// question-paper text, in order, so maxMarks can be prefilled instead of
// left blank — teacher can still edit it, this is just a starting value.
const parseQuestionMarksFromPaperText = (text) => {
  if (!text || typeof text !== "string") return [];
  const blocks = text.split(/(?=^Q\d+[.)])/m).filter((b) => /^Q\d+[.)]/.test(b));
  return blocks.map((block) => {
    const match = block.match(/\[(\d+)\s*Marks?\]/i);
    return match ? Number(match[1]) : "";
  });
};

// Pulls each question's CO tag(s) (e.g. "[CO1]" or "[CO2, CO3]") from the
// raw question-paper text, in order — mirrors the marks parser above.
const parseQuestionCOsFromPaperText = (text) => {
  if (!text || typeof text !== "string") return [];
  const blocks = text.split(/(?=^Q\d+[.)])/m).filter((b) => /^Q\d+[.)]/.test(b));
  return blocks.map((block) => {
    const match = block.match(/\[\s*(CO\d+(?:\s*,\s*CO\d+)*)\s*\]/i);
    if (!match) return [];
    return match[1].split(",").map((c) => c.trim().toUpperCase());
  });
};

// ─── Per-question CO section ──────────────────────────────────────────────────
function QuestionCOSection({ qIndex, input, coveredCOs, onAdd, onRemove, onMarksChange }) {
  const [selectedCode, setSelectedCode] = useState("");
  const addedCodes = input.cos.map((c) => c.co_code);
  const unselected = coveredCOs.filter((c) => !addedCodes.includes(c.co_code));

  // Each CO's marks are an independent cap on that question (matches the AI
  // grading rubric: "cap each CO's awarded marks at that CO's max marks") —
  // not a shared pool that has to sum to the question's total. A question
  // worth 10 marks tagged with both CO3 and CO4 can validly award up to 10
  // for each, since they're graded as separate outcomes on the same answer.
  const maxMarks = Number(input.maxMarks) || 0;
  const coExceedsMax = maxMarks > 0 && input.cos.some((c) => Number(c.marks || 0) > maxMarks);

  const handleAdd = () => {
    if (!selectedCode) return;
    const co = coveredCOs.find((c) => c.co_code === selectedCode);
    if (co) {
      onAdd(qIndex, co);
      setSelectedCode("");
    }
  };

  return (
    <div className="mt-5 border-t pt-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-gray-700">Course Outcomes (COs)</h4>
        {input.cos.length > 0 && (
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-medium ${coExceedsMax
              ? "bg-red-100 text-red-600"
              : "bg-green-100 text-green-600"
              }`}
          >
            {coExceedsMax ? "Some CO marks exceed max" : `Max marks per CO: ${maxMarks || "—"}`}
          </span>
        )}
      </div>

      {coveredCOs.length === 0 ? (
        <p className="text-xs text-gray-400">No covered COs found for this exam.</p>
      ) : (
        <>
          {/* CO picker */}
          <div className="flex gap-2">
            <select
              value={selectedCode}
              onChange={(e) => setSelectedCode(e.target.value)}
              className="flex-1 p-2 border rounded text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ff7f10]"
            >
              <option value="">+ Select a CO to add</option>
              {unselected.map((co) => (
                <option key={co.co_code} value={co.co_code}>
                  {co.co_code}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleAdd}
              disabled={!selectedCode}
              className="px-4 py-2 bg-[#ff7f10] text-white text-sm rounded hover:bg-[#e6730e] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Add
            </button>
          </div>

          {/* Added COs */}
          {input.cos.length > 0 && (
            <div className="mt-3 border rounded overflow-hidden">
              {/* Header */}
              <div className="grid grid-cols-12 bg-gray-100 text-xs font-semibold text-gray-600">
                <div className="col-span-2 p-2">CO Code</div>
                <div className="col-span-7 p-2">Description</div>
                <div className="col-span-2 p-2 text-center">Marks</div>
                <div className="col-span-1 p-2" />
              </div>

              {input.cos.map((co, cIdx) => {
                const thisExceedsMax = maxMarks > 0 && Number(co.marks || 0) > maxMarks;
                return (
                <div key={co.co_code} className="grid grid-cols-12 border-t items-center">
                  <div className="col-span-2 p-2">
                    <span className="inline-block bg-orange-100 text-orange-700 text-xs font-bold px-2 py-0.5 rounded">
                      {co.co_code}
                    </span>
                  </div>
                  <div className="col-span-7 p-2 text-xs text-gray-600 leading-snug truncate">
                    {co.description}
                  </div>
                  <div className="col-span-2 p-2 flex justify-center">
                    <input
                      type="number"
                      min="0"
                      max={maxMarks || undefined}
                      value={co.marks}
                      onChange={(e) => onMarksChange(qIndex, cIdx, e.target.value)}
                      placeholder="0"
                      className={`w-16 p-1 border rounded text-center text-sm focus:outline-none focus:ring-2 focus:ring-[#ff7f10] ${thisExceedsMax ? "border-red-400" : ""
                        }`}
                    />
                  </div>
                  <div className="col-span-1 p-2 flex justify-center">
                    <button
                      type="button"
                      onClick={() => onRemove(qIndex, cIdx)}
                      className="text-red-400 hover:text-red-600 text-lg leading-none"
                      title="Remove CO"
                    >
                      ×
                    </button>
                  </div>
                </div>
                );
              })}
            </div>
          )}

          {coExceedsMax && (
            <p className="text-xs text-red-500 mt-1">
              ⚠ One or more COs have marks exceeding this question&apos;s max marks ({maxMarks}).
            </p>
          )}

          {/* ── NO "all COs required" warning — CO assignment is optional per question ── */}
        </>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function EvaluationParameterCO() {
  const router = useRouter();
    const { user } = useContext(AuthContext);  
  const themeColor = user?.color || "#ff7f10"; 
  const params = useParams();
  const pathname = usePathname();
  const [totalMarks, setTotalMarks] = useState()

  // Trasnslations
  const t = useTranslations("evaluationCO");
  const twc = useTranslations("evaluationwithoutCO");
  const tc = useTranslations("common");

  const folderId =
    params?.id ||
    (pathname ? pathname.split("/").filter(Boolean).pop() : null) ||
    (typeof window !== "undefined"
      ? window.location.pathname.split("/").filter(Boolean).pop()
      : null) ||
    null;

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [folderData, setFolderData] = useState(null);
  const [hasExistingEval, setHasExistingEval] = useState(false);
  const [questionInputs, setQuestionInputs] = useState([]);

  // COs filtered to only those covered in this exam
  const [coveredCOs, setCoveredCOs] = useState([]); // [{ co_code, description }]

  // ─── API calls ─────────────────────────────────────────────────────────────

  const fetchFolderDetails = useCallback(async () => {
    const res = await axios.get(
      `/api/newsaved-documents/${folderId}`,
      {
        withCredentials: true,
      }
    );
    return res.data.folder || res.data;
  }, [folderId]);

  const fetchSubjectDetails = useCallback(async (subjectId) => {
    const res = await axios.get(
      `/api/subject/${subjectId}`,
      {
        withCredentials: true,
      }
    );
    return res.data.subject || res.data;
  }, []);

  const fetchEvaluationDetails = useCallback(async () => {
    const res = await axios.get(
      `/api/evaluation-details/${folderId}`,
      {
        withCredentials: true,
      }
    );
    setTotalMarks(res?.data?.evaluation?.totalMarks)
    return res.data?.evaluation?.questionEvaluationDetails || null;
  }, [folderId]);

  // ─── Init ──────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!folderId) {
      toast.error("No folder ID found in URL");
      setLoading(false);
      return;
    }

    const init = async () => {
      setLoading(true);
      try {
        const [folderSettled, evalSettled] = await Promise.allSettled([
          fetchFolderDetails(),
          fetchEvaluationDetails(),
        ]);

        const folder = folderSettled.status === "fulfilled" ? folderSettled.value : null;
        const evalResult = evalSettled.status === "fulfilled" ? evalSettled.value : null;

        if (!folder) { toast.error("Failed to load exam folder"); return; }
        setFolderData(folder);

        // ── 1. Parse covered_cos — backend returns JSON string e.g. "[\"CO1\",\"CO2\"]" ──
        let coveredCoCodes = [];
        const rawCOs = folder.covered_cos;
        if (Array.isArray(rawCOs)) {
          coveredCoCodes = rawCOs;
        } else if (typeof rawCOs === "string") {
          try { coveredCoCodes = JSON.parse(rawCOs); } catch { coveredCoCodes = []; }
        }

        // ── 2. Fetch subject and filter its co[] to only the covered ones ──
        const subjectId =
          typeof folder.subject_id === "object" && folder.subject_id?.$oid
            ? folder.subject_id.$oid
            : folder.subject_id;

        let filteredCOs = [];
        if (subjectId) {
          try {
            const subject = await fetchSubjectDetails(subjectId);
            // subject.co → [{ co_code, description }]
            const allCOs = subject?.co || subject?.cos || [];
            filteredCOs = coveredCoCodes.length > 0
              ? allCOs.filter((c) => coveredCoCodes.includes(c.co_code))
              : allCOs;
          } catch {
            toast.error("Could not load subject CO details");
          }
        }
        setCoveredCOs(filteredCOs);

        // ── 3. Build question inputs ──
        if (evalResult && Array.isArray(evalResult) && evalResult.length > 0) {
          setHasExistingEval(true);
          setQuestionInputs(
            evalResult.map((q) => ({
              minMarks: q.minMarks ?? 0,
              maxMarks: q.maxMarks ?? "",
              parameters: Array.isArray(q.parameters) ? q.parameters : [],
              cos: Array.isArray(q.cos) ? q.cos : [],
            }))
          );
        } else {
          setHasExistingEval(false);
          const count =
            folder?.question_paper?.no_of_questions ||
            folder?.question_paper?.noofquestion ||
            folder?.questionpaperfile?.no_of_question ||
            folder?.numberOfQuestions ||
            0;

          if (!count) toast.error("Could not determine number of questions from folder");

          const paperText = folder?.question_paper?.text;
          const parsedMarks = parseQuestionMarksFromPaperText(paperText);
          const parsedCOs = parseQuestionCOsFromPaperText(paperText);
          const droppedTags = []; // { qNo, code } — paper-tagged COs not in this exam's covered_cos
          setQuestionInputs(
            Array.from({ length: Number(count) }, (_, i) => {
              const qMaxMarks = parsedMarks[i] ?? "";
              // Each tagged CO gets the question's full marks, not a split —
              // e.g. a 10-mark question tagged [CO3, CO4] prefills both at 10.
              const prefilledCOs = (parsedCOs[i] || [])
                .map((code) => {
                  const co = filteredCOs.find((c) => c.co_code === code);
                  if (!co) droppedTags.push({ qNo: i + 1, code });
                  return co;
                })
                .filter(Boolean)
                .map((co) => ({ co_code: co.co_code, description: co.description, marks: qMaxMarks }));
              return EMPTY_QUESTION(qMaxMarks, prefilledCOs);
            })
          );

          if (droppedTags.length > 0) {
            const summary = droppedTags.map((d) => `Q${d.qNo}: ${d.code}`).join(", ");
            toast.error(
              `Question paper tags COs not declared for this exam (${summary}). ` +
              `Edit the exam's covered COs to include them, or these questions won't count toward those COs.`,
              { duration: 8000 }
            );
          }
        }
      } catch (err) {
        toast.error("An unexpected error occurred while loading data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [folderId, fetchFolderDetails, fetchEvaluationDetails, fetchSubjectDetails]);

  // ─── Parameter handlers ────────────────────────────────────────────────────

  const handleInputChange = (qIndex, field, value) => {
    setQuestionInputs((prev) => {
      const updated = [...prev];
      updated[qIndex] = { ...updated[qIndex], [field]: value };
      return updated;
    });
  };

  const handleSelectParameter = (qIndex, value) => {
    if (!value) return;
    setQuestionInputs((prev) => {
      const updated = [...prev];
      if (!updated[qIndex].parameters.some((p) => p.name === value)) {
        updated[qIndex] = {
          ...updated[qIndex],
          parameters: [...updated[qIndex].parameters, { name: value, percentage: 0, isCustom: false }],
        };
      }
      return updated;
    });
  };

  const handleAddCustomParameter = (qIndex) => {
    setQuestionInputs((prev) => {
      const updated = [...prev];
      updated[qIndex] = {
        ...updated[qIndex],
        parameters: [...updated[qIndex].parameters, { name: "", percentage: 0, isCustom: true }],
      };
      return updated;
    });
  };

  const handleRemoveParameter = (qIndex, pIndex) => {
    setQuestionInputs((prev) => {
      const updated = [...prev];
      updated[qIndex] = {
        ...updated[qIndex],
        parameters: updated[qIndex].parameters.filter((_, i) => i !== pIndex),
      };
      return updated;
    });
  };

  const handlePercentageChange = (qIndex, pIndex, value) => {
    setQuestionInputs((prev) => {
      const updated = [...prev];
      const params = [...updated[qIndex].parameters];
      params[pIndex] = { ...params[pIndex], percentage: Number(value) };
      updated[qIndex] = { ...updated[qIndex], parameters: params };
      return updated;
    });
  };

  const handleCustomNameChange = (qIndex, pIndex, value) => {
    setQuestionInputs((prev) => {
      const updated = [...prev];
      const params = [...updated[qIndex].parameters];
      params[pIndex] = { ...params[pIndex], name: value };
      updated[qIndex] = { ...updated[qIndex], parameters: params };
      return updated;
    });
  };

  // ─── CO handlers ──────────────────────────────────────────────────────────

  const handleAddCO = (qIndex, co) => {
    setQuestionInputs((prev) => {
      const updated = [...prev];
      updated[qIndex] = {
        ...updated[qIndex],
        cos: [...updated[qIndex].cos, { co_code: co.co_code, description: co.description, marks: "" }],
      };
      return updated;
    });
  };

  const handleRemoveCO = (qIndex, cIdx) => {
    setQuestionInputs((prev) => {
      const updated = [...prev];
      updated[qIndex] = {
        ...updated[qIndex],
        cos: updated[qIndex].cos.filter((_, i) => i !== cIdx),
      };
      return updated;
    });
  };

  const handleCOMarksChange = (qIndex, cIdx, value) => {
    setQuestionInputs((prev) => {
      const updated = [...prev];
      const cos = [...updated[qIndex].cos];
      cos[cIdx] = { ...cos[cIdx], marks: value };
      updated[qIndex] = { ...updated[qIndex], cos };
      return updated;
    });
  };

  const getTotalPercentage = (params) =>
    params.reduce((sum, p) => sum + Number(p.percentage || 0), 0);

  // ─── Validation ────────────────────────────────────────────────────────────

  const validateBeforeSubmit = () => {
    const errors = [];
    if (!totalMarks) {
      errors.push(`Total Marks are required`);

    }
    questionInputs.forEach((q, i) => {
      const n = i + 1;
      const maxMarks = Number(q.maxMarks);

      // NOTE: minMarks defaults to 0, a valid value — `== null` (not a plain
      // falsy check) correctly treats 0 as present. Empty string is checked
      // separately since maxMarks can be prefilled as "" when marks
      // couldn't be parsed from the question paper text.
      if (
        q.minMarks == null || q.minMarks === "" ||
        q.maxMarks == null || q.maxMarks === "" || Number(q.maxMarks) <= 0
      ) {
        errors.push(`Question ${n}: Min / Max marks are required`);
      }

      // Parameter percentage check
      if (q.parameters.length > 0) {
        const total = getTotalPercentage(q.parameters);
        if (total !== 100)
          errors.push(`Question ${n}: Percentages must add up to 100 (current: ${total})`);
        q.parameters.forEach((p) => {
          if (!p.name?.trim())
            errors.push(`Question ${n}: A parameter is missing a name`);
          if (!p.percentage || p.percentage <= 0)
            errors.push(`Question ${n}: Invalid percentage for "${p.name || "Unnamed"}"`);
        });
      }

      // CO checks — only validate COs that were actually added; none are mandatory
      if (q.cos.length > 0) {
        q.cos.forEach((co) => {
          if (!co.marks || Number(co.marks) <= 0)
            errors.push(`Question ${n}: Marks required for ${co.co_code}`);
        });

        // Each CO's marks are an independent cap on the question, not a
        // shared pool — a 10-mark question tagged with 2 COs can validly
        // award up to 10 for each, so this checks each CO on its own rather
        // than summing them against the question's max.
        const maxMarks = Number(q.maxMarks) || 0;
        q.cos.forEach((co) => {
          if (maxMarks > 0 && Number(co.marks) > maxMarks)
            errors.push(`Question ${n}: ${co.co_code} marks (${co.marks}) exceed the question's max marks (${maxMarks})`);
        });
      }
    });
    return errors.length ? errors : null;
  };

  const handleSubmit = () => {
    const validationErrors = validateBeforeSubmit();
    if (validationErrors) {
      validationErrors.forEach((err) => toast.error(err));
      return;
    }
    setShowConfirm(true);
  };

  const confirmSubmission = async () => {
    setIsSubmitting(true);
    setShowConfirm(false);
    try {
      await axios.post(
        `/api/evaluation-details/${folderId}`,
        { questionEvaluationDetails: questionInputs, totalMarks: totalMarks },
        {
          withCredentials: true,
        }
      );
      toast.success(
        hasExistingEval
          ? "Evaluation details updated successfully!"
          : "Evaluation details saved successfully!"
      );
      router.back(-1);
    } catch (error) {
      toast.error(
        error?.response?.data?.error ||
        "Failed to save evaluation details. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
   <div className="min-h-screen" style={{ backgroundColor: themeColor }}>
      <Navbar title={t("title")} />

      <div className="mb-4">
        <button
          onClick={() => router.back()}
            style={{ backgroundColor: user?.color || "#ff7f10" }}
          className="flex items-center mb-4 px-4 ml-6 py-2 text-sm rounded text-white border"
        >
          <FaArrowLeft />
          {tc("back")}
        </button>
      </div>

      <div className="p-6 max-w-8xl mx-auto">
        <div className="bg-white p-6 rounded shadow">

          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-xl font-bold" style={{ color: themeColor }}>
              {t("evaluationParameters")}
            </h2>
            {!loading && (
              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${hasExistingEval ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"}`}>
                {hasExistingEval ? "Edit Mode" : "Create Mode"}
              </span>
            )}
            {/* Show available covered COs as informational tags only */}
            {!loading && coveredCOs.length > 0 && (
              <div className="ml-auto flex gap-1 flex-wrap justify-end items-center">
                {coveredCOs.map((co) => (
                  <span key={co.co_code} className="text-xs bg-orange-100 text-orange-700 font-semibold px-2 py-0.5 rounded-full">
                    {co.co_code}
                  </span>
                ))}
                <span className="text-xs text-gray-400 ml-1">{twc("availableCOs")}</span>
              </div>
            )}
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Spinner />
              <p className="text-sm text-gray-500">{t("loading")}</p>
            </div>
          ) : questionInputs.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <p className="text-lg font-medium">{t("noQuestions")}</p>
              <p className="text-sm mt-1">{t("noQuestionsDesc")}</p>
            </div>
          ) : (
            <>
              {questionInputs.map((input, qIndex) => {
                const total = getTotalPercentage(input.parameters);
                const isOver = total > 100;
                const isComplete = total === 100;

                return (
                  <div key={qIndex} className="mb-8 border rounded-lg p-4">
                    {/* Question header */}
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-800">{twc("question")} {qIndex + 1}</h3>
                      <div className="flex items-center gap-2">
                        {/* Simple informational CO count badge — no required/missing pressure */}
                        {input.cos.length > 0 && (
                          <span className="text-xs px-2 py-1 rounded-full font-medium bg-orange-100 text-orange-600">
                            {input.cos.length} CO{input.cos.length > 1 ? "s" : ""} {twc("assignedCO")}
                          </span>
                        )}
                        {input.parameters.length > 0 && (
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${isOver ? "bg-red-100 text-red-600" : isComplete ? "bg-green-100 text-green-600" : "bg-yellow-100 text-yellow-600"}`}>
                            {total}% / 100%
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Min / Max marks */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {twc("minMarks")} <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          placeholder={twc("minMarks")}
                          value={input.minMarks}
                          onChange={(e) => handleInputChange(qIndex, "minMarks", e.target.value)}
                          className="w-full p-2 border rounded focus:outline-none focus:ring-2"
                          style={{ outlineColor: themeColor }}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {twc("maxMarks")} <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          placeholder={twc("maxMarks")}
                          value={input.maxMarks}
                          onChange={(e) => handleInputChange(qIndex, "maxMarks", e.target.value)}
                          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#ff7f10]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {/* ── Parameters section ── */}
                      <div className="mt-5 border-t pt-4">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3">{twc("markParameters")}</h4>

                        {/* Percentage progress bar */}
                        {input.parameters.length > 0 && (
                          <div className="mb-3">
                            <div className="flex justify-between text-xs text-gray-500 mb-1">
                              <span>{twc("percentageAllocated")}</span>
                              <span>{total} / 100</span>
                            </div>
                            <div className="w-full bg-gray-200 h-2 rounded">
                              <div
                                className={`h-2 rounded transition-all duration-300 ${isOver ? "bg-red-500" : "bg-green-500"}`}
                                style={{ width: `${Math.min(total, 100)}%` }}
                              />
                            </div>
                          </div>
                        )}

                        <select
                          value=""
                          onChange={(e) => handleSelectParameter(qIndex, e.target.value)}
                          className="w-full p-2 border rounded text-gray-700"
                        >
                          <option value="" disabled>+ Select Parameters</option>
                          {MARK_PARAMETERS.map((p) => (
                            <option key={p} value={p} disabled={input.parameters.some((x) => x.name === p)}>
                              {p}
                            </option>
                          ))}
                        </select>

                        {input.parameters.length > 0 && (
                          <div className="mt-3 border rounded overflow-hidden">
                            <div className="grid grid-cols-3 bg-gray-100 text-sm font-medium text-gray-600">
                              <div className="p-2">{twc("parameter")}</div>
                              <div className="p-2 text-center">{twc("percentage")}</div>
                              <div className="p-2 text-center">{twc("action")}</div>
                            </div>
                            {input.parameters.map((p, pIndex) => (
                              <div key={pIndex} className="grid grid-cols-3 border-t items-center">
                                <div className="p-2">
                                  {p.isCustom ? (
                                    <input
                                      type="text"
                                      placeholder={twc("customParameterPlaceholder")}
                                      value={p.name}
                                      onChange={(e) => handleCustomNameChange(qIndex, pIndex, e.target.value)}
                                      className="w-full p-1 border rounded text-sm"
                                    />
                                  ) : (
                                    <span className="text-sm">{p.name}</span>
                                  )}
                                </div>
                                <div className="p-2 flex justify-center">
                                  <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={p.percentage}
                                    onChange={(e) => handlePercentageChange(qIndex, pIndex, e.target.value)}
                                    className="w-20 p-1 border rounded text-center text-sm"
                                  />
                                </div>
                                <div className="p-2 flex justify-center">
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveParameter(qIndex, pIndex)}
                                    className="text-red-500 text-sm hover:underline"
                                  >
                                    {twc("remove")}
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="mt-3 flex justify-end">
                          <button
                            type="button"
                            onClick={() => handleAddCustomParameter(qIndex)}
                            style={{ backgroundColor: themeColor }}
className="text-sm text-white px-3 py-1 rounded hover:opacity-90"
                          >
                            {twc("addCustomParameter")}
                          </button>
                        </div>
                      </div>

                      {/* ── CO section ── */}
                      <QuestionCOSection
                        qIndex={qIndex}
                        input={input}
                        coveredCOs={coveredCOs}
                        onAdd={handleAddCO}
                        onRemove={handleRemoveCO}
                        onMarksChange={handleCOMarksChange}
                      />
                    </div>
                  </div>
                );
              })}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {twc("totalMarks")} <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  placeholder={twc("totalMarks")}
                  value={totalMarks}
                  onChange={(e) => setTotalMarks(e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#ff7f10]"
                />
              </div>

              {/* Action buttons */}
              <div className="flex justify-between mt-6">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-6 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded"
                >
                  {tc("cancel")}
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleSubmit}
                   style={{ backgroundColor: user?.color || "#ff7f10" }}
                  className="px-6 py-2  text-white rounded  disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? tc("saving") : hasExistingEval ? tc("update") : tc("save")}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Confirm modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <p className="font-semibold text-gray-800 mb-2">
              {hasExistingEval ? t("confirmUpdate") : t("confirmSave")}
            </p>
            <p className="text-sm text-gray-500 mb-6">
              {hasExistingEval
                ? t("confirmUpdateDesc")
                : t("confirmSaveDesc", { count: questionInputs.length })}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 text-sm"
              >
                {tc("cancel")}
              </button>
              <button
                onClick={confirmSubmission}
                disabled={isSubmitting}
                 style={{ backgroundColor: user?.color || "#ff7f10" }}
                className="px-4 py-2 text-white rounded text-sm disabled:opacity-60"
              >
                {isSubmitting ? tc("saving") : tc("confirm")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}