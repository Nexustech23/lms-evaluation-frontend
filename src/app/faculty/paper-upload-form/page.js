"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "@/components/ui/Navbar";
import Spinner from "@/components/ui/Spinner";
import { IconEdit, IconEye, IconUpload } from "@tabler/icons-react";
import toast from "react-hot-toast";
import { IKContext, IKUpload } from "imagekitio-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import Filters from "@/components/Filters";
import { useDocuments } from "../../../api/Document";
import { useContext } from "react";
import { AuthContext } from "@/app/AuthContext";

export default function Page() {
  const { user } = useContext(AuthContext);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [numberOfQuestions, setNumberOfQuestions] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalDocuments, setTotalDocuments] = useState(0);

  const itemsPerPage = 10;
  // ─── Translations ────────────────────────────────────────────────────────
  const t = useTranslations("uploadQP");
  const ts = useTranslations("subjects");
  const tcq = useTranslations("createQuestionPaper-Prompt");
  const td = useTranslations("examDetails")

  const [filters, setFilters] = useState({
    selectedSchool: "",
    selectedProgramme: "",
    selectedDepartment: "",
    selectedBatch: "",
    selectedSemester: "",
    selectedSubject: "",
  });
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);
  const [documents, setDocuments] = useState(null);
  const [loading, setLoading] = useState(false);
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
  const router = useRouter();

  const IMAGEKIT_URL_ENDPOINT = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT;

  const authenticator = async () => {
    const response = await fetch(
      `/api/imagekit-auth`,
      {
        credentials: "include",
      }
    );

    if (!response.ok) {
      throw new Error("ImageKit auth failed");
    }

    return response.json();
  };

  const openUploadModal = (doc) => {
    setSelectedDoc(doc);
    setSelectedFile(null);
    setNumberOfQuestions("");
    setUploadedFile(null);
    setUploadProgress(0);
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!uploadedFile || !numberOfQuestions) {
      toast.error("Upload PDF and enter number of questions");
      return;
    }

    try {
      setIsSubmitting(true);
      await axios.post(
        `/api/upload-question-paper/${selectedDoc.id}`,
        {
          questionpaper_url: uploadedFile.url,
          fileId: uploadedFile.fileId,
          filename: uploadedFile.name,
          no_of_question: numberOfQuestions,
        },
        {
          withCredentials: true,
        }
      );

      toast.success("Question paper saved");
      setShowModal(false);
      fetchDocuments();
    } catch (err) {
      toast.error("Failed to save question paper");
    } finally {
      setIsSubmitting(false);
    }
  };
