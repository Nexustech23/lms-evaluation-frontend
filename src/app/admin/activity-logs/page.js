"use client";

import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import Navbar from "@/components/ui/Navbar";
import { AuthContext } from "@/app/AuthContext";
import ActivityLogsTable from "@/components/activity-logs/ActivityLogsTable";

const ENDPOINTS = {
  students: "/api/institute-students/activity-logs",
  faculty: "/api/faculty/activity-logs",
};

export default function ActivityLogsPage() {
  const { user } = useContext(AuthContext);
  const [tab, setTab] = useState("students");
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });

  const fetchLogs = async (nextTab, page = 1) => {
    try {
      setLoading(true);
      setError("");
      const res = await axios.get(ENDPOINTS[nextTab], {
        params: { page, limit: pagination.limit },
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
    fetchLogs(tab, 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const accentColor = user?.color || "#ff7f10";

  return (
    <div className="h-screen" style={{ backgroundColor: accentColor }}>
      <Navbar title="Activity Logs" />

      <div className="p-6 mx-4">
        <div className="bg-white rounded-xl shadow-md overflow-hidden p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold" style={{ color: accentColor }}>
                MyCareerGuru Activity
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {tab === "students"
                  ? "What your students have used in their MyCareerGuru account."
                  : "AI usage by your faculty — question paper generation and grading."}
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

          <ActivityLogsTable
            variant={tab}
            rows={logs}
            loading={loading}
            error={error}
            pagination={pagination}
            onPrev={() => fetchLogs(tab, pagination.page - 1)}
            onNext={() => fetchLogs(tab, pagination.page + 1)}
            accentColor={accentColor}
            emptyMessage={
              tab === "students"
                ? "No activity recorded yet for your students."
                : "No activity recorded yet for your faculty."
            }
          />
        </div>
      </div>
    </div>
  );
}
