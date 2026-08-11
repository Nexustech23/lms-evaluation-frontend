"use client";

import React, {
    useContext,
    useState,
    useEffect,
} from "react";

import axios from "axios";

import { useParams, useRouter } from "next/navigation";

import Navbar from "@/components/ui/Navbar";

import { AuthContext } from "@/app/AuthContext";

import {
    IconEye,
    IconEdit,
    IconTrash,
} from "@tabler/icons-react";

export default function Enroll() {

    const router = useRouter();

    const { user } = useContext(AuthContext);

    const params = useParams();

    const color =
        user?.color || "#ff7f10";

    // =====================================================
    // STATES
    // =====================================================

    const [subjects, setSubjects] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [showViewModal, setShowViewModal] =
        useState(false);

    const [showEditModal, setShowEditModal] =
        useState(false);

    const [showDeleteModal, setShowDeleteModal] =
        useState(false);

    const [selectedSubject, setSelectedSubject] =
        useState(null);

    const [deleting, setDeleting] =
        useState(null);

    const [editForm, setEditForm] =
        useState({});

    const selectedSemester =
        Array.isArray(params?.batchId)
            ? params.batchId[0]
            : params?.batchId || "";

    // =====================================================
    // FETCH STUDENTS
    // =====================================================

    const fetchStudents = async () => {

        try {

            setLoading(true);

            const res = await axios.get(
                `/api/student-groups`,
                {
                    withCredentials: true,
                }
            );

            setSubjects(
                res?.data?.groups || []
            );

        } catch (err) {

            console.error(err);

        } finally {

            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudents();
    }, []);

    // =====================================================
    // MODALS
    // =====================================================

    const openViewModal = (subject) => {

        setSelectedSubject(subject);

        setShowViewModal(true);
    };

    const openEditModal = (subject) => {

        setSelectedSubject(subject);

        setEditForm({
            semester: subject.semester,
            subject_code:
                subject.subject_code,
            subject_name:
                subject.subject_name,
            subject_type:
                subject.subject_type,
            credits: subject.credits,
            status: subject.status,
        });

        setShowEditModal(true);
    };

    const openDeleteModal = (subject) => {

        setSelectedSubject(subject);

        setShowDeleteModal(true);
    };

    const handleDelete = (id) => {

        setDeleting(id);

        setTimeout(() => {

            setDeleting(null);

            setShowDeleteModal(false);

        }, 800);
    };

    const handleEditSave = () => {

        setShowEditModal(false);
    };

    // =====================================================
    // TOOLTIP BUTTON
    // =====================================================

    const TooltipButton = ({
        onClick,
        disabled,
        tooltip,
        colorClass,
        hoverBg,
        children,
    }) => (

        <div className="relative group">

            <button
                onClick={onClick}
                disabled={disabled}
                className={`
                    p-2
                    ${colorClass}
                    ${hoverBg}
                    rounded-xl
                    transition
                `}
            >
                {children}
            </button>

            <div
                className="
                    absolute
                    -top-12
                    left-1/2
                    -translate-x-1/2
                    opacity-0
                    group-hover:opacity-100
                    group-hover:-translate-y-1
                    transition-all
                    duration-200
                    ease-in-out
                    pointer-events-none
                    z-10
                "
            >
                <div
                    className="
                        px-3
                        py-1.5
                        text-xs
                        text-white
                        bg-black/80
                        backdrop-blur-md
                        rounded-md
                        shadow-lg
                        whitespace-nowrap
                    "
                >
                    {tooltip}
                </div>

                <div
                    className="
                        w-2
                        h-2
                        bg-black/80
                        rotate-45
                        mx-auto
                        -mt-1
                    "
                />
            </div>
        </div>
    );

    return (

        <div
            className="flex min-h-screen flex-col"
            style={{
                background: `
                    linear-gradient(
                        135deg,
                        ${color},
                        ${color}dd,
                        ${color}99
                    )
                `,
            }}
        >

            {/* ================================================= */}
            {/* NAVBAR */}
            {/* ================================================= */}

            <Navbar title="Enrolled Students" />

            {/* ================================================= */}
            {/* CONTENT */}
            {/* ================================================= */}

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
                        justify-between
                    "
                >

                    <div>

                        <h1
                            className="
                                text-2xl
                                font-semibold
                                text-white
                            "
                        >
                            Enrolled Students
                        </h1>

                        <p
                            className="
                                text-base
                                text-white/85
                                md:text-lg
                            "
                        >
                            View enrolled students
                            by programme, batch,
                            semester and school.
                        </p>
                    </div>

                    <button
                        onClick={() =>
                            router.push(
                                "/admin/enroll/enroll-student"
                            )
                        }
                        className="
                            bg-white
                            py-3
                            px-8
                            w-fit
                            h-fit
                            text-md
                            font-bold
                            rounded-xl
                            mb-1
                            flex
                            items-center
                            gap-1
                            transition
                            hover:opacity-90
                        "
                        style={{
                            color: color,
                        }}
                    >
                        Enroll Student
                    </button>
                </div>

                {/* ================================================= */}
                {/* TABLE */}
                {/* ================================================= */}

                <div
                    className="
                        mt-6
                        overflow-hidden
                        rounded-3xl
                        bg-white/90
                        backdrop-blur-xl
                        shadow-2xl
                    "
                >

                    <div className="overflow-x-auto">

                        <table
                            className="
                                w-full
                                min-w-[1200px]
                                text-sm
                            "
                        >

                            <thead>

                                <tr
                                    style={{
                                        backgroundColor:
                                            `${color}20`,
                                    }}
                                    className="text-left"
                                >

                                    <th
                                        className="
                                            px-4
                                            py-4
                                            font-bold
                                            text-black
                                        "
                                    >
                                        S.No
                                    </th>

                                    <th className="px-4 py-4 font-bold text-black">
                                        School Name
                                    </th>

                                    <th className="px-4 py-4 font-bold text-black">
                                        Program
                                    </th>

                                    <th className="px-4 py-4 font-bold text-black">
                                        Batch
                                    </th>

                                    <th className="px-4 py-4 font-bold text-black">
                                        No. of Students
                                    </th>

                                    <th className="px-4 py-4 font-bold text-black">
                                        Semester
                                    </th>

                                    <th className="px-4 py-4 text-center font-bold text-black">
                                        Actions
                                    </th>
                                </tr>
                            </thead>

                            <tbody>

                                {/* ====================== */}
                                {/* LOADING */}
                                {/* ====================== */}

                                {loading ? (

                                    <tr>

                                        <td
                                            colSpan={7}
                                            className="
                                                py-16
                                                text-center
                                                text-gray-500
                                            "
                                        >
                                            Loading students...
                                        </td>
                                    </tr>

                                ) : subjects.length > 0 ? (

                                    subjects.map(
                                        (
                                            sub,
                                            index
                                        ) => (

                                            <tr
                                                key={sub._id}
                                                className="
                                                    border-t
                                                    border-gray-200
                                                    transition
                                                    hover:bg-gray-50
                                                "
                                            >

                                                <td className="px-4 py-5 text-gray-400">
                                                    {index + 1}
                                                </td>

                                                {/* SCHOOL */}

                                                <td className="px-4 py-5">

                                                    <span
                                                        className="
                                                            rounded-full
                                                            border
                                                            border-blue-200
                                                            bg-blue-50
                                                            px-3
                                                            py-1
                                                            text-xs
                                                            font-medium
                                                            text-blue-600
                                                        "
                                                    >
                                                        {sub.semester}
                                                    </span>
                                                </td>

                                                {/* PROGRAM */}

                                                <td className="px-4 py-5">

                                                    <span
                                                        className="
                                                            rounded-full
                                                            px-3
                                                            py-1
                                                            text-xs
                                                            font-semibold
                                                        "
                                                        style={{
                                                            backgroundColor:
                                                                `${color}20`,

                                                            color,

                                                            border:
                                                                `1px solid ${color}55`,
                                                        }}
                                                    >
                                                        {
                                                            sub.subject_code
                                                        }
                                                    </span>
                                                </td>

                                                {/* BATCH */}

                                                <td
                                                    className="
                                                        whitespace-nowrap
                                                        px-4
                                                        py-5
                                                        font-semibold
                                                        text-gray-800
                                                    "
                                                >
                                                    {
                                                        sub.subject_name
                                                    }
                                                </td>

                                                {/* STUDENT COUNT */}

                                                <td
                                                    className="
                                                        whitespace-nowrap
                                                        px-4
                                                        py-5
                                                        text-gray-600
                                                        font-semibold
                                                    "
                                                >
                                                    {
                                                        sub.subject_type
                                                    }
                                                </td>

                                                {/* SEMESTER */}

                                                <td className="px-4 py-5 text-gray-600">
                                                    {
                                                        sub.credits
                                                    }
                                                </td>

                                                {/* ACTIONS */}

                                                <td className="px-4 py-5">

                                                    <div
                                                        className="
                                                            flex
                                                            items-center
                                                            justify-center
                                                            gap-4
                                                        "
                                                    >

                                                        <TooltipButton
                                                            onClick={() =>
                                                                openViewModal(
                                                                    sub
                                                                )
                                                            }
                                                            tooltip="View Students"
                                                            colorClass="text-blue-600"
                                                            hoverBg="hover:bg-blue-100"
                                                        >
                                                            <IconEye size={20} />
                                                        </TooltipButton>

                                                        <TooltipButton
                                                            onClick={() =>
                                                                openEditModal(
                                                                    sub
                                                                )
                                                            }
                                                            tooltip="Edit"
                                                            colorClass="text-amber-600"
                                                            hoverBg="hover:bg-amber-100"
                                                        >
                                                            <IconEdit size={20} />
                                                        </TooltipButton>

                                                        <TooltipButton
                                                            onClick={() =>
                                                                openDeleteModal(
                                                                    sub
                                                                )
                                                            }
                                                            disabled={
                                                                deleting ===
                                                                sub._id
                                                            }
                                                            tooltip="Delete"
                                                            colorClass="text-red-600"
                                                            hoverBg="hover:bg-red-100"
                                                        >
                                                            {
                                                                deleting ===
                                                                sub._id
                                                                    ? "..."
                                                                    : (
                                                                        <IconTrash size={20} />
                                                                    )
                                                            }
                                                        </TooltipButton>
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    )

                                ) : (

                                    <tr>

                                        <td
                                            colSpan={7}
                                            className="
                                                px-6
                                                py-16
                                                text-center
                                                text-gray-500
                                            "
                                        >
                                            No enrolled students found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* ================================================= */}
            {/* VIEW MODAL */}
            {/* ================================================= */}

            {showViewModal &&
                selectedSubject && (

                    <div
                        className="
                            fixed
                            inset-0
                            bg-black/40
                            backdrop-blur-sm
                            flex
                            justify-center
                            items-center
                            z-50
                            p-3
                        "
                    >

                        <div
                            className="
                                bg-white
                                w-full
                                max-w-4xl
                                rounded-2xl
                                shadow-xl
                                overflow-hidden
                            "
                        >

                            {/* HEADER */}

                            <div
                                className="
                                    px-5
                                    py-4
                                    text-white
                                    flex
                                    items-center
                                    justify-between
                                "
                                style={{
                                    background:
                                        `
                                        linear-gradient(
                                            to right,
                                            ${color},
                                            ${color}cc
                                        )
                                    `,
                                }}
                            >

                                <div>

                                    <h2
                                        className="
                                            text-base
                                            font-semibold
                                        "
                                    >
                                        Enrolled Students
                                    </h2>

                                    <p
                                        className="
                                            text-[11px]
                                            opacity-90
                                        "
                                    >
                                        {
                                            selectedSubject.semester
                                        }
                                        {" — "}
                                        {
                                            selectedSubject.subject_code
                                        }
                                    </p>
                                </div>

                                <button
                                    onClick={() =>
                                        setShowViewModal(
                                            false
                                        )
                                    }
                                    className="
                                        text-white/80
                                        hover:text-white
                                        text-sm
                                    "
                                >
                                    ✕
                                </button>
                            </div>

                            {/* TABLE */}

                            <div
                                className="
                                    px-5
                                    py-4
                                    max-h-[500px]
                                    overflow-y-auto
                                "
                            >

                                {selectedSubject.students
                                    ?.length > 0 ? (

                                    <table
                                        className="
                                            w-full
                                            text-sm
                                        "
                                    >

                                        <thead>

                                            <tr
                                                style={{
                                                    backgroundColor:
                                                        `${color}15`,
                                                }}
                                                className="text-left"
                                            >

                                                <th className="px-3 py-2 font-semibold text-gray-700">
                                                    S.No
                                                </th>

                                                <th className="px-3 py-2 font-semibold text-gray-700">
                                                    Name
                                                </th>

                                                <th className="px-3 py-2 font-semibold text-gray-700">
                                                    Roll No.
                                                </th>

                                                <th className="px-3 py-2 font-semibold text-gray-700">
                                                    Email
                                                </th>

                                                <th className="px-3 py-2 font-semibold text-gray-700">
                                                    Status
                                                </th>
                                            </tr>
                                        </thead>

                                        <tbody>

                                            {selectedSubject.students.map(
                                                (
                                                    student,
                                                    i
                                                ) => (

                                                    <tr
                                                        key={
                                                            student.id
                                                        }
                                                        className="
                                                            border-t
                                                            border-gray-100
                                                            hover:bg-gray-50
                                                        "
                                                    >

                                                        <td className="px-3 py-3 text-gray-400">
                                                            {i + 1}
                                                        </td>

                                                        <td className="px-3 py-3 font-medium text-gray-800">
                                                            {
                                                                student.name
                                                            }
                                                        </td>

                                                        <td className="px-3 py-3 text-gray-600">
                                                            {
                                                                student.roll
                                                            }
                                                        </td>

                                                        <td className="px-3 py-3 text-gray-500">
                                                            {
                                                                student.email
                                                            }
                                                        </td>

                                                        <td className="px-3 py-3">

                                                            <span
                                                                className={`
                                                                    px-2
                                                                    py-0.5
                                                                    rounded-full
                                                                    text-xs
                                                                    font-medium
                                                                    ${
                                                                        student.status ===
                                                                        "Active"
                                                                            ? "bg-green-50 text-green-600 border border-green-200"
                                                                            : "bg-red-50 text-red-500 border border-red-200"
                                                                    }
                                                                `}
                                                            >
                                                                {
                                                                    student.status
                                                                }
                                                            </span>
                                                        </td>
                                                    </tr>
                                                )
                                            )}
                                        </tbody>
                                    </table>

                                ) : (

                                    <div
                                        className="
                                            py-10
                                            text-center
                                        "
                                    >

                                        <p className="text-3xl mb-2">
                                            🎓
                                        </p>

                                        <p
                                            className="
                                                text-gray-500
                                                text-sm
                                            "
                                        >
                                            No students enrolled yet.
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* FOOTER */}

                            <div
                                className="
                                    px-5
                                    py-3
                                    bg-gray-50
                                    flex
                                    justify-end
                                "
                            >

                                <button
                                    onClick={() =>
                                        setShowViewModal(
                                            false
                                        )
                                    }
                                    className="
                                        px-4
                                        py-1.5
                                        text-white
                                        rounded-md
                                        text-xs
                                        font-medium
                                    "
                                    style={{
                                        backgroundColor:
                                            color,
                                    }}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}
        </div>
    );
}