"use client";

import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import Navbar from "@/components/ui/Navbar";
import Spinner from "@/components/ui/Spinner";
import { AuthContext } from "@/app/AuthContext";

export default function ActivityLogsPage() {
  const { user } = useContext(AuthContext);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });

  const fetchLogs = async (page = 1) => {
    try {
      setLoading(true);
      setError("");
      const res = await axios.get("/api/institute-students/activity-logs", {
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
    fetchLogs(1);
  }, []);

  const totalPages = Math.ceil(pagination.total / pagination.limit);

  return (
    <div className="h-screen" style={{ backgroundColor: user?.color || "#ff7f10" }}>
      <Navbar title="Activity Logs" />

      <div className="p-6 mx-4">
        <div className="bg-white rounded-xl shadow-md overflow-hidden p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold" style={{ color: user?.color || "#ff7f10" }}>
              MyCareerGuru Activity
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              What your students have used in their MyCareerGuru account.
            </p>
          </div>

          {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">{error}</div>}

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Spinner color={user?.color || "#ff7f10"} />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto rounded-xl">
                <table className="w-full border-collapse text-gray-800">
                  <thead>
                    <tr className="bg-orange-100">
                      <th className="p-3 text-left">Student</th>
                      <th className="p-3 text-left">Email</th>
                      <th className="p-3 text-left">Action</th>
                      <th className="p-3 text-left">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.length > 0 ? (
                      logs.map((log, idx) => (
                        <tr key={idx} className="border-b hover:bg-gray-50 transition">
                          <td className="p-3 font-medium">{log.student_name || "—"}</td>
                          <td className="p-3">{log.student_email || "—"}</td>
                          <td className="p-3">{log.action}</td>
                          <td className="p-3 text-sm">
                            {log.created_at ? new Date(log.created_at).toLocaleString() : "—"}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="text-center py-10 text-gray-500">
                          No activity recorded yet for your students.
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
                    onClick={() => fetchLogs(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="px-4 py-2 border rounded-md text-sm disabled:opacity-50 hover:bg-gray-100 transition"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => fetchLogs(pagination.page + 1)}
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
}
