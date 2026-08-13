"use client";

import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { useRouter, useParams } from "next/navigation";
import { IconPlus, IconTrash } from "@tabler/icons-react";
import { FaArrowLeft } from "react-icons/fa";
import Navbar from "@/components/ui/Navbar";
import Spinner from "@/components/ui/Spinner";
import toast from "react-hot-toast";
import { AuthContext } from "@/app/AuthContext";

const emptyFallbackRow = () => ({ student_id: "", marks: "" });
const emptyRubricRow = (questionCount) => ({
  student_id: "",
  qmarks: Array.from({ length: questionCount }, () => ""),
});

export default function ManualMarksEntryPage() {
  const { user } = useContext(AuthContext);
  const color = user?.color || "#ff7f10";
  const router = useRouter();
  const params = useParams();
  const examId = params?.examId || null;

  const [folderName, setFolderName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Rubric mode (preferred — enables CO/PO attainment for these students)
  const [rubricQuestions, setRubricQuestions] = useState(null); // null = no rubric found
  const [rubricTotalMarks, setRubricTotalMarks] = useState(0);

  // Fallback mode (no rubric on this exam — total marks only, no CO breakdown)
  const [maxMarks, setMaxMarks] = useState("");

  const [rows, setRows] = useState([emptyFallbackRow()]);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const [folderRes, evalRes] = await Promise.allSettled([
          axios.get(`/api/get-answer-scripts/${examId}`, { withCredentials: true }),
          axios.get(`/api/evaluation-details/${examId}`, { withCredentials: true }),
        ]);

        if (folderRes.status === "fulfilled") {
          setFolderName(folderRes.value.data?.foldername || "Exam");
        }

        const questions =
          evalRes.status === "fulfilled"
            ? evalRes.value.data?.evaluation?.questionEvaluationDetails
            : null;

        if (Array.isArray(questions) && questions.length > 0) {
          setRubricQuestions(questions);
          setRubricTotalMarks(
            evalRes.value.data?.evaluation?.totalMarks ||
            questions.reduce((sum, q) => sum + (Number(q.maxMarks) || 0), 0)
          );
          setRows([emptyRubricRow(questions.length)]);
        } else {
          setRubricQuestions(null);
          setRows([emptyFallbackRow()]);
        }
      } catch {
        toast.error("Failed to load exam details");
      } finally {
        setLoading(false);
      }
    };
    if (examId) fetchDetails();
  }, [examId]);

  const isRubricMode = Array.isArray(rubricQuestions) && rubricQuestions.length > 0;

  const updateRow = (index, field, value) => {
    setRows((previous) =>
      previous.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    );
  };

  const updateQMark = (rowIndex, qIndex, value) => {
    setRows((previous) =>
      previous.map((row, i) => {
        if (i !== rowIndex) return row;
        const qmarks = [...row.qmarks];
        qmarks[qIndex] = value;
        return { ...row, qmarks };
      })
    );
  };

  const addRow = () =>
    setRows((previous) => [
      ...previous,
      isRubricMode ? emptyRubricRow(rubricQuestions.length) : emptyFallbackRow(),
    ]);

  const removeRow = (index) =>
    setRows((previous) => previous.filter((_, i) => i !== index));

  const rowTotal = (row) =>
    (row.qmarks || []).reduce((sum, v) => sum + (Number(v) || 0), 0);

  const handleSaveRubricMode = async () => {
    const entries = [];
    for (const row of rows) {
      const student_id = row.student_id.trim();
      if (!student_id) continue;

      const question_marks = rubricQuestions.map((q, qIndex) => ({
        question_no: qIndex + 1,
        marks: Number(row.qmarks[qIndex]),
      }));

      const invalid = question_marks.find((qm, qIndex) => {
        const qMax = Number(rubricQuestions[qIndex].maxMarks);
        return Number.isNaN(qm.marks) || qm.marks < 0 || qm.marks > qMax;
      });
      if (invalid) {
        toast.error(
          `${student_id}: Q${invalid.question_no} marks must be between 0 and ` +
          `${rubricQuestions[invalid.question_no - 1].maxMarks}`
        );
        return;
      }

      entries.push({ student_id, question_marks });
    }

    if (!entries.length) {
      toast.error("Please add at least one student with marks");
      return;
    }

    setSaving(true);
    try {
      const res = await axios.post(
        `/api/manual-marks-entry/${examId}`,
        { entries },
        { withCredentials: true }
      );
      toast.success(`Saved marks for ${res.data?.saved_count || entries.length} student(s)`);
      setRows([emptyRubricRow(rubricQuestions.length)]);
    } catch (error) {
      toast.error(error?.response?.data?.detail || error?.response?.data?.error || "Unable to save marks");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveFallbackMode = async () => {
    const parsedMax = Number(maxMarks);
    if (!parsedMax || parsedMax <= 0) {
      toast.error("Please enter a valid Max Marks value");
      return;
    }

    const entries = rows
      .map((row) => ({
        student_id: row.student_id.trim(),
        marks: Number(row.marks),
      }))
      .filter((row) => row.student_id && !Number.isNaN(row.marks));

    if (!entries.length) {
      toast.error("Please add at least one student with marks");
      return;
    }

    const invalid = entries.find((row) => row.marks < 0 || row.marks > parsedMax);
    if (invalid) {
      toast.error(`Marks for ${invalid.student_id} must be between 0 and ${parsedMax}`);
      return;
    }

    setSaving(true);
    try {
      const res = await axios.post(
        `/api/manual-marks-entry/${examId}`,
        { max_marks: parsedMax, entries },
        { withCredentials: true }
      );
      toast.success(`Saved marks for ${res.data?.saved_count || entries.length} student(s)`);
      setRows([emptyFallbackRow()]);
    } catch (error) {
      toast.error(error?.response?.data?.detail || error?.response?.data?.error || "Unable to save marks");
    } finally {
      setSaving(false);
    }
  };

  const handleSave = () => (isRubricMode ? handleSaveRubricMode() : handleSaveFallbackMode());

  return (
    <div className="min-h-screen" style={{ backgroundColor: color }}>
      <Navbar title="Enter Marks Manually" />
      <div className="p-6">
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 mb-4 text-sm font-semibold text-gray-500 hover:text-gray-700"
          >
            <FaArrowLeft size={12} /> Back
          </button>

          {loading ? (
            <div className="flex justify-center py-16">
              <Spinner />
            </div>
          ) : (
            <>
              <h2 className="text-lg font-bold text-gray-800 mb-1">{folderName}</h2>

              {isRubricMode ? (
                <p className="text-sm text-gray-500 mb-6">
                  Type per-question marks for each student — no answer script upload required.
                  Marks are automatically split across each question&apos;s COs, so CO/PO
                  attainment will count these students correctly. Total marks: {rubricTotalMarks}.
                </p>
              ) : (
                <>
                  <p className="text-sm text-gray-500 mb-1">
                    Type marks directly for each student — no answer script upload required.
                  </p>
                  <p className="text-xs text-amber-600 mb-5">
                    This exam has no rubric, so these marks won&apos;t count toward CO/PO
                    attainment. Build a rubric first (Evaluation Parameters) if you need CO
                    tracking for this exam.
                  </p>
                </>
              )}

              {!isRubricMode && (
                <div className="mb-5 max-w-xs">
                  <label className="block text-xs font-semibold text-gray-500 mb-1">
                    Max Marks (for this exam)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={maxMarks}
                    onChange={(e) => setMaxMarks(e.target.value)}
                    placeholder="e.g. 100"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2"
                    style={{ "--tw-ring-color": color }}
                  />
                </div>
              )}

              <div className="overflow-x-auto rounded-xl border border-gray-200 mb-4">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-left text-gray-600">
                    <tr>
                      <th className="px-4 py-3 w-56">Student ID</th>
                      {isRubricMode ? (
                        <>
                          {rubricQuestions.map((q, qIndex) => (
                            <th key={qIndex} className="px-4 py-3 whitespace-nowrap">
                              Q{qIndex + 1} <span className="text-gray-400">(max {q.maxMarks})</span>
                            </th>
                          ))}
                          <th className="px-4 py-3 whitespace-nowrap">Total</th>
                        </>
                      ) : (
                        <th className="px-4 py-3 w-1/3">Marks</th>
                      )}
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, index) => (
                      <tr key={index} className="border-t border-gray-100">
                        <td className="px-4 py-2">
                          <input
                            type="text"
                            value={row.student_id}
                            onChange={(e) => updateRow(index, "student_id", e.target.value)}
                            placeholder="e.g. Student1"
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                          />
                        </td>
                        {isRubricMode ? (
                          <>
                            {rubricQuestions.map((q, qIndex) => (
                              <td key={qIndex} className="px-4 py-2">
                                <input
                                  type="number"
                                  min="0"
                                  max={q.maxMarks}
                                  value={row.qmarks[qIndex]}
                                  onChange={(e) => updateQMark(index, qIndex, e.target.value)}
                                  placeholder="0"
                                  className="w-20 rounded-lg border border-gray-300 px-3 py-2 text-sm"
                                />
                              </td>
                            ))}
                            <td className="px-4 py-2 text-center font-semibold text-gray-700">
                              {rowTotal(row)}
                            </td>
                          </>
                        ) : (
                          <td className="px-4 py-2">
                            <input
                              type="number"
                              value={row.marks}
                              onChange={(e) => updateRow(index, "marks", e.target.value)}
                              placeholder="0"
                              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                            />
                          </td>
                        )}
                        <td className="px-4 py-2 text-center">
                          <button
                            onClick={() => removeRow(index)}
                            disabled={rows.length === 1}
                            className="text-gray-400 hover:text-red-500 disabled:opacity-30"
                          >
                            <IconTrash size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between">
                <button
                  onClick={addRow}
                  className="flex items-center gap-1.5 text-sm font-semibold"
                  style={{ color }}
                >
                  <IconPlus size={16} /> Add Row
                </button>

                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="rounded-xl px-6 py-2.5 text-sm font-bold text-white shadow-sm disabled:opacity-60"
                  style={{ backgroundColor: color }}
                >
                  {saving ? "Saving..." : "Save Marks"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
