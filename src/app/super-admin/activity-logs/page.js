"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "@/components/ui/Navbar";
import ActivityLogsTable from "@/components/activity-logs/ActivityLogsTable";

const ENDPOINTS = {
  students: "/api/self-learners/activity-logs",
  faculty: "/api/faculty/activity-logs/all",
};

const ActivityLogsPage = () => {
  const [tab, setTab] = useState("students");
  const [logs, setLogs] = useState([]);
  const [institutes, setInstitutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [instituteId, setInstituteId] = useState("");
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });

  const fetchLogs = async (nextTab, page = 1, emailFilter = email, instituteFilter = instituteId) => {
    try {
      setLoading(true);
      setError("");
      const res = await axios.get(ENDPOINTS[nextTab], {
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
    // "independent" (no institute) only means anything for self-learners —
    // drop it when switching to the Faculty tab, which has no such concept.
    const effectiveInstituteId = tab === "faculty" && instituteId === "independent" ? "" : instituteId;
    if (effectiveInstituteId !== instituteId) setInstituteId(effectiveInstituteId);
    fetchLogs(tab, 1, email, effectiveInstituteId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  useEffect(() => {
    axios
      .get("/api/institutes", { params: { limit: 1000 }, withCredentials: true })
      .then((res) => setInstitutes(res.data.data || []))
      .catch(() => {});
  }, []);

  const handleInstituteChange = (value) => {
    setInstituteId(value);
    fetchLogs(tab, 1, email, value);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchLogs(tab, 1, email, instituteId);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#ff7f10]">
      <Navbar title="Activity Logs" />

      <div className="flex-1 p-6">
        <div className="bg-white rounded-xl shadow-md overflow-hidden p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-[#ff7f10]">Activity Logs</h2>
              <p className="text-sm text-gray-500 mt-1">
                {tab === "students"
                  ? "MyCareerGuru activity across self-learners and institute students, with AI token usage & cost."
                  : "Faculty AI usage — question paper generation and grading — with token usage & cost."}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setTab("students")}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
                  tab === "students" ? "bg-orange-500 text-white" : "border text-gray-600 hover:bg-gray-100"
                }`}
              >
                Students
              </button>
              <button
                onClick={() => setTab("faculty")}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
                  tab === "faculty" ? "bg-orange-500 text-white" : "border text-gray-600 hover:bg-gray-100"
                }`}
              >
                Faculty
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap mb-6">
            <select
              value={instituteId}
              onChange={(e) => handleInstituteChange(e.target.value)}
              className="px-3 py-1.5 rounded-md text-sm border text-gray-700"
            >
              <option value="">All institutes</option>
              {tab === "students" && <option value="independent">Independent (no institute)</option>}
              {institutes.map((inst) => (
                <option key={inst.id} value={inst.id}>
                  {inst.fullName}
                </option>
              ))}
            </select>

            <form onSubmit={handleSearch} className="flex items-center gap-2">
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

          <ActivityLogsTable
            variant={tab}
            rows={logs}
            loading={loading}
            error={error}
            pagination={pagination}
            onPrev={() => fetchLogs(tab, pagination.page - 1)}
            onNext={() => fetchLogs(tab, pagination.page + 1)}
            showCost
            accentColor="#ff7f10"
          />
        </div>
      </div>
    </div>
  );
};

export default ActivityLogsPage;
