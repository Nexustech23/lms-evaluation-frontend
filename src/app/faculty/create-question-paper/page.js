"use client";

import React, { useEffect, useState, useCallback, useContext } from "react";
import axios from "axios";
import Navbar from "@/components/ui/Navbar";
import Spinner from "@/components/ui/Spinner";
import toast from "react-hot-toast";
import { useRouter, useSearchParams } from "next/navigation";
import { IconEye, IconDownload, IconPencil, IconTrash, } from "@tabler/icons-react";
import { useTranslations } from "next-intl";

import Filters from "@/components/Filters";
import { AuthContext } from "@/app/AuthContext";

export default function SavedResult() {
  const { user } = useContext(AuthContext);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingSubjects, setLoadingSubjects] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();

  const paperId = searchParams.get("id");

  const isEditMode = !!paperId;

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPapers, setTotalPapers] = useState(0);

  const itemsPerPage = 10;

  // ─── Translation hook ────────────────────────────────────────────────────────
  const t = useTranslations("createQuestionPaper");
  const ts = useTranslations("subjects");

  const [filters, setFilters] = useState({
    selectedSchool: "",
    selectedProgramme: "",
    selectedDepartment: "",
    selectedBatch: "",
    selectedSemester: "",
    selectedSubject: "",
  });

  // Reset page on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  // Fetch paginated papers
  const fetchPapers = async () => {
    try {
      setLoading(true);

      const params = {
        page: currentPage,
        limit: itemsPerPage,
      };

      if (filters.selectedSubject)
        params.subjectId = filters.selectedSubject;

      if (filters.selectedSemester)
        params.semester = filters.selectedSemester;

      if (filters.selectedSchool)
        params.schoolId = filters.selectedSchool;

      if (filters.selectedProgramme)
        params.programmeId = filters.selectedProgramme;

      if (filters.selectedDepartment)
        params.departmentId = filters.selectedDepartment;

      if (filters.selectedBatch)
        params.batchId = filters.selectedBatch;

      const res = await axios.get(`/api/question-paper`, {
        withCredentials: true,
        params,
      });

      setPapers(res.data.questionPapers || []);
      setTotalPages(res.data.totalPages || 1);
      setTotalPapers(res.data.totalPapers || 0);
    } catch {
      toast.error("Failed to load question papers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPapers();
  }, [filters, currentPage]);

  const handleDownload = async (url, filename) => {
    const res = await fetch(url);

    const blob = await res.blob();

    const a = document.createElement("a");

    a.href = URL.createObjectURL(blob);
    a.download = filename;

    a.click();

    URL.revokeObjectURL(a.href);
  };
  const handleDelete = async () => {
    try {
      await axios.delete(`/api/question-paper/${deleteConfirm}`, {
        withCredentials: true,
      });
      toast.success('Question paper deleted successfully');
      setDeleteConfirm(null);
      fetchPapers();
    } catch {
      toast.error("Failed to delete question paper");
    }
  };
const handleView = (url) => {
  const extension = url?.split(".").pop()?.toLowerCase();

  const isDocx = extension === "docx";
  const isDoc = extension === "doc";

  const viewUrl =
    isDocx || isDoc
      ? `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(
          url
        )}`
      : url;

  window.open(viewUrl, "_blank", "noopener,noreferrer");
};
  return (
    <div
      className="flex flex-col min-h-screen"
      style={{ backgroundColor: user?.color || "#cc4e00" }}
    >
      <Navbar title={t("title")} />

      <div className="flex-1 px-6 overflow-hidden rounded-xl">
        <div className="flex justify-end mb-2">
          <button
            onClick={() =>
              router.push("/faculty/create-question-paper/prompt")
            }
            className="text-white rounded-xl w-fit border p-2 hover:scale-105 transition-all duration-300"
            style={{ backgroundColor: user?.color || "#cc4e00" }}
          >
            Create Question-Paper
          </button>
        </div>

        <Filters filters={filters} setFilters={setFilters} />

        <div className="bg-white mt-4 rounded-xl shadow-md overflow-hidden">
          {/* ── Table ── */}
          {loading || loadingSubjects ? (
            <div className="flex justify-center items-center py-8">
              <Spinner className="h-8 w-8 text-[#ff7f10]" />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto rounded-xl">
                <table className="w-full border border-gray-200 rounded-xl overflow-hidden">
                  <thead>
                    <tr
                      style={{
                        backgroundColor:
                          (user?.color || "#ff7f10") + "20",
                      }}
                      className="text-left"
                    >
                      <th className="p-3 text-black font-bold">
                        {ts("sno")}
                      </th>

                      <th className="p-3 text-black font-bold">
                        {ts("subjectName")}
                      </th>

                      <th className="p-3 text-black font-bold">
                        {t("examType")}
                      </th>

                      <th className="p-3 text-black font-bold">
                        {ts("programme")}
                      </th>

                      <th className="p-3 text-black font-bold">
                        {ts("department")}
                      </th>

                      <th className="p-3 text-black font-bold">
                        {ts("batch")}
                      </th>

                      <th className="p-3 text-black font-bold">
                        {ts("semester")}
                      </th>

                      <th className="p-3 text-black font-bold">
                        {t("marks")}
                      </th>

                      <th className="p-3 text-black font-bold">
                        {t("paper")}
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {papers.length === 0 ? (
                      <tr>
                        <td
                          colSpan={13}
                          className="py-8 text-center text-gray-400 font-medium"
                        >
                          {t("noPapers")}
                        </td>
                      </tr>
                    ) : (
                      papers.map((doc, index) => (
                        <tr
                          key={doc._id}
                          className="border-t hover:bg-gray-50 transition"
                        >
                          {/* Serial */}
                          <td className="px-4 py-4 text-gray-400">
                            {(currentPage - 1) * itemsPerPage +
                              index +
                              1}
                          </td>

                          {/* Subject */}
                          <td className="px-4 py-4 font-semibold text-gray-800 whitespace-nowrap">
                            {doc.subjectName || "—"}
                          </td>

                          {/* Exam Type */}
                          <td className="px-4 py-4">
                            {doc.examType ? (
                              <span
                                style={{
                                  backgroundColor:
                                    (user?.color || "#ff7f10") +
                                    "20",
                                  color:
                                    user?.color || "#ff7f10",
                                  maxWidth: "100px",
                                  display: "inline-block",
                                  overflow: "hidden",
                                  whiteSpace: "nowrap",
                                  textOverflow: "ellipsis",
                                }}
                                className="px-2 py-1 rounded-full text-xs font-semibold"
                              >
                                {doc.examType}
                              </span>
                            ) : (
                              <span className="text-gray-400">
                                —
                              </span>
                            )}
                          </td>

                          {/* Programme */}
                          <td className="px-4 py-4 text-gray-600 whitespace-nowrap">
                            {doc.programmeName || "—"}
                          </td>

                          {/* Department */}
                          <td className="px-4 py-4 text-gray-600 whitespace-nowrap">
                            {doc.departmentName || "—"}
                          </td>

                          {/* Batch */}
                          <td className="px-4 py-4 text-gray-600 whitespace-nowrap">
                            {doc.batchName || "—"}
                          </td>

                          {/* Semester */}
                          <td className="px-4 py-4">
                            {doc.semester ? (
                              <span className="px-2 py-1 bg-blue-50 text-blue-600 border border-blue-200 rounded-full text-xs font-medium">
                                {doc.semester}
                              </span>
                            ) : (
                              <span className="text-gray-400">
                                —
                              </span>
                            )}
                          </td>

                          {/* Total Marks */}
                          <td className="px-4 py-4 text-gray-600">
                            {doc.totalMarks || "—"}
                          </td>

                          {/* View / Download */}
                          <td className="px-4 py-4 text-center">
                            {doc.questionPaperUrl ? (
                              <div className="flex items-center gap-6 min-w-max">

                                {/* Edit */}
                                <button
                                  onClick={() =>
                                    router.push(
                                      `/faculty/create-question-paper/prompt?id=${doc._id}`
                                    )
                                  }
                                  className="text-orange-500 hover:text-orange-700 transition flex items-center justify-center"
                                  title="Edit"
                                >
                                  <IconPencil size={18} />
                                </button>
                                {/* Delete */}
<button
  onClick={() => setDeleteConfirm(doc._id)}
  className="text-red-500 hover:text-red-700 transition flex items-center justify-center"
  title="Delete"
>
  <IconTrash size={18} />
</button>

{/* View */}
<button
  onClick={() => handleView(doc.questionPaperUrl)}
  className="text-blue-600 hover:text-blue-800 transition"
  title="View"
>
  <IconEye size={18} />
</button>

{/* Download */}
<button
  onClick={() =>
    handleDownload(
      doc.questionPaperUrl,
      `${doc.subjectName}_${doc.examType}${
        doc.questionPaperUrl?.toLowerCase().endsWith(".docx")
          ? ".docx"
          : ".pdf"
      }`
    )
  }
  className="text-green-600 hover:text-green-800 transition"
  title="Download"
>
  <IconDownload size={18} />
</button>
                              </div>
                            ) : (
                              <span className="text-gray-400">
                                —
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPapers > 0 && (
                <div className="flex items-center justify-between mt-4 px-4 py-4 bg-white border border-gray-200 rounded-xl shadow-sm">
                  <div className="text-sm text-gray-500">
                    Showing{" "}
                    <span className="font-semibold">
                      {(currentPage - 1) * itemsPerPage + 1}
                    </span>{" "}
                    to{" "}
                    <span className="font-semibold">
                      {Math.min(
                        currentPage * itemsPerPage,
                        totalPapers
                      )}
                    </span>{" "}
                    of{" "}
                    <span className="font-semibold">
                      {totalPapers}
                    </span>{" "}
                    papers
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      disabled={currentPage === 1}
                      onClick={() =>
                        setCurrentPage((p) => p - 1)
                      }
                      className="px-4 py-2 border rounded-xl disabled:opacity-50 hover:bg-gray-50 transition"
                    >
                      Prev
                    </button>

                    {Array.from(
                      { length: totalPages },
                      (_, i) => i + 1
                    ).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-4 py-2 border rounded-xl text-sm transition ${currentPage === page
                          ? "text-white"
                          : "bg-white text-gray-700 hover:bg-gray-50"
                          }`}
                        style={
                          currentPage === page
                            ? {
                              backgroundColor:
                                user?.color || "#ff7f10",
                              borderColor:
                                user?.color || "#ff7f10",
                            }
                            : {}
                        }
                      >
                        {page}
                      </button>
                    ))}

                    <button
                      disabled={currentPage === totalPages}
                      onClick={() =>
                        setCurrentPage((p) => p + 1)
                      }
                      className="px-4 py-2 border rounded-xl disabled:opacity-50 hover:bg-gray-50 transition"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      {/* Delete Confirm Popup */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 w-[90%] max-w-md shadow-xl">
            <h2 className="text-lg font-bold text-gray-800 mb-2">Delete Question Paper?</h2>
            <p className="text-sm text-gray-500 mb-6">
              This action cannot be undone. The question paper will be permanently deleted.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-5 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-5 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}