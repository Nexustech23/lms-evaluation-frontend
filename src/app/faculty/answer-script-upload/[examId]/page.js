"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import {
  IconDownload,
  IconEye,
  IconArchive,
  IconUpload,
} from "@tabler/icons-react";
import Navbar from "@/components/ui/Navbar";
import Spinner from "@/components/ui/Spinner";
import toast from "react-hot-toast";
import { useParams } from "next/navigation";
import { FaArrowLeft } from "react-icons/fa";
import { useTranslations } from "next-intl";
import { useContext } from "react";
import { AuthContext } from "@/app/AuthContext";

export default function SavedResult() {
  const { user } = useContext(AuthContext);
  const params = useParams();
  const folderId = params?.examId || null;
  const [files, setFiles] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState("");
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedAnswerFiles, setUploadedAnswerFiles] = useState([]);
  const [uploadProgressMap, setUploadProgressMap] = useState({});
  const [newFilename, setNewFilename] = useState("");
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [renameTargetId, setRenameTargetId] = useState(null);
  const [pendingUploads, setPendingUploads] = useState(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const t = useTranslations("fileManager");
  const ts = useTranslations("subjects");
  const tc = useTranslations("common");

  const router = useRouter();

  /* ---------------- IMAGEKIT ---------------- */
  const authenticator = async () => {
    const res = await fetch(`/api/imagekit-auth`, { credentials: "include" });
    if (!res.ok) throw new Error("ImageKit auth failed");
    return res.json();
  };

  /* ---------------- FETCH ---------------- */
  const fetchDetails = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/get-answer-scripts/${folderId}`, {
        withCredentials: true,
      });
      setFiles(res.data.answer_scripts || []);
      setSelectedFolder(res.data.foldername || "Evaluated Answer Sheets");
    } catch {
      toast.error("Failed to load folder");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, []);

  /* ---------------- HANDLE MULTIPLE FILES ---------------- */
  const handleFileSelection = async (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length === 0) return;

    setIsUploading(true);
    setPendingUploads(selectedFiles.length);

    for (const file of selectedFiles) {
      await uploadSingleFile(file);
    }

    setIsUploading(false);
    setPendingUploads(0);
  };

  const uploadSingleFile = async (file) => {
    const tempId = `upload_${Date.now()}_${Math.random()}`;
    try {
      setUploadProgressMap((prev) => ({
        ...prev,
        [tempId]: { name: file.name, progress: 0 },
      }));

      const authData = await authenticator();

      const formData = new FormData();
      formData.append("file", file);
      formData.append("publicKey", authData.publicKey);
      formData.append("signature", authData.signature);
      formData.append("expire", authData.expire);
      formData.append("token", authData.token);
      formData.append("fileName", file.name);

      const response = await axios.post(
        `https://upload.imagekit.io/api/v1/files/upload`,
        formData,
        {
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgressMap((prev) => ({
              ...prev,
              [tempId]: { name: file.name, progress: percentCompleted },
            }));
          },
        }
      );

      setUploadedAnswerFiles((prev) => [
        ...prev,
        {
          url: response.data.url,
          fileId: response.data.fileId,
          name: file.name,
        },
      ]);

      toast.success(`Uploaded: ${file.name}`);
      setTimeout(() => {
        setUploadProgressMap((prev) => {
          const newMap = { ...prev };
          delete newMap[tempId];
          return newMap;
        });
      }, 1000);
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(`Failed to upload: ${file.name}`);
      setUploadProgressMap((prev) => {
        const newMap = { ...prev };
        delete newMap[tempId];
        return newMap;
      });
    }
  };

  /* ---------------- SAVE UPLOADED FILES ---------------- */
  const saveUploadedAnswers = async () => {
    if (!uploadedAnswerFiles.length || !folderId || isUploading) return;

    try {
      setIsUploading(true);
      await Promise.all(
        uploadedAnswerFiles.map((file) =>
          axios.post(
            `/api/upload-answer-script/${folderId}`,
            {
              answer_script_url: file.url,
              fileId: file.fileId,
              filename: file.name,
            },
            { withCredentials: true }
          )
        )
      );

      toast.success("Answer scripts saved successfully");
      setUploadedAnswerFiles([]);
      setUploadProgressMap({});
      fetchDetails(folderId);
    } catch {
      toast.error("Failed to save answer scripts");
    } finally {
      setIsUploading(false);
    }
  };

  /* ---------------- PREVIEW / DOWNLOAD ---------------- */
  const previewFile = (url) => {
    if (!url) return;
    window.open(url, "_blank");
  };

  const downloadFile = async (url, fileName) => {
    if (!url) {
      toast.error("No answer sheet available.");
      return;
    }
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = fileName || "AnswerSheet.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download file");
    }
  };

  /* ---------------- DELETE ---------------- */
  const handleDeleteFile = (answerId) => {
    setSelectedId(answerId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`/api/delete-file`, {
        data: { answer_id: selectedId },
        withCredentials: true,
      });
      toast.success("File deleted");
      fetchDetails(folderId);
    } catch {
      toast.error("Delete failed");
    } finally {
      setShowDeleteModal(false);
      setSelectedId(null);
    }
  };

  /* ---------------- RENAME ---------------- */
  const openRenameModal = (file) => {
    setRenameTargetId(file.answer_id);
    setNewFilename(file.filename);
    setShowRenameModal(true);
  };

  const handleRenameFile = async () => {
    if (!newFilename.trim()) {
      toast.error("Filename cannot be empty");
      return;
    }
    try {
      await axios.put(
        `/api/rename-file`,
        { answer_id: renameTargetId, newFilename },
        { withCredentials: true }
      );
      toast.success("Filename renamed");
      setShowRenameModal(false);
      fetchDetails(folderId);
    } catch {
      toast.error("Rename failed");
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: user?.color || "#ff7f10" }}>
      <Navbar title={`${t("filesIn")} ${selectedFolder}`} />
      {loading ? (
        <Spinner />
      ) : (
        <>
          <div className="h-full mx-auto px-4 py-8">
            <div className="mb-4">
              <button
                onClick={() => router.back()}
                style={{ backgroundColor: (user?.color || "#ff7f10") + "80" }}
                className="flex items-center border mb-4 px-4 ml-4 py-2 text-sm text-white rounded"
              >
                <FaArrowLeft />
                {tc("back")}
              </button>
            </div>

            <div className="overflow-x-auto bg-white rounded-xl shadow">
              <table className="w-full border">
                <thead>
                  <tr
                    style={{ backgroundColor: (user?.color || "#ff7f10") + "20" }}
                    className="text-left"
                  >
                    <th className="px-4 py-3 text-left">{ts("sno")}</th>
                    <th className="px-4 py-3 text-left">{t("fileName")}</th>
                    <th className="px-4 py-3 text-left">{ts("action")}</th>
                  </tr>
                </thead>
                <tbody>
                  {files.map((file, i) => (
                    <tr key={file.answer_id} className="border-t">
                      <td className="px-4 py-3">{i + 1}</td>
                      <td className="px-4 py-3">📄 {file.filename}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openRenameModal(file)}
                            style={{ color: user?.color || "#ff7f10" }}
                            className="hover:opacity-80 transition"
                            title={t("rename")}
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => previewFile(file.answer_script_url)}
                            style={{ color: user?.color || "#ff7f10" }}
                            className="hover:opacity-80 transition"
                            title={t("preview")}
                          >
                            <IconEye size={20} />
                          </button>
                          <button
                            onClick={() => downloadFile(file.answer_script_url, file.filename)}
                            className="hover:opacity-80 transition hover:text-green-800 text-green-600"
                            title={t("download")}
                          >
                            <IconDownload size={20} />
                          </button>
                          <button
                            onClick={() => handleDeleteFile(file.answer_id)}
                            className="text-red-600"
                            title={tc("delete")}
                          >
                            <IconArchive size={20} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* -------- MULTIPLE FILE UPLOAD -------- */}
            <div className="mt-8 bg-white rounded-xl shadow p-6">
              <h2 className="text-xl font-bold mb-4">{t("uploadTitle")}</h2>
              <input
                type="file"
                multiple
                onChange={handleFileSelection}
                disabled={isUploading}
                accept=".pdf"
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded file:border-0
                  file:text-sm file:font-semibold
                  file:bg-[#18cc00] file:text-white
                  hover:file:bg-[#159a00]
                  disabled:opacity-50 disabled:cursor-not-allowed"
              />

              {isUploading && pendingUploads > 0 && (
                <p className="mt-2 text-sm text-gray-600">
                  {t("uploading")} {pendingUploads} {t("files")}
                </p>
              )}

              {Object.entries(uploadProgressMap).map(([key, file]) => (
                <div key={key} className="mt-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700">{file.name}</span>
                    <span className="text-gray-500">{file.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all"
                      style={{
                        width: `${file.progress}%`,
                        backgroundColor: user?.color || "#ff7f10",
                      }}
                    />
                  </div>
                </div>
              ))}

              {uploadedAnswerFiles.length > 0 && (
                <div className="mt-6 p-4 bg-green-50 rounded border border-green-200">
                  <p className="text-green-800 font-medium mb-3">
                    {uploadedAnswerFiles.length}{t("readyToSave")}
                  </p>
                  <button
                    onClick={saveUploadedAnswers}
                    disabled={isUploading}
                    className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <IconUpload size={20} />
                    {isUploading ? tc("saving") : t("saveFiles")}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* -------- RENAME MODAL -------- */}
          {showRenameModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-96">
                <h2 className="text-xl font-bold mb-4">{t("renameTitle")}</h2>
                <input
                  type="text"
                  value={newFilename}
                  onChange={(e) => setNewFilename(e.target.value)}
                  className="w-full border px-3 py-2 rounded mb-4"
                  autoFocus
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowRenameModal(false)}
                    className="px-4 py-2 border rounded hover:bg-gray-100"
                  >
                    {tc("cancel")}
                  </button>
                  <button
                    onClick={handleRenameFile}
                    style={{ backgroundColor: user?.color || "#ff7f10" }}
                    className="px-4 py-2 text-white rounded hover:opacity-90"
                  >
                    {t("rename")}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* -------- DELETE MODAL -------- */}
          {showDeleteModal && (
            <div className="fixed inset-0 z-[9999] bg-black/30 flex items-center justify-center">
              <div className="bg-white p-6 rounded-lg shadow-lg w-[350px] text-center relative z-[10000]">
                <h2 className="text-lg font-semibold mb-2 text-black">
                  Confirm Deletion
                </h2>
                <p className="text-gray-700 mb-6">
                  Are you sure you want to delete this file?
                </p>
                <div className="flex justify-center gap-4">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="px-4 py-2 border rounded bg-gray-100 hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    style={{ backgroundColor: user?.color || "#ff7f10" }}
                    className="px-4 py-2 text-white rounded hover:opacity-90"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}