const OFFICE_EXTENSIONS = ["doc", "docx", "ppt", "pptx", "xls", "xlsx", "odt"];

  const handleViewQP = (doc) => {

        if (!doc.question_paper.url) {
      toast.error("Question paper not uploaded yet");
      return;
    }
  const ext = doc.question_paper.url.split(".").pop()?.toLowerCase().split("?")[0]; // handle query strings
  if (OFFICE_EXTENSIONS.includes(ext)) {
    const encoded = encodeURIComponent(doc.question_paper.url);
    window.open(`https://docs.google.com/viewer?url=${encoded}&embedded=false`, "_blank");
  } else {
    window.open(doc.question_paper.url, "_blank");
  }
  };



  const isPastExam = (examdate) => {
    if (!examdate) return false;
    const exam = new Date(examdate);
    const today = new Date();
    exam.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    return exam > today;
  };

  return (
    <div className="flex h-screen flex-col bg-[#ff7f10]" style={{ backgroundColor: user?.color || "#cc5200" }}>
      <Navbar title={t("title")} />

      <div className="px-6">
        <Filters filters={filters} setFilters={setFilters} />
        <div className="flex-1 overflow-hidden rounded-xl mt-4">
          <div className="mb-6">
            <div className=" rounded-xl shadow-md overflow-hidden">
              {loading ? (
                <div className="flex justify-center py-8">
                  <Spinner className="h-8 w-8 text-[#ff7f10]" />
                </div>
              ) : (
                <div>

                  <div className="bg-white rounded-xl overflow-x-auto custom-scrollbar">

                    <table className="w-full border ">
                      <thead>
                        <tr
                          style={{
                            backgroundColor: (user?.color || "#ff7f10") + "20",
                          }}
                          className="text-left"
                        >
                          <th className="p-3 text-black font-bold">{ts("sno")}</th>
                          <th className="p-3 text-black font-bold">{t("folderName")}</th>
                          <th className="p-3 text-black font-bold">{tcq("examDetails")}</th>
                          <th className="p-3 text-black font-bold">{td("examDate")}</th>
                          <th className="p-3 text-black font-bold">{ts("school")}</th>
                          <th className="p-3 text-black font-bold">{ts("programme")}</th>
                          <th className="p-3 text-black font-bold">{ts("department")}</th>
                          <th className="p-3 text-black font-bold">{ts("batch")}</th>
                          <th className="p-3 text-black font-bold">{ts("semester")}</th>
                          <th className="p-3 text-black font-bold">{ts("subject")}</th>
                          <th className="p-3 text-black font-bold">{tcq("examType")}</th>
                          <th className="p-3 text-black font-bold">{t("weightage")}</th>
                          <th className="p-3 text-black font-bold">{t("uploadQuestionPaper")}</th>
                          <th className="p-3 text-black font-bold">{t("view")}</th>
                          <th className="p-3 text-black font-bold">{t("status")}</th>
                          <th className="p-3 text-black font-bold">{t("edit")}</th>
                        </tr>
                      </thead>

                      <tbody>
                        {documents?.map((doc, index) => (
                          <tr key={doc._id || doc.id || index} className="border-t hover:bg-gray-50 transition">

                            {/* Serial */}
                            <td className="px-4 py-4 text-gray-400">{(currentPage - 1) *
                              itemsPerPage +
                              index +
                              1}</td>

                            {/* Folder */}
                            <td className="px-4 py-4 font-semibold text-gray-800 whitespace-nowrap">
                              {doc.folder_name}
                            </td>

                            {/* Exam Title */}
                            <td className="px-4 py-4 text-gray-600 whitespace-nowrap">
                              {doc.exam_title}
                            </td>

                            {/* Exam Date */}
                            <td className="px-4 py-4 text-gray-600 whitespace-nowrap">
                              {formatDate(doc.exam_date)}
                            </td>

                            {/* School */}
                            <td className="px-4 py-4 text-gray-600 whitespace-nowrap">
                              {doc.school_name}
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
                              <span className="px-2 py-1 bg-blue-50 text-blue-600 border border-blue-200 rounded-full text-xs font-medium">
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

                            {/* Weightage */}
                            <td className="px-4 py-4 text-gray-600">
                              {doc.weightage}
                            </td>

                            {/* Upload / File */}
                            <td className="px-4 py-4">
                              {!doc.question_paper.url ? (

                                /* ================= UPLOAD ICON ================= */
                                <div className="relative group w-fit">
                                  <IconUpload
                                    size={18}
                                    className="text-green-600 hover:text-green-800 cursor-pointer transition"
                                    onClick={() => openUploadModal(doc)}
                                  />

                                  {/* Tooltip */}
                                  <div className="absolute -top-10 left-1/2 -translate-x-1/2
        opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none">

                                    <div className="px-2 py-1 text-xs text-white bg-black rounded-md whitespace-nowrap">
                                      Upload Question Paper
                                    </div>

                                    <div className="w-2 h-2 bg-black rotate-45 mx-auto -mt-1"></div>
                                  </div>
                                </div>

                              ) : (

                                /* ================= FILE + UPDATE ================= */
                                <div className="text-gray-700 flex flex-col gap-1 max-w-[160px]">

                                  <span className="break-words text-xs">
                                    {doc.question_paper.filename}
                                  </span>

                                  {/* UPDATE BUTTON WITH TOOLTIP */}
                                  <div className="relative group w-fit">
                                    <button
                                      onClick={() => openUploadModal(doc)}
                                      className="px-2 py-1 rounded text-xs text-white bg-gray-700 hover:bg-gray-800 transition"
                                      hidden={!isPastExam(doc.examdate)}
                                    >
                                      Update QP
                                    </button>

                                    {/* Tooltip */}
                                    <div className="absolute -top-10 left-1/2 -translate-x-1/2
          opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none">

                                      <div className="px-2 py-1 text-xs text-white bg-black rounded-md whitespace-nowrap">
                                        Update Question Paper
                                      </div>

                                      <div className="w-2 h-2 bg-black rotate-45 mx-auto -mt-1"></div>
                                    </div>
                                  </div>

                                </div>

                              )}
                            </td>

                            {/* View */}
                            <td className="px-4 py-4">
                              <div className="relative group w-fit">

                                <IconEye
                                  className="text-blue-600 hover:text-blue-800 cursor-pointer transition"
                                  size={18}
                                  onClick={() => handleViewQP(doc)}
                                />

                                {/* Tooltip */}
                                <div className="absolute -top-10 left-1/2 -translate-x-1/2
      opacity-0 group-hover:opacity-100
      transition-all duration-200 pointer-events-none">

                                  <div className="px-2 py-1 text-xs text-white bg-black rounded-md whitespace-nowrap">
                                    View Question Paper
                                  </div>

                                  {/* Arrow */}
                                  <div className="w-2 h-2 bg-black rotate-45 mx-auto -mt-1"></div>
                                </div>

                              </div>
                            </td>

                            {/* Status */}
                            <td className="px-4 py-4">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium text-white ${doc.question_paper?.url ? "bg-green-600" : "bg-yellow-500"
                                  }`}
                              >
                                {doc.question_paper?.url ? "Done" : "Pending"}
                              </span>
                            </td>

                            {/* Edit */}
                            <td className="px-4 py-4">
                              <div className="relative group w-fit">

                                <IconEdit
                                  size={18}
                                  className={`transition ${doc.question_paper.url
                                    ? "text-gray-400 cursor-not-allowed"
                                    : "text-orange-500 hover:text-orange-700 cursor-pointer"
                                    }`}
                                  onClick={() => {
                                    if (!doc.question_paper.url) {
                                      router.push(`/faculty/paper-upload-form/${doc.id}`);
                                    }
                                  }}
                                />

                                {/* Tooltip */}
                                <div className="absolute -top-10 left-1/2 -translate-x-1/2
      opacity-0 group-hover:opacity-100
      transition-all duration-200 pointer-events-none">

                                  <div className="px-2 py-1 text-xs text-white bg-black rounded-md ">
                                    {doc.question_paper.url ? "Already Uploaded" : "Upload Question Paper"}
                                  </div>

                                  {/* Arrow */}
                                  <div className="w-2 h-2 bg-black rotate-45 mx-auto -mt-1"></div>
                                </div>

                              </div>
                            </td>

                          </tr>
                        ))}
                      </tbody>
                    </table></div>
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
                            className={`px-4 py-2 border rounded-xl text-sm transition ${currentPage === page
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

          {/* Upload Modal */}
          {showModal && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg w-full max-w-md p-6">
                <h2 className="text-lg font-bold mb-4">
                  Upload Question Paper for –{" "}
                  <span className="text-[#ff7f10]">{selectedDoc.foldername}</span>
                </h2>

                <div className="space-y-4">
                  <IKContext
                    urlEndpoint={IMAGEKIT_URL_ENDPOINT}
                    publicKey={process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY}
                    authenticator={authenticator}
                  >
                    <IKUpload
                      accept="
    application/pdf,
    application/msword,
    application/vnd.openxmlformats-officedocument.wordprocessingml.document,
    application/vnd.ms-excel,
    application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
  "
                      onUploadStart={() => {
                        setUploadProgress(0);
                        setIsSubmitting(true);
                      }}
                      onUploadProgress={(progress) => {
                        const percent = Math.round(
                          (progress.loaded / progress.total) * 100,
                        );
                        setUploadProgress(percent);
                      }}
                      onSuccess={(res) => {
                        setUploadedFile(res);
                        setIsSubmitting(false);
                        toast.success("Uploaded to ImageKit");
                      }}
                      onError={(err) => {
                        console.error(err);
                        setIsSubmitting(false);
                        toast.error("ImageKit upload failed");
                      }}
                    />
                  </IKContext>
                  {isSubmitting && (
                    <div className="mt-3">
                      <div className="w-full bg-gray-200 rounded">
                        <div
                          className=" text-xs text-white text-center rounded py-1"
                          style={{ width: `${uploadProgress}%`, backgroundColor: user?.color }}
                        >
                          {uploadProgress}%
                        </div>
                      </div>
                    </div>
                  )}
                  <input
                    type="number"
                    placeholder="Number of Questions"
                    value={numberOfQuestions}
                    onChange={(e) => setNumberOfQuestions(e.target.value)}
                    className="w-full border p-2 rounded"
                  />
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border rounded"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    style={{ backgroundColor: user?.color }}
                    disabled={isSubmitting || !uploadedFile || !numberOfQuestions}
                    className="px-4 py-2  text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? "Uploading..." : "Submit"}
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

    </div>
  );
}
