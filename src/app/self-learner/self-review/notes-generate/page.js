"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, Square } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import LoadingState from "@/components/question-paper/ai-tutor/LoadingState";
import OutputPreview from "@/components/question-paper/ai-tutor/OutputPreview";
import FileUploadBox from "@/components/question-paper/ai-tutor/FileUploadBox";
import NotesHistory from "@/components/question-paper/ai-tutor/NotesHistory";

const POLL_INTERVAL = 3000;

export default function Page() {
  const [prompt, setPrompt] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notesType, setNotesType] = useState("Short Notes");
  const [notesLength, setNotesLength] = useState("5 Pages");
  const [result, setResult] = useState(null);
  const [loadingStep, setLoadingStep] = useState(0);

  // ── HISTORY (persisted notes — see app/models/ai_tutor_note.py) ──
  // Generated notes previously lived only in the job-status response, gone
  // the moment the polling stopped tracking it (a refresh, another
  // generation, a return visit) — this panel is what makes past notes
  // reachable again, backed by GET/DELETE /api/ai-tutor/notes.
  const [historyNotes, setHistoryNotes] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [activeNoteId, setActiveNoteId] = useState(null);
  const [deletingNoteId, setDeletingNoteId] = useState(null);

  const recognitionRef = useRef(null);
  const pollTimerRef = useRef(null);

  const loadingSteps = [
    "Uploading study material",
    "Extracting learning content",
    "Analyzing topics with Guru",
    "Generating smart notes",
    "Building notes PDF",
    "Finalizing notes document",
  ];

  useEffect(() => {
    return () => {
      clearTimeout(pollTimerRef.current);
    };
  }, []);

  // ── HISTORY: FETCH ──
  const fetchHistory = async () => {
    try {
      const res = await axios.get("/api/ai-tutor/notes?limit=20", { withCredentials: true });
      setHistoryNotes(res.data.notes || []);
    } catch (err) {
      // History is a convenience panel, not the primary generate flow —
      // fail quietly rather than blocking or alarming the page over it.
      console.error("Failed to load notes history:", err);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // ── HISTORY: LOAD A PAST NOTE INTO THE PREVIEW ──
  const loadNote = async (noteId) => {
    try {
      const res = await axios.get(`/api/ai-tutor/notes/${noteId}`, { withCredentials: true });
      const note = res.data.note;

      // Same shape generate-notes/status returns on completion, so
      // OutputPreview renders a history-loaded note identically to a
      // freshly generated one.
      setResult({
        success: true,
        status: "completed",
        step: "done",
        solution_url: note.solution_url,
        file_id: note.file_id,
        html_content: note.html_content,
        token_usage: note.token_usage,
        warning: note.warning,
        note_id: note.id,
        generated_at: note.created_at,
      });
      setActiveNoteId(noteId);
    } catch (err) {
      toast.error("Could not load that note.");
    }
  };

  // ── HISTORY: DELETE ──
  const deleteNote = async (noteId) => {
    setDeletingNoteId(noteId);
    try {
      await axios.delete(`/api/ai-tutor/notes/${noteId}`, { withCredentials: true });
      setHistoryNotes((prev) => prev.filter((n) => n.id !== noteId));
      if (noteId === activeNoteId) {
        setResult(null);
        setActiveNoteId(null);
      }
      toast.success("Note deleted.");
    } catch (err) {
      toast.error("Could not delete note.");
    } finally {
      setDeletingNoteId(null);
    }
  };

  // ── VOICE START ──
  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      toast.error("Speech Recognition not supported");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event) => {
      // Rebuild from 0, not event.resultIndex: with continuous=true, past
      // results stay in event.results for the whole session, but only
      // starting from resultIndex re-reads the segment that just changed —
      // so once a sentence finalizes and recognition moves to the next one,
      // that new event's resultIndex skips right past it and the box
      // appeared to "reset" after every sentence. Matches the already-
      // correct pattern in faculty/create-question-paper/prompt/page.js.
      let transcript = "";
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setPrompt(transcript);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognition.start();
    recognitionRef.current = recognition;
  };

  // ── VOICE STOP ──
  const stopListening = () => {
    recognitionRef.current?.stop();
  };

  // ── POLLING ──
  const pollJobStatus = (jobId) => {
    pollTimerRef.current = setTimeout(async () => {
      try {
        const res = await axios.get(
          `/api/ai-tutor/generate-notes/status/${jobId}`,
          { withCredentials: true }
        );

        const job = res.data;

        const stepMap = {
          starting: 0,
          extracting_notes: 1,
          generating_notes: 3,
          building_pdf: 4,
          done: 5,
        };

        if (stepMap[job.step] !== undefined) {
          setLoadingStep(stepMap[job.step]);
        }

        if (job.status === "completed") {
          clearTimeout(pollTimerRef.current);
          setResult(job);
          setActiveNoteId(job.note_id || null);
          setLoading(false);
          toast.success("Notes generated successfully!");
          // Picks up the just-created note (job.note_id) without the user
          // having to refresh — see app/models/ai_tutor_note.py for why a
          // failed persistence write leaves note_id null instead of failing
          // the whole job; in that case there's simply nothing new to show
          // here, and this call is a harmless no-op refresh.
          fetchHistory();
          return;
        }

        if (job.status === "failed") {
          clearTimeout(pollTimerRef.current);
          setLoading(false);
          toast.error(job.error || "Generation failed.");
          return;
        }

        pollJobStatus(jobId);

      } catch (err) {
        clearTimeout(pollTimerRef.current);
        setLoading(false);
        toast.error("Error checking job status.");
      }
    }, POLL_INTERVAL);
  };

  // ── GENERATE NOTES ──
  const handleGenerate = async () => {
    try {
      if (!prompt && !file) {
        toast.error("Please enter notes details or upload study material.");
        return;
      }

      setLoading(true);
      setLoadingStep(0);
      setResult(null);
      setActiveNoteId(null);

      const formData = new FormData();
      formData.append("prompt", prompt);
      formData.append("notesType", notesType);
      formData.append("notesLength", notesLength);
      if (file) {
        formData.append("file", file);
      }

      const response = await axios.post(
        "/api/ai-tutor/generate-notes",
        formData,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      const { jobId } = response.data;
      if (!jobId) {
        throw new Error("Job ID missing.");
      }

      pollJobStatus(jobId);

    } catch (error) {
      console.log(error);
      clearTimeout(pollTimerRef.current);
      setLoading(false);
      toast.error(error?.response?.data?.error || "Something went wrong");
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FB] p-4 md:p-6">

      <div className="max-w-5xl mx-auto bg-white rounded-3xl border border-gray-200 shadow-sm p-5 md:p-8">

        {/* HEADING */}
        <div className="mb-7">
          <h1 className="text-2xl md:text-3xl font-bold text-[#1E1B4B]">
            Generate Your Notes
          </h1>
          <p className="text-sm text-gray-600 mt-2 font-medium">
            Create short notes, detailed notes, summaries, or presentation-style notes.
          </p>
        </div>

        {/* TEXTAREA */}
        <div className="relative">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={`Examples:

• Create detailed notes for Operating Systems.
• Generate React interview preparation notes.
• Create short notes for DBMS with examples.
• Generate easy revision notes for Computer Networks.
• Create AI-powered study notes from uploaded PDF.
`}
            className="w-full h-[260px] rounded-3xl border border-gray-200 bg-[#FAFBFF] p-6 pr-24 md:pr-32 text-sm text-[#1E1B4B] placeholder:text-gray-400 outline-none resize-none focus:ring-2 focus:ring-violet-400"
          />

          {/* MIC */}
          <div className="absolute bottom-6 right-6">
            <button
              onClick={isListening ? stopListening : startListening}
              className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition ${isListening ? "bg-red-500 hover:bg-red-600" : "bg-violet-500 hover:bg-violet-600"
                } text-white`}
            >
              {isListening ? <Square size={16} /> : <Mic size={18} />}
            </button>
          </div>
        </div>

        {/* OPTIONS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-8">

          {/* NOTES TYPE */}
          <div>
            <label className="block text-sm font-semibold text-[#1E1B4B] mb-2">
              Notes Type
            </label>
            <select
              value={notesType}
              onChange={(e) => setNotesType(e.target.value)}
              className="w-full border border-gray-200 rounded-2xl bg-[#FAFBFF] p-4 text-sm text-[#1E1B4B] outline-none focus:ring-2 focus:ring-violet-400"
            >
              <option>Short Notes</option>
              <option>Detailed Notes</option>
              <option>Presentation Style</option>
              <option>Summary Notes</option>
            </select>
          </div>

          {/* NOTES LENGTH */}
          <div>
            <label className="block text-sm font-semibold text-[#1E1B4B] mb-2">
              Notes Length
            </label>
            <select
              value={notesLength}
              onChange={(e) => setNotesLength(e.target.value)}
              className="w-full border border-gray-200 rounded-2xl bg-[#FAFBFF] p-4 text-sm text-[#1E1B4B] outline-none focus:ring-2 focus:ring-violet-400"
            >
              <option>5 Pages</option>
              <option>10 Pages</option>
              <option>15 Pages</option>
              <option>Custom</option>
            </select>
          </div>
        </div>

        {/* FILE */}
        <FileUploadBox
          file={file}
          setFile={setFile}
          title="Attach Study Material"
          supportedText="PDF, DOCX supported"
        />

        {/* BUTTON */}
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full mt-8 h-14 rounded-2xl bg-[#1E1B4B] text-white text-sm font-semibold hover:opacity-90 transition disabled:opacity-50"
        >
          {loading ? "Generating Notes..." : "Generate Your Notes"}
        </button>

        {/* LOADING */}
        {loading && (
          <LoadingState
            title="Generating Notes..."
            subtitle="Guru is analyzing your study material and preparing smart notes."
            steps={loadingSteps}
            loadingStep={loadingStep}
          />
        )}

        {/* OUTPUT */}
        {!loading && (
          <OutputPreview
            title="Generated Notes Preview"
            result={result}
            emptyMessage="Your generated notes preview will appear here."
          />
        )}

        {/* HISTORY */}
        {!loading && (
          <NotesHistory
            notes={historyNotes}
            loading={historyLoading}
            activeNoteId={activeNoteId}
            deletingId={deletingNoteId}
            onSelect={loadNote}
            onDelete={deleteNote}
          />
        )}

      </div>

    </div>
  );
}
