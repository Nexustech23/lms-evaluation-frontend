"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useParams, usePathname } from "next/navigation";
import axios from "axios";
import Navbar from "@/components/ui/Navbar";
import Spinner from "@/components/ui/Spinner";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";
import { FaArrowLeft } from "react-icons/fa";
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

const EMPTY_QUESTION = () => ({
  minMarks: "",
  maxMarks: "",
  guidelines: "",
  parameters: [],
});

export default function EvaluationParameterWithoutCO() {
  const router = useRouter();
  const { user } = useContext(AuthContext);
  const params = useParams();
  const pathname = usePathname();

  const t = useTranslations("evaluationwithoutCO");
  const tc = useTranslations("common");
  const folderId =
    params?.id ||
    (pathname ? pathname.split('/').filter(Boolean).pop() : null) ||
    (typeof window !== 'undefined'
      ? window.location.pathname.split('/').filter(Boolean).pop()
      : null) ||
    null;

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  // Folder metadata (used for question count fallback)
  const [folderData, setFolderData] = useState(null);
  // Whether evaluation details already existed (edit vs fresh fill)
  const [hasExistingEval, setHasExistingEval] = useState(false);
 const [totalMarks, setTotalMarks] = useState()
  const [questionInputs, setQuestionInputs] = useState([]);

  const fetchFolderDetails = useCallback(async () => {
    const res = await axios.get(
      `/api/newsaved-documents/${folderId}`,
      {   withCredentials: true, 
       }
    );
    return res.data.folder || res.data;
  }, [folderId]);

  const fetchEvaluationDetails = useCallback(async () => {
    const res = await axios.get(
      `/api/evaluation-details/${folderId}`,
      {
          withCredentials: true, 
       
      }
    );
    // Return null if no evaluation exists yet (404 / empty)
     setTotalMarks(res?.data?.evaluation?.totalMarks)
    return res.data?.evaluation?.questionEvaluationDetails || null;
  }, [folderId]);

  // ─── Initialise ───────────────────────────────────────────────────────────

  useEffect(() => {
    if (!folderId) {
      toast.error("No folder ID found in URL");
      setLoading(false);
      return;
    }

    const init = async () => {
      setLoading(true);
      try {
        // Run both requests concurrently; evaluation 404 is non-fatal
        const [folder, evalDetails] = await Promise.allSettled([
          fetchFolderDetails(),
          fetchEvaluationDetails(),
        ]);

        const folderResult =
          folder.status === "fulfilled" ? folder.value : null;
        const evalResult =
          evalDetails.status === "fulfilled" ? evalDetails.value : null;

        if (!folderResult) {
          toast.error("Failed to load exam folder");
          return;
        }

        setFolderData(folderResult);

        if (evalResult && Array.isArray(evalResult) && evalResult.length > 0) {
          // ── Edit path: pre-fill from existing evaluation details ──
          setHasExistingEval(true);
          setQuestionInputs(
            evalResult.map((q) => ({
              minMarks: q.minMarks ?? "",
              maxMarks: q.maxMarks ?? "",
              guidelines: q.guidelines ?? "",
              parameters: Array.isArray(q.parameters) ? q.parameters : [],
            }))
          );
        } else {
          // ── Create path: blank inputs, count from question paper ──
          setHasExistingEval(false);
          const count =
            folderResult?.question_paper?.no_of_questions ||
            folderResult?.question_paper?.noofquestion ||
            folderResult?.questionpaperfile?.no_of_question ||
            folderResult?.numberOfQuestions ||
            0;

          if (!count) {
            toast.error("Could not determine number of questions from folder");
          }

          setQuestionInputs(
            Array.from({ length: Number(count) }, EMPTY_QUESTION)
          );
        }
      } catch (err) {
        toast.error("An unexpected error occurred while loading data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [folderId, fetchFolderDetails, fetchEvaluationDetails]);

  // ─── Handlers ─────────────────────────────────────────────────────────────

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
      const alreadyExists = updated[qIndex].parameters.some(
        (p) => p.name === value
      );
      if (!alreadyExists) {
        updated[qIndex] = {
          ...updated[qIndex],
          parameters: [
            ...updated[qIndex].parameters,
            { name: value, percentage: 0, isCustom: false },
          ],
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
        parameters: [
          ...updated[qIndex].parameters,
          { name: "", percentage: 0, isCustom: true },
        ],
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

  const getTotalPercentage = (params) =>
    params.reduce((sum, p) => sum + Number(p.percentage || 0), 0);

  // ─── Validation ───────────────────────────────────────────────────────────

  const validateBeforeSubmit = () => {
    const errors = [];
    questionInputs.forEach((q, i) => {
      const n = i + 1;
      if (!q.minMarks || !q.maxMarks)
        errors.push(`Question ${n}: Min / Max marks are required`);

      if (q.parameters.length > 0) {
        const total = getTotalPercentage(q.parameters);
        if (total !== 100)
          errors.push(
            `Question ${n}: Percentages must add up to 100 (current: ${total})`
          );

        q.parameters.forEach((p) => {
          if (!p.name?.trim())
            errors.push(`Question ${n}: A parameter is missing a name`);
          if (!p.percentage || p.percentage <= 0)
            errors.push(
              `Question ${n}: Invalid percentage for "${p.name || "Unnamed"}"`
            );
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
        { questionEvaluationDetails: questionInputs ,totalMarks: totalMarks },
        {
            withCredentials: true, 
       
        }
      );
      toast.success(
        hasExistingEval
          ? "Evaluation details updated successfully!"
          : "Evaluation details saved successfully!"
      );
      router.back(-1)
    } catch (error) {
      toast.error(
        error?.response?.data?.error ||
          "Failed to save evaluation details. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    
    <div className="min-h-screen" style={{ backgroundColor: user?.color || "#ff7f10" }}>
      <Navbar title={t("title")} />

      <div className="mb-4">
              <button
                onClick={() => router.back()}
                style={{ color: user?.color || "#ff7f10" }}
className="flex items-center mb-4 px-4 ml-36 py-2 text-sm bg-white rounded hover:opacity-80"
              >
                <FaArrowLeft />
                {tc("back")}
              </button>
            </div>

      <div className="p-6 max-w-5xl mx-auto">
        <div className="bg-white p-6 rounded shadow">

          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-xl font-bold"
style={{ color: user?.color || "#ff7f10" }}>
             {t("evaluationParameters")}
            </h2>
            {!loading && (
              <span
                className={`text-xs font-semibold px-2 py-1 rounded-full ${
                  hasExistingEval
                    ? "bg-blue-100 text-blue-700"
                    : "bg-green-100 text-green-700"
                }`}
              >
                {hasExistingEval ? "Edit Mode" : "Create Mode"}
              </span>
            )}
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Spinner />
              <p className="text-sm text-gray-500">Loading evaluation data…</p>
            </div>
          ) : questionInputs.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <p className="text-lg font-medium">{t("noQuestions")}</p>
              <p className="text-sm mt-1">
                {t("noQuestionsDesc")}
              </p>
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
                      <h3 className="font-semibold text-gray-800">
                        {t("question")} {qIndex + 1}
                      </h3>
                      {input.parameters.length > 0 && (
                        <span
                          className={`text-xs px-2 py-1 rounded-full font-medium ${
                            isOver
                              ? "bg-red-100 text-red-600"
                              : isComplete
                              ? "bg-green-100 text-green-600"
                              : "bg-yellow-100 text-yellow-600"
                          }`}
                        >
                          {total}% / 100%
                        </span>
                      )}
                    </div>

                    {/* Min / Max marks */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t("minMarks")} <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          placeholder={t("minMarks")}
                          value={input.minMarks}
                          onChange={(e) =>
                            handleInputChange(qIndex, "minMarks", e.target.value)
                          }
                          className="w-full p-2 border rounded focus:outline-none focus:ring-2  focus:ring-green-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t("maxMarks")} <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          placeholder="Max Marks"
                          value={input.maxMarks}
                          onChange={(e) =>
                            handleInputChange(qIndex, "maxMarks", e.target.value)
                          }
                          className="w-full p-2 border rounded  focus:outline-none
  focus:ring-2
  focus:ring-gray-400"
                        />
                      </div>
                    </div>

                    {/* Guidelines */}
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t("guideline")}
                      </label>
                      <input
                        type="text"
                        placeholder={t("guidelinePlaceholder")}
                        value={input.guidelines}
                        onChange={(e) =>
                          handleInputChange(qIndex, "guidelines", e.target.value)
                        }
                        className="w-full p-2 border rounded focus:outline-none focus:ring-2  focus:ring-green-500"
                      />
                    </div>

                    {/* Parameters section */}
                    <div className="mt-5">
                      {/* Percentage progress bar */}
                      {input.parameters.length > 0 && (
                        <div className="mb-3">
                          <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>{t("percentageAllocated")}</span>
                            <span>{total} / 100</span>
                          </div>
                          <div className="w-full bg-gray-200 h-2 rounded">
                            <div
                              className={`h-2 rounded transition-all duration-300 ${
                                isOver ? "bg-red-500" : "bg-green-500"
                              }`}
                              style={{ width: `${Math.min(total, 100)}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Parameter selector */}
                      <select
                        value=""
                        onChange={(e) =>
                          handleSelectParameter(qIndex, e.target.value)
                        }
                        className="w-full p-2 border rounded text-gray-700"
                      >
                        <option value="" disabled>
                          {t("selectParameter")}
                        </option>
                        {MARK_PARAMETERS.map((p) => (
                          <option
                            key={p}
                            value={p}
                            disabled={input.parameters.some((x) => x.name === p)}
                          >
                            {p}
                          </option>
                        ))}
                      </select>

                      {/* Parameter table */}
                      {input.parameters.length > 0 && (
                        <div className="mt-3 border rounded overflow-hidden">
                          <div className="grid grid-cols-3 bg-gray-100 text-sm font-medium text-gray-600">
                            <div className="p-2">{t("parameter")}</div>
                            <div className="p-2 text-center">{t("percentage")}</div>
                            <div className="p-2 text-center">{ts("action")}</div>
                          </div>
                          {input.parameters.map((p, pIndex) => (
                            <div
                              key={pIndex}
                              className="grid grid-cols-3 border-t items-center"
                            >
                              <div className="p-2">
                                {p.isCustom ? (
                                  <input
                                    type="text"
                                    placeholder={t("customParameterPlaceholder")}
                                    value={p.name}
                                    onChange={(e) =>
                                      handleCustomNameChange(
                                        qIndex,
                                        pIndex,
                                        e.target.value
                                      )
                                    }
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
                                  onChange={(e) =>
                                    handlePercentageChange(
                                      qIndex,
                                      pIndex,
                                      e.target.value
                                    )
                                  }
                                  className="w-20 p-1 border rounded text-center text-sm"
                                />
                              </div>
                              <div className="p-2 flex justify-center">
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleRemoveParameter(qIndex, pIndex)
                                  }
                                  className="text-red-500 text-sm hover:underline"
                                >
                                  {t("remove")}
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Add custom parameter */}
                      <div className="mt-3 flex justify-end">
                        <button
                          type="button"
                          onClick={() => handleAddCustomParameter(qIndex)}
                          style={{ backgroundColor: user?.color || "#ff7f10" }}
className="text-sm text-white px-3 py-1 rounded hover:opacity-90"
                        >
                         {t("addCustomParameter")}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("totalMarks")} <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  placeholder={t("totalMarks")}
                  value={totalMarks}
                  onChange={(e) => setTotalMarks(e.target.value)}
                  className="w-full p-2 border rounded  focus:outline-none
  focus:ring-2
  focus:ring-gray-400"
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
  className="px-6 py-2 text-white rounded hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting
                    ? tc("saving")
                    : hasExistingEval
                    ? tc("update")
                    : tc("save")}
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
              {hasExistingEval
                ? "Confirm evaluation update?"
                : "Confirm evaluation save?"}
            </p>
            <p className="text-sm text-gray-500 mb-6">
              {hasExistingEval
                ? "This will overwrite the existing evaluation details."
                : `You are setting parameters for ${questionInputs.length} question(s).`}
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
  className="px-4 py-2 text-white rounded text-sm hover:opacity-90 disabled:opacity-60"
              >
                {isSubmitting ? tc("saving") : t("confirm")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}