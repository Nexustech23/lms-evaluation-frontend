"use client";

import { useState, useRef, useEffect } from "react";
import {
  ArrowLeft,
  Mic,
  Square,
  FileText,
} from "lucide-react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import toast from "react-hot-toast";
import LoadingState from
  "@/components/question-paper/ai-tutor/LoadingState";
import OutputPreview from
  "@/components/question-paper/ai-tutor/OutputPreview";
import FileUploadBox from
  "@/components/question-paper/ai-tutor/FileUploadBox";

const API_BASE = "http://103.192.198.186:5051";

const POLL_INTERVAL = 3000;   // 3 seconds

export default function Page() {
  const [prompt, setPrompt] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] =
    useState(0);

  const loadingSteps = [

    "Uploading homework file",
    "Extracting homework content",
    "Analyzing questions with AI",
    "Generating detailed solution",
    "Building PDF document",
    "Finalizing homework output"

  ]
  const [homeworkType, setHomeworkType] =
    useState("Detailed Solution");

  const [responseStyle, setResponseStyle] =
    useState("Simple");

  const [result, setResult] = useState(null);

  const recognitionRef = useRef(null);
  const pollTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      clearTimeout(pollTimerRef.current);
    };
  }, []);

  // START VOICE
  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      toast.error(
        "Speech Recognition not supported in this browser"
      );
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = true;

    // BETTER FOR english
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      let transcript = "";

      for (
        let i = event.resultIndex;
        i < event.results.length;
        i++
      ) {
        transcript +=
          event.results[i][0].transcript;
      }

      setPrompt(transcript);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();

    recognitionRef.current = recognition;
  };

  // STOP VOICE
  const stopListening = () => {
    recognitionRef.current?.stop();
  };

  // POLLING
  const pollJobStatus = (jobId) => {
    pollTimerRef.current = setTimeout(async () => {
      try {
        const res = await axios.get(
          `${API_BASE}/api/ai-tutor/homework-help/status/${jobId}`
        );

        const job = res.data;

        const stepMap = {
          starting: 0,
          extracting_homework: 1,
          generating_solution: 3,
          building_pdf: 4,
          done: 5,
        };

        if (stepMap[job.step] !== undefined) {
          setLoadingStep(stepMap[job.step]);
        }

        if (job.status === "completed") {
          clearTimeout(pollTimerRef.current);
          setResult(job);
          setLoading(false);
          toast.success("AI Notes generated successfully!");
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
  // GENERATE
  const handleGenerate = async () => {

    try {

      if (!prompt && !file) {

        toast.error(
          "Please enter homework details or upload a file."
        );

        return;
      }

      setLoading(true);
      setLoadingStep(0);
      setResult(null);

      const formData = new FormData();

      formData.append(
        "prompt",
        prompt
      );

      formData.append(
        "homeworkType",
        homeworkType
      );

      formData.append(
        "responseStyle",
        responseStyle
      );

      if (file) {

        formData.append(
          "file",
          file
        );

      }

      const response = await axios.post(
        `${API_BASE}/api/ai-tutor/homework-help`,
        formData,
        {
          headers: {
            "Content-Type":
              "multipart/form-data",
          },
        }
      );

      const { jobId } = response.data;

      // START POLLING — loading/interval cleared inside pollJobStatus
      pollJobStatus(jobId);

    } catch (error) {

      console.log(error);

      clearTimeout(pollTimerRef.current);
      setLoading(false);

      toast.error(
        error?.response?.data?.error ||
        "Something went wrong"
      );

    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FB] p-4 md:p-6">

      {/* MAIN CONTAINER */}
      <div className="max-w-5xl mx-auto bg-white rounded-3xl border border-gray-200 shadow-sm p-5 md:p-8">

        {/* HEADING */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-[#1E1B4B]">
            Homework Help AI
          </h1>

          <p className="text-sm text-gray-600 mt-2 font-medium">
            Add homework instructions, upload PDFs,
            or describe what help you need.
          </p>
        </div>

        {/* TEXTAREA */}
        <div className="relative">

          <textarea
            value={prompt}
            onChange={(e) =>
              setPrompt(e.target.value)
            }
            placeholder={`Example:
Solve my homework questions.
Explain answers step by step.
Generate easy explanations.
Help with programming homework.`}
            className="
              w-full
              h-[260px]
              rounded-3xl
              border
              border-gray-200
              bg-[#FAFBFF]
              p-6
              pr-24
              md:pr-32
              text-sm
              text-[#1E1B4B]
              placeholder:text-gray-400
              outline-none
              resize-none
              focus:ring-2
              focus:ring-violet-400
            "
          />

          {/* MIC BUTTON */}
          <div className="absolute bottom-6 right-6">

            <button
              onClick={
                isListening
                  ? stopListening
                  : startListening
              }
              className={`
                w-12
                h-12
                rounded-full
                flex
                items-center
                justify-center
                shadow-lg
                transition
                ${isListening
                  ? "bg-red-500 hover:bg-red-600"
                  : "bg-violet-500 hover:bg-violet-600"
                }
                text-white
              `}
            >
              {isListening ? (
                <Square size={16} />
              ) : (
                <Mic size={18} />
              )}
            </button>
          </div>

          {/* LISTENING */}
          {isListening && (
            <div className="absolute top-5 right-5 flex items-center gap-2 bg-red-50 text-red-500 px-3 py-2 rounded-full text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              Listening...
            </div>
          )}
        </div>

        {/* OPTIONS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-8">

          {/* HOMEWORK TYPE */}
          <div>
            <label className="block text-sm font-semibold text-[#1E1B4B] mb-2">
              Homework Type
            </label>

            <select
              value={homeworkType}
              onChange={(e) =>
                setHomeworkType(e.target.value)
              }
              className="
                w-full
                border
                border-gray-200
                rounded-2xl
                bg-[#FAFBFF]
                p-4
                text-sm
                text-[#1E1B4B]
                outline-none
                focus:ring-2
                focus:ring-violet-400
              "

            >
              <option>Detailed Solution</option>
              <option>Short Explanation</option>
              <option>Step By Step</option>
              <option>Summary Answer</option>
            </select>
          </div>

          {/* RESPONSE MODE */}
          <div>
            <label className="block text-sm font-semibold text-[#1E1B4B] mb-2">
              Response Style
            </label>

            <select
              value={responseStyle}
              onChange={(e) =>
                setResponseStyle(e.target.value)
              }
              className="
                w-full
                border
                border-gray-200
                rounded-2xl
                bg-[#FAFBFF]
                p-4
                text-sm
                text-[#1E1B4B]
                outline-none
                focus:ring-2
                focus:ring-violet-400
              "
            >
              <option>Simple</option>
              <option>Student Friendly</option>
              <option>Technical</option>
              <option>Exam Style</option>
            </select>
          </div>
        </div>

        {/* PDF SECTION */}
        <FileUploadBox

          file={file}

          setFile={setFile}

          title="Attach Homework File"

          supportedText="PDF, DOCX, PNG, JPG supported"

        />

        {/* GENERATE BUTTON */}
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="
            w-full
            mt-8
            h-14
            rounded-2xl
            bg-[#1E1B4B]
            text-white
            text-sm
            font-semibold
            hover:opacity-90
            transition
            disabled:opacity-50
          "
        >
          {loading
            ? "Generating Homework Help..."
            : "Generate Homework Help"}
        </button>
        {loading && (

          <LoadingState

            title="Generating Homework..."
            subtitle="AI is analyzing your file and preparing the solution."

            steps={loadingSteps}

            loadingStep={loadingStep}

          />

        )}

        {/* OUTPUT PREVIEW */}
        {!loading && (

          <OutputPreview

            title="Homework Output Preview"

            result={result}

            emptyMessage="
    Your AI-generated homework solution,
    explanations,
    summaries,
    and answers will appear here.
    "

          />

        )}
      </div>
    </div>
  );
}