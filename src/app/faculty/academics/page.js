"use client";

import Navbar from "@/components/ui/Navbar";
import { useState, useContext, useEffect } from "react";
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
  X,
  Send,
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

  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [publishingId, setPublishingId] = useState(null);

  const [materials, setMaterials] = useState([]);
  const [facultySubjects, setFacultySubjects] = useState([]);

  const [formData, setFormData] = useState({
    type: "Notes",
    title: "",
    description: "",
    branch_id: "",
    batch_id: "",
    subject_id: "",
    semester: "",
    due_date: "",
    total_marks: "",
    file: null,
  });

  const materialTabs = ["Notes", "Assignments", "Class Test"];

  const subjectTabs = [
    { id: "all", name: "All Subjects" },
    ...facultySubjects.map((subject) => ({
      id: subject._id,
      name: subject.subject_name,
    })),
  ];

  const visibleTabs = subjectTabs.slice(tabStart, tabStart + 4);

  const branches = [
    ...new Map(
      facultySubjects
        .filter((subject) => subject.department_id)
        .map((subject) => [
          subject.department_id,
          {
            id: subject.department_id,
            name: subject.department_name || "Unnamed Branch",
          },
        ]),
    ).values(),
  ];

  const semesterOptions = [
    ...new Set(
      facultySubjects
        .map((subject) => subject.semester)
        .filter((semester) => semester !== undefined && semester !== null),
    ),
  ].sort((a, b) => Number(a) - Number(b));

  const batches = [
    ...new Map(
      facultySubjects
        .filter((subject) => {
          if (!subject.batch_id) {
            return false;
          }

          if (formData.branch_id && subject.department_id !== formData.branch_id) {
            return false;
          }

          return true;
        })
        .map((subject) => [
          subject.batch_id,
          {
            id: subject.batch_id,
            name: subject.batch_name || "Unnamed Batch",
          },
        ]),
    ).values(),
  ];

  const modalSubjects = facultySubjects.filter((subject) => {
    if (formData.branch_id && subject.department_id !== formData.branch_id) {
      return false;
    }

    if (formData.batch_id && subject.batch_id !== formData.batch_id) {
      return false;
    }

    if (formData.semester && String(subject.semester) !== String(formData.semester)) {
      return false;
    }

    return true;
  });

  const filteredMaterials = materials.filter((item) => {
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
        item.branch_name,
        item.batch_name,
        item.file_name,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query);

    return matchesType && matchesSubject && matchesSemester && matchesSearch;
  });

  const normalizeMaterialFromApi = (item) => ({
    id: item.id,
    backend_id: item.id,
    localOnly: false,
    is_published: item.is_published,

    type: item.type,
    title: item.title,
    description: item.description,

    branch_id: item.department_id,
    branch_name: "",
    batch_id: item.batch_id,
    batch_name: "",

    subject_id: item.subject_id,
    subject_name: "",
    subject_code: "",

    semester: item.semester,
    due_date: item.due_date,
    total_marks: item.total_marks,

    file: null,
    file_name: item.file?.filename || "File",
    file_size: item.file?.size,
    file_type: item.file?.mime_type,
    file_url: item.file?.url,

    date: item.created_at
      ? new Date(item.created_at).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
      : "",

    count: 1,
  });

  const fetchFacultySubjects = async () => {
    try {
      const res = await axios.get("/api/subjects/faculty", {
        withCredentials: true,
      });

      setFacultySubjects(res.data?.subjects || []);
    } catch (err) {
      console.error(err);
      setFacultySubjects([]);
    }
  };

  const fetchMaterials = async () => {
    try {
      const res = await axios.get("/api/faculty/materials", {
        withCredentials: true,
      });

      setMaterials((res.data?.materials || []).map(normalizeMaterialFromApi));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchFacultySubjects();
    fetchMaterials();
  }, []);

  const handleChange = (field, value) => {
    if (field === "branch_id") {
      setFormData((prev) => ({
        ...prev,
        branch_id: value,
        batch_id: "",
        subject_id: "",
      }));

      return;
    }

    if (field === "batch_id") {
      setFormData((prev) => ({
        ...prev,
        batch_id: value,
        subject_id: "",
      }));

      return;
    }

    if (field === "semester") {
      setFormData((prev) => ({
        ...prev,
        semester: value,
        subject_id: "",
      }));

      return;
    }

    if (field === "subject_id") {
      const selected = facultySubjects.find((subject) => subject._id === value);

      setFormData((prev) => ({
        ...prev,
        subject_id: value,
        branch_id: selected?.department_id || prev.branch_id,
        batch_id: selected?.batch_id || prev.batch_id,
        semester: selected?.semester ? String(selected.semester) : prev.semester,
      }));

      return;
    }

    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const resetForm = () => {
    setFormData({
      type: activeTab,
      title: "",
      description: "",
      branch_id: "",
      batch_id: "",
      subject_id: "",
      semester: "",
      due_date: "",
      total_marks: "",
      file: null,
    });
  };

  const handleOpenModal = () => {
    setFormData((prev) => ({
      ...prev,
      type: activeTab,
    }));

    setShowModal(true);
  };

  const handleSaveDraft = async () => {
    if (!formData.title.trim()) {
      alert("Title is required");
      return;
    }

    if (!formData.type) {
      alert("Type is required");
      return;
    }

    if (!formData.branch_id) {
      alert("Branch is required");
      return;
    }

    if (!formData.semester) {
      alert("Semester is required");
      return;
    }

    if (!formData.batch_id) {
      alert("Batch is required");
      return;
    }

    if (!formData.subject_id) {
      alert("Subject is required");
      return;
    }

    if (!formData.file) {
      alert("File is required");
      return;
    }

    try {
      setSaving(true);

      const selectedSubjectData = facultySubjects.find(
        (subject) => subject._id === formData.subject_id,
      );

      const fileUrl = URL.createObjectURL(formData.file);

      const newMaterial = {
        id: `draft-${Date.now()}`,
        localOnly: true,
        is_published: false,
        publish_status: "draft",

        type: formData.type,
        title: formData.title,
        description: formData.description,

        branch_id: selectedSubjectData?.department_id || formData.branch_id,
        branch_name: selectedSubjectData?.department_name || "",
        batch_id: selectedSubjectData?.batch_id || formData.batch_id,
        batch_name: selectedSubjectData?.batch_name || "",

        subject_id: formData.subject_id,
        subject_name: selectedSubjectData?.subject_name || "",
        subject_code: selectedSubjectData?.subject_code || "",

        semester: formData.semester,
        due_date: formData.due_date,
        total_marks: formData.total_marks,

        file: formData.file,
        file_name: formData.file.name,
        file_size: formData.file.size,
        file_type: formData.file.type,
        file_url: fileUrl,

        date: new Date().toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),

        count: 1,
      };

      setMaterials((prev) => [newMaterial, ...prev]);

      setActiveTab(formData.type);
      setSelectedSubject(formData.subject_id);
      setSelectedSemester(`Semester ${formData.semester}`);

      setShowModal(false);
      resetForm();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const uploadToImageKit = async (file) => {
    const authRes = await axios.get("/api/imagekit-auth", {
      withCredentials: true,
    });

    const auth = authRes.data;

    const uploadForm = new FormData();

    uploadForm.append("file", file);
    uploadForm.append("fileName", file.name);
    uploadForm.append("publicKey", auth.publicKey);
    uploadForm.append("signature", auth.signature);
    uploadForm.append("expire", auth.expire);
    uploadForm.append("token", auth.token);
    uploadForm.append("folder", "/faculty-materials");

    const uploadRes = await axios.post(
      "https://upload.imagekit.io/api/v1/files/upload",
      uploadForm,
    );

    return {
      url: uploadRes.data.url,
      fileId: uploadRes.data.fileId,
      name: uploadRes.data.name || file.name,
      type: file.type,
      size: file.size,
    };
  };

  const handlePublish = async (material) => {
    try {
      setPublishingId(material.id);

      if (!material.file) {
        alert("Original file missing. Please create the draft again.");
        return;
      }

      const uploadedFile = await uploadToImageKit(material.file);

      const payload = {
        title: material.title,
        description: material.description,
        type: material.type,

        subject_id: material.subject_id,
        batch_id: material.batch_id,

        file_url: uploadedFile.url,
        file_id: uploadedFile.fileId,
        filename: uploadedFile.name,
        mime_type: uploadedFile.type,
        size: uploadedFile.size,

        due_date: material.due_date,
        total_marks: material.total_marks,
      };

      const res = await axios.post("/api/faculty/materials", payload, {
        withCredentials: true,
      });

      setMaterials((prev) =>
        prev.map((item) =>
          item.id === material.id
            ? {
              ...item,
              backend_id: res.data?.material_id,
              localOnly: false,
              is_published: true,
              publish_status: "published",
              file_url: uploadedFile.url,
              file_id: uploadedFile.fileId,
              file_name: uploadedFile.name,
              file_type: uploadedFile.type,
              file_size: uploadedFile.size,
              file: null,
            }
            : item,
        ),
      );
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.error || "Failed to publish");
    } finally {
      setPublishingId(null);
    }
  };

  const handleSettingsClick = () => {
    alert("Settings");
  };

  const handleMoreClick = () => {
    alert("More");
  };

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
          <div className="mb-4 flex flex-row items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900">Academics</h1>

            <button
              onClick={handleOpenModal}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 text-white flex items-center gap-2"
              style={{ backgroundColor: themeColor }}
            >
              <Upload size={16} />
              Upload
            </button>
          </div>

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
                  onClick={() =>
                    setTabStart((prev) =>
                      Math.min(prev + 1, Math.max(subjectTabs.length - 4, 0)),
                    )
                  }
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
          {filteredMaterials.map((item) => (
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
                <div className="mb-3">
                  {!item.is_published ? (
                    <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700">
                      Draft
                    </span>
                  ) : (
                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                      Published
                    </span>
                  )}
                </div>

                <div
                  className="absolute top-5 right-5 min-w-[36px] h-9 px-3 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg"
                  style={{
                    background: `linear-gradient(135deg, ${themeColor}, ${themeColor}cc)`,
                    boxShadow: `0 6px 18px ${themeColor}40`,
                  }}
                >
                  {item.count}
                </div>

                <h3 className="text-gray-900 font-bold text-lg leading-snug pr-14 mb-3">
                  {item.title}
                </h3>

                <p className="text-sm text-gray-500 mb-2">
                  {item.subject_name}
                  {item.subject_code ? ` (${item.subject_code})` : ""}
                </p>

                <p className="text-xs text-gray-400 mb-3">
                  {item.branch_name}
                  {item.batch_name ? ` | ${item.batch_name}` : ""}
                  {" | "}
                  Semester {item.semester}
                </p>

                <div
                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
                  style={{
                    backgroundColor: `${themeColor}15`,
                    color: themeColor,
                  }}
                >
                  {item.date}
                </div>
              </div>

              <div
                className="px-6 py-4 flex items-center justify-between border-t transition-all duration-300 gap-2"
                style={{
                  borderColor: `${themeColor}15`,
                  backgroundColor: `${themeColor}06`,
                }}
              >
                <button
                  onClick={() => window.open(item.file_url, "_blank")}
                  className="p-3 rounded-full transition-all duration-200 hover:scale-110"
                >
                  <Eye className="w-5 h-5" style={{ color: themeColor }} />
                </button>

                <a
                  href={item.file_url}
                  download={item.file_name}
                  className="p-3 rounded-full transition-all duration-200 hover:scale-110"
                >
                  <Download className="w-5 h-5" style={{ color: themeColor }} />
                </a>

                {!item.is_published && (
                  <button
                    onClick={() => handlePublish(item)}
                    disabled={publishingId === item.id}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-white transition hover:opacity-90 disabled:opacity-60 flex items-center gap-1"
                    style={{ backgroundColor: themeColor }}
                  >
                    <Send size={14} />
                    {publishingId === item.id ? "Publishing..." : "Publish"}
                  </button>
                )}
              </div>
            </div>
          ))}

          {filteredMaterials.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center h-full min-h-[250px] text-center">
              <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                <Upload className="w-6 h-6 text-gray-400" />
              </div>

              <p className="text-gray-500 font-medium">
                {searchQuery.trim()
                  ? "No matching item found"
                  : `No ${activeTab} uploaded`}
              </p>

              <p className="text-gray-400 text-xs mt-1">
                Upload files to create drafts here.
              </p>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
          <div className="bg-white w-full max-w-xl rounded-xl shadow-2xl max-h-[95vh] overflow-y-auto">
            <div className="px-6 py-4 border-b flex items-center justify-between sticky top-0 bg-white rounded-t-xl z-10">
              <div>
                <h3 className="font-bold text-gray-800 text-lg">
                  Upload Academic File
                </h3>

                <p className="text-gray-400 text-sm mt-0.5">
                  Add a draft first. Publish it when ready.
                </p>
              </div>

              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Material Details
              </p>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type <span className="text-red-500">*</span>
                </label>

                <select
                  value={formData.type}
                  onChange={(e) => handleChange("type", e.target.value)}
                  className="w-full p-2.5 border rounded-lg text-sm bg-white focus:outline-none focus:ring-2"
                  style={{ "--tw-ring-color": `${themeColor}40` }}
                >
                  <option value="Notes">Notes</option>
                  <option value="Assignments">Assignments</option>
                  <option value="Class Test">Class Test</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title <span className="text-red-500">*</span>
                </label>

                <input
                  value={formData.title}
                  placeholder="e.g. Unit 1 Notes"
                  onChange={(e) => handleChange("title", e.target.value)}
                  className="w-full p-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2"
                  style={{ "--tw-ring-color": `${themeColor}40` }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>

                <textarea
                  value={formData.description}
                  placeholder="Short description"
                  rows={3}
                  onChange={(e) => handleChange("description", e.target.value)}
                  className="w-full p-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 resize-none"
                  style={{ "--tw-ring-color": `${themeColor}40` }}
                />
              </div>

              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider pt-2">
                Academic Mapping
              </p>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Branch <span className="text-red-500">*</span>
                  </label>

                  <select
                    value={formData.branch_id}
                    onChange={(e) => handleChange("branch_id", e.target.value)}
                    className="w-full p-2.5 border rounded-lg text-sm bg-white focus:outline-none focus:ring-2"
                    style={{ "--tw-ring-color": `${themeColor}40` }}
                  >
                    <option value="">Select branch</option>
                    {branches.map((branch) => (
                      <option key={branch.id} value={branch.id}>
                        {branch.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Batch <span className="text-red-500">*</span>
                  </label>

                  <select
                    value={formData.batch_id}
                    onChange={(e) => handleChange("batch_id", e.target.value)}
                    className="w-full p-2.5 border rounded-lg text-sm bg-white focus:outline-none focus:ring-2"
                    style={{ "--tw-ring-color": `${themeColor}40` }}
                  >
                    <option value="">Select batch</option>
                    {batches.map((batch) => (
                      <option key={batch.id} value={batch.id}>
                        {batch.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Semester <span className="text-red-500">*</span>
                  </label>

                  <select
                    value={formData.semester}
                    onChange={(e) => handleChange("semester", e.target.value)}
                    className="w-full p-2.5 border rounded-lg text-sm bg-white focus:outline-none focus:ring-2"
                    style={{ "--tw-ring-color": `${themeColor}40` }}
                  >
                    <option value="">Select semester</option>
                    {semesterOptions.map((semester) => (
                      <option key={semester} value={semester}>
                        Semester {semester}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject <span className="text-red-500">*</span>
                </label>

                <select
                  value={formData.subject_id}
                  onChange={(e) => handleChange("subject_id", e.target.value)}
                  className="w-full p-2.5 border rounded-lg text-sm bg-white focus:outline-none focus:ring-2"
                  style={{ "--tw-ring-color": `${themeColor}40` }}
                >
                  <option value="">Select subject</option>
                  {modalSubjects.map((subject) => (
                    <option key={subject._id} value={subject._id}>
                      {subject.subject_name}
                      {subject.subject_code ? ` (${subject.subject_code})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              {(formData.type === "Assignments" || formData.type === "Class Test") && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Due Date
                    </label>

                    <input
                      type="date"
                      value={formData.due_date}
                      onChange={(e) => handleChange("due_date", e.target.value)}
                      className="w-full p-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2"
                      style={{ "--tw-ring-color": `${themeColor}40` }}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Total Marks
                    </label>

                    <input
                      type="number"
                      value={formData.total_marks}
                      placeholder="e.g. 20"
                      onChange={(e) => handleChange("total_marks", e.target.value)}
                      className="w-full p-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2"
                      style={{ "--tw-ring-color": `${themeColor}40` }}
                    />
                  </div>
                </div>
              )}

              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider pt-2">
                File
              </p>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Upload File <span className="text-red-500">*</span>
                </label>

                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.png,.jpg,.jpeg"
                  onChange={(e) => handleChange("file", e.target.files?.[0] || null)}
                  className="w-full p-2.5 border rounded-lg text-sm bg-white focus:outline-none focus:ring-2"
                  style={{ "--tw-ring-color": `${themeColor}40` }}
                />

                {formData.file && (
                  <p className="mt-2 text-xs text-gray-500">
                    Selected: {formData.file.name}
                  </p>
                )}
              </div>
            </div>

            <div className="px-6 py-4 border-t flex justify-end gap-3 bg-gray-50 rounded-b-xl">
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-100 text-sm font-medium transition"
              >
                Cancel
              </button>

              <button
                disabled={saving}
                onClick={handleSaveDraft}
                className="px-5 py-2 text-white rounded-lg text-sm font-semibold transition disabled:opacity-60"
                style={{ backgroundColor: themeColor }}
              >
                {saving ? "Saving..." : "Add Draft"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AcademicsPage;
