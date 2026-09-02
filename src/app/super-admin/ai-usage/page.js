"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "@/components/ui/Navbar";
import Spinner from "@/components/ui/Spinner";

const FEATURE_LABELS = {
  roadmap_curriculum: "Roadmap Generation",
  roadmap_pre_assessment: "Pre-Assessment Quiz",
  roadmap_notes: "Roadmap Notes (VARK)",
  roadmap_resources: "Learning Resources",
  roadmap_quiz_generate: "Week Quiz Generation",
  roadmap_quiz_grading: "Week Quiz Grading",
  roadmap_practice_questions: "Practice Questions",
  roadmap_practice_evaluate: "Practice Answer Evaluation",
  roadmap_diagram_repair: "Concept Diagram Repair",
  self_review_homework_help: "Homework Help",
  self_review_homework_extraction: "Homework File Reading",
  self_review_notes: "AI Notes",
  self_review_notes_extraction: "AI Notes File Reading",
  test_engine_generate: "Test Engine — Question Generation",
  test_engine_grading: "Test Engine — Grading",
  detailed_feedback: "Detailed Feedback",
  rag_ingest_extraction: "Course Material Reading",
  rag_embedding: "Course Material Indexing",
  rag_summarize: "Course Material Summarizing",
  rag_retrieve: "Course Material Search",
};

const featureLabel = (feature) => FEATURE_LABELS[feature] || feature;

const PROVIDER_LABELS = {
  claude: "Claude",
  gemini: "Gemini",
};

const providerLabel = (provider) => PROVIDER_LABELS[provider] || provider;

const DAY_OPTIONS = [7, 30, 90];

const AiUsagePage = () => {
  const [days, setDays] = useState(30);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchUsage = async (selectedDays) => {
    try {
      setLoading(true);
      setError("");
      const res = await axios.get(`/api/ai-usage?days=${selectedDays}`, { withCredentials: true });
      setData(res.data);
    } catch (err) {
      setError("Failed to load AI usage data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsage(days);
  }, [days]);

  return (
    <div className="min-h-screen flex flex-col bg-[#ff7f10]">
      <Navbar title="AI Usage" />

      <div className="flex-1 p-6">
        <div className="bg-white rounded-xl shadow-md overflow-hidden p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <h2 className="text-2xl font-bold text-[#ff7f10]">AI Usage — Cost by Feature</h2>

            <div className="flex items-center gap-2">
              {DAY_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  onClick={() => setDays(opt)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
                    days === opt
                      ? "bg-orange-500 text-white"
                      : "border text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  Last {opt}d
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">{error}</div>
          )}

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Spinner className="h-8 w-8 text-[#ff7f10]" />
            </div>
          ) : (
            <>
              {data && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-orange-50 rounded-lg p-4">
                    <p className="text-xs text-gray-500 font-medium">Total Calls</p>
                    <p className="text-xl font-bold text-gray-800 mt-1">{data.totals.call_count.toLocaleString()}</p>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-4">
                    <p className="text-xs text-gray-500 font-medium">Total Tokens</p>
                    <p className="text-xl font-bold text-gray-800 mt-1">{data.totals.total_tokens.toLocaleString()}</p>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-4">
                    <p className="text-xs text-gray-500 font-medium">Input / Output</p>
                    <p className="text-sm font-semibold text-gray-800 mt-1">
                      {data.totals.input_tokens.toLocaleString()} / {data.totals.output_tokens.toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-4">
                    <p className="text-xs text-gray-500 font-medium">Estimated Cost</p>
                    <p className="text-xl font-bold text-gray-800 mt-1">${data.totals.cost_usd.toFixed(2)}</p>
                  </div>
                </div>
              )}

              {data && data.byProvider && data.byProvider.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">By Provider</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {data.byProvider.map((row) => (
                      <div key={row.provider} className="bg-orange-50 rounded-lg p-4 border border-orange-100">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-bold text-gray-800">{providerLabel(row.provider)}</p>
                          <p className="text-sm font-semibold text-gray-800">${row.cost_usd.toFixed(4)}</p>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-xs text-gray-600">
                          <div>
                            <p className="text-gray-400">Input</p>
                            <p className="font-semibold text-gray-800">{row.input_tokens.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-gray-400">Output</p>
                            <p className="font-semibold text-gray-800">{row.output_tokens.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-gray-400">Calls</p>
                            <p className="font-semibold text-gray-800">{row.call_count.toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="overflow-x-auto rounded-xl">
                <table className="w-full border-collapse text-gray-800">
                  <thead>
                    <tr className="bg-orange-100">
                      <th className="p-3 text-left">Feature</th>
                      <th className="p-3 text-right">Calls</th>
                      <th className="p-3 text-right">Distinct Users</th>
                      <th className="p-3 text-right">Input Tokens</th>
                      <th className="p-3 text-right">Output Tokens</th>
                      <th className="p-3 text-right">Est. Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data && data.byFeature.length > 0 ? (
                      data.byFeature.map((row) => (
                        <tr key={row.feature} className="border-b hover:bg-gray-50 transition">
                          <td className="p-3 font-medium">{featureLabel(row.feature)}</td>
                          <td className="p-3 text-right">{row.call_count.toLocaleString()}</td>
                          <td className="p-3 text-right">{row.distinct_users.toLocaleString()}</td>
                          <td className="p-3 text-right">{row.input_tokens.toLocaleString()}</td>
                          <td className="p-3 text-right">{row.output_tokens.toLocaleString()}</td>
                          <td className="p-3 text-right font-semibold">${row.cost_usd.toFixed(4)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="text-center py-10 text-gray-500">
                          No AI usage recorded in this window.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <p className="text-xs text-gray-400 mt-4">
                Costs are internal estimates based on provider list pricing, not an actual bill.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AiUsagePage;
