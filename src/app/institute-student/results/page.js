"use client";

import { useState, useContext } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";
import { AuthContext } from "@/app/AuthContext";
import { withAlpha } from "@/lib/question-paper/colorHelpers";
import Navbar from "@/components/ui/Navbar";
import { IconTrash, IconEdit, IconEye, IconPercentage, IconScoreboard } from "@tabler/icons-react";
import { Eye, Download, Search, Settings, MoreVertical, ChevronLeft, ChevronRight, Upload } from "lucide-react";
export default function ResultPage() {
  const { user } = useContext(AuthContext);
  const color = user?.color || "#ff7f10";
  const t = useTranslations("faculty");

  const [activeTab, setActiveTab] = useState("Internal Exam");
  const [loading, setLoading] = useState(true);

  const internalSubjectsData = [
    {
      _id: "1",
      semester: 1,
      subject_code: "CS101",
      subject_name: "Programming Fundamentals",
      subject_type: "Theory",
      credits: 4,
      faculty_assigned: "Dr. Sharma",
    },
    {
      _id: "2",
      semester: 1,
      subject_code: "CS102",
      subject_name: "Data Structures",
      subject_type: "Theory + Lab",
      credits: 4,
      faculty_assigned: "Prof. Mehta",
    },
    {
      _id: "3",
      semester: 1,
      subject_code: "MA101",
      subject_name: "Engineering Mathematics",
      subject_type: "Theory",
      credits: 3,
      faculty_assigned: "Dr. Verma",
    },
  ];

  const externalSubjectsData = [
    {
      _id: "4",
      semester: 2,
      subject_code: "CS201",
      subject_name: "Object Oriented Programming",
      subject_type: "Theory + Lab",
      credits: 4,
      faculty_assigned: "Ms. Kapoor",
    },
    {
      _id: "5",
      semester: 2,
      subject_code: "EC202",
      subject_name: "Digital Electronics",
      subject_type: "Theory",
      credits: 3,
      faculty_assigned: "Mr. Mehta",
    },
  ];

  const [internalAvailable, setInternalAvailable] = useState(internalSubjectsData);
  const [externalAvailable, setExternalAvailable] = useState(externalSubjectsData);
  const availableSubjects = activeTab === "Internal Exam" ? internalAvailable : externalAvailable;

  const handleViewBtn = () => {
    alert("View Btn click")
  }

  const handleScoreBtn = () => {
    alert("Score Btn Click")
  }

  const handlePercentageBtn = () => {
    alert("Percentage Btn Click")
  }

  const renderTable = (subjects, showRemove = false) => (
    <div className="mt-6 overflow-hidden rounded-2xl bg-white shadow-md">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1200px] text-sm">
          <thead>
            <tr style={{ backgroundColor: `${color}20` }} className="text-left">
              <th className="px-4 py-4 font-bold text-black">S.No</th>
              <th className="px-4 py-4 font-bold text-black">Semester</th>
              <th className="px-4 py-4 font-bold text-black">Subject Code</th>
              <th className="px-4 py-4 font-bold text-black">Subject Name</th>
              <th className="px-4 py-4 font-bold text-black">Subject Type</th>
              <th className="px-4 py-4 font-bold text-black">Credits</th>
              <th className="px-4 py-4 font-bold text-black">Faculty Assigned</th>
              <th className="px-4 py-4 text-center font-bold text-black">Actions</th>
            </tr>
          </thead>
          <tbody>
            {subjects.map((sub, index) => (
              <tr key={sub._id} className="border-t border-gray-200 transition hover:bg-gray-50">
                <td className="px-4 py-5 text-gray-400">{index + 1}</td>
                <td className="px-4 py-5">
                  <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600">
                    {sub.semester}
                  </span>
                </td>
                <td className="px-4 py-5">
                  <span
                    className="rounded-full px-3 py-1 text-xs font-semibold"
                    style={{
                      backgroundColor: `${color}20`,
                      color,
                      border: `1px solid ${color}55`,
                    }}
                  >
                    {sub.subject_code}
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-5 font-semibold text-gray-800">{sub.subject_name}</td>
                <td className="whitespace-nowrap px-4 py-5 text-gray-600">{sub.subject_type}</td>
                <td className="px-4 py-5 text-gray-600">{sub.credits}</td>
                <td className="whitespace-nowrap px-4 py-5 text-gray-600">{sub.faculty_assigned}</td>
                <td className="px-4 py-4">
                  <div className="flex items-center justify-center gap-3">
                    <div className="relative group">
                      <button
                        className="p-2 hover:bg-blue-100 rounded-xl transition"
                        style={{ color: color }}
                        onClick={() => handleViewBtn()}
                      >
                        <IconEye size={20} />
                      </button>

                      <div className="absolute -top-11 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 group-hover:-translate-y-1 transition-all duration-200 ease-in-out pointer-events-none">

                        <div className="px-3 py-1.5 text-xs text-white bg-black/80 backdrop-blur-md rounded-md shadow-lg whitespace-nowrap">
                          View
                        </div>

                        <div className="w-2 h-2 bg-black/80 rotate-45 mx-auto -mt-1"></div>
                      </div>
                    </div>
                    <div className="relative group">
                      <button
                        className="p-2 text-orange-600 hover:bg-blue-100 rounded-xl transition"
                        style={{ color: color }}
                        onClick={() => handleScoreBtn()}
                      >
                        <IconScoreboard />
                      </button>

                      <div className="absolute -top-11 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 group-hover:-translate-y-1 transition-all duration-200 ease-in-out pointer-events-none">

                        <div className="px-3 py-1.5 text-xs text-white bg-black/80 backdrop-blur-md rounded-md shadow-lg whitespace-nowrap">
                          Score
                        </div>

                        <div className="w-2 h-2 bg-black/80 rotate-45 mx-auto -mt-1"></div>
                      </div>
                    </div>
                    <div className="relative group">
                      <button
                        className="p-2 text-red-600 hover:bg-blue-100 rounded-xl transition disabled:opacity-50"
                        style={{ color: color }}
                        onClick={() => handlePercentageBtn()}
                      >
                        <IconPercentage size={20} />
                      </button>

                      <div className="absolute -top-11 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 group-hover:-translate-y-1 transition-all duration-200 ease-in-out pointer-events-none">

                        <div className="px-3 py-1.5 text-xs text-white bg-black/80 backdrop-blur-md rounded-md shadow-lg whitespace-nowrap">
                          Percentage
                        </div>

                        <div className="w-2 h-2 bg-black/80 rotate-45 mx-auto -mt-1"></div>
                      </div>
                    </div>

                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
  const themeColor = user?.color || "#ff7f10";

  const [selectedSubject, setSelectedSubject] = useState("intro");
  const [tabStart, setTabStart] = useState(0);

 



  const tabs = ["Intro", "Arithmetic (Foundation)", "Arithmetic (Selection)", "Advance (Foundation)", "Advance (Selection)", "English", "Piyush"];

  const visibleTabs = tabs.slice(tabStart, tabStart + 4);

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: withAlpha(color) }}>
      <Navbar title={"Result"} />

      <div className="bg-white min-h-screen p-4 mx-2 mb-6 rounded-xl" style={{ backgroundColor: color }}>
        <div className="flex justify-center mb-10">
          <div className="bg-white border border-orange-100 rounded-2xl p-2 flex gap-2 shadow-lg">
            {["Internal Exam", "External Exam"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 rounded-xl font-semibold capitalize transition-all duration-300 ${activeTab === tab ? "text-white shadow-lg" : "text-[#0d3b4a] hover:bg-blue-50"
                  }`}
                style={{ backgroundColor: activeTab === tab ? color : "" }}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
    <div className="flex flex-row gap-2 items-center">
                <button
                  className="p-2 rounded-full transition flex-shrink-0"
                  style={{
                    "--hover-color": `${themeColor}20`,
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = e.currentTarget.style.getPropertyValue("--hover-color"))
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "transparent")
                  }
                  onClick={() => setTabStart((prev) => Math.max(prev - 1, 0))}
                >
                  <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>

                <div className="flex gap-3 overflow-x-auto flex-1 pb-2">
                  {visibleTabs.map((tab, index) => {
                    const tabValue = tab.toLowerCase().replace(/\s+/g, "-");

                    return (
                      <button
                        key={index}
                        onClick={() => setSelectedSubject(tabValue)}
                        className="text-sm font-semibold px-4 py-2 rounded-xl transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                        style={{
                          borderBottom: selectedSubject === tabValue
                            ? `3px solid ${themeColor}`
                            : "3px solid transparent",
                          color: selectedSubject === tabValue ? themeColor : "#374151",
                          backgroundColor: selectedSubject === tabValue ? `${themeColor}12` : "white",
                        }}
                      >
                        {tab}
                      </button>
                    );
                  })}
                </div>

                <button
                  className="p-2 rounded-full transition flex-shrink-0"
                  style={{
                    "--hover-color": `${themeColor}20`,
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = e.currentTarget.style.getPropertyValue("--hover-color"))
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "transparent")
                  }
                  onClick={() => setTabStart((prev) => Math.min(prev + 1, tabs.length - 4))}
                >
                  <ChevronRight className="w-5 h-5 text-gray-600" />
                </button>
              </div>
        {availableSubjects.length > 0 && renderTable(availableSubjects)}

      </div>
    </div>
  );
}
