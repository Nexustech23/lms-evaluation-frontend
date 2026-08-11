"use client";
import React, { useEffect, useState, useCallback, use } from "react";
import axios from "axios";
import Navbar from "@/components/ui/Navbar";
import Spinner from "@/components/ui/Spinner";
import { IconUpload, IconEye } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";
import Filters from "@/components/Filters";
import { useDocuments } from "../../../api/Document"
import { useContext } from "react";
import { AuthContext } from "@/app/AuthContext";

export default function page() {
   const { user } = useContext(AuthContext);
  const router = useRouter();
  const [documents,setDocuments]=useState(null);
  const [loading,setLoading]=useState(false);
  const [filters, setFilters] = useState({
    selectedSchool: "",
    selectedProgramme: "",
    selectedDepartment: "",
    selectedBatch: "",
    selectedSemester: "",
    selectedSubject: "",
  });
const [currentPage, setCurrentPage] = useState(1);
const [totalPages, setTotalPages] = useState(1);
const [totalDocuments, setTotalDocuments] = useState(0);

const itemsPerPage = 10;
useEffect(() => {
  setCurrentPage(1);
}, [filters]);
  // ─── Translations ──────────────────────────────────────────────────────
  const t = useTranslations("uploadAnswerScripts");
  const ts = useTranslations("subjects");
  const tc = useTranslations("common");
  const td = useTranslations("examDetails");
  const tcq = useTranslations("createQuestionPaper");
  const tuq = useTranslations("uploadQP");

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

    setDocuments(
      response.data.documents || []
    );

    setTotalPages(
      response.data.totalPages || 1
    );

    setTotalDocuments(
      response.data.totalDocuments || 0
    );

  } catch {
    toast.error(
      "Failed to load documents"
    );
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

  const handleView = (doc) => {
    router.push(`/faculty/answer-script-upload/${doc.id}`);
  };

  return (
  <div
  className="flex flex-col min-h-screen"
  style={{ backgroundColor: user?.color || "#ff7f10" }}
>
        <Navbar title={t("title")} />

      <div className="flex-1 px-6 ">
        <Filters filters={filters} setFilters={setFilters} />
      <div className="flex-1  overflow-hidden rounded-xl mt-6">
        <div className=" rounded-xl shadow-md overflow-hidden ">

          {loading ? (
            <div className="flex justify-center py-8">
             <Spinner
  className="h-8 w-8"
  color={user?.color || "#ff7f10"}
/>
            </div>
          ) : documents?.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              {t("noData")}
            </p>
          ) : (
            <div>
            <div className=" bg-white rounded-xl overflow-x-auto">
              <table className="w-full border">
                <thead>
                  <tr style={{ backgroundColor: (user?.color || "#ff7f10") + "20" }}>
                    <th className="p-3 text-black font-bold ">{ts("sno")}</th>
                    <th className="p-3  text-black font-bold">{tuq("folderName")}</th>
                    <th className="p-3  text-black font-bold">{td("examDate")}</th>
                    <th className="p-3 text-black font-bold">{ts("programme")}</th>
                    <th className="p-3 text-black font-bold">{ts("department")}</th>
                    <th className="p-3  text-black font-bold">{ts("batch")}</th>
                    <th className="p-3 text-black font-bold">{ts("semester")}</th>
                    <th className="p-3 text-black font-bold ">{ts("subject")}</th>
                    <th className="p-3  text-black font-bold">{tcq("examType")}</th>
                    <th className="p-3 text-black font-bold">{ts("action")}</th>
                  </tr>
                </thead>

                <tbody>
                  {documents?.map((doc, index) => {
                    return (
                     <tr
  key={doc._id || index}
  className="border-t bg-white hover:bg-gray-50 transition"
>

                        {/* Serial */}
                        <td className="px-4 py-4 text-gray-400">{(currentPage - 1) *
  itemsPerPage +
  index +
  1}</td>

                        {/* Folder */}
                        <td className="px-4 py-4 font-semibold text-gray-800 whitespace-nowrap">
                          {doc.folder_name}
                        </td>


                        {/* Exam Date */}
                        <td className="px-4 py-4 text-gray-600 whitespace-nowrap">
                          {formatDate(doc.exam_date)}
                        </td>



                        {/* Programme */}
                        <td className="px-4 py-4 text-gray-600 whitespace-nowrap">
                          {doc.programme_name}
                        </td>

                        {/* Department */}
                        <td className="px-4 py-4 text-gray-600 whitespace-nowrap">
                          {doc.department_name}
                        </td>

                        {/* Batch */}
                        <td className="px-4 py-4 text-gray-600 whitespace-nowrap">
                          {doc.batch_name}
                        </td>

                        {/* Semester */}
                        <td className="px-4 py-4">
                          <span
  className="px-2 py-1 rounded-full text-xs font-medium"
  style={{
    backgroundColor: (user?.color || "#ff7f10") + "20",
    color: user?.color || "#ff7f10",
    border: `1px solid ${user?.color || "#ff7f10"}`,
  }}
>
  {doc.semester}
</span>
                        </td>

                        {/* Subject */}
                        <td className="px-4 py-4 text-gray-600 whitespace-nowrap">
                          {doc.subject_name}
                        </td>

                        {/* Exam Type */}
                        <td className="px-4 py-4">
                         <span
  className="px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap"
  style={{
    backgroundColor: (user?.color || "#ff7f10") + "20",
    color: user?.color || "#ff7f10",
    border: `1px solid ${user?.color || "#ff7f10"}`,
  }}
>
  {doc.exam_type}
</span>
                        </td>

                        {/* Upload Action */}
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-center">

                            <div className="relative group w-fit">

                             <IconUpload
  style={{ color: user?.color || "#ff7f10" }}
  className="cursor-pointer transition hover:opacity-80"
  size={18}
  onClick={() => handleView(doc)}
/>

                              {/* Tooltip */}
                              <div className="absolute -top-10 -translate-x-1/2
        opacity-0 group-hover:opacity-100
        transition-all duration-200 pointer-events-none">

                                <div className="px-2 py-1 text-xs text-white bg-black rounded-md">
                                 {t("title")}
                                </div>

                                {/* Arrow */}
                                <div className="w-2 h-2 bg-black rotate-45 mx-auto -mt-1"></div>
                              </div>

                            </div>

                          </div>
                        </td>

                      </tr>
                    );
                  })}
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
          currentPage *
            itemsPerPage,
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
        disabled={
          currentPage === 1
        }
        onClick={() =>
          setCurrentPage(
            (p) => p - 1
          )
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
          currentPage ===
          totalPages
        }
        onClick={() =>
          setCurrentPage(
            (p) => p + 1
          )
        }
        className="px-4 py-2 border rounded-xl disabled:opacity-50 hover:bg-gray-50 transition"
      >
        Next
      </button>
    </div>
  </div>
)}
            </div>
          )}
        </div>
      </div>
    </div>
    </div>
  );
}
