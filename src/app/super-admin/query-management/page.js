"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import Navbar from "@/components/ui/Navbar";
import Spinner from "@/components/ui/Spinner";
import {
  Mail,
  CheckCircle2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Inbox,
  ExternalLink,
  X,
  Eye,
} from "lucide-react";

/* ─── Constants ─────────────────────────────────────────────────────────── */

const STATUS_FILTERS = [
  { key: "all",  label: "All"  },
  { key: "new",  label: "New"  },
  { key: "read", label: "Read" },
];

const TOPIC_FILTERS = [
  { key: "all",         label: "All Topics"  },
  { key: "support",     label: "Support"     },
  { key: "feedback",    label: "Feedback"    },
  { key: "demo",        label: "Demo"        },
  { key: "inquiry",     label: "Inquiry"     },
  { key: "partnership", label: "Partnership" },
];

/* Per-topic pill colours (warm palette that sits well beside orange) */
const TOPIC_COLORS = {
  support:     { bg: "#FEF3C7", text: "#92400E" },
  feedback:    { bg: "#DCFCE7", text: "#166534" },
  demo:        { bg: "#DBEAFE", text: "#1E40AF" },
  inquiry:     { bg: "#FCE7F3", text: "#9D174D" },
  partnership: { bg: "#D1FAE5", text: "#065F46" },
};

/* ─── Helpers ────────────────────────────────────────────────────────────── */

const parseMessage = (message = "", role = "") => {
  if (role === "institute" && message.startsWith("Institute Name:")) {
    const lines = message.split("\n\n");
    return {
      instituteName: lines[0].replace("Institute Name:", "").trim(),
      actualMessage: lines.slice(1).join("\n\n").trim(),
    };
  }
  return { instituteName: null, actualMessage: message };
};

const initials = (name = "") => name.charAt(0).toUpperCase();

/* ─── Styles (inline so CSP-safe; avoids Tailwind config constraints) ─────── */

const PAGE_BG = `
  background-color: #FFF3E8;
  background-image:
    radial-gradient(circle at 18% 22%, rgba(234,88,12,.10) 0%, transparent 55%),
    radial-gradient(circle at 82% 70%, rgba(251,146,60,.12) 0%, transparent 50%),
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Ccircle cx='1' cy='1' r='1' fill='%23EA580C' fill-opacity='.04'/%3E%3C/svg%3E");
`;

/* ─── Component ──────────────────────────────────────────────────────────── */

