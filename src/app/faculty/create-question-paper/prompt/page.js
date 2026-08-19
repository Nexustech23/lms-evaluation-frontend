"use client";
import {
  useState,
  useRef,
  useCallback,
  useEffect,
  useMemo,
  useContext,
} from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { FaArrowLeft } from "react-icons/fa";
import { AuthContext } from "@/app/AuthContext";

import { STAGES } from "@/lib/question-paper/constants";
import { withAlpha, darkenColor } from "@/lib/question-paper/colorHelpers";
import { buildPreviewHtml } from "@/lib/question-paper/previewBuilder";

import Navbar from "@/components/ui/Navbar";
import FilterBar from "@/components/question-paper/FilterBar";
import ChooseStage from "@/components/question-paper/ChooseStage";
import InputStage, {
  getDefaultSections,
} from "@/components/question-paper/InputStage";
import GeneratingStage from "@/components/question-paper/GeneratingStage";
import EditorStage from "@/components/question-paper/EditorStage";

// ─────────────────────────────────────────────────────────────────────────────
export default function QuestionPaperGenerator() {
  const { user } = useContext(AuthContext);
  const color = user?.color || "#ff7f10";
  const router = useRouter();
  const searchParams = useSearchParams();
  const paperId = searchParams.get("id");
  const isEditMode = !!paperId;

  // ── i18n ──────────────────────────────────────────────────────────────────
  const t = useTranslations("createQuestionPaper-Prompt");
  const ts = useTranslations("subjects");
  const tc = useTranslations("common");

  // ── Stage ─────────────────────────────────────────────────────────────────
  const [stage, setStage] = useState(STAGES.CHOOSE);
  const [inputMode, setInputMode] = useState(null); // "pdf" | "prompt"

  // ── File state ────────────────────────────────────────────────────────────
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [coursePlannerFile, setCoursePlannerFile] = useState(null);
  const [isCoursePlannerDragging, setIsCoursePlannerDragging] = useState(false);
  const fileInputRef = useRef(null);
  const coursePlannerInputRef = useRef(null);

  // ── Prompt ────────────────────────────────────────────────────────────────
  const [prompt, setPrompt] = useState("");
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  // ── Exam metadata ─────────────────────────────────────────────────────────
  const [subjectNameInput, setSubjectNameInput] = useState("");
  const [examType, setExamType] = useState("End Semester Examination");
  const [totalMarks, setTotalMarks] = useState(100);
  const [duration, setDuration] = useState("3 Hours");
  const [folderName, setFolderName] = useState("");
  const [academicYear, setAcademicYear] = useState("");

  // ── Sections (lifted from InputStage so they survive stage transitions
  //    and can be read in handleGenerate) ────────────────────────────────────
  const [sections, setSections] = useState(getDefaultSections);

  // Derived validation — single source of truth
  const totalSectionPercent = sections.reduce(
    (sum, s) => sum + (Number(s.percent) || 0),
    0,
  );
  const sectionPercentValid =
    sections.length > 0 &&
    totalSectionPercent === 100 &&
    sections.every((s) => Number(s.percent) > 0);

  // ── Editor / output ───────────────────────────────────────────────────────
  const [editorContent, setEditorContent] = useState("");
  const [docxBase64, setDocxBase64] = useState("");
  const [docxFilename, setDocxFilename] = useState("question_paper.docx");
  const [generationMeta, setGenerationMeta] = useState({});
  const [generationStep, setGenerationStep] = useState("");

  // ── UI loading flags ──────────────────────────────────────────────────────
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // ── Filter / subject tree ─────────────────────────────────────────────────
  const [structuredData, setStructuredData] = useState({});
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [selectedProgramme, setSelectedProgramme] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [selectedSemester, setSelectedSemester] = useState("");
  const [selectedSubject, setSelectedSubject] = useState(null);

  // ── Fetch subject tree on mount ───────────────────────────────────────────
  const fetchSubjects = useCallback(async () => {
    try {
      setLoadingSubjects(true);
      const res = await axios.get(`/api/subjects/faculty`, {
        withCredentials: true,
        // Default server-side limit is 10 — a faculty with subjects across
        // several batches/semesters can easily exceed that, which would
        // silently drop older batches from this picker. Request a high
        // enough limit to cover realistic totals instead.
        params: { limit: 500 },
      });
      const data = res.data.subjects || [];
      const tree = {};
      data.forEach((sub) => {
        const {
          school_id,
          school_name,
          programme_id,
          programme_name,
          department_id,
          department_name,
          batch_id,
          batch_name,
          semester,
        } = sub;

        if (!tree[school_id])
          tree[school_id] = { name: school_name, programmes: {} };

        const progs = tree[school_id].programmes;
        if (!progs[programme_id])
          progs[programme_id] = { name: programme_name, departments: {} };

        const depts = progs[programme_id].departments;
        if (!depts[department_id])
          depts[department_id] = { name: department_name, batches: {} };

        const batchMap = depts[department_id].batches;
        if (!batchMap[batch_id])
          batchMap[batch_id] = { name: batch_name, semesters: {} };

        const sems = batchMap[batch_id].semesters;
        if (!sems[semester]) sems[semester] = [];
        sems[semester].push(sub);
      });
      return tree;
    } catch {
      toast.error("Failed to load filter data");
      return {};
    } finally {
      setLoadingSubjects(false);
    }
  }, []);

  useEffect(() => {
    fetchSubjects().then(setStructuredData);
  }, [fetchSubjects]);

  useEffect(() => {
    if (isEditMode) fetchPaperDetails();
  }, [isEditMode]);

  // ── Derived filter lists ───────────────────────────────────────────────────
  const schools = Object.entries(structuredData).map(([id, v]) => ({
    id,
    name: v.name,
  }));

  const programmes = selectedSchool
    ? Object.entries(structuredData[selectedSchool.id]?.programmes || {}).map(
        ([id, v]) => ({ id, name: v.name }),
      )
    : [];

  const departments = selectedProgramme
    ? Object.entries(
        structuredData[selectedSchool.id]?.programmes[selectedProgramme.id]
          ?.departments || {},
      ).map(([id, v]) => ({ id, name: v.name }))
    : [];

  const hasDepartments =
    departments.length > 0 && !departments.every((d) => d.id === "null");

  const batches = (() => {
    if (hasDepartments && selectedDepartment) {
      return Object.entries(
        structuredData[selectedSchool.id]?.programmes[selectedProgramme.id]
          ?.departments[selectedDepartment.id]?.batches || {},
      ).map(([id, v]) => ({ id, name: v.name }));
    }
    if (!hasDepartments && selectedProgramme) {
      return Object.entries(
        structuredData[selectedSchool.id]?.programmes[selectedProgramme.id]
          ?.departments["null"]?.batches || {},
      ).map(([id, v]) => ({ id, name: v.name }));
    }
    return [];
  })();

  const semesterSource = (() => {
    if (hasDepartments && selectedDepartment && selectedBatch) {
      return (
        structuredData[selectedSchool.id]?.programmes[selectedProgramme.id]
          ?.departments[selectedDepartment.id]?.batches[selectedBatch.id]
          ?.semesters || {}
      );
    }
    if (!hasDepartments && selectedBatch) {
      return (
        structuredData[selectedSchool.id]?.programmes[selectedProgramme.id]
          ?.departments["null"]?.batches[selectedBatch.id]?.semesters || {}
      );
    }
    return {};
  })();

  const semesters = selectedBatch ? Object.keys(semesterSource) : [];
  const filteredSubjects = selectedSemester
    ? semesterSource[selectedSemester] || []
    : [];

  // ── Filter cascade helpers ────────────────────────────────────────────────
  const resetBelow = (level) => {
    if (level <= 1) setSelectedProgramme(null);
    if (level <= 2) setSelectedDepartment(null);
    if (level <= 3) setSelectedBatch(null);
    if (level <= 4) setSelectedSemester("");
    if (level <= 5) setSelectedSubject(null);
  };

  const handleClearFilters = () => {
    setSelectedSchool(null);
    setSelectedProgramme(null);
    setSelectedDepartment(null);
    setSelectedBatch(null);
    setSelectedSemester("");
    setSelectedSubject(null);
  };

  const fetchPaperDetails = async () => {
    const toastId = toast.loading("Loading question paper…");
    try {
      const res = await axios.get(`/api/question-paper/${paperId}`, {
        withCredentials: true,
      });
      const data = res.data.questionPaper;

      // ── Populate all metadata ────────────────────────────────────────────
      setExamType(data.examType || "");
      setDuration(data.duration || "");
      setTotalMarks(data.totalMarks || 100);
      setAcademicYear(data.academicYear || "");
      setFolderName(data.folderName || "");
      setDocxFilename(
        data.questionPaperUrl
          ? data.questionPaperUrl.split("/").pop().split("?")[0]
          : "question_paper.docx",
      );
      setGenerationMeta({
        instituteName: data.instituteName || "",
        departmentName: data.departmentName || "",
        programmeName: data.programmeName || "",
        batchName: data.batchName || "",
        subjectName: data.subjectName || "",
        examType: data.examType || "",
        semester: data.semester || "",
        academicYear: data.academicYear || "",
        totalMarks: data.totalMarks || 100,
        duration: data.duration || "",
        fileUrl: data.questionPaperUrl || "",
      });

      // ── Resolve editor content ────────────────────────────────────────────
      // Prefer stored editorContent; fall back to converting the DOCX via mammoth
      if (data.editorContent) {
        setEditorContent(data.editorContent);
        setStage(STAGES.EDITOR);
        toast.dismiss(toastId);
      } else if (data.questionPaperUrl) {
        toast.loading("Converting DOCX to editor…", { id: toastId });
        try {
          // Fetch the DOCX file as an ArrayBuffer
          const docxRes = await fetch(data.questionPaperUrl);
          if (!docxRes.ok) throw new Error("Failed to fetch DOCX file.");
          const arrayBuffer = await docxRes.arrayBuffer();

          // Store base64 so the user can re-download without regenerating
          const bytes = new Uint8Array(arrayBuffer);
          const binary = bytes.reduce(
            (acc, b) => acc + String.fromCharCode(b),
            "",
          );
          setDocxBase64(btoa(binary));

          // Convert DOCX → HTML using mammoth
          const mammoth = (await import("mammoth")).default;
          const { value: html } = await mammoth.convertToHtml({ arrayBuffer });
          setEditorContent(
            html || "<p>Could not extract content from DOCX.</p>",
          );
        } catch (convErr) {
          console.error("DOCX conversion failed:", convErr);
          setEditorContent(
            "<p>Could not load paper content. Please regenerate.</p>",
          );
          toast.error("Could not convert DOCX — showing placeholder.", {
            id: toastId,
          });
        }
        setStage(STAGES.EDITOR);
        toast.dismiss(toastId);
      } else {
        // No content at all
        setEditorContent(
          "<p>No content available. Please regenerate this paper.</p>",
        );
        setStage(STAGES.EDITOR);
        toast.error("No content found for this paper.", { id: toastId });
      }
    } catch {
      toast.error("Failed to load question paper", { id: toastId });
    }
  };

  // ── Preview metadata ──────────────────────────────────────────────────────
  const previewMeta = useMemo(
    () => ({
      instituteName:  generationMeta.instituteName || "",

      departmentName:
        selectedDepartment?.name || generationMeta.departmentName || "",

      programmeName:
        selectedProgramme?.name || generationMeta.programmeName || "",

      batchName: selectedBatch?.name || generationMeta.batchName || "",

      subjectName:
        selectedSubject?.subject_name ||
        subjectNameInput ||
        generationMeta.subjectName ||
        "",

      examType: generationMeta.examType || examType,

      semester: selectedSemester || generationMeta.semester || "",

      academicYear:  academicYear || generationMeta.academicYear || "",

      duration: generationMeta.duration || duration,

      totalMarks: generationMeta.totalMarks || totalMarks,
    }),
    [
      selectedSchool,
      selectedDepartment,
      selectedProgramme,
      selectedBatch,
      selectedSubject,
      subjectNameInput,
      generationMeta,
      examType,
      selectedSemester,
      academicYear,
      duration,
      totalMarks,
    ],
  );

  const previewHtml = useMemo(
    () => buildPreviewHtml(editorContent, previewMeta, color),
    [editorContent, previewMeta, color],
  );

  // ── Reset everything ──────────────────────────────────────────────────────
  const handleReset = () => {
    setStage(STAGES.CHOOSE);
    setInputMode(null);
    setPrompt("");
    setUploadedFile(null);
    setEditorContent("");
    setDocxBase64("");
    setDocxFilename("question_paper.docx");
    setGenerationMeta({});
    setIsSaved(false);
    setCoursePlannerFile(null);
    setSubjectNameInput("");
    setSections(getDefaultSections());
    setGenerationStep("");
  };

  // ── Speech recognition ────────────────────────────────────────────────────
  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      toast.error("Speech Recognition not supported in this browser");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event) => {
      let transcript = "";
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setPrompt(transcript);
    };
    recognition.onerror = (event) => {
      if (event.error === "not-allowed")
        toast.error("Microphone permission denied");
      setIsListening(false);
    };
    recognition.onend = () => setIsListening(false);

    recognition.start();
    recognitionRef.current = recognition;
  };

  const stopListening = () => recognitionRef.current?.stop();
  const cancelListening = () => {
    recognitionRef.current?.stop();
    setPrompt("");
  };

  // ── Generate ──────────────────────────────────────────────────────────────
  const handleGenerate = async () => {
    if (!sectionPercentValid) {
      toast.error(
        totalSectionPercent !== 100
          ? `Sections total ${totalSectionPercent}% — must equal 100%.`
          : "Each section must have a percentage greater than 0.",
      );
      return;
    }

    setStage(STAGES.GENERATING);
    setGenerationStep("starting");

    try {
      const formData = new FormData();
      if (selectedSubject?._id)
        formData.append("subjectId", selectedSubject._id);
      formData.append(
        "subjectName",
        selectedSubject?.subject_name || subjectNameInput.trim() || "Subject",
      );
      if (selectedSemester) formData.append("semester", selectedSemester);
      if (academicYear) formData.append("academicYear", academicYear);
      formData.append("examType", examType);
      formData.append("totalMarks", String(totalMarks));
      formData.append("duration", duration);
      formData.append(
        "folderName",
        folderName ||
          `${selectedSubject?.subject_name || subjectNameInput || "Paper"} — ${examType}`,
      );

      // ── Send full sections array (including bloom levels) as JSON ──────────
      formData.append("sections", JSON.stringify(sections));

      if (inputMode === "pdf" && uploadedFile) {
        formData.append("questionBank", uploadedFile);
        if (coursePlannerFile)
          formData.append("coursePlanner", coursePlannerFile);
      } else {
        formData.append("prompt", prompt);
        if (coursePlannerFile)
          formData.append("coursePlanner", coursePlannerFile);
      }

      const startRes = await axios.post(
        `/api/question-paper/generate-ai`,
        formData,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        },
      );
      const { jobId, token_warnings } = startRes.data;
      if (!jobId) throw new Error("No jobId returned from server.");

      if (token_warnings?.length) {
        toast(
          "Your institute is running low on AI tokens — contact your administrator to top up soon.",
          { icon: "⚠️" },
        );
      }

      // Polling loop
      const result = await new Promise((resolve, reject) => {
        let attempts = 0;
        const timer = setInterval(async () => {
          attempts++;
          if (attempts > 120) {
            clearInterval(timer);
            reject(new Error("Generation timed out."));
            return;
          }
          try {
            const pollRes = await axios.get(
              `/api/question-paper/generate-ai/status/${jobId}`,
              { withCredentials: true },
            );
            const job = pollRes.data;
            if (job.step) setGenerationStep(job.step);
            if (job.status === "completed") {
              clearInterval(timer);
              resolve(job);
            } else if (job.status === "failed") {
              clearInterval(timer);
              reject(new Error(job.error || "Generation failed."));
            }
          } catch (pollErr) {
            if (
              pollErr?.response?.status >= 400 &&
              pollErr?.response?.status < 500
            ) {
              clearInterval(timer);
              reject(pollErr);
            }
          }
        }, 2500);
      });

      const {
        paperText,
        docxBase64: b64,
        filename,
        instituteName,
        subjectName: resSubjectName,
        examType: resExamType,
        semester: resSemester,
        academicYear: resAcademicYear,
        totalMarks: resTotalMarks,
        duration: resDuration,
        generationSource,
        tokenUsage,
      } = result;
      console.log(result);
      if (!paperText)
        throw new Error(
          "Server returned empty paper content. Please try again.",
        );

      const escapeHtml = (str) =>
        str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

      // Questions carrying a [CO#] tag (attached by the AI when the paper
      // is tied to a real subject) render it as a right-aligned badge
      // instead of leaving it inline in the question text.
      const renderQuestionLine = (escaped) => {
        const coMatch = escaped.match(/\[\s*CO\s*\d+\s*\]/i);
        if (!coMatch) return `<p><strong>${escaped}</strong></p>`;
        const coTag = coMatch[0].replace(/\s+/g, "").toUpperCase();
        const rest = (
          escaped.slice(0, coMatch.index) +
          escaped.slice(coMatch.index + coMatch[0].length)
        ).trim();
        return `<p style="display:flex;justify-content:space-between;align-items:baseline;gap:12px;"><strong>${rest}</strong><span style="font-size:11px;font-weight:600;color:#6b7280;white-space:nowrap;">${coTag}</span></p>`;
      };

      let inDiagram = false;
      const formatted = (paperText || "")
        .split(/\r?\n/)
        .map((line) => {
          const trimmed = line.trim();
          if (trimmed === "<<<DIAGRAM>>>") {
            inDiagram = true;
            return "";
          }
          if (trimmed === "<<<END_DIAGRAM>>>") {
            inDiagram = false;
            return "";
          }
          if (inDiagram) {
            return "";
          }

          const escaped = escapeHtml(trimmed);
          if (!escaped) return "<p><br/></p>";
          if (/^SECTION\s+[A-Z]/i.test(escaped)) return `<h2>${escaped}</h2>`;
          if (/^(Q\d+[\.\)]|\d+\.)/i.test(escaped))
            return renderQuestionLine(escaped);
          if (escaped.startsWith("```")) return "";
          return `<p>${escaped}</p>`;
        })
        .filter(Boolean)
        .join("");

      setEditorContent(formatted);

      // Async preview diagram loader
      const renderDiagramPreviews = async (text) => {
        const lines = (text || "").split(/\r?\n/);
        let htmlParts = [];
        let inDiag = false;
        let diagBuf = [];

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          const trimmed = line.trim();

          if (trimmed === "<<<DIAGRAM>>>") {
            inDiag = true;
            diagBuf = [];
            continue;
          }

          if (trimmed === "<<<END_DIAGRAM>>>") {
            inDiag = false;
            const rawJson = diagBuf.join("\n").trim();
            if (rawJson) {
              try {
                const spec = JSON.parse(rawJson);
                if (spec.type === "data_table") {
                  const title = spec.title || "";
                  const headers = spec.headers || [];
                  const rows = spec.rows || [];
                  
                  let tableHtml = `<div style="margin: 16px 0;">`;
                  if (title) {
                    tableHtml += `<p style="text-align: center; font-weight: bold; margin-bottom: 6px;">${escapeHtml(title)}</p>`;
                  }
                  tableHtml += `<table style="width: 100%; border-collapse: collapse; border: 1px solid #bfdbfe; font-size: 14px;">`;
                  
                  if (headers.length > 0) {
                    tableHtml += `<thead><tr style="background-color: #eff6ff;">`;
                    headers.forEach(h => {
                      tableHtml += `<th style="border: 1px solid #bfdbfe; padding: 8px; color: #1d4ed8; font-weight: bold; text-align: center;">${escapeHtml(h)}</th>`;
                    });
                    tableHtml += `</tr></thead>`;
                  }
                  
                  tableHtml += `<tbody>`;
                  rows.forEach((row, ri) => {
                    const bgColor = ri % 2 === 0 ? "#f8fafc" : "#ffffff";
                    tableHtml += `<tr>`;
                    const cellData = Array.isArray(row) ? row : [];
                    cellData.forEach(cell => {
                      tableHtml += `<td style="border: 1px solid #e2e8f0; padding: 8px; text-align: center; background-color: ${bgColor};">${escapeHtml(String(cell))}</td>`;
                    });
                    tableHtml += `</tr>`;
                  });
                  tableHtml += `</tbody></table></div>`;
                  
                  htmlParts.push(tableHtml);
                } else {
                  const res = await axios.post(
                    "/api/question-paper/render-diagram",
                    { spec },
                    { withCredentials: true }
                  );
                  if (res.data && res.data.image) {
                    htmlParts.push(
                      `<p style="text-align: center;"><img src="${res.data.image}" alt="${escapeHtml(spec.title || 'Diagram')}" style="max-width: 90%; height: auto; border: 1px solid #e2e8f0; border-radius: 6px; padding: 6px; margin: 12px auto; display: block;" /></p>`
                    );
                  } else {
                    htmlParts.push(`<p style="color: red; text-align: center; font-style: italic;">[Failed to render diagram preview]</p>`);
                  }
                }
              } catch (err) {
                console.error("Failed to render diagram:", err);
                htmlParts.push(`<p style="color: red; text-align: center; font-style: italic;">[Diagram Error: ${escapeHtml(err.message)}]</p>`);
              }
            }
            continue;
          }

          if (inDiag) {
            diagBuf.push(line);
            continue;
          }

          const escaped = escapeHtml(trimmed);
          if (!escaped) {
            htmlParts.push("<p><br/></p>");
            continue;
          }
          if (/^SECTION\s+[A-Z]/i.test(escaped)) {
            htmlParts.push(`<h2>${escaped}</h2>`);
            continue;
          }
          if (/^(Q\d+[\.\)]|\d+\.)/i.test(escaped)) {
            htmlParts.push(renderQuestionLine(escaped));
            continue;
          }
          if (escaped.startsWith("```")) continue;
          htmlParts.push(`<p>${escaped}</p>`);
        }

        return htmlParts.filter(Boolean).join("");
      };

      renderDiagramPreviews(paperText)
        .then((htmlWithDiagrams) => {
          setEditorContent(htmlWithDiagrams);
        })
        .catch((err) => {
          console.error("Async preview render failed:", err);
        });

      setDocxBase64(b64 || "");
      setDocxFilename(filename || "question_paper.docx");
      setGenerationMeta({
        instituteName: instituteName || selectedSchool?.name || "",

        departmentName: selectedDepartment?.name || "",

        programmeName: selectedProgramme?.name || "",

        batchName: selectedBatch?.name || "",

        subjectName: resSubjectName || selectedSubject?.subject_name || "",

        examType: resExamType || examType,

        semester: resSemester || selectedSemester || "",

        academicYear: resAcademicYear || academicYear || "",

        totalMarks: resTotalMarks || totalMarks,

        duration: resDuration || duration,

        generationSource:
          generationSource || (inputMode === "pdf" ? "pdf" : "prompt"),

        tokenUsage: tokenUsage || {},
      });
      setStage(STAGES.EDITOR);
      toast.success("Question paper generated!");
    } catch (err) {
      toast.error(
        err?.response?.data?.error ||
          err?.message ||
          "Generation failed. Please try again.",
      );
      setStage(STAGES.INPUT);
    } finally {
      setGenerationStep("");
    }
  };

  // ── Download DOCX ─────────────────────────────────────────────────────────
  const handleDownloadDocx = async () => {
    setIsDownloading(true);
    try {
      if (docxBase64) {
        const bytes = Uint8Array.from(atob(docxBase64), (c) => c.charCodeAt(0));
        const blob = new Blob([bytes], {
          type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        });
        const url = URL.createObjectURL(blob);
        Object.assign(document.createElement("a"), {
          href: url,
          download: docxFilename,
        }).click();
        URL.revokeObjectURL(url);
        toast.success("DOCX downloaded!");
      } else if (generationMeta.fileUrl) {
        const res = await fetch(generationMeta.fileUrl);
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        Object.assign(document.createElement("a"), {
          href: url,
          download: docxFilename,
        }).click();
        URL.revokeObjectURL(url);
        toast.success("DOCX downloaded!");
      } else {
        toast.error("No file available to download. Please regenerate.");
      }
    } catch {
      toast.error("Download failed.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    const toastId = toast.loading("Saving question paper...");
    try {
      const payload = {
        editorContent,
        instituteName: previewMeta.instituteName,
        departmentName: previewMeta.departmentName,
        programmeName: previewMeta.programmeName,
        batchName: previewMeta.batchName,
        subjectId: selectedSubject?._id || null,
        subjectName: previewMeta.subjectName,
        examType: previewMeta.examType,
        semester: previewMeta.semester,
        academicYear: previewMeta.academicYear,
        totalMarks: previewMeta.totalMarks,
        duration: previewMeta.duration,
        folderName:
          folderName ||
          `${previewMeta.subjectName || "Paper"} — ${previewMeta.examType}`,
        generationSource: generationMeta.generationSource,
        promptUsed: inputMode === "prompt" ? prompt : null,
        schoolId: selectedSchool?.id || null,
        programmeId: selectedProgramme?.id || null,
        departmentId: selectedDepartment?.id || null,
        batchId: selectedBatch?.id || null,
      };
      toast.loading("Saving to grAdelytIcs...", {
        id: toastId,
      });

      let updatedFileUrl = "";
      if (isEditMode) {
        const res = await axios.put(`/api/question-paper/${paperId}`, payload, {
          withCredentials: true,
        });
        updatedFileUrl = res.data.questionPaperUrl;
      } else {
        if (!selectedSubject) {
          toast.error("Please select a Subject in filters before saving.");
          return;
        }
        const res = await axios.post(`/api/question-paper/save`, payload, {
          withCredentials: true,
        });
        updatedFileUrl = res.data.questionPaperUrl;
      }

      if (updatedFileUrl) {
        setGenerationMeta((prev) => ({
          ...prev,
          fileUrl: updatedFileUrl,
        }));
      }

      toast.success(
        isEditMode
          ? "Question paper updated successfully!"
          : "Question paper saved successfully!",
        {
          id: toastId,
        },
      );

      setIsSaved(true);

      setTimeout(() => {
        setIsSaved(false);
      }, 5000);

      router.back();
    } catch (err) {
      console.error(err);

      toast.error(
        err?.response?.data?.error || err?.message || "Save failed. Try again.",
        {
          id: toastId,
        },
      );
    } finally {
      setIsSaving(false);
    }
  };

  console.log(previewMeta);
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div
      className="flex flex-col min-h-screen"
      style={{ backgroundColor: withAlpha(color) }}
    >
      <Navbar title={t("filterTitle")} />

      {/* Back button */}
      <div className="mb-4 mx-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 mb-4 px-4 ml-4 py-2 text-sm bg-white rounded"
          style={{ color: darkenColor(color) }}
        >
          <FaArrowLeft />
          {tc("back")}
        </button>
      </div>

      <div className="bg-white min-h-screen p-4 mx-6 rounded-xl">
        {/* ── Filter bar ── */}
        <FilterBar
          color={color}
          loadingSubjects={loadingSubjects}
          schools={schools}
          programmes={programmes}
          departments={departments}
          batches={batches}
          semesters={semesters}
          filteredSubjects={filteredSubjects}
          selectedSchool={selectedSchool}
          selectedProgramme={selectedProgramme}
          selectedDepartment={selectedDepartment}
          selectedBatch={selectedBatch}
          selectedSemester={selectedSemester}
          selectedSubject={selectedSubject}
          onSchoolChange={(v) => {
            setSelectedSchool(schools.find((s) => s.id === v) || null);
            resetBelow(1);
          }}
          onProgrammeChange={(v) => {
            setSelectedProgramme(programmes.find((p) => p.id === v) || null);
            resetBelow(2);
          }}
          onDepartmentChange={(v) => {
            setSelectedDepartment(departments.find((d) => d.id === v) || null);
            resetBelow(3);
          }}
          onBatchChange={(v) => {
            setSelectedBatch(batches.find((b) => b.id === v) || null);
            resetBelow(4);
          }}
          onSemesterChange={(v) => {
            setSelectedSemester(v);
            setSelectedSubject(null);
          }}
          onSubjectChange={(v) =>
            setSelectedSubject(
              filteredSubjects.find((s) => s._id === v) || null,
            )
          }
          onClear={handleClearFilters}
          filterNote={t("filterNote")}
          filterHint={t("filterHint")}
          labelMap={{
            school: ts("school"),
            programme: ts("programme"),
            department: ts("department"),
            batch: ts("batch"),
            semester: ts("semester"),
            subject: ts("subject"),
          }}
          clearLabel={ts("clear")}
        />

        {/* ── Stage router ── */}
        {(stage === STAGES.CHOOSE ||
          stage === STAGES.INPUT ||
          stage === STAGES.GENERATING) && (
          <div className="max-w-3xl mx-auto py-4 px-4">
            {stage === STAGES.CHOOSE && (
              <ChooseStage
                color={color}
                chooseHint={t("chooseHint")}
                cards={[
                  {
                    mode: "pdf",
                    icon: "📄",
                    title: t("uploadQuestionBank"),
                    desc: t("uploadDesc"),
                  },
                  {
                    mode: "prompt",
                    icon: "✏️",
                    title: "Add a Prompt",
                    desc: "Describe your paper in plain language",
                  },
                ]}
                onChoose={(mode) => {
                  setInputMode(mode);
                  setStage(STAGES.INPUT);
                }}
              />
            )}

            {stage === STAGES.INPUT && (
              <InputStage
                color={color}
                inputMode={inputMode}
                prompt={prompt}
                setPrompt={setPrompt}
                isListening={isListening}
                startListening={startListening}
                stopListening={stopListening}
                cancelListening={cancelListening}
                uploadedFile={uploadedFile}
                setUploadedFile={setUploadedFile}
                isDragging={isDragging}
                setIsDragging={setIsDragging}
                fileInputRef={fileInputRef}
                coursePlannerFile={coursePlannerFile}
                setCoursePlannerFile={setCoursePlannerFile}
                isCoursePlannerDragging={isCoursePlannerDragging}
                setIsCoursePlannerDragging={setIsCoursePlannerDragging}
                coursePlannerInputRef={coursePlannerInputRef}
                selectedSubject={selectedSubject}
                subjectNameInput={subjectNameInput}
                setSubjectNameInput={setSubjectNameInput}
                examType={examType}
                setExamType={setExamType}
                totalMarks={totalMarks}
                setTotalMarks={setTotalMarks}
                duration={duration}
                setDuration={setDuration}
                academicYear={academicYear}
                setAcademicYear={setAcademicYear}
                // Sections — fully controlled from this parent
                sections={sections}
                setSections={setSections}
                onBack={handleReset}
                onGenerate={handleGenerate}
                t={t}
                tc={tc}
              />
            )}

            {stage === STAGES.GENERATING && (
              <GeneratingStage
                color={color}
                inputMode={inputMode}
                coursePlannerFile={coursePlannerFile}
                generationStep={generationStep}
                t={t}
              />
            )}
          </div>
        )}

        {stage === STAGES.EDITOR && (
          <EditorStage
            color={color}
            editorContent={editorContent}
            setEditorContent={setEditorContent}
            previewHtml={previewHtml}
            previewMeta={previewMeta}
            docxBase64={docxBase64}
            generationMeta={generationMeta}
            docxFilename={docxFilename}
            isDownloading={isDownloading}
            isSaving={isSaving}
            isSaved={isSaved}
            onReset={handleReset}
            onDownloadDocx={handleDownloadDocx}
            onSave={handleSave}
            t={t}
          />
        )}
      </div>
    </div>
  );
}
