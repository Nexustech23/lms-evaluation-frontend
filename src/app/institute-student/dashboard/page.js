"use client";

import Navbar from "@/components/ui/Navbar";
import { useTranslations } from "next-intl";
import { useState, useContext } from "react";
import dynamic from "next/dynamic";

// recharts (~150KB) is only needed once this dashboard renders its chart —
// load it lazily, client-only (Phase 5.3).
const PerformanceBarChart = dynamic(() => import("./PerformanceBarChart"), {
  ssr: false,
  loading: () => <div className="h-full w-full" />,
});

import {
  Bell,
  X,
  CheckCircle,
  AlertCircle,
  Info,
  BookOpen,
  GraduationCap,
  ClipboardList,
  TrendingUp,
} from "lucide-react";

import { AuthContext } from "@/app/AuthContext";

const data = [
  { name: "Electronics", value: 72 },
  { name: "Mathematics", value: 61 },
  { name: "Network", value: 88 },
  { name: "EM Theory", value: 45 },
  { name: "AIML", value: 91 },
];

const Dashboard = () => {
  const t = useTranslations("dashboard");

  const { user } = useContext(AuthContext);

  const [showNotifications, setShowNotifications] = useState(false);

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: "success",
      title: "Assignment Submitted",
      message: "Your assignment has been successfully submitted.",
      time: "2 hours ago",
      read: false,
    },
    {
      id: 2,
      type: "alert",
      title: "Upcoming Exam",
      message: "Computer Science exam on Friday at 2 PM.",
      time: "5 hours ago",
      read: false,
    },
    {
      id: 3,
      type: "info",
      title: "Grades Released",
      message: "Your midterm grades are available now.",
      time: "1 day ago",
      read: true,
    },
  ]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const semesters = [
    "Semester 1",
    "Semester 2",
    "Semester 3",
    "Semester 4",
    "Semester 5",
    "Semester 6",
  ];

  const subjectColors = {
    Mathematics: "from-blue-500 to-indigo-500",
    Physics: "from-pink-500 to-rose-500",
    Chemistry: "from-orange-400 to-red-400",
    English: "from-green-400 to-emerald-500",
    "Computer Science": "from-violet-500 to-purple-500",
    "Data Structures": "from-cyan-500 to-sky-500",
  };

  const timetable = [
    {
      time: "09:00 - 10:00",
      monday: {
        subject: "Mathematics",
        faculty: "Dr. Sharma",
        room: "A-101",
      },
      tuesday: {
        subject: "Physics",
        faculty: "Prof. Verma",
        room: "B-204",
      },
      wednesday: null,
      thursday: {
        subject: "Chemistry",
        faculty: "Dr. Singh",
        room: "Lab 2",
      },
      friday: null,
      saturday: {
        subject: "English",
        faculty: "Ms. Joshi",
        room: "C-110",
      },
    },
    {
      time: "10:00 - 11:00",
      monday: {
        subject: "Computer Science",
        faculty: "Mr. Mehta",
        room: "Lab 1",
      },
      tuesday: null,
      wednesday: {
        subject: "Mathematics",
        faculty: "Dr. Sharma",
        room: "A-101",
      },
      thursday: null,
      friday: {
        subject: "Physics",
        faculty: "Prof. Verma",
        room: "B-204",
      },
      saturday: null,
    },
    {
      time: "11:00 - 11:30",
      isBreak: true,
    },
    {
      time: "11:30 - 12:30",
      monday: null,
      tuesday: {
        subject: "Data Structures",
        faculty: "Ms. Kapoor",
        room: "A-203",
      },
      wednesday: null,
      thursday: {
        subject: "Computer Science",
        faculty: "Mr. Mehta",
        room: "Lab 1",
      },
      friday: {
        subject: "English",
        faculty: "Ms. Joshi",
        room: "C-110",
      },
      saturday: null,
    },
  ];

  const days = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];

  const labels = {
    monday: "Monday",
    tuesday: "Tuesday",
    wednesday: "Wednesday",
    thursday: "Thursday",
    friday: "Friday",
    saturday: "Saturday",
  };

  const removeNotification = (id) => {
    setNotifications(notifications.filter((n) => n.id !== id));
  };

  const markAsRead = (id) => {
    setNotifications(
      notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      )
    );
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "alert":
        return <AlertCircle className="w-5 h-5 text-orange-500" />;
      case "info":
        return <Info className="w-5 h-5 text-blue-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div
      className="min-h-screen"
    style={{
  background: `
    linear-gradient(
      135deg,
      ${user?.color} 0%,
      ${user?.color}bb 45%,
      ${user?.color}99 100%
    )
  `,
}}
    >
      <div className="p-6 lg:p-8 space-y-8 border ">

        {/* HERO SECTION */}
        <div
          className="relative overflow-hidden rounded-[32px] p-8 shadow-2xl"
          style={{
            background: `linear-gradient(135deg, ${user?.color || "#6366f1"}, #818cf8)`,
          }}
        >
          <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>

          <div className="relative z-10 flex flex-col lg:flex-row justify-between items-center gap-6">
            <div>
              <p className="text-white/80 text-sm mb-2">
                Welcome back 👋
              </p>

              <h1 className="text-4xl font-bold text-white tracking-tight">
                NexusTech Student Portal
              </h1>

              <p className="text-white/80 mt-3 max-w-xl">
                Track your academic progress, classes, assignments and notifications in one place.
              </p>

              <div className="flex gap-4 mt-6 flex-wrap">
                <button className="px-5 py-3 bg-white text-black rounded-2xl font-semibold hover:scale-105 transition">
                  View Courses
                </button>

                <button className="px-5 py-3 bg-white/20 backdrop-blur-xl border border-white/20 text-white rounded-2xl font-semibold hover:bg-white/30 transition">
                  Attendance
                </button>
              </div>
            </div>

            <img
              src="https://i.pinimg.com/736x/6f/b2/32/6fb23265a9bbbdf25f9d8227534d115e.jpg"
              className="w-32 h-32 rounded-full object-cover border-4 border-white/30 shadow-2xl"
            />
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            {
              title: "Attendance",
              value: "92%",
              icon: <TrendingUp />,
            },
            {
              title: "Assignments",
              value: "14",
              icon: <ClipboardList />,
            },
            {
              title: "CGPA",
              value: "8.7",
              icon: <GraduationCap />,
            },
            {
              title: "Subjects",
              value: "6",
              icon: <BookOpen />,
            },
          ].map((item, i) => (
            <div
              key={i}
              className="
                bg-white
                border
                border-white/40
                rounded-3xl
                p-6
                shadow-xl
                hover:-translate-y-1
                transition-all
              "
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">
                    {item.title}
                  </p>

                  <h2 className="text-3xl font-bold text-gray-900 mt-2">
                    {item.value}
                  </h2>
                </div>

                <div
                  className="p-3 rounded-2xl text-white"
                  style={{
                    backgroundColor: user?.color || "#6366f1",
                  }}
                >
                  {item.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* LEFT */}
          <div className="lg:col-span-3 space-y-6">

            {/* SEMESTERS */}
            <div className="bg-white border border-white/30 rounded-[32px] p-6 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Your Semesters
                </h2>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                {semesters.map((semester, i) => (
                  <div
                    key={i}
                    className="
                      relative
                      overflow-hidden
                      rounded-3xl
                      p-6
                      text-white
                      cursor-pointer
                      hover:-translate-y-1
                      hover:shadow-2xl
                      transition-all
                      duration-300
                    "
                    style={{
                      background: `linear-gradient(135deg, ${user?.color || "#6366f1"}, #8b5cf6)`,
                    }}
                  >

                    <div className="relative z-10">
                      <h3 className="font-bold text-lg">
                        {semester}
                      </h3>

                      <p className="text-sm text-white mt-1">
                        View Details
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* TIMETABLE */}
            <div className="bg-white border border-white/30 rounded-[32px] shadow-xl overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900">
                  Student Timetable
                </h2>

                <p className="text-gray-500 mt-2">
                  Weekly class schedule overview
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[1000px]">
                  <thead className="sticky top-0 bg-white z-10">
                    <tr className="border-b border-gray-100">
                      <th className="p-5 text-left text-gray-600 font-semibold">
                        Time
                      </th>

                      {days.map((day) => (
                        <th
                          key={day}
                          className="p-5 text-left text-gray-600 font-semibold"
                        >
                          {labels[day]}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {timetable.map((slot, i) => (
                      <tr
                        key={i}
                        className="border-b border-gray-50 hover:bg-white/40 transition"
                      >
                        <td className="p-5 font-semibold text-gray-700 whitespace-nowrap">
                          {slot.time}
                        </td>

                        {slot.isBreak ? (
                          <td
                            colSpan={6}
                            className="p-6 text-center font-semibold"
                            style={{
                              color: user?.color || "#6366f1",
                            }}
                          >
                            ☕ Break Time
                          </td>
                        ) : (
                          days.map((day) => {
                            const item = slot[day];

                            return (
                              <td key={day} className="p-4">
                                {item ? (
                                  <div
                                    className={`
                                      bg-gradient-to-br
                                      ${
                                        subjectColors[item.subject] ||
                                        "from-gray-500 to-gray-700"
                                      }
                                      rounded-3xl
                                      p-4
                                      text-white
                                      hover:scale-105
                                      transition-all
                                      duration-300
                                      shadow-lg
                                    `}
                                  >
                                    <p className="font-bold text-sm">
                                      {item.subject}
                                    </p>

                                    <p className="text-xs mt-2 text-white/80">
                                      {item.faculty}
                                    </p>

                                    <p className="text-xs text-white/70 mt-1">
                                      {item.room}
                                    </p>
                                  </div>
                                ) : (
                                  <div className="text-gray-800 text-xs italic">
                                    Free Slot
                                  </div>
                                )}
                              </td>
                            );
                          })
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="lg:col-span-2 space-y-6">

            {/* CHART */}
            <div className="bg-white backdrop-blur-xl border border-white/30 rounded-[32px] p-6 shadow-xl">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Subject Scores
                </h2>

                <p className="text-gray-500 mt-2">
                  Performance overview
                </p>
              </div>

              <div className="h-[350px]">
                <PerformanceBarChart data={data} barColor={user?.color || "#6366f1"} />
              </div>
            </div>

            {/* NOTIFICATIONS */}
            <div className="bg-white backdrop-blur-xl border border-white/30 rounded-[32px] shadow-xl overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Notifications
                  </h2>

                  <p className="text-gray-500 mt-2">
                    Latest updates
                  </p>
                </div>

                {unreadCount > 0 && (
                  <div
                    className="px-3 py-1 rounded-full text-white text-sm font-semibold"
                    style={{
                      backgroundColor: user?.color || "#6366f1",
                    }}
                  >
                    {unreadCount} new
                  </div>
                )}
              </div>

              <div className="divide-y divide-gray-100">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`
                      p-5
                      hover:bg-white/50
                      transition
                      ${
                        !notif.read
                          ? "border-l-4 border-blue-500 bg-blue-50/40"
                          : ""
                      }
                    `}
                  >
                    <div className="flex gap-4">
                      <div>
                        {getNotificationIcon(notif.type)}
                      </div>

                      <div className="flex-1">
                        <div className="flex justify-between">
                          <div>
                            <p className="font-semibold text-gray-900">
                              {notif.title}
                            </p>

                            <p className="text-sm text-gray-600 mt-1">
                              {notif.message}
                            </p>

                            <p className="text-xs text-gray-400 mt-2">
                              {notif.time}
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-2 mt-4">
                          {!notif.read && (
                            <button
                              onClick={() => markAsRead(notif.id)}
                              className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-600 text-xs font-semibold hover:bg-blue-100 transition"
                            >
                              Mark Read
                            </button>
                          )}

                          <button
                            onClick={() => removeNotification(notif.id)}
                            className="px-3 py-1.5 rounded-xl bg-red-50 text-red-600 text-xs font-semibold hover:bg-red-100 transition"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-5 border-t border-gray-100">
                <button
                  onClick={() => setShowNotifications(true)}
                  className="w-full py-3 rounded-2xl text-white font-semibold transition hover:opacity-90"
                  style={{
                    backgroundColor: user?.color || "#6366f1",
                  }}
                >
                  View All Notifications
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* MODAL */}
        {showNotifications && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-5">
            <div className="w-full max-w-2xl bg-white rounded-[32px] shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    All Notifications
                  </h2>

                  <p className="text-gray-500 mt-1">
                    Manage all updates
                  </p>
                </div>

                <button
                  onClick={() => setShowNotifications(false)}
                  className="p-2 rounded-xl hover:bg-gray-100 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="max-h-[500px] overflow-y-auto divide-y">
                {notifications.map((notif) => (
                  <div key={notif.id} className="p-5">
                    <div className="flex gap-4">
                      {getNotificationIcon(notif.type)}

                      <div className="flex-1">
                        <p className="font-semibold">
                          {notif.title}
                        </p>

                        <p className="text-sm text-gray-600 mt-1">
                          {notif.message}
                        </p>

                        <p className="text-xs text-gray-400 mt-2">
                          {notif.time}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;