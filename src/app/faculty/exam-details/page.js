"use client";

import React, { useState, useEffect, useContext } from "react";
import Navbar from "@/components/ui/Navbar";
import Spinner from "@/components/ui/Spinner";
import Filters from "@/components/Filters";
import { AuthContext } from "@/app/AuthContext";
import { useTranslations } from "next-intl";

import toast from "react-hot-toast";
import axios from "axios";

export default function SavedResult() {
  const [filters, setFilters] = useState({
    selectedSchool: "",
    selectedProgramme: "",
    selectedDepartment: "",
    selectedBatch: "",
    selectedSemester: "",
    selectedSubject: "",
  });

  const { user } = useContext(AuthContext);

  const t = useTranslations("examDetails");
  const ts = useTranslations("subjects");
  const tp = useTranslations("createQuestionPaper-Prompt");

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalDocuments, setTotalDocuments] = useState(0);

  const itemsPerPage = 10;

  // Reset page on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  useEffect(() => {
    fetchDocuments();
  }, [filters, currentPage]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        `/api/newsaved-documents`,
        {
          withCredentials: true,

          params: {
            page: currentPage,
            limit: itemsPerPage,

            school: filters.selectedSchool,
            programme: filters.selectedProgramme,
            department: filters.selectedDepartment,
            batch: filters.selectedBatch,
            semester: filters.selectedSemester,
            subject: filters.selectedSubject,
            is_archived: false,
          },
        }
      );

      setDocuments(response.data.documents || []);
      setTotalPages(response.data.totalPages || 1);
      setTotalDocuments(response.data.totalDocuments || 0);

    } catch {
      toast.error("Failed to load documents");
    } finally {
      setLoading(false);
    }
  };

  function formatDate(value) {
    if (!value) return "-";

    const date = new Date(value);

    if (isNaN(date.getTime())) return "-";

    return date
      .toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
      .replace(/\//g, "-");
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: user?.color || "#ff7f10" }}
    >
      <Navbar title={t("title")} />

      {/* Filters */}
      <div className="mb-6 px-6">
        <Filters
          filters={filters}
          setFilters={setFilters}
        />
      </div>

      <div className="flex-1 px-6 overflow-hidden rounded-xl">
        <div className="bg-white rounded-xl shadow-md overflow-hidden">

          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Spinner
                className="h-8 w-8"
                color={user?.color || "#ff7f10"}
              />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto rounded-xl">
                <table className="w-full rounded-xl overflow-hidden">
                  <thead>
                    <tr
                      style={{
                        backgroundColor:
                          (user?.color || "#ff7f10") + "20",
                      }}
                      className="text-left"
                    >
                      <th className="p-3 text-gray-900 font-bold">
                        {ts("sno")}
                      </th>

                      <th className="p-3 text-gray-900 font-bold">
                        {t("folderName")}
                      </th>

                      <th className="p-3 text-gray-900 font-bold">
                        {tp("examDetails")}
                      </th>

                      <th className="p-3 text-gray-900 font-bold">
                        {tp("examType")}
                      </th>

                      <th className="p-3 text-gray-900 font-bold">
                        {t("examDate")}
                      </th>

                      <th className="p-3 text-gray-900 font-bold">
                        {ts("school")}
                      </th>

                      <th className="p-3 text-gray-900 font-bold">
                        {ts("programme")}
                      </th>

                      <th className="p-3 text-gray-900 font-bold">
                        {ts("department")}
                      </th>

                      <th className="p-3 text-gray-900 font-bold">
                        {ts("batch")}
                      </th>

                      <th className="p-3 text-gray-900 font-bold">
                        {ts("semester")}
                      </th>

                      <th className="p-3 text-gray-900 font-bold">
                        {ts("subject")}
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {documents?.length === 0 ? (
                      <tr>
                        <td
                          colSpan={11}
                          className="py-8 text-center text-gray-400"
                        >
                          {t("noDocuments")}
                        </td>
                      </tr>
                    ) : (
                      documents?.map((doc, index) => (
                        <tr
                          key={doc._id || index}
                          className="border-t bg-white hover:bg-gray-50 transition"
                        >
                          {/* Serial */}
                          <td className="px-4 py-4">
                            {(currentPage - 1) *
                              itemsPerPage +
                              index +
                              1}
                          </td>

                          {/* Folder */}
                          <td className="px-4 py-4 font-semibold">
                            {doc.folder_name || "—"}
                          </td>

                          {/* Exam Title */}
                          <td className="px-4 py-4">
                            {doc.exam_title || "—"}
                          </td>

                          {/* Exam Type */}
                          <td className="px-4 py-4">
                            {doc.exam_type ? (
                              <span
                                className="px-2 py-1 rounded-full text-xs font-semibold"
                                style={{
                                  backgroundColor:
                                    (user?.color || "#ff7f10") +
                                    "20",

                                  color:
                                    user?.color || "#ff7f10",

                                  border: `1px solid ${
                                    user?.color || "#ff7f10"
                                  }`,
                                }}
                              >
                                {doc.exam_type}
                              </span>
                            ) : (
                              "—"
                            )}
                          </td>

                          {/* Date */}
                          <td className="px-4 py-4">
                            {doc.exam_date
                              ? formatDate(doc.exam_date)
                              : "—"}
                          </td>

                          {/* School */}
                          <td className="px-4 py-4">
                            {doc.school_name || "—"}
                          </td>

                          {/* Programme */}
                          <td className="px-4 py-4">
                            {doc.programme_name || "—"}
                          </td>

                          {/* Department */}
                          <td className="px-4 py-4">
                            {doc.department_name || "—"}
                          </td>

                          {/* Batch */}
                          <td className="px-4 py-4">
                            {doc.batch_name || "—"}
                          </td>

                          {/* Semester */}
                          <td className="px-4 py-4">
                            {doc.semester ? (
                              <span
                                className="px-2 py-1 rounded-full text-xs"
                                style={{
                                  backgroundColor:
                                    (user?.color || "#ff7f10") +
                                    "20",

                                  color:
                                    user?.color || "#ff7f10",

                                  border: `1px solid ${
                                    user?.color || "#ff7f10"
                                  }`,
                                }}
                              >
                                {doc.semester}
                              </span>
                            ) : (
                              "—"
                            )}
                          </td>

                          {/* Subject */}
                          <td className="px-4 py-4">
                            {doc.subject_name || "—"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalDocuments > 0 && (
                <div className="flex items-center justify-between mt-4 px-4 py-4 bg-white border border-gray-200 rounded-xl shadow-sm">
                  <div className="text-sm text-gray-500">
                    Showing{" "}
                    <span className="font-semibold">
                      {(currentPage - 1) *
                        itemsPerPage +
                        1}
                    </span>{" "}
                    to{" "}
                    <span className="font-semibold">
                      {Math.min(
                        currentPage * itemsPerPage,
                        totalDocuments
                      )}
                    </span>{" "}
                    of{" "}
                    <span className="font-semibold">
                      {totalDocuments}
                    </span>{" "}
                    documents
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Prev */}
                    <button
                      disabled={currentPage === 1}
                      onClick={() =>
                        setCurrentPage((p) => p - 1)
                      }
                      className="px-4 py-2 border rounded-xl disabled:opacity-50 hover:bg-gray-50 transition"
                    >
                      Prev
                    </button>

                    {/* Page Numbers */}
                    {Array.from(
                      { length: totalPages },
                      (_, i) => i + 1
                    ).map((page) => (
                      <button
                        key={page}
                        onClick={() =>
                          setCurrentPage(page)
                        }
                        className={`px-4 py-2 border rounded-xl text-sm transition ${
                          currentPage === page
                            ? "text-white"
                            : "bg-white text-gray-700 hover:bg-gray-50"
                        }`}
                        style={
                          currentPage === page
                            ? {
                                backgroundColor:
                                  user?.color ||
                                  "#ff7f10",

                                borderColor:
                                  user?.color ||
                                  "#ff7f10",
                              }
                            : {}
                        }
                      >
                        {page}
                      </button>
                    ))}

                    {/* Next */}
                    <button
                      disabled={
                        currentPage === totalPages
                      }
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
    </div>
  );
}