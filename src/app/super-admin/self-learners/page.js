"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "@/components/ui/Navbar";
import Spinner from "@/components/ui/Spinner";

const STATUS_FILTERS = [
  { value: "", label: "All" },
  { value: "pending", label: "Pending Approval" },
  { value: "active", label: "Active" },
];

const SORT_OPTIONS = [
  { value: "recent", label: "Newest" },
  { value: "tokens_desc", label: "Most AI Tokens" },
  { value: "tokens_asc", label: "Least AI Tokens" },
];

const formatTokens = (usage) => {
  const input = usage?.input_tokens || 0;
  const output = usage?.output_tokens || 0;
  if (!input && !output) return "— / —";
  return `${input.toLocaleString()} / ${output.toLocaleString()}`;
};

const SelfLearnersPage = () => {
  const [learners, setLearners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [status, setStatus] = useState("pending");
  const [sort, setSort] = useState("recent");
  const [busyId, setBusyId] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });

  const fetchLearners = async (page = 1, statusFilter = status, sortOption = sort) => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/self-learners`, {
        params: { page, limit: pagination.limit, status: statusFilter || undefined, sort: sortOption },
        withCredentials: true,
      });
      setLearners(res.data.self_learners || []);
      setPagination((prev) => ({ ...prev, page: res.data.page || 1, total: res.data.total || 0 }));
    } catch (err) {
      setError("Failed to load MyCareerGuru accounts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLearners(1, status, sort);
  }, [status, sort]);

  useEffect(() => {
    if (error || success) {
      const t = setTimeout(() => { setError(""); setSuccess(""); }, 3000);
      return () => clearTimeout(t);
    }
  }, [error, success]);

  const setActive = async (id, is_active) => {
    setBusyId(id);
    try {
      await axios.put(`/api/self-learner/${id}`, { is_active }, { withCredentials: true });
      setSuccess(is_active ? "Account approved" : "Account deactivated");
      fetchLearners(pagination.page, status);
    } catch (err) {
      setError("Failed to update account");
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (id) => {
    if (!confirm("Delete this MyCareerGuru account? This cannot be undone.")) return;
    setBusyId(id);
    try {
      await axios.delete(`/api/self-learner/${id}`, { withCredentials: true });
      setSuccess("Account deleted");
      fetchLearners(pagination.page, status);
    } catch (err) {
      setError("Failed to delete account");
    } finally {
      setBusyId(null);
    }
  };

  const totalPages = Math.ceil(pagination.total / pagination.limit);

  return (
    <div className="min-h-screen flex flex-col bg-[#ff7f10]">
      <Navbar title="MyCareerGuru Accounts" />

      <div className="flex-1 p-6">
        <div className="bg-white rounded-xl shadow-md overflow-hidden p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <h2 className="text-2xl font-bold text-[#ff7f10]">MyCareerGuru Accounts</h2>

            <div className="flex items-center gap-2 flex-wrap">
              {STATUS_FILTERS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setStatus(f.value)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
                    status === f.value ? "bg-orange-500 text-white" : "border text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {f.label}
                </button>
              ))}
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="px-3 py-1.5 rounded-md text-sm font-medium border text-gray-600 hover:bg-gray-100 transition"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    Sort: {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">{error}</div>}
          {success && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">{success}</div>}

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Spinner className="h-8 w-8 text-[#ff7f10]" />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto rounded-xl">
                <table className="w-full border-collapse text-gray-800">
                  <thead>
                    <tr className="bg-orange-100">
                      <th className="p-3 text-left">Name</th>
                      <th className="p-3 text-left">Email</th>
                      <th className="p-3 text-left">Phone</th>
                      <th className="p-3 text-left">Signed Up</th>
                      <th className="p-3 text-left">Status</th>
                      <th className="p-3 text-right">Claude (In / Out)</th>
                      <th className="p-3 text-right">Gemini (In / Out)</th>
                      <th className="p-3 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {learners.length > 0 ? (
                      learners.map((learner) => (
                        <tr key={learner.id} className="border-b hover:bg-gray-50 transition">
                          <td className="p-3 font-medium">{learner.fullName}</td>
                          <td className="p-3">{learner.email}</td>
                          <td className="p-3">{learner.phone || "—"}</td>
                          <td className="p-3">
                            {learner.created_at ? new Date(learner.created_at).toLocaleDateString() : "—"}
                          </td>
                          <td className="p-3">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                learner.is_active ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                              }`}
                            >
                              {learner.is_active ? "Active" : "Pending"}
                            </span>
                          </td>
                          <td className="p-3 text-right text-sm">{formatTokens(learner.token_usage?.claude)}</td>
                          <td className="p-3 text-right text-sm">{formatTokens(learner.token_usage?.gemini)}</td>
                          <td className="p-3">
                            <div className="flex items-center gap-3">
                              {!learner.is_active ? (
                                <button
                                  disabled={busyId === learner.id}
                                  onClick={() => setActive(learner.id, true)}
                                  className="text-xs font-semibold text-green-600 hover:text-green-800 disabled:opacity-50"
                                >
                                  Approve
                                </button>
                              ) : (
                                <button
                                  disabled={busyId === learner.id}
                                  onClick={() => setActive(learner.id, false)}
                                  className="text-xs font-semibold text-amber-600 hover:text-amber-800 disabled:opacity-50"
                                >
                                  Deactivate
                                </button>
                              )}
                              <button
                                disabled={busyId === learner.id}
                                onClick={() => remove(learner.id)}
                                className="text-xs font-semibold text-red-500 hover:text-red-700 disabled:opacity-50"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={8} className="text-center py-10 text-gray-500">
                          No MyCareerGuru accounts {status === "pending" ? "pending approval" : "found"}.
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
                    onClick={() => fetchLearners(pagination.page - 1, status)}
                    disabled={pagination.page === 1}
                    className="px-4 py-2 border rounded-md text-sm disabled:opacity-50 hover:bg-gray-100 transition"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => fetchLearners(pagination.page + 1, status)}
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

export default SelfLearnersPage;
