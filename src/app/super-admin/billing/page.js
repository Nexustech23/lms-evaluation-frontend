"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Navbar from "@/components/ui/Navbar";
import Spinner from "@/components/ui/Spinner";
import { FaEdit } from "react-icons/fa";

const BillingPage = () => {
  const [billingData, setBillingData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });

  const router = useRouter();

  /* ================= TOKEN DISPLAY ================= */

  const WARNING_RATIO = 0.05;

  const renderTokenCell = (used, limit, remaining) => {
    if (limit == null) {
      return (
        <span>
          {used.toLocaleString()} <span className="text-gray-400 text-xs">· Unlimited</span>
        </span>
      );
    }

    const isExhausted = remaining <= 0;
    const isLow = !isExhausted && remaining <= limit * WARNING_RATIO;

    return (
      <span
        className={
          isExhausted
            ? "text-red-600 font-semibold"
            : isLow
            ? "text-amber-600 font-semibold"
            : ""
        }
      >
        {used.toLocaleString()} / {limit.toLocaleString()}
        {isExhausted && <span className="ml-1 text-xs">(limit reached)</span>}
        {isLow && <span className="ml-1 text-xs">(low)</span>}
      </span>
    );
  };

  /* ================= FETCH ================= */

  const fetchInstitutes = async (page = 1) => {
    try {
      setLoading(true);

      const response = await axios.get(
        `/api/institutes?page=${page}&limit=${pagination.limit}`,
        {
          withCredentials: true,
        }
      );

      setBillingData(response.data.data || []);

      setPagination((prev) => ({
        ...prev,
        page: response.data.page || 1,
        limit: response.data.limit || 10,
        total: response.data.total || 0,
      }));
    } catch (error) {
      console.error("Error fetching institutes:", error);
      setError("Failed to load institutes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstitutes(pagination.page);
  }, [pagination.page]);

  /* ================= AUTO DISMISS ================= */

  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError("");
        setSuccess("");
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [error, success]);

  /* ================= PAGINATION ================= */

  const totalPages = Math.ceil(
    pagination.total / pagination.limit
  );

  const handleNext = () => {
    if (pagination.page < totalPages) {
      setPagination((prev) => ({
        ...prev,
        page: prev.page + 1,
      }));
    }
  };

  const handlePrev = () => {
    if (pagination.page > 1) {
      setPagination((prev) => ({
        ...prev,
        page: prev.page - 1,
      }));
    }
  };

  /* ================= ACTIONS ================= */

  const handleInvoiceCreation = async (instituteId) => {
    try {
      setLoading(true);

      console.log("Creating invoice for", instituteId);

      setSuccess(`Invoice created for institute ${instituteId}`);
    } catch (error) {
      console.error("Error creating invoice:", error);
      setError("Failed to create invoice");
    } finally {
      setLoading(false);
    }
  };

  const handlePaid = async (instituteId) => {
    try {
      setLoading(true);

      console.log("Marking as paid for", instituteId);

      setSuccess(`Payment marked for institute ${instituteId}`);
    } catch (error) {
      console.error("Error marking payment:", error);
      setError("Failed to mark payment");
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */

  return (
    <div className="min-h-screen flex flex-col bg-[#ff7f10]">
      <Navbar title="Billing Management" />

      <div className="flex-1 p-6">
        <div className="bg-white rounded-xl shadow-md overflow-hidden p-6">

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md flex items-center">
              <svg
                className="w-5 h-5 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 
                  1.414L8.586 10l-1.293 1.293a1 1 0 101.414 
                  1.414L10 11.414l1.293 1.293a1 1 0 
                  001.414-1.414L11.414 10l1.293-1.293a1 
                  1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>

              {error}
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md flex items-center">
              <svg
                className="w-5 h-5 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 
                  000 16zm3.707-9.293a1 1 0 
                  00-1.414-1.414L9 10.586 
                  7.707 9.293a1 1 0 
                  00-1.414 1.414l2 2a1 1 0 
                  001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>

              {success}
            </div>
          )}

          <h2 className="text-2xl font-bold mb-6 text-[#ff7f10]">
            Billing Details
          </h2>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Spinner className="h-8 w-8 text-[#ff7f10]" />
            </div>
          ) : (
            <>
              {/* ================= TABLE ================= */}

              <div className="overflow-x-auto rounded-xl">
                <table className="w-full border-collapse text-gray-800">
                  <thead>
                    <tr className="bg-orange-100">
                      <th className="p-3 text-left">S No.</th>
                      <th className="p-3 text-left">Institute Name</th>
                      <th className="p-3 text-left">Institute Email</th>
                      <th className="p-3 text-left">Joined At</th>
                      <th className="p-3 text-left">Gemini Tokens (Used/Limit)</th>
                      <th className="p-3 text-left">Claude Tokens (Used/Limit)</th>
                      <th className="p-3 text-left">Status</th>
                      <th className="p-3 text-left">Update Institute</th>
                    </tr>
                  </thead>

                  <tbody>
                    {billingData.length > 0 ? (
                      billingData.map((item, index) => (
                        <tr
                          key={item.id}
                          className="border-b hover:bg-gray-50 transition"
                        >
                          <td className="p-3">
                            {(pagination.page - 1) *
                              pagination.limit +
                              index +
                              1}
                          </td>

                          <td className="p-3 font-medium">
                            {item.fullName}
                          </td>

                          <td className="p-3">
                            {item.email}
                          </td>

                          <td className="p-3">
                            {new Date(
                              item.created_at
                            ).toLocaleDateString()}
                          </td>

                          <td className="p-3">
                            {renderTokenCell(
                              item.gemini_total_tokens,
                              item.gemini_token_limit,
                              item.gemini_tokens_remaining
                            )}
                          </td>

                          <td className="p-3">
                            {renderTokenCell(
                              item.claude_total_tokens,
                              item.claude_token_limit,
                              item.claude_tokens_remaining
                            )}
                          </td>

                          <td className="p-3">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                item.is_active
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {item.is_active
                                ? "Active"
                                : "Inactive"}
                            </span>
                          </td>

                          <td className="p-3">
                            <div className="relative group flex justify-center">
                              <FaEdit
                                className="text-orange-500 cursor-pointer hover:text-orange-700 transition"
                                onClick={() =>
                                  router.push(
                                    `/super-admin/create-account?institute=${item.id}`
                                  )
                                }
                              />

                              <div
                                className="absolute -top-11 left-1/2 
                                -translate-x-1/2 opacity-0 
                                group-hover:opacity-100 
                                group-hover:-translate-y-1
                                transition-all duration-200 
                                ease-in-out pointer-events-none"
                              >
                                <div
                                  className="px-3 py-1.5 text-xs text-white 
                                  bg-black/80 backdrop-blur-md 
                                  rounded-md shadow-lg whitespace-nowrap"
                                >
                                  Edit
                                </div>

                                <div className="w-2 h-2 bg-black/80 rotate-45 mx-auto -mt-1"></div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={8}
                          className="text-center py-10 text-gray-500"
                        >
                          No institutes found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* ================= PAGINATION ================= */}

              <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-6">

                <p className="text-sm text-gray-600">
                  Showing{" "}
                  {billingData.length > 0
                    ? (pagination.page - 1) *
                        pagination.limit +
                      1
                    : 0}
                  {" "}to{" "}
                  {Math.min(
                    pagination.page * pagination.limit,
                    pagination.total
                  )}{" "}
                  of {pagination.total} entries
                </p>

                <div className="flex items-center gap-2">

                  <button
                    onClick={handlePrev}
                    disabled={pagination.page === 1}
                    className="px-4 py-2 border rounded-md text-sm disabled:opacity-50 hover:bg-gray-100 transition"
                  >
                    Previous
                  </button>

                  <div className="px-4 py-2 bg-orange-500 text-white rounded-md text-sm font-medium">
                    {pagination.page}
                  </div>

                  <button
                    onClick={handleNext}
                    disabled={
                      pagination.page === totalPages ||
                      totalPages === 0
                    }
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

export default BillingPage;