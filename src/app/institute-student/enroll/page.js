"use client";

import Navbar from "@/components/ui/Navbar";

import { useState, useContext, useEffect } from "react";

import axios from "axios";

import { useRouter } from "next/navigation";

import { AuthContext } from "@/app/AuthContext";

import toast from "react-hot-toast";

const MyBatch = () => {
  const router = useRouter();

  const { user } = useContext(AuthContext);

  const color = user?.color || "#ff7f10";


  const [loading, setLoading] = useState(true);

  const [alreadyEnrolled, setAlreadyEnrolled] = useState(false);

  const [enrolledSubjects, setEnrolledSubjects] = useState([]);

  const [availableSubjects, setAvailableSubjects] = useState([]);

  const [loadingAvailableSubjects, setLoadingAvailableSubjects] =
    useState(false);

  const [newlyEnrolledSubjects, setNewlyEnrolledSubjects] = useState([]);

  const [showAvailableTable, setShowAvailableTable] = useState(false);

  const [studentBatchId, setStudentBatchId] = useState("");

  const [studentDepartmentId, setStudentDepartmentId] = useState("");

  const [departments, setDepartments] = useState([]);

  const [batches, setBatches] = useState([]);

  const [semesters, setSemesters] = useState([]);

  const [selectedDepartment, setSelectedDepartment] = useState("");

  const [selectedBatch, setSelectedBatch] = useState(null);

  const [selectedEnrolledSemester, setSelectedEnrolledSemester] =
    useState("1");

  const semesterBoxes = [1, 2, 3, 4, 5, 6, 7, 8];

  const filteredEnrolledSubjects = enrolledSubjects.filter(
    (subject) => String(subject.semester) === String(selectedEnrolledSemester),
  );

  const selectedSemesterNewlyEnrolledSubjects = newlyEnrolledSubjects.filter(
    (subject) => String(subject.semester) === String(selectedEnrolledSemester),
  );

  const visibleEnrolledSubjects = [
    ...filteredEnrolledSubjects,
    ...selectedSemesterNewlyEnrolledSubjects,
  ];

  const visibleAvailableSubjects = availableSubjects.filter(
    (subject) =>
      !visibleEnrolledSubjects.some((enrolled) => enrolled.id === subject.id),
  );

  // =====================================================
  // FETCH AVAILABLE SUBJECTS
  // =====================================================

  const fetchAvailableSubjects = async (semester, batchId, departmentId) => {
    if (!batchId) {
      setAvailableSubjects([]);
      return;
    }

    try {
      setLoadingAvailableSubjects(true);

      const res = await axios.get(
        `/api/student-subjects?batch=${batchId}&semester=${semester}&department=${departmentId || ""}`,
        {
          withCredentials: true,
        },
      );

      setAvailableSubjects(res.data?.subjects || []);
    } catch (err) {
      console.error(err);

      setAvailableSubjects([]);
    } finally {
      setLoadingAvailableSubjects(false);
    }
  };

  // =====================================================
  // FETCH INITIAL DATA
  // =====================================================

  const fetchAcademicData = async () => {
    try {
      setLoading(true);

      const enrolledRes = await axios.get("/api/student-enrolled-subjects", {
        withCredentials: true,
      });

      const enrolledData = enrolledRes.data;

      const subjects = enrolledData?.subjects || [];

      if (subjects.length > 0) {
        const firstSubject = subjects[0];

        const batchId = firstSubject?.batch_id || "";

        const departmentId = firstSubject?.department_id || "";

        setAlreadyEnrolled(true);

        setEnrolledSubjects(subjects);

        setStudentBatchId(batchId);

        setStudentDepartmentId(departmentId);

        setSelectedEnrolledSemester("1");

        setDepartments([]);

        setBatches([]);

        setSemesters([]);

        const semesterOneSubjects = subjects.filter(
          (subject) => String(subject.semester) === "1",
        );

        if (semesterOneSubjects.length === 0) {
          setShowAvailableTable(true);

          await fetchAvailableSubjects("1", batchId, departmentId);
        } else {
          setShowAvailableTable(false);

          setAvailableSubjects([]);
        }

        return;
      }

      const filtersRes = await axios.get("/api/student-academic-filters", {
        withCredentials: true,
      });

      const filtersData = filtersRes.data;

      setAlreadyEnrolled(false);

      setEnrolledSubjects([]);

      setAvailableSubjects([]);

      setNewlyEnrolledSubjects([]);

      setDepartments(filtersData?.departments || []);

      setBatches(filtersData?.batches || []);

      setSemesters(filtersData?.semesters || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAcademicData();
  }, []);

  // =====================================================
  // SELECT ENROLLED SEMESTER BOX
  // =====================================================

  const handleEnrolledSemesterSelect = async (semester) => {
    const semesterValue = String(semester);

    setSelectedEnrolledSemester(semesterValue);

    setNewlyEnrolledSubjects([]);

    const subjectsForSemester = enrolledSubjects.filter(
      (subject) => String(subject.semester) === semesterValue,
    );

    if (subjectsForSemester.length > 0) {
      setShowAvailableTable(false);

      setAvailableSubjects([]);

      return;
    }

    setShowAvailableTable(true);

    await fetchAvailableSubjects(
      semesterValue,
      studentBatchId,
      studentDepartmentId,
    );
  };

  // =====================================================
  // ADD SUBJECT
  // =====================================================

  const handleAddSubject = async (subject) => {
    try {
      const res = await axios.post(
        "/api/link-student-subjects",
        {
          subject_ids: [subject.id],
        },
        {
          withCredentials: true,
        },
      );

      toast.success(res.data?.message || "Subject enrolled successfully");

      const addedSubject = {
        ...subject,
        semester: selectedEnrolledSemester,
      };

      setNewlyEnrolledSubjects((prev) => [...prev, addedSubject]);

      setAvailableSubjects((prev) =>
        prev.filter((item) => item.id !== subject.id),
      );
    } catch (err) {
      toast.error(err?.response?.data?.error || "Enrollment failed");
    }
  };

  // =====================================================
  // SELECT DEPARTMENT
  // =====================================================

  const handleDepartmentSelect = async (departmentId) => {
    setSelectedDepartment(departmentId);

    setSelectedBatch(null);

    setSemesters([]);

    try {
      const res = await axios.get(
        `/api/student-academic-filters?department_id=${departmentId}`,
        {
          withCredentials: true,
        },
      );

      setBatches(res.data?.batches || []);
    } catch (err) {
      console.error(err);
    }
  };

  // =====================================================
  // SELECT BATCH
  // =====================================================

  const handleBatchSelect = (batch) => {
    setSelectedBatch(batch);

    setSemesters(batch?.semesters || []);
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        backgroundColor: color,
      }}
    >
      <Navbar title="Semester Enroll" />

      <div className="flex-1 px-8 py-8">
        <div>
          <h1
            className="
              text-4xl
              font-bold
              text-white
            "
          >
            Semester Enrollment
          </h1>

          <p
            className="
              mt-2
              text-white/80
            "
          >
            Enroll subjects according to your batch and semester.
          </p>
        </div>

        {loading ? (
          <div
            className="
              mt-10
              rounded-2xl
              bg-white
              p-10
              text-center
            "
          >
            Loading...
          </div>
        ) : (
          <>
            {alreadyEnrolled ? (
              <>
                {/* =================================== */}
                {/* SEMESTER BOXES */}
                {/* =================================== */}
                <div className="bg-white border border-white/30 rounded-[32px] p-6 shadow-xl mt-2">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900">
                      Your Semesters
                    </h2>
                  </div>

                  <div
                    className="
                    mt-0
                    grid
                    grid-cols-1
                    sm:grid-cols-2
                    md:grid-cols-4
                    lg:grid-cols-6
                    xl:grid-cols-8
                    gap-5
                  "
                  >
                    {semesterBoxes.map((semester) => {
                      const isSelected =
                        String(selectedEnrolledSemester) === String(semester);

                      return (
                        <div
                          key={semester}
                          onClick={() => handleEnrolledSemesterSelect(semester)}
                          className="
    cursor-pointer
    rounded-2xl
    border
    p-2
    text-center
    transition
    hover:shadow-xl

  "
                          style={{
                            backgroundColor: isSelected ? `${color}20` : "#f3f4f6",
                            borderColor: isSelected ? color : "#e5e7eb",
                            boxShadow: isSelected ? `0 4px 12px ${color}20`: "none",
                          }}
                        >
                          <div
                            className="
      text-md
      font-bold
    "
                            style={{
                              color: isSelected ? `${color}` : "#111827",
                            }}
                          >
                            {semester}
                          </div>

                          <div
                            className="
      mt-2
      text-sm
    "
                            style={{
                              color: isSelected ? `${color}` : "#111827",
                            }}
                          >
                            Semester
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>



                {/* =================================== */}
                {/* AVAILABLE SUBJECTS TABLE */}
                {/* =================================== */}

                {showAvailableTable && (
                  <>
                    <div className="mt-8 px-2">
                      <h2 className="text-xl font-bold text-white">
                        Available Subjects
                      </h2>
                    </div>
                    <div
                      className="
                      mt-2
                      overflow-hidden
                      rounded-2xl
                      bg-white
                      shadow-md
                    "
                    >

                      <div className="overflow-x-auto">
                        <table
                          className="
                          w-full
                          min-w-[1000px]
                          text-sm
                        "
                        >
                          <thead>
                            <tr
                              style={{
                                backgroundColor: `${color}20`,
                              }}
                            >
                              <th className="px-4 py-4 text-left">
                                S. No.
                              </th>

                              <th className="px-4 py-4 text-left">
                                Subject Code
                              </th>

                              <th className="px-4 py-4 text-left">
                                Subject Name
                              </th>

                              <th className="px-4 py-4 text-left">
                                Faculty
                              </th>

                              <th className="px-4 py-4 text-left">
                                Credits
                              </th>

                              <th className="px-4 py-4 text-left">
                                Action
                              </th>
                            </tr>
                          </thead>

                          <tbody>
                            {loadingAvailableSubjects ? (
                              <tr>
                                <td
                                  colSpan={5}
                                  className="
                                  py-10
                                  text-center
                                "
                                >
                                  Loading...
                                </td>
                              </tr>
                            ) : visibleAvailableSubjects.length > 0 ? (
                              visibleAvailableSubjects.map((sub, index) => (
                                <tr
                                  key={sub.id}
                                  className="
                                  border-t
                                  hover:bg-gray-50
                                  transition
                                "
                                >
                                  <td className="px-4 py-5 font-medium">
                                    {index+1 || "-"}
                                  </td>

                                  <td className="px-4 py-5 font-medium">
                                    {sub.subject_code || "-"}
                                  </td>

                                  <td className="px-4 py-5">
                                    {sub.subject_name || "-"}
                                  </td>

                                  <td className="px-4 py-5">
                                    {sub.faculty_name || "-"}
                                  </td>

                                  <td className="px-4 py-5">
                                    {sub.credits || "-"}
                                  </td>

                                  <td className="px-4 py-5">
                                    <button
                                      onClick={() => handleAddSubject(sub)}
                                      className="
                                      rounded-xl
                                      px-5
                                      py-2
                                      font-bold
                                      text-white
                                    "
                                      style={{
                                        backgroundColor: color,
                                      }}
                                    >
                                      Add
                                    </button>
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td
                                  colSpan={5}
                                  className="
                                  py-10
                                  text-center
                                "
                                >
                                  No available subjects found.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </>
                )}

                {/* =================================== */}
                {/* ENROLLED SUBJECTS TABLE */}
                {/* =================================== */}

                {visibleEnrolledSubjects.length > 0 && (
                  <>
                    <div className="mt-8 px-2">
                  <h2 className="text-xl font-bold text-white">
                    Enrolled Subjects
                  </h2>
                </div>

                <div
                  className="
                    mt-2
                    overflow-hidden
                    rounded-2xl
                    bg-white
                    shadow-md
                  "
                >
                  <div className="overflow-x-auto">
                    <table
                      className="
                        w-full
                        min-w-[1000px]
                        text-sm
                      "
                    >
                      <thead>
                        <tr
                          style={{
                            backgroundColor: `${color}20`,
                          }}
                        >
                          <th className="px-4 py-4 text-left">
                            S. No.
                          </th>

                          <th className="px-4 py-4 text-left">
                            Subject Code
                          </th>

                          <th className="px-4 py-4 text-left">
                            Subject Name
                          </th>

                          <th className="px-4 py-4 text-left">
                            Faculty
                          </th>

                          <th className="px-4 py-4 text-left">
                            Credits
                          </th>

                          <th className="px-4 py-4 text-left">
                            Semester
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {visibleEnrolledSubjects.length > 0 ? (
                          visibleEnrolledSubjects.map((sub, index) => (
                            <tr
                              key={sub.id}
                              className="
                                border-t
                                hover:bg-gray-50
                                transition
                              "
                            >
                              <td className="px-4 py-5 font-medium">
                                {index+1 || "-"}
                              </td>

                              <td className="px-4 py-5 font-medium">
                                {sub.subject_code || "-"}
                              </td>

                              <td className="px-4 py-5">
                                {sub.subject_name || "-"}
                              </td>

                              <td className="px-4 py-5">
                                {sub.faculty_name || "-"}
                              </td>

                              <td className="px-4 py-5">
                                {sub.credits || "-"}
                              </td>

                              <td className="px-4 py-5">
                                {sub.semester || selectedEnrolledSemester}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              colSpan={5}
                              className="
                                py-10
                                text-center
                              "
                            >
                              No subject enrolled.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
                  </>
                )
                }
              </>
            ) : (
              <>
                {/* ================================= */}
                {/* DEPARTMENTS */}
                {/* ================================= */}

                {departments.length > 0 && !selectedDepartment && (
                  <div
                    className="
                      mt-8
                      rounded-2xl
                      bg-white
                      p-8
                    "
                  >
                    <h2
                      className="
                        text-2xl
                        font-bold
                        mb-6
                      "
                    >
                      Select Department
                    </h2>

                    <div
                      className="
                        flex
                        flex-wrap
                        gap-4
                      "
                    >
                      {departments.map((dep) => (
                        <button
                          key={dep?.id}
                          onClick={() => handleDepartmentSelect(dep?.id)}
                          className="
                            rounded-xl
                            px-6
                            py-3
                            bg-blue-50
                            border
                            font-semibold
                            hover:shadow-md
                          "
                        >
                          {dep?.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* ================================= */}
                {/* BATCHES */}
                {/* ================================= */}

                {(selectedDepartment || departments.length === 0) &&
                  !selectedBatch && (
                    <div
                      className="
                        mt-8
                        rounded-2xl
                        bg-white
                        p-8
                      "
                    >
                      <h2
                        className="
                          text-2xl
                          font-bold
                          mb-6
                        "
                      >
                        Select Batch
                      </h2>

                      <div
                        className="
                          flex
                          flex-wrap
                          gap-4
                        "
                      >
                        {batches.map((batch) => (
                          <button
                            key={batch?.id}
                            onClick={() => handleBatchSelect(batch)}
                            className="
                              rounded-xl
                              px-6
                              py-3
                              bg-orange-50
                              border
                              font-semibold
                              hover:shadow-md
                            "
                          >
                            {batch?.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                {/* ================================= */}
                {/* SEMESTERS */}
                {/* ================================= */}

                {selectedBatch && semesters.length > 0 && (
                  <div
                    className="
                      mt-8
                      rounded-2xl
                      bg-white
                      p-8
                    "
                  >
                    <h2
                      className="
                        text-2xl
                        font-bold
                        mb-6
                      "
                    >
                      Select Semester
                    </h2>

                    <div
                      className="
                        grid
                        grid-cols-1
                        sm:grid-cols-2
                        md:grid-cols-3
                        gap-5
                      "
                    >
                      {semesters.map((semester) => (
                        <div
                          key={semester}
                          onClick={() =>
                            router.push(
                              `/institute-student/enroll/${semester}?batch=${selectedBatch?.id}&department=${selectedDepartment}`,
                            )
                          }
                          className="
                            cursor-pointer
                            rounded-2xl
                            border
                            bg-blue-50
                            p-8
                            text-center
                            transition
                            hover:shadow-xl
                          "
                        >
                          <div
                            className="
                              text-3xl
                              font-bold
                            "
                          >
                            {semester}
                          </div>

                          <div
                            className="
                              mt-2
                              text-gray-500
                            "
                          >
                            Open Subjects
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MyBatch;