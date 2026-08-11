"use client";

import React, {
  useContext,
  useState,
  useEffect,
} from "react";

import axios from "axios";

import {
  useParams,
  useRouter,
  useSearchParams,
} from "next/navigation";

import Navbar from "@/components/ui/Navbar";

import { AuthContext } from "@/app/AuthContext";

import toast from "react-hot-toast";

export default function SubjectsSemesterPagePreview() {

  const router = useRouter();

  const searchParams = useSearchParams();

  const { user } =
    useContext(AuthContext);

  const params = useParams();

  const color =
    user?.color || "#ff7f10";

  const selectedSemester =
    Array.isArray(params?.batchId)
      ? params.batchId[0]
      : params?.batchId || "";

  const selectedBatch =
    searchParams.get("batch");

  const selectedDepartment =
    searchParams.get("department");

  // =====================================================
  // STATES
  // =====================================================

  const [loading, setLoading] =
    useState(true);

  const [availableSubjects,
    setAvailableSubjects] = useState([]);

  const [selectedSubjects,
    setSelectedSubjects] = useState([]);

  const [saving, setSaving] =
    useState(false);

  // =====================================================
  // FETCH SUBJECTS
  // =====================================================

  const fetchSubjects = async () => {

    try {

      setLoading(true);

      const res = await axios.get(
        `/api/student-subjects?batch=${selectedBatch}&semester=${selectedSemester}&department=${selectedDepartment}`,
        {
          withCredentials: true,
        }
      );

      setAvailableSubjects(
        res.data?.subjects || []
      );

    } catch (err) {

      console.error(err);

    } finally {

      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  // =====================================================
  // TOGGLE
  // =====================================================

  const toggleSubject = (id) => {

    setSelectedSubjects((prev) =>

      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    );
  };

  // =====================================================
  // SAVE
  // =====================================================

  const handleEnroll = async () => {

    if (!selectedSubjects.length) {

      toast.error(
        "Please select subjects"
      );

      return;
    }

    try {

      setSaving(true);

      const res = await axios.post(
        "/api/link-student-subjects",

        {
          subject_ids:
            selectedSubjects,
        },

        {
          withCredentials: true,
        }
      );

      toast.success(
        res.data?.message ||
        "Subjects linked successfully"
      );

      fetchSubjects();

    } catch (err) {

      toast.error(
        err?.response?.data?.error ||
        "Enrollment failed"
      );

    } finally {

      setSaving(false);
    }
  };


    

  return (

    <div
      className="
        flex
        min-h-screen
        flex-col
      "
      style={{
        backgroundColor: color,
      }}
    >

      <Navbar
        title={`Semester ${selectedSemester}`}
      />

      <div className="flex-1 px-6 pb-8">

        {/* HEADER */}

        <div
          className="
            flex
            flex-row
            gap-6
            pb-5
            pt-3
            items-center
          "
        >

          <button
            onClick={() =>
              router.push(
                "/institute-student/enroll"
              )
            }
            className="
              bg-white
              py-3
              px-8
              rounded-xl
              font-bold
            "
            style={{
              color,
            }}
          >
            ← Back
          </button>

          <div>

            <h1
              className="
                text-2xl
                font-semibold
                text-white
              "
            >
              Semester {selectedSemester}
            </h1>

            <p
              className="
                text-base
                text-white/85
              "
            >
              Select subjects to enroll.
            </p>
          </div>
        </div>

        {/* TABLE */}

        <div
          className="
            mt-6
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
        backgroundColor:
          `${color}20`,
      }}
    >

      <th className="px-4 py-4 text-left">
        Select
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
    </tr>
  </thead>

  <tbody>

    {loading ? (

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

    ) : availableSubjects.length > 0 ? (

      availableSubjects.map(
        (sub) => (

          <tr
            key={sub.id}
            className="
              border-t
              hover:bg-gray-50
              transition
            "
          >

            <td className="px-4 py-5">

              <input
                type="checkbox"
                checked={
                  selectedSubjects.includes(
                    sub.id
                  )
                }
                onChange={() =>
                  toggleSubject(
                    sub.id
                  )
                }
                className="
                  h-4
                  w-4
                "
              />
            </td>

            <td className="px-4 py-5 font-medium">
              {sub.subject_code}
            </td>

            <td className="px-4 py-5">
              {sub.subject_name}
            </td>

            <td className="px-4 py-5">
              {sub.faculty_name || "-"}
            </td>

            <td className="px-4 py-5">
              {sub.credits}
            </td>
          </tr>
        )
      )

    ) : (

      <tr>

        <td
          colSpan={5}
          className="
            py-10
            text-center
          "
        >
          No subjects found.
        </td>
      </tr>
    )}
  </tbody>
</table>
          </div>
        </div>

        {/* ACTION */}

        <div className="mt-6">

          <button
            onClick={handleEnroll}
            disabled={saving}
            className="
              rounded-xl
              bg-white
              px-8
              py-3
              font-bold
            "
            style={{
              color,
            }}
          >
            {saving
              ? "Enrolling..."
              : "Enroll Subjects"}
          </button>
        </div>
      </div>
    </div>
  );
}