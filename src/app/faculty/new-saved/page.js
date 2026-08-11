"use client";
import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import {
  IconMenu2,
  IconX,
  IconDownload,
  IconEye,
  IconArchive,
} from "@tabler/icons-react";
import Navbar from "@/components/ui/Navbar";
import Spinner from "@/components/ui/Spinner";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";
import Filters from "@/components/Filters";
import { useDocuments } from "../../../api/Document"
import { AuthContext } from "@/app/AuthContext";
import { useContext } from "react";

export default function SavedResult() {
  const { user} = useContext(AuthContext);
  const [documents ,setDocuments] =useState(null)
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [files, setFiles] = useState([]);
  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] =
  useState(1);

const [totalPages, setTotalPages] =
  useState(1);

const [totalDocuments, setTotalDocuments] =
  useState(0);

const itemsPerPage = 8;
  const router = useRouter();
const [renameModal, setRenameModal] = useState({
  open: false,
  value: "",
  message: "",
  folderId: null,
});
const [confirmModal, setConfirmModal] = useState({
  open: false, title: "", message: "", onConfirm: null,
});
  const t = useTranslations("savedResults");
  const tf = useTranslations("fileManager");
  const tuq = useTranslations("uploadQP");
  const ts = useTranslations("subjects");
  const tc = useTranslations("common");
  // Preview file from URL (ImageKit)
  const previewFile = (url) => {
    if (!url) {
      toast.error("No file available for preview");
      return;
    }
    window.open(url, "_blank");
  };

  // Download file from URL (ImageKit)
  const downloadFile = async (url, fileName) => {
    if (!url) {
      toast.error("No file available for download");
      return;
    }

    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = fileName || "DownloadedFile.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      toast.success("File downloaded successfully");
    } catch (err) {
      console.error("Download error:", err);
      toast.error("Failed to download file");
    }
  };

  const handleFolderOpen = async (folderName, insertId) => {
    setLoading(true);
    setCurrentFolderId(insertId);
    try {
      const response = await axios.get(
        `/api/get-answer-scripts/${insertId}`,
        {
          withCredentials: true,
        }
      );
      setFiles(response.data.answer_scripts || []);
      setSelectedFolder(folderName);
      toast.success(`Opened folder: ${folderName}`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };
  const handleaddnewfiles = async () => {
    router.push(`/faculty/answer-script-upload/${currentFolderId}`);
  };

  // Rename File Function
 const handleRenameFile = (answer_id, oldFilename) => {
  setRenameModal({ open: true, value: oldFilename, folderId: answer_id, type: "file" });
};
const handleRenameFolder = (folder_id, oldFoldername) => {
  setRenameModal({ open: true, value: oldFoldername, folderId: folder_id, type: "folder" });
};

const confirmDeleteFile = (answer_id) => {
  setConfirmModal({
    open: true,
    title: "Delete File",
    message: "Are you sure you want to delete this file?",
    onConfirm: async () => {
      setConfirmModal({ open: false });
      try {
        setLoading(true);
        const response = await axios.delete(`/api/delete-file`, {
          data: { answer_id },
          withCredentials: true,
        });
        if (response.data.success) {
          setFiles((prev) => prev.filter((file) => file.answer_id !== answer_id));
          toast.success("File deleted successfully");
        }
      } catch {
        toast.error("Error deleting file.");
      } finally {
        setLoading(false);
      }
    },
  });
};
  const confirmDeleteFolder = (folder_id) => {
    setConfirmModal({
      open: true,
      title: "Delete Folder",
      message: "Are you sure you want to delete this folder?",
      onConfirm: async () => {
        setConfirmModal({ open: false });

        try {
          setLoading(true);
          const response = await axios.delete(
            `/api/delete-folder`,
            {
              data: { _id: folder_id },

              withCredentials: true,

            },
          );

          if (response.data.success) {
            setDocuments((prev) =>
              prev.filter((doc) => doc._id !== folder_id),
            );
            setSelectedFolder(null);
            toast.success("Folder deleted successfully");
          }
        } catch {
          toast.error("Error deleting folder.");
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const confirmRenameFolder = async () => {
  if (!renameModal.value.trim()) return;
  try {
    setLoading(true);
    if (renameModal.type === "file") {
      let newFilename = renameModal.value;
      if (!newFilename.toLowerCase().endsWith(".pdf")) newFilename += ".pdf";
      await axios.put(`/api/rename-file`, { answer_id: renameModal.folderId, newFilename }, { withCredentials: true });
      setFiles((prev) => prev.map((f) => f.answer_id === renameModal.folderId ? { ...f, filename: newFilename } : f));
      toast.success("File renamed successfully");
    } else {
      await axios.put(`/api/rename-folder`, { _id: renameModal.folderId, newFoldername: renameModal.value }, { withCredentials: true });
      toast.success("Folder renamed successfully");
      fetchDocuments();
    }
  } catch {
    toast.error("Rename failed");
  } finally {
    setLoading(false);
    setRenameModal({ open: false, value: "", folderId: null });
  }
};
  const handleDownloadFolder = async (folder_id, foldername) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `/api/download-folder/${folder_id}`,
        {
          responseType: "blob",

          withCredentials: true,

        }
      );

      const blob = new Blob([response.data], { type: "application/zip" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${foldername}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Folder downloaded successfully");
    } catch (error) {
      toast.error("Error downloading folder. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleMoveToArchive = (folder_id) => {
    setConfirmModal({
      open: true,
      title: "Move Folder",
      message: "Are you sure you want to move this folder to Archive results?",
      onConfirm: async () => {
        setConfirmModal({ open: false });

        try {
          setLoading(true);
          const response = await axios.post(
            `/api/set-archive-status/${folder_id}`,
            { is_archived: true },
            {
              withCredentials: true,
            }
          );

          if (response.data.success) {
            toast.success("Folder transferred to archive results successfully");
            setFiles([]);
            setSelectedFolder(null);
            fetchDocuments();
          } else {
            toast.error("Failed to move folder.");
          }
        } catch {
          toast.error("Error moving folder. Please try again.");
        } finally {
          setLoading(false);
        }
      },
    });
  };

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

          school:
            filters.selectedSchool,

          programme:
            filters.selectedProgramme,

          department:
            filters.selectedDepartment,

          batch:
            filters.selectedBatch,

          semester:
            filters.selectedSemester,

          subject:
            filters.selectedSubject,

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
  return (
    <div
  className="min-h-screen flex flex-col"
  style={{ backgroundColor: user?.color || "#ff7f10" }}
>
      <Navbar title={t("title")} />
      <div className="flex-1 px-4">
      <Filters setFilters={setFilters} filters={filters}/>

        <div className="bg-white rounded-xl shadow-md overflow-hidden p-6 mt-4 ">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Spinner className="h-8 w-8 text-[#18cc00]" />
            </div>
          ) : !selectedFolder ? (
            <div>
              <h2 className="text-2xl font-bold mb-6 "   style={{ color: user?.color || "#ff7f10" }}>
                {t("savedFolders")}
              </h2>
              {/* ── Filters ── */}
              
              <ul className="grid grid-cols-3 gap-6 auto-rows-fr">
                {documents.map((doc) => (
                  <li
                    key={doc.id}
                      style={{ backgroundColor: (user?.color || "#ff7f10")+"20" ,borderColor:user?.color || "#ff7f10"}}
                    className="cursor-pointer  border rounded-xl p-5 shadow-sm hover:shadow-md  transition-all duration-200"
                    onClick={() => {
                      handleFolderOpen(doc.folder_name, doc.id);
                      setCurrentFolderId(doc.id);
                    }}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-4xl mb-3">📁</div>

                        <h3 className="font-semibold  text-lg"   style={{ color:user?.color || "#ff7f10" }}>
                          {doc.folder_name}
                        </h3>
                      </div>

                      <div className="flex gap-2">

                        {/* Rename */}
                        <div className="relative group">
                          <button
                            className="text-green-600 hover:text-orange-800"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRenameFolder(doc.id, doc.folder_name);
                            }}
                          >
                            <IconMenu2 size={20} />
                          </button>

                          <div className="absolute -top-10 left-1/2 -translate-x-1/2
      opacity-0 group-hover:opacity-100
      transition-all duration-200 pointer-events-none">
                            <div className="px-2 py-1 text-xs text-white bg-black/80 backdrop-blur-md rounded-md shadow-lg whitespace-nowrap">
                              Rename Folder
                            </div>
                            <div className="w-2 h-2 bg-black/80 rotate-45 mx-auto -mt-1"></div>
                          </div>
                        </div>

                        {/* Delete */}
                        <div className="relative group">
                          <button
                            className="text-red-600 hover:text-red-800"
                            onClick={(e) => {
                              e.stopPropagation();
                              confirmDeleteFolder(doc.id);
                            }}
                          >
                            <IconX size={20} />
                          </button>

                          <div className="absolute -top-10 left-1/2 -translate-x-1/2
      opacity-0 group-hover:opacity-100
      transition-all duration-200 pointer-events-none">
                            <div className="px-2 py-1 text-xs text-white bg-black/80 backdrop-blur-md rounded-md shadow-lg whitespace-nowrap">
                              Delete Folder
                            </div>
                            <div className="w-2 h-2 bg-black/80 rotate-45 mx-auto -mt-1"></div>
                          </div>
                        </div>

                        {/* Archive */}
                        <div className="relative group">
                          <button
                           style={{ color:user?.color || "#ff7f10" }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMoveToArchive(doc.id);
                            }}
                          >
                            <IconArchive size={20} />
                          </button>

                          <div className="absolute -top-10 left-1/2 -translate-x-1/2
      opacity-0 group-hover:opacity-100
      transition-all duration-200 pointer-events-none">
                            <div className="px-2 py-1 text-xs text-white bg-black/80 backdrop-blur-md rounded-md shadow-lg whitespace-nowrap">
                              Move to Archive
                            </div>
                            <div className="w-2 h-2 bg-black/80 rotate-45 mx-auto -mt-1"></div>
                          </div>
                        </div>

                        {/* Download */}
                        <div className="relative group">
                          <button
                            className="text-green-600 hover:text-green-800"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownloadFolder(doc.id, doc.folder_name);
                            }}
                          >
                            <IconDownload size={20} />
                          </button>

                          <div className="absolute -top-10 left-1/2 -translate-x-1/2
      opacity-0 group-hover:opacity-100
      transition-all duration-200 pointer-events-none">
                            <div className="px-2 py-1 text-xs text-white bg-black/80 backdrop-blur-md rounded-md shadow-lg whitespace-nowrap">
                              Download Folder as ZIP
                            </div>
                            <div className="w-2 h-2 bg-black/80 rotate-45 mx-auto -mt-1"></div>
                          </div>
                        </div>

                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              {/* Pagination */}
{totalDocuments > 0 && (
  <div className="flex items-center justify-between mt-6 bg-white rounded-xl p-4 border border-gray-200">

    {/* Info */}
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
      folders
    </div>

    {/* Controls */}
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

      {/* Pages */}
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
          ) : (
            <div>
              <button
                className="mb-6 px-4 py-2 text-white rounded "  style={{ backgroundColor: (user?.color || "#ff7f10") ,borderColor:user?.color || "#ff7f10"}}
                onClick={() => setSelectedFolder(null)}
              >
                {t("backToFolders")}
              </button>
              <h2 className="text-2xl font-bold mb-6 text-[#18cc00]"  style={{ color: (user?.color || "#ff7f10") }}>
               {tf("filesIn")} {selectedFolder}
              </h2>
              <div className="overflow-x-auto rounded-xl">
                        <table className="w-full ">
                <thead>
                  <tr
  style={{
    backgroundColor: (user?.color || "#ff7f10") + "20",
  }}
  className="text-left"
>   <th className="p-3 text-left">{tf("fileName")}</th>
                      <th className="p-3 text-center">{tuq("status")}</th>
                      <th className="p-3 text-right">{t("resultActions")}</th>
                      <th className="p-3 text-right">{t("transcriptActions")}</th>
                      <th className="p-3 text-right">{ts("action")}</th>
                    </tr>
                  </thead>

                  <tbody>
                    {files.length > 0 ? (
                      files.map((file, index) => (
                        <tr
                          key={file.answer_id}
                          className="border-b border-gray-200 hover:bg-gray-50"
                        >
                          <td className="p-3">
                            📄 {file.filename || `File ${index + 1}`}
                          </td>
                          <td className="p-3 text-center">
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-medium ${file.evaluated_report_url
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-700"
                                }`}
                            >
                              {file.evaluated_report_url ? t("evaluated") : t("evaluationPending")}
                            </span>
                          </td>
                          <td className="p-3">
                            <div className="flex justify-end gap-2">

                              {/* Download */}
                              <div className="relative group">
                                <button
                                  className="text-green-600 hover:text-green-800 disabled:text-gray-400 disabled:cursor-not-allowed"
                                  disabled={!file.evaluated_report_url}
                                  onClick={() =>
                                    downloadFile(
                                      file.evaluated_report_url,
                                      `Result${file.filename}` || `Result${index + 1}.pdf`
                                    )
                                  }
                                >
                                  <IconDownload size={20} />
                                </button>

                                {/* Tooltip */}
                                <div className="absolute -top-10 left-1/2 -translate-x-1/2
        opacity-0 group-hover:opacity-100
        transition-all duration-200 pointer-events-none">

                                  <div className="px-2 py-1 text-xs text-white bg-black/80 rounded-md whitespace-nowrap">
                                    {file.evaluated_report_url ? "Download" : t("noFiles")}
                                  </div>

                                  <div className="w-2 h-2 bg-black/80 rotate-45 mx-auto -mt-1"></div>
                                </div>
                              </div>

                              {/* Preview */}
                              <div className="relative group">
                                <button
                                  className="text-blue-600 hover:text-blue-800 disabled:text-gray-400 disabled:cursor-not-allowed"
                                  disabled={!file.evaluated_report_url}
                                  onClick={() => previewFile(file.evaluated_report_url)}
                                >
                                  <IconEye size={20} />
                                </button>

                                {/* Tooltip */}
                                <div className="absolute -top-10 left-1/2 -translate-x-1/2
        opacity-0 group-hover:opacity-100
        transition-all duration-200 pointer-events-none">

                                  <div className="px-2 py-1 text-xs text-white bg-black/80 rounded-md whitespace-nowrap">
                                    {file.evaluated_report_url ? "View" : "No File Available"}
                                  </div>

                                  <div className="w-2 h-2 bg-black/80 rotate-45 mx-auto -mt-1"></div>
                                </div>
                              </div>

                            </div>
                          </td>
                          <td className="p-3">
                            <div className="flex justify-end gap-2">

                              {/* Download */}
                              <div className="relative group">
                                <span>
                                  <button
                                    className="text-green-600 hover:text-green-800 disabled:text-gray-400 disabled:cursor-not-allowed"
                                    disabled={!file.html_content}
                                    onClick={() =>
                                      downloadFile(
                                        file.html_content,
                                        `Result${file.filename}` || `Result${index + 1}.pdf`
                                      )
                                    }
                                  >
                                    <IconDownload size={20} />
                                  </button>
                                </span>

                                {/* Tooltip */}
                                <div className="absolute -top-10 left-1/2 -translate-x-1/2
        opacity-0 group-hover:opacity-100
        transition-all duration-200 pointer-events-none">

                                  <div className="px-2 py-1 text-xs text-white bg-black/80 backdrop-blur-md rounded-md shadow-lg whitespace-nowrap">
                                    {file.html_content ? "Download" : "No File Available"}
                                  </div>

                                  <div className="w-2 h-2 bg-black/80 rotate-45 mx-auto -mt-1"></div>
                                </div>
                              </div>

                              {/* Preview */}
                              <div className="relative group">
                                <span>
                                  <button
                                    className="text-blue-600 hover:text-blue-800 disabled:text-gray-400 disabled:cursor-not-allowed"
                                    disabled={!file.html_content}
                                    onClick={() => previewFile(file.html_content)}
                                  >
                                    <IconEye size={20} />
                                  </button>
                                </span>

                                {/* Tooltip */}
                                <div className="absolute -top-10 left-1/2 -translate-x-1/2
        opacity-0 group-hover:opacity-100
        transition-all duration-200 pointer-events-none">

                                  <div className="px-2 py-1 text-xs text-white bg-black/80 backdrop-blur-md rounded-md shadow-lg whitespace-nowrap">
                                    {file.html_content ? "View" : "No File Available"}
                                  </div>

                                  <div className="w-2 h-2 bg-black/80 rotate-45 mx-auto -mt-1"></div>
                                </div>
                              </div>

                            </div>
                          </td>
                          <td className="p-3">
                            <div className="flex justify-end gap-2">

                              {/* Rename */}
                              <div className="relative group">
                                <button
                                  className="text-orange-500 hover:text-green-800"
                                  onClick={() =>
                                    handleRenameFile(file.answer_id, file.filename)
                                  }
                                >
                                  <IconMenu2 size={20} />
                                </button>

                                <div className="absolute -top-10 left-1/2 -translate-x-1/2
        opacity-0 group-hover:opacity-100
        transition-all duration-200 ease-in-out pointer-events-none">
                                  <div className="px-2 py-1 text-xs text-white bg-black/80 backdrop-blur-md rounded-md shadow-lg whitespace-nowrap">
                                    Rename 
                                  </div>
                                  <div className="w-2 h-2 bg-black/80 rotate-45 mx-auto -mt-1"></div>
                                </div>
                              </div>

                              {/* Download */}
                              <div className="relative group">
                                <button
                                  className="text-green-600 hover:text-green-800"
                                  onClick={() =>
                                    downloadFile(
                                      file.answer_script_url,
                                      file.filename || `File${index + 1}.pdf`
                                    )
                                  }
                                >
                                  <IconDownload size={20} />
                                </button>

                                <div className="absolute -top-10 left-1/2 -translate-x-1/2
        opacity-0 group-hover:opacity-100
        transition-all duration-200 ease-in-out pointer-events-none">
                                  <div className="px-2 py-1 text-xs text-white bg-black/80 backdrop-blur-md rounded-md shadow-lg whitespace-nowrap">
                                    Download
                                  </div>
                                  <div className="w-2 h-2 bg-black/80 rotate-45 mx-auto -mt-1"></div>
                                </div>
                              </div>

                              {/* Preview */}
                              <div className="relative group">
                                <button
                                  className="text-blue-600 hover:text-blue-800"
                                  onClick={() => previewFile(file.answer_script_url)}
                                >
                                  <IconEye size={20} />
                                </button>

                                <div className="absolute -top-10 left-1/2 -translate-x-1/2
        opacity-0 group-hover:opacity-100
        transition-all duration-200 ease-in-out pointer-events-none">
                                  <div className="px-2 py-1 text-xs text-white bg-black/80 backdrop-blur-md rounded-md shadow-lg whitespace-nowrap">
                                    View
                                  </div>
                                  <div className="w-2 h-2 bg-black/80 rotate-45 mx-auto -mt-1"></div>
                                </div>
                              </div>

                              {/* Delete */}
                              <div className="relative group">
                                <button
                                  className="text-red-500 hover:text-green-800"
                                  onClick={() => confirmDeleteFile(file.answer_id)}
                                >
                                  <IconX size={20} />
                                </button>

                                <div className="absolute -top-10 left-1/2 -translate-x-1/2
        opacity-0 group-hover:opacity-100
        transition-all duration-200 ease-in-out pointer-events-none">
                                  <div className="px-2 py-1 text-xs text-white bg-black/80 backdrop-blur-md rounded-md shadow-lg whitespace-nowrap">
                                    Delete
                                  </div>
                                  <div className="w-2 h-2 bg-black/80 rotate-45 mx-auto -mt-1"></div>
                                </div>
                              </div>

                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3" className="p-8 text-center text-gray-500">
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
              <button
                className="mt-8 px-4 py-2 bg-[#18cc00] text-white rounded hover:bg-[#129900]"
                onClick={handleaddnewfiles}
              >
               {t("addNewFiles")}
              </button>
            </div>
          )}
        </div>
      </div>
      {confirmModal.open && (
        <div className="fixed inset-0  bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md shadow-lg">
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-2">
                {confirmModal.title}
              </h3>
              <p className="text-gray-600 mb-6">
                {confirmModal.message}
              </p>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setConfirmModal({ open: false })}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  {tc("cancel")}
                </button>
                <button
                  onClick={confirmModal.onConfirm}
                  className="px-4 py-2  text-white rounded-md "
                    style={{ backgroundColor: user?.color || "#ff7f10" }}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {renameModal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
           <h2 className="text-lg font-bold mb-4">
  {renameModal.type === "file" ? "Rename File" : "Rename Folder"}
</h2>
            <input
              type="text"
              value={renameModal.value}
              onChange={(e) => setRenameModal(prev => ({ ...prev, value: e.target.value }))}
              className="w-full border px-3 py-2 rounded mb-4"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setRenameModal({ open: false, value: "", folderId: null })}
                className="px-4 py-2 border rounded hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={confirmRenameFolder}
                className="px-4 py-2 text-white rounded"
                style={{ backgroundColor: user?.color || "#ff7f10" }}
              >
                Rename
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}