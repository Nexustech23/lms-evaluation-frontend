"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "@/components/ui/Navbar";
import Spinner from "@/components/ui/Spinner";

const ROLE_LABELS = {
  self_learner: "Self-Learner",
  institute_student: "Institute Student",
};

const PROVIDER_LABELS = {
  claude: "Claude",
  gemini: "Gemini",
};

const formatTokens = (input, output) => {
  if (!input && !output) return "— / —";
  return `${(input || 0).toLocaleString()} / ${(output || 0).toLocaleString()}`;
};

const ActivityLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [institutes, setInstitutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [instituteId, setInstituteId] = useState("");
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });

  const fetchLogs = async (page = 1, emailFilter = email, instituteFilter = instituteId) => {
    try {
      setLoading(true);
      setError("");
      const res = await axios.get("/api/self-learners/activity-logs", {
        params: {
          page,
          limit: pagination.limit,
          email: emailFilter || undefined,
          institute_id: instituteFilter || undefined,
        },
        withCredentials: true,
      });
      setLogs(res.data.logs || []);
      setPagination((prev) => ({ ...prev, page: res.data.page || 1, total: res.data.total || 0 }));
    } catch (err) {
      setError("Failed to load activity logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(1, email, instituteId);
    axios
      .get("/api/institutes", { params: { limit: 1000 }, withCredentials: true })
      .then((res) => setInstitutes(res.data.data || []))
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleInstituteChange = (value) => {
    setInstituteId(value);
    fetchLogs(1, email, value);
  };

  const totalPages = Math.ceil(pagination.total / pagination.limit);

  return (
    <div className="min-h-screen flex flex-col bg-[#ff7f10]">
      <Navbar title="Activity Logs" />

      <div className="flex-1 p-6">
        <div className="bg-white rounded-xl shadow-md overflow-hidden p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-[#ff7f10]">Activity Logs</h2>
              <p className="text-sm text-gray-500 mt-1">
                MyCareerGuru activity across self-learners and institute students, with AI token usage &amp; cost.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={instituteId}
                onChange={(e) => handleInstituteChange(e.target.value)}
                className="px-3 py-1.5 rounded-md text-sm border text-gray-700"
              >
                <option value="">All institutes</option>
                <option value="independent">Independent (no institute)</option>
                {institutes.map((inst) => (
                  <option key={inst.id} value={inst.id}>
                    {inst.fullName}
                  </option>
                ))}
              </select>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  fetchLogs(1, email, instituteId);
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Search by email"
                  className="px-3 py-1.5 rounded-md text-sm border text-gray-700"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-md text-sm font-medium bg-orange-500 text-white hover:bg-orange-600 transition"
                >
                  Search
                </button>
              </form>
            </div>
          </div>

          {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">{error}</div>}

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Spinner color="#ff7f10" />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto rounded-xl">
                <table className="w-full border-collapse text-gray-800">
                  <thead>
                    <tr className="bg-orange-100">
                      <th className="p-3 text-left">Student</th>
                      <th className="p-3 text-left">Email</th>
                      <th className="p-3 text-left">Type</th>
                      <th className="p-3 text-left">Action</th>
                      <th className="p-3 text-left">Provider</th>
                      <th className="p-3 text-right">Tokens (In / Out)</th>
                      <th className="p-3 text-right">Cost (USD)</th>
                      <th className="p-3 text-left">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.length > 0 ? (
                      logs.map((log, idx) => (
                        <tr key={idx} className="border-b hover:bg-gray-50 transition">
                          <td className="p-3 font-medium">{log.student_name || "—"}</td>
                          <td className="p-3">{log.student_email || "—"}</td>
                          <td className="p-3">{ROLE_LABELS[log.student_role] || log.student_role}</td>
                          <td className="p-3">{log.action}</td>
                          <td className="p-3">{PROVIDER_LABELS[log.provider] || log.provider}</td>
                          <td className="p-3 text-right text-sm">
                            {formatTokens(log.input_tokens, log.output_tokens)}
                          </td>
                          <td className="p-3 text-right text-sm">${(log.cost_usd || 0).toFixed(4)}</td>
                          <td className="p-3 text-sm">
                            {log.created_at ? new Date(log.created_at).toLocaleString() : "—"}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={8} className="text-center py-10 text-gray-500">
                          No activity recorded yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between gap-4 mt-6">
                <p className="text-sm text-gray-600">
                  Page {pagination.page} of {Math.max(totalPages, 1)} · {pagination.total} total
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => fetchLogs(pagination.page - 1, email, instituteId)}
                    disabled={pagination.page === 1}
                    className="px-4 py-2 border rounded-md text-sm disabled:opacity-50 hover:bg-gray-100 transition"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => fetchLogs(pagination.page + 1, email, instituteId)}
                    disabled={pagination.page >= totalPages}
                    className="px-4 py-2 border rounded-md text-sm disabled:opacity-50 hover:bg-gray-100 transition"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityLogsPage;
