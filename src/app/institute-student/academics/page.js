"use client";

import Navbar from "@/components/ui/Navbar";
import { useState, useContext, useEffect, useMemo } from "react";
import axios from "axios";
import {
  Eye,
  Download,
  Search,
  Settings,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Upload,
} from "lucide-react";
import { AuthContext } from "@/app/AuthContext";

const AcademicsPage = () => {
  const { user } = useContext(AuthContext);
  const themeColor = user?.color || "#ff7f10";

  const [activeTab, setActiveTab] = useState("Notes");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [selectedSemester, setSelectedSemester] = useState("All Semesters");
  const [tabStart, setTabStart] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [materials, setMaterials] = useState([]);
  const [enrolledSubjects, setEnrolledSubjects] = useState([]);

  const materialTabs = ["Notes", "Assignments", "Class Test"];

  const subjectById = useMemo(() => {
    return enrolledSubjects.reduce((acc, subject) => {
      acc[subject.id] = subject;
      return acc;
    }, {});
  }, [enrolledSubjects]);

  const subjectTabs = useMemo(() => {
    return [
      { id: "all", name: "All Subjects" },
      ...enrolledSubjects.map((subject) => ({
        id: subject.id,
        name: subject.subject_name || subject.subject_code || "Untitled Subject",
      })),
    ];
  }, [enrolledSubjects]);

  const visibleTabs = subjectTabs.slice(tabStart, tabStart + 4);

  const semesterOptions = useMemo(() => {
    return [
      ...new Set(
        enrolledSubjects
          .map((subject) => subject.semester)
          .filter((semester) => semester !== undefined && semester !== null),
      ),
    ].sort((a, b) => Number(a) - Number(b));
  }, [enrolledSubjects]);

  const normalizedMaterials = useMemo(() => {
    return materials.map((item) => {
      const subject = subjectById[item.subject_id] || {};
      const file = item.file || {};

      return {
        id: item.id,
        type: item.type,
        title: item.title || "Untitled",
        description: item.description || "",
        subject_id: item.subject_id,
        subject_name: subject.subject_name || item.subject_name || "Subject",
        subject_code: subject.subject_code || item.subject_code || "",
        faculty_name: subject.faculty_name || item.faculty_name || "",
        semester: item.semester,
        due_date: item.due_date,
        total_marks: item.total_marks,
        file_name: file.filename || "File",
        file_url: file.url,
        date: item.created_at
          ? new Date(item.created_at).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })
          : "",
      };
    });
  }, [materials, subjectById]);

  const filteredMaterials = normalizedMaterials.filter((item) => {
    const matchesType = item.type === activeTab;

    const matchesSubject =
      selectedSubject === "all" || item.subject_id === selectedSubject;

    const matchesSemester =
      selectedSemester === "All Semesters" ||
      String(item.semester) === selectedSemester.replace("Semester ", "");

    const query = searchQuery.trim().toLowerCase();

    const matchesSearch =
      !query ||
      [
        item.title,
        item.description,
        item.subject_name,
        item.subject_code,
        item.faculty_name,
        item.file_name,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query);

    return matchesType && matchesSubject && matchesSemester && matchesSearch;
  });

  const fetchAcademics = async () => {
    try {
      setLoading(true);

      const [materialsRes, enrolledRes] = await Promise.all([
        axios.get("/api/student/materials", {
          withCredentials: true,
        }),
        axios.get("/api/student-enrolled-subjects", {
          withCredentials: true,
        }),
      ]);

      setMaterials(materialsRes.data?.materials || []);
      setEnrolledSubjects(enrolledRes.data?.subjects || []);
    } catch (err) {
      console.error(err);
      setMaterials([]);
      setEnrolledSubjects([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAcademics();
  }, []);

  const handleSettingsClick = () => {
    alert("Settings");
  };

  const handleMoreClick = () => {
    alert("More");
  };

  const recordInteraction = async (materialId, status) => {
    try {
      await axios.post(
        `/api/student/materials/${materialId}/interaction`,
        { status },
        {
          withCredentials: true,
        },
      );
    } catch (err) {
      console.error(err);
    }
  };

  const openFile = async (item) => {
    if (!item.file_url) return;
    await recordInteraction(item.id, "viewed");
    window.open(item.file_url, "_blank", "noopener,noreferrer");
  };

  const nextTabStart = Math.max(subjectTabs.length - 4, 0);

  return (
    <div
      className="min-h-screen flex flex-col bg-gray-50"
      style={{
        backgroundColor: user?.color ? `${user.color}` : "#fff5f0",
      }}
    >
      <div className="relative">
        <Navbar title="Academics" style={{ backgroundColor: themeColor }} />
      </div>

      <div className="flex-1 flex flex-col px-6 py-6 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h1 className="text-xl font-bold text-gray-900 mb-4">Academics</h1>

          <div className="flex items-center gap-3 mb-4 flex-wrap">
            {materialTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200"
                style={{
                  backgroundColor: activeTab === tab ? `${themeColor}20` : "#f3f4f6",
                  color: activeTab === tab ? themeColor : "#374151",
                  boxShadow: activeTab === tab ? `0 4px 12px ${themeColor}20` : "none",
                  border:
                    activeTab === tab
                      ? `1px solid ${themeColor}30`
                      : "1px solid transparent",
                }}
              >
                {tab}
              </button>
            ))}

            <div className="ml-auto flex items-center gap-3">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`Search ${activeTab.toLowerCase()}`}
                  className="w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-3 text-sm font-medium text-gray-700 outline-none transition focus:border-transparent focus:ring-2"
                  style={{ "--tw-ring-color": `${themeColor}40` }}
                />
              </div>

              <button
                onClick={handleSettingsClick}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <Settings className="w-5 h-5 text-gray-600" />
              </button>

              <button
                onClick={handleMoreClick}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <MoreVertical className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-3">
            <div className="flex flex-row justify-between items-center gap-2 overflow-x-auto py-2">
              <div className="flex flex-row gap-2 items-center">
                <button
                  className="p-2 rounded-full transition flex-shrink-0"
                  onClick={() => setTabStart((prev) => Math.max(prev - 1, 0))}
                >
                  <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>

                <div className="flex gap-3 overflow-x-auto flex-1 pb-2">
                  {visibleTabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setSelectedSubject(tab.id)}
                      className="text-sm font-semibold px-4 py-2 rounded-xl transition-all duration-200 bg-white shadow-sm hover:shadow-md whitespace-nowrap"
                      style={{
                        borderBottom:
                          selectedSubject === tab.id
                            ? `3px solid ${themeColor}`
                            : "3px solid transparent",
                        color: selectedSubject === tab.id ? themeColor : "#374151",
                        backgroundColor:
                          selectedSubject === tab.id ? `${themeColor}12` : "white",
                      }}
                    >
                      {tab.name}
                    </button>
                  ))}
                </div>

                <button
                  className="p-2 rounded-full transition flex-shrink-0"
                  onClick={() => setTabStart((prev) => Math.min(prev + 1, nextTabStart))}
                >
                  <ChevronRight className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              <div className="relative border px-2 py-1 rounded-xl">
                <span className="absolute text-sm top-[-10px] left-[8px] bg-white px-2">
                  Filters
                </span>

                <select
                  value={selectedSemester}
                  onChange={(e) => setSelectedSemester(e.target.value)}
                  className="px-3 py-2 rounded-lg text-sm font-semibold bg-white cursor-pointer"
                >
                  <option>All Semesters</option>
                  {semesterOptions.map((semester) => (
                    <option key={semester}>Semester {semester}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          {loading ? (
            <div className="col-span-full flex items-center justify-center min-h-[250px] text-gray-500 font-medium">
              Loading academics...
            </div>
          ) : (
            filteredMaterials.map((item) => (
              <div
                key={item.id}
                className="relative bg-white rounded-3xl border overflow-hidden transition-all duration-300 group hover:-translate-y-1 hover:shadow-2xl"
                style={{
                  borderColor: `${themeColor}25`,
                  boxShadow: `0 8px 30px ${themeColor}12`,
                  background: `linear-gradient(180deg, white 0%, ${themeColor}08 100%)`,
                }}
              >
                <div
                  className="h-1 w-full"
                  style={{
                    background: `linear-gradient(90deg, ${themeColor}, ${themeColor}80)`,
                  }}
                />

                <div className="relative p-6">
                  <div
                    className="absolute top-5 right-5 min-w-[36px] h-9 px-3 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg"
                    style={{
                      background: `linear-gradient(135deg, ${themeColor}, ${themeColor}cc)`,
                      boxShadow: `0 6px 18px ${themeColor}40`,
                    }}
                  >
                    {activeTab === "Notes" ? "N" : activeTab === "Assignments" ? "A" : "T"}
                  </div>

                  <h3 className="text-gray-900 font-bold text-lg leading-snug pr-14 mb-3">
                    {item.title}
                  </h3>

                  <p className="text-sm text-gray-500 mb-2">
                    {item.subject_name}
                    {item.subject_code ? ` (${item.subject_code})` : ""}
                  </p>

                  {item.faculty_name && (
                    <p className="text-xs text-gray-400 mb-2">
                      Faculty: {item.faculty_name}
                    </p>
                  )}

                  <p className="text-xs text-gray-400 mb-3">
                    Semester {item.semester}
                    {item.total_marks ? ` | ${item.total_marks} marks` : ""}
                  </p>

                  {item.due_date && (
                    <p className="text-xs text-gray-500 mb-3">
                      Due: {item.due_date}
                    </p>
                  )}

                  <div
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
                    style={{
                      backgroundColor: `${themeColor}15`,
                      color: themeColor,
                    }}
                  >
                    {item.date || "Published"}
                  </div>
                </div>

                <div
                  className="px-6 py-4 flex items-center justify-between border-t transition-all duration-300"
                  style={{
                    borderColor: `${themeColor}15`,
                    backgroundColor: `${themeColor}06`,
                  }}
                >
                  <button
                    onClick={() => openFile(item)}
                    disabled={!item.file_url}
                    className="p-3 rounded-full transition-all duration-200 hover:scale-110 disabled:opacity-40"
                  >
                    <Eye className="w-5 h-5" style={{ color: themeColor }} />
                  </button>

                  {activeTab === "Assignments" && (
                    <button
                      onClick={() => alert("Submission flow can be connected here.")}
                      className="p-3 rounded-full transition-all duration-200 hover:scale-110"
                    >
                      <Upload className="w-5 h-5" style={{ color: themeColor }} />
                    </button>
                  )}

                  <a
                    href={item.file_url || "#"}
                    download={item.file_name}
                    className="p-3 rounded-full transition-all duration-200 hover:scale-110"
                  >
                    <Download className="w-5 h-5" style={{ color: themeColor }} />
                  </a>
                </div>
              </div>
            ))
          )}

          {!loading && filteredMaterials.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center h-full min-h-[250px] text-center">
              <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                <Upload className="w-6 h-6 text-gray-400" />
              </div>

              <p className="text-gray-500 font-medium">
                {searchQuery.trim()
                  ? "No matching item found"
                  : `No ${activeTab} available`}
              </p>

              <p className="text-gray-400 text-xs mt-1">
                Published faculty materials will appear here.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AcademicsPage;