const QueryManagementPage = () => {
  const [queryData,        setQueryData]        = useState([]);
  const [loading,          setLoading]          = useState(true);
  const [filter,           setFilter]           = useState("all");
  const [topic,            setTopic]            = useState("all");
  const [selectedQuery,    setSelectedQuery]    = useState(null);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [pagination,       setPagination]       = useState({ page: 1, limit: 10, total: 0 });

  /* ── Fetch ─────────────────────────────────────────────────────────── */

  const fetchQueries = async (showLoader = false) => {
    try {
      if (showLoader) setLoading(true);
      const response = await axios.get(
        `/api/admin/contact-queries?page=${pagination.page}&limit=${pagination.limit}&status=${filter}&topic=${topic}`,
        { withCredentials: true }
      );
      setQueryData(response.data.data || []);
      setPagination((prev) => ({
        ...prev,
        page:  response.data.page  || 1,
        limit: response.data.limit || 10,
        total: response.data.total || 0,
      }));
    } catch (error) {
      console.error("Error fetching queries:", error);
      toast.error("Failed to load queries");
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueries(true);
    const interval = setInterval(() => fetchQueries(false), 10000);
    return () => clearInterval(interval);
  }, [pagination.page, filter, topic]);

  /* ── Actions ───────────────────────────────────────────────────────── */

  const handleMarkAsRead = async (id) => {
    try {
      await axios.patch(`/api/admin/contact-queries/${id}/read`, {}, { withCredentials: true });
      setQueryData((prev) => prev.map((item) => item.id === id ? { ...item, read: true } : item));
      toast.success("Marked as read");
    } catch {
      toast.error("Failed to mark as read");
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/admin/contact-queries/${id}`, { withCredentials: true });
      setQueryData((prev) => prev.filter((item) => item.id !== id));
      toast.success("Query deleted");
    } catch {
      toast.error("Failed to delete query");
    }
  };

  /* ── Pagination ────────────────────────────────────────────────────── */

  const totalPages = Math.ceil(pagination.total / pagination.limit);
  const handleNext = () => pagination.page < totalPages && setPagination((p) => ({ ...p, page: p.page + 1 }));
  const handlePrev = () => pagination.page > 1 && setPagination((p) => ({ ...p, page: p.page - 1 }));
  const resetPage  = () => setPagination((p) => ({ ...p, page: 1 }));

  /* ── Render ────────────────────────────────────────────────────────── */

  return (
    <div style={{
      minHeight: "100vh",
      fontFamily: "-apple-system, 'Segoe UI', sans-serif",
      backgroundColor: "#FFF3E8",
      backgroundImage: `
        radial-gradient(circle at 15% 20%, rgba(234,88,12,.10) 0%, transparent 50%),
        radial-gradient(circle at 85% 75%, rgba(251,146,60,.12) 0%, transparent 50%)
      `,
    }}>

      <style>{`
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(10px); }
          to   { opacity:1; transform:translateY(0);    }
        }
        .qm-card { animation: fadeUp .3s ease both; }
        .qm-row:hover { background: rgba(255,237,213,.55) !important; }
        .qm-action-btn:hover { opacity:.82; }
        .qm-pill-btn { transition: all .15s ease; }
        .qm-pill-btn:hover { transform: translateY(-1px); }
        .qm-tab:hover { background: rgba(234,88,12,.08) !important; color: #EA580C !important; }
      `}</style>

      <Toaster
        position="top-right"
        toastOptions={{
          style: { borderRadius: 12, fontSize: 13, fontWeight: 600,
                   background: "#fff", border: "1px solid #FFEDD5" }
        }}
      />

      <Navbar title="Query Management" />

      <div style={{ padding: "28px 24px 48px" }}>

        {/* ── Glassmorphic Card ──────────────────────────────────────── */}
        <div
          className="qm-card"
          style={{
            background: "rgba(255,255,255,.82)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            borderRadius: 24,
            border: "1px solid rgba(234,88,12,.14)",
            boxShadow: "0 4px 6px rgba(234,88,12,.04), 0 12px 40px rgba(120,40,0,.08)",
            overflow: "hidden",
          }}
        >

          {/* ── Card Header ───────────────────────────────────────────── */}
          <div style={{
            background: "linear-gradient(135deg, #C2410C 0%, #EA580C 55%, #F97316 100%)",
            padding: "26px 28px 0",
            position: "relative",
            overflow: "hidden",
          }}>

            {/* Decorative blobs inside header */}
            <div style={{
              position: "absolute", top: -30, right: -30,
              width: 180, height: 180, borderRadius: "50%",
              background: "rgba(255,255,255,.06)",
              pointerEvents: "none",
            }} />
            <div style={{
              position: "absolute", bottom: 10, left: "38%",
              width: 120, height: 120, borderRadius: "50%",
              background: "rgba(255,255,255,.04)",
              pointerEvents: "none",
            }} />

            {/* Title row */}
            <div style={{
              display: "flex", flexWrap: "wrap",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 16, marginBottom: 20,
              position: "relative",
            }}>

              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 14,
                  background: "rgba(255,255,255,.18)",
                  backdropFilter: "blur(8px)",
                  border: "1px solid rgba(255,255,255,.3)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Inbox size={24} color="#fff" />
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#fff", letterSpacing: "-0.3px" }}>
                    Contact Queries
                  </h2>
                  <p style={{ margin: "3px 0 0", fontSize: 13, color: "rgba(255,255,255,.72)" }}>
                    {pagination.total} total · refreshes every 10 s
                  </p>
                </div>
              </div>

              {/* Status pills */}
              <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                {STATUS_FILTERS.map((f) => {
                  const active = filter === f.key;
                  return (
                    <button
                      key={f.key}
                      className="qm-pill-btn"
                      onClick={() => { setFilter(f.key); resetPage(); }}
                      style={{
                        padding: "7px 20px",
                        borderRadius: 99,
                        border: "1px solid",
                        borderColor: active ? "transparent" : "rgba(255,255,255,.35)",
                        cursor: "pointer",
                        fontSize: 13,
                        fontWeight: 700,
                        background: active
                          ? "rgba(255,255,255,.95)"
                          : "rgba(255,255,255,.12)",
                        backdropFilter: "blur(8px)",
                        color: active ? "#C2410C" : "rgba(255,255,255,.92)",
                        boxShadow: active ? "0 2px 12px rgba(0,0,0,.15)" : "none",
                      }}
                    >
                      {f.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Topic tabs — sit flush on the bottom of the gradient header */}
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap", position: "relative" }}>
              {TOPIC_FILTERS.map((t) => {
                const active = topic === t.key;
                return (
                  <button
                    key={t.key}
                    className={active ? undefined : "qm-tab"}
                    onClick={() => { setTopic(t.key); resetPage(); }}
                    style={{
                      padding: "9px 18px",
                      borderRadius: "10px 10px 0 0",
                      border: "1px solid",
                      borderBottom: "none",
                      cursor: "pointer",
                      fontSize: 12,
                      fontWeight: 700,
                      letterSpacing: "0.03em",
                      transition: "all .15s",
                      background: active
                        ? "rgba(255,255,255,.95)"
                        : "rgba(255,255,255,.10)",
                      backdropFilter: "blur(8px)",
                      borderColor: active
                        ? "rgba(255,255,255,.4)"
                        : "rgba(255,255,255,.18)",
                      color: active ? "#C2410C" : "rgba(255,255,255,.85)",
                      position: "relative",
                      zIndex: active ? 2 : 1,
                      marginBottom: active ? -1 : 0,
                    }}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Content ───────────────────────────────────────────────── */}
          {loading ? (
            <div style={{ height: 480, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Spinner />
            </div>
          ) : queryData.length === 0 ? (
            <div style={{ height: 480, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14 }}>
              <div style={{
                width: 80, height: 80, borderRadius: "50%",
                background: "linear-gradient(135deg, #FFEDD5, #FED7AA)",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 4px 20px rgba(234,88,12,.18)",
              }}>
                <Inbox size={34} color="#EA580C" />
              </div>
              <p style={{ margin: 0, fontSize: 17, fontWeight: 800, color: "#431407" }}>No Queries Found</p>
              <p style={{ margin: 0, fontSize: 13, color: "#9A3412" }}>Queries will appear here once users contact you.</p>
            </div>
          ) : (
            <>
              {/* ── Table ─────────────────────────────────────────────── */}
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", minWidth: 1080, borderCollapse: "collapse" }}>

                  <thead>
                    <tr style={{
                      background: "linear-gradient(90deg, #FFF7ED 0%, #FFEDD5 100%)",
                      borderBottom: "2px solid #FED7AA",
                    }}>
                      {["#", "User", "Email", "Phone", "Topic", "Role", "Institute", "Message", "Status", "Actions"].map((h) => (
                        <th key={h} style={{
                          padding: "13px 16px",
                          textAlign: "left",
                          fontSize: 10,
                          fontWeight: 800,
                          letterSpacing: "0.08em",
                          textTransform: "uppercase",
                          color: "#9A3412",
                          whiteSpace: "nowrap",
                        }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {queryData.map((item, index) => {
                      const { instituteName, actualMessage } = parseMessage(item.message, item.role);
                      const isNew     = !item.read;
                      const topicStyle = TOPIC_COLORS[item.topic] || { bg: "#FEF3C7", text: "#78350F" };

                      return (
                        <tr
                          key={item.id}
                          className="qm-row"
                          style={{
                            borderBottom: "1px solid #FFF7ED",
                            borderLeft: isNew ? "4px solid #EA580C" : "4px solid transparent",
                            background: isNew ? "rgba(255,237,213,.22)" : "#fff",
                            transition: "background .12s",
                          }}
                        >
                          {/* # */}
                          <td style={{ padding: "15px 16px", fontSize: 12, color: "#FDBA74", fontVariantNumeric: "tabular-nums", fontWeight: 700 }}>
                            {(pagination.page - 1) * pagination.limit + index + 1}
                          </td>

                          {/* User */}
                          <td style={{ padding: "15px 16px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              <div style={{
                                width: 38, height: 38, borderRadius: "50%",
                                background: "linear-gradient(135deg, #FED7AA, #FDBA74)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: 15, fontWeight: 800, color: "#C2410C",
                                flexShrink: 0,
                                boxShadow: "0 2px 8px rgba(234,88,12,.2)",
                              }}>
                                {initials(item.first_name)}
                              </div>
                              <span style={{ fontSize: 14, fontWeight: 700, color: "#431407", whiteSpace: "nowrap" }}>
                                {item.first_name} {item.last_name}
                              </span>
                            </div>
                          </td>

                          {/* Email */}
                          <td style={{ padding: "15px 16px", fontSize: 13, color: "#6B7280" }}>
                            {item.email}
                          </td>

                          {/* Phone */}
                          <td style={{ padding: "15px 16px", fontSize: 13, color: "#6B7280", fontVariantNumeric: "tabular-nums" }}>
                            {item.contact_no}
                          </td>

                          {/* Topic */}
                          <td style={{ padding: "15px 16px" }}>
                            <span style={{
                              padding: "4px 11px", borderRadius: 99,
                              background: topicStyle.bg, color: topicStyle.text,
                              fontSize: 11, fontWeight: 700, letterSpacing: "0.04em",
                              textTransform: "capitalize",
                            }}>
                              {item.topic}
                            </span>
                          </td>

                          {/* Role */}
                          <td style={{ padding: "15px 16px", fontSize: 13, color: "#374151", textTransform: "capitalize", fontWeight: 600 }}>
                            {item.role}
                          </td>

                          {/* Institute */}
                          <td style={{ padding: "15px 16px", fontSize: 13, color: "#9CA3AF", maxWidth: 130 }}>
                            {instituteName || <span style={{ color: "#D1D5DB" }}>—</span>}
                          </td>

                          {/* Message */}
                          <td style={{ padding: "15px 16px", maxWidth: 230 }}>
                            <p style={{
                              margin: 0, fontSize: 13, color: "#4B5563",
                              overflow: "hidden", display: "-webkit-box",
                              WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
                              lineHeight: 1.5,
                            }}>
                              {actualMessage}
                            </p>
                            <button
                              onClick={() => {
                                setSelectedQuery({ ...item, instituteName, actualMessage });
                                setShowMessageModal(true);
                              }}
                              style={{
                                marginTop: 5, background: "none", border: "none",
                                cursor: "pointer", fontSize: 11, fontWeight: 800,
                                color: "#EA580C", padding: 0,
                                display: "flex", alignItems: "center", gap: 3,
                                letterSpacing: "0.02em",
                              }}
                            >
                              <Eye size={11} /> Read more
                            </button>
                          </td>

                          {/* Status */}
                          <td style={{ padding: "15px 16px" }}>
                            <span style={{
                              padding: "4px 11px", borderRadius: 99,
                              fontSize: 11, fontWeight: 700,
                              background: item.read ? "#DCFCE7" : "#FEF9C3",
                              color:      item.read ? "#166534" : "#854D0E",
                            }}>
                              {item.read ? "Read" : "New"}
                            </span>
                          </td>

                          {/* Actions */}
                          <td style={{ padding: "15px 16px" }}>
                            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                              <a
                                href={`https://mail.google.com/mail/?view=cm&fs=1&to=${item.email}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="qm-action-btn"
                                style={{
                                  display: "flex", alignItems: "center", gap: 4,
                                  padding: "5px 11px", borderRadius: 8,
                                  border: "1px solid #BFDBFE",
                                  background: "rgba(239,246,255,.9)",
                                  backdropFilter: "blur(4px)",
                                  color: "#1D4ED8",
                                  fontSize: 12, fontWeight: 700,
                                  textDecoration: "none", whiteSpace: "nowrap",
                                  transition: "opacity .15s",
                                }}
                              >
                                <Mail size={12} /> Reply
                              </a>

                              {!item.read && (
                                <button
                                  onClick={() => handleMarkAsRead(item.id)}
                                  className="qm-action-btn"
                                  style={{
                                    display: "flex", alignItems: "center", gap: 4,
                                    padding: "5px 11px", borderRadius: 8,
                                    border: "1px solid #BBF7D0",
                                    background: "rgba(240,253,244,.9)",
                                    backdropFilter: "blur(4px)",
                                    color: "#166534",
                                    fontSize: 12, fontWeight: 700,
                                    cursor: "pointer", whiteSpace: "nowrap",
                                    transition: "opacity .15s",
                                  }}
                                >
                                  <CheckCircle2 size={12} /> Read
                                </button>
                              )}

                              <button
                                onClick={() => handleDelete(item.id)}
                                className="qm-action-btn"
                                style={{
                                  display: "flex", alignItems: "center",
                                  padding: "6px 9px", borderRadius: 8,
                                  border: "1px solid #FECACA",
                                  background: "rgba(255,245,245,.9)",
                                  backdropFilter: "blur(4px)",
                                  color: "#DC2626",
                                  cursor: "pointer",
                                  transition: "opacity .15s",
                                }}
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* ── Pagination ────────────────────────────────────────── */}
              <div style={{
                display: "flex", flexWrap: "wrap",
                alignItems: "center", justifyContent: "space-between",
                gap: 12, padding: "16px 24px",
                borderTop: "1px solid #FFEDD5",
                background: "rgba(255,247,237,.6)",
                backdropFilter: "blur(8px)",
              }}>
                <p style={{ margin: 0, fontSize: 13, color: "#9A3412" }}>
                  Showing{" "}
                  <strong style={{ color: "#C2410C", fontVariantNumeric: "tabular-nums" }}>
                    {queryData.length > 0 ? (pagination.page - 1) * pagination.limit + 1 : 0}
                  </strong>
                  {" "}–{" "}
                  <strong style={{ color: "#C2410C", fontVariantNumeric: "tabular-nums" }}>
                    {Math.min(pagination.page * pagination.limit, pagination.total)}
                  </strong>
                  {" "}of{" "}
                  <strong style={{ color: "#431407", fontVariantNumeric: "tabular-nums" }}>{pagination.total}</strong>
                  {" "}queries
                </p>

                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <button
                    onClick={handlePrev}
                    disabled={pagination.page === 1}
                    style={{
                      display: "flex", alignItems: "center", gap: 4,
                      padding: "8px 16px", borderRadius: 10,
                      border: "1px solid #FED7AA",
                      background: "rgba(255,255,255,.8)",
                      backdropFilter: "blur(8px)",
                      color: "#9A3412",
                      fontSize: 13, fontWeight: 700,
                      cursor: pagination.page === 1 ? "not-allowed" : "pointer",
                      opacity: pagination.page === 1 ? 0.38 : 1,
                    }}
                  >
                    <ChevronLeft size={15} /> Prev
                  </button>

                  <div style={{
                    minWidth: 40, height: 40, borderRadius: 10,
                    background: "linear-gradient(135deg, #C2410C, #EA580C)",
                    color: "#fff",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 14, fontWeight: 800,
                    fontVariantNumeric: "tabular-nums",
                    boxShadow: "0 3px 12px rgba(194,65,12,.40)",
                    padding: "0 12px",
                  }}>
                    {pagination.page}
                  </div>

                  <button
                    onClick={handleNext}
                    disabled={pagination.page === totalPages || totalPages === 0}
                    style={{
                      display: "flex", alignItems: "center", gap: 4,
                      padding: "8px 16px", borderRadius: 10,
                      border: "1px solid #FED7AA",
                      background: "rgba(255,255,255,.8)",
                      backdropFilter: "blur(8px)",
                      color: "#9A3412",
                      fontSize: 13, fontWeight: 700,
                      cursor: (pagination.page === totalPages || totalPages === 0) ? "not-allowed" : "pointer",
                      opacity: (pagination.page === totalPages || totalPages === 0) ? 0.38 : 1,
                    }}
                  >
                    Next <ChevronRight size={15} />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Message Modal ──────────────────────────────────────────────────── */}

      {showMessageModal && selectedQuery && (
        <div
          onClick={() => { setShowMessageModal(false); setSelectedQuery(null); }}
          style={{
            position: "fixed", inset: 0, zIndex: 50,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "rgba(67,20,7,.45)",
            backdropFilter: "blur(6px)",
            padding: 16,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%", maxWidth: 600,
              background: "rgba(255,255,255,.96)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              borderRadius: 24,
              border: "1px solid rgba(234,88,12,.18)",
              overflow: "hidden",
              boxShadow: "0 32px 64px rgba(67,20,7,.22)",
            }}
          >
            {/* Modal header — rich orange gradient */}
            <div style={{
              background: "linear-gradient(135deg, #7C2D12 0%, #C2410C 45%, #EA580C 75%, #F97316 100%)",
              padding: "24px 24px 20px",
              position: "relative",
              overflow: "hidden",
            }}>
              {/* Decorative circles */}
              <div style={{ position: "absolute", top: -20, right: -20, width: 140, height: 140, borderRadius: "50%", background: "rgba(255,255,255,.07)", pointerEvents: "none" }} />
              <div style={{ position: "absolute", bottom: -30, left: "30%", width: 100, height: 100, borderRadius: "50%", background: "rgba(255,255,255,.05)", pointerEvents: "none" }} />

              <div style={{ display: "flex", alignItems: "center", gap: 14, position: "relative" }}>
                <div style={{
                  width: 54, height: 54, borderRadius: "50%",
                  background: "rgba(255,255,255,.2)",
                  border: "2px solid rgba(255,255,255,.35)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 22, fontWeight: 900, color: "#fff",
                  flexShrink: 0,
                }}>
                  {initials(selectedQuery.first_name)}
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#fff", letterSpacing: "-0.2px" }}>
                    {selectedQuery.first_name} {selectedQuery.last_name}
                  </h2>
                  <p style={{ margin: "3px 0 0", fontSize: 13, color: "rgba(255,255,255,.72)" }}>
                    {selectedQuery.email}
                  </p>
                </div>
              </div>

              <button
                onClick={() => { setShowMessageModal(false); setSelectedQuery(null); }}
                style={{
                  position: "absolute", top: 16, right: 16,
                  background: "rgba(255,255,255,.15)",
                  backdropFilter: "blur(8px)",
                  border: "1px solid rgba(255,255,255,.25)",
                  borderRadius: 8, width: 34, height: 34,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", color: "#fff",
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal body */}
            <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {[
                  { label: "Topic",          value: selectedQuery.topic,                   cap: true  },
                  { label: "Role",           value: selectedQuery.role,                    cap: true  },
                  { label: "Contact Number", value: selectedQuery.contact_no,              cap: false },
                  { label: "Institute",      value: selectedQuery.instituteName || "—",   cap: false },
                ].map(({ label, value, cap }) => (
                  <div key={label} style={{
                    background: "linear-gradient(135deg, #FFF7ED, #FFEDD5)",
                    border: "1px solid #FED7AA",
                    borderRadius: 12, padding: "12px 14px",
                  }}>
                    <p style={{ margin: 0, fontSize: 10, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: "#9A3412", marginBottom: 4 }}>
                      {label}
                    </p>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#431407", textTransform: cap ? "capitalize" : "none" }}>
                      {value}
                    </p>
                  </div>
                ))}
              </div>

              {/* Full message */}
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                  <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: "#431407" }}>Full Message</h3>
                  <span style={{
                    padding: "3px 11px", borderRadius: 99, fontSize: 11, fontWeight: 700,
                    background: selectedQuery.read ? "#DCFCE7" : "#FEF9C3",
                    color:      selectedQuery.read ? "#166534" : "#854D0E",
                  }}>
                    {selectedQuery.read ? "Read" : "New"}
                  </span>
                </div>
                <div style={{
                  background: "#FFF7ED",
                  border: "1px solid #FED7AA",
                  borderRadius: 14, padding: "16px 18px",
                  maxHeight: 260, overflowY: "auto",
                }}>
                  <p style={{ margin: 0, fontSize: 14, lineHeight: 1.8, color: "#431407", whiteSpace: "pre-wrap" }}>
                    {selectedQuery.actualMessage}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal footer */}
            <div style={{
              padding: "14px 24px",
              background: "rgba(255,247,237,.7)",
              backdropFilter: "blur(8px)",
              borderTop: "1px solid #FED7AA",
              display: "flex", justifyContent: "flex-end", gap: 10,
            }}>
              {!selectedQuery.read && (
                <button
                  onClick={async () => {
                    await handleMarkAsRead(selectedQuery.id);
                    setSelectedQuery((prev) => ({ ...prev, read: true }));
                  }}
                  style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "9px 18px", borderRadius: 10,
                    border: "1px solid #BBF7D0",
                    background: "#F0FDF4",
                    color: "#166534",
                    fontSize: 13, fontWeight: 700, cursor: "pointer",
                  }}
                >
                  <CheckCircle2 size={15} /> Mark as Read
                </button>
              )}

              <a
                href={`https://mail.google.com/mail/?view=cm&fs=1&to=${selectedQuery.email}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "9px 20px", borderRadius: 10,
                  background: "linear-gradient(135deg, #C2410C, #EA580C)",
                  color: "#fff",
                  fontSize: 13, fontWeight: 800,
                  textDecoration: "none",
                  boxShadow: "0 3px 12px rgba(194,65,12,.38)",
                }}
              >
                <ExternalLink size={14} /> Reply via Gmail
              </a>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default QueryManagementPage;
