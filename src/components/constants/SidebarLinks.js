import React from "react";

import {
  IconHome,
  IconReceipt2,
  IconHistory,
  IconUserPlus,
  IconBuilding,
  IconUsers,
  IconInbox,
  IconBook2,
  IconFileDescription,
  IconPlus,
  IconFileUpload,
  IconSettings,
  IconUpload,
  IconClipboardCheck,
  IconDeviceFloppy,
  IconArchive,
  IconBrain,
  IconBooks,
  IconMessageChatbot,
  IconCalendarEvent,
  IconChartBar,
  IconBell,
  IconClock,
  IconTarget,
  IconTrophy,
  IconNotebook,
  IconFileAnalytics,
  IconSchool,
  IconChecklist,
  IconVideo,
  IconMessage,
  IconBulb,
  IconClipboardText,
  IconRobot,
  IconAlarm,
  IconBookUpload,
  IconChartPie,
  IconMessageCircle,
  IconCertificate
} from "@tabler/icons-react";
export const ROLES = {
  SUPER_ADMIN: 1,
  INSTITUTE_ADMIN: 2,
  FACULTY: 3,
  INSTITUTE_STUDENT: 4,
  TUTOR: 5,
  TUTOR_STUDENT: 6,
  SELF_LEARNER: 7,
};

export const getSidebarLinks = (role, user, t) => {
  return [

    // ================= SUPER ADMIN =================
    ...(role === ROLES.SUPER_ADMIN
      ? [
        {
          label: "Dashboard",
          href: "/super-admin/dashboard",
          icon: <IconHome />,
        },
        {
          label: "Billing",
          href: "/super-admin/billing",
          icon: <IconReceipt2 />,
        },
        {
          label: "Payment History",
          href: "/super-admin/payment-history",
          icon: <IconHistory />,
        },
        {
          label: "Create Account",
          href: "/super-admin/create-account",
          icon: <IconUserPlus />,
        },
        {
          label: "Inquiries",
          href: "/super-admin/query-management",
          icon: <IconInbox />,
        },
      ]
      : []),

    // ================= INSTITUTE ADMIN =================
    ...(role === ROLES.INSTITUTE_ADMIN
      ? [
        {
          label: "Dashboard",
          href: "/admin/dashboard",
          icon: <IconHome />,
        },

        {
          label: "Schools & Departments",
          href: "/admin/school",
          icon: <IconBuilding />,
        },

        {
          label: "Faculty",
          href: "/admin/faculty",
          icon: <IconUsers />,
        },
        {
          label: "Academic Results",
          href: "/admin/academicResults",
          icon: <IconUserPlus />,
        },
        {
          label: "Academic Transcript",
          href: "/admin/academic-transcript",
          icon: <IconCertificate />,
        },
        {
          label: "Relative Grading",
          href: "/admin/relativeGrades",
          icon: <IconChartBar />,
        },

        {
          label: "Enroll",
          href: "/admin/enroll",
          icon: <IconUserPlus />,
        },


        ...(user?.hasCOAccess
          ? [
            {
              label: "Course Outcome",
              href: "/admin/co",
              icon: <IconChecklist />,
            },
          ]
          : []),
      ]
      : []),

    // ================= FACULTY =================
    ...(role === ROLES.FACULTY
      ? [
        {
          label: "Dashboard",
          href: "/faculty/dashboard",
          icon: <IconHome />,
        },

        {
          label: "Subjects",
          href: "/faculty/subjects",
          icon: <IconBook2 />,
        },
        {
          label: "Academics",
          href: "/faculty/academics",
          icon: <IconSchool />,
        },
        ...(user?.hasQPGAccess
          ? [
            {
              label: "Generate Question Paper",
              href: "/faculty/create-question-paper",
              icon: <IconChecklist />,
            },
          ]
          : []),
        {
          label: "Exams",
          icon: <IconFileDescription />,
          defaultHref: "/faculty/exam-details",
          children: [
            {
              label: "Exam Details",
              href: "/faculty/exam-details",
              icon: <IconFileDescription />,
            },
            {
              label: "Create Exam",
              href: "/faculty/new-uploads-form",
              icon: <IconPlus />,
            },
            {
              label: "Upload Question Paper",
              href: "/faculty/paper-upload-form",
              icon: <IconFileUpload />,
            },
            {
              label: "Evaluation Parameters",
              href: "/faculty/evaluation-parameter",
              icon: <IconSettings />,
            },
            {
              label: "Upload Answer Scripts",
              href: "/faculty/answer-script-upload",
              icon: <IconUpload />,
            },
            {
              label: "Evaluate Answers",
              href: "/faculty/evaluate-answer-script",
              icon: <IconClipboardCheck />,
            },
          ],
        },
        ...(user?.hasCOAccess
          ? [
            {
              label: "Course Outcome",
              href: "/faculty/co",
              icon: <IconChecklist />,
            },
          ]
          : []),
        {
          label: "Results",
          icon: <IconDeviceFloppy />,
          defaultHref: "/faculty/new-saved",
          children: [
            {
              label: "Saved Results",
              href: "/faculty/new-saved",
              icon: <IconDeviceFloppy />,
            },
            {
              label: "Import Marks Excel",
              href: "/faculty/import-marks-excel",
              icon: <IconFileUpload />,
            },
            {
              label: "Archive Results",
              href: "/faculty/new-archive",
              icon: <IconArchive />,
            },
          ],
        },
      ]
      : []),

    // ================= INSTITUTE STUDENT =================
    ...(role === ROLES.INSTITUTE_STUDENT
      ? [
        {
          label: "Dashboard",
          href: "/institute-student/dashboard",
          icon: <IconHome />,
        },
        {
          label: "Enroll",
          href: "/institute-student/enroll",
          icon: <IconHome />,
        },
        {
          label: "Academics",
          icon: <IconSchool />,
          href: "/institute-student/academics",
        },

        {
          label: "Result",
          icon: <IconClipboardText />,
          href: "/institute-student/results",
        },
      ]
      : []),

    ...(role === ROLES.TUTOR
      ? [
        {
          label: "Dashboard",
          href: "/tutor/dashboard",
          icon: <IconHome />,
        },

        {
          label: "Courses",
          icon: <IconBooks />,
          defaultHref: "/tutor/courses",
          children: [
            {
              label: "All Courses",
              href: "/tutor/courses",
              icon: <IconBooks />,
            },
            {
              label: "Create Course",
              href: "/tutor/courses/create-course",
              icon: <IconPlus />,
            },
            {
              label: "Update Course",
              href: "/tutor/courses/update-course",
              icon: <IconSettings />,
            },
          ],
        },

        {
          label: "Enrolled Students",
          href: "/tutor/enrolledStudents",
          icon: <IconUsers />,
        },

        {
          label: "Batches",
          icon: <IconSchool />,
          href: "/tutor/batches",
        },
        {
          label: "Demo Classes",
          icon: <IconSchool />,
          href: "/tutor/demo-classes",
        },
      ]
      : []),

    ...(role === ROLES.TUTOR_STUDENT
      ? [
        {
          label: "Dashboard",
          href: "/student/dashboard",
          icon: <IconHome />,
        },

        {
          label: "Courses",
          href: "/student/courses",
          icon: <IconBooks />,
        },

        {
          label: "Demo Class",
          href: "/student/demo-class",
          icon: <IconVideo />,
        },

        {
          label: "My Batch",
          icon: <IconSchool />,
          defaultHref: "/student/my-batch",
          children: [
            {
              label: "All Batches",
              href: "/student/my-batch",
              icon: <IconSchool />,
            },
            {
              label: "Analytics",
              href: "/student/my-batch/[batchId]/analytics",
              icon: <IconChartBar />,
            },
            {
              label: "Live Session",
              href: "/student/my-batch/[batchId]/live-session",
              icon: <IconVideo />,
            },
            {
              label: "Recorded Sessions",
              href: "/student/my-batch/[batchId]/recorded-sessions",
              icon: <IconVideo />,
            },
            {
              label: "Notes",
              href: "/student/my-batch/[batchId]/notes",
              icon: <IconNotebook />,
            },
            {
              label: "Assignments",
              href: "/student/my-batch/[batchId]/assignment",
              icon: <IconClipboardText />,
            },
            {
              label: "Tests",
              href: "/student/my-batch/[batchId]/test",
              icon: <IconChecklist />,
            },
            {
              label: "Doubts",
              href: "/student/my-batch/[batchId]/doubts",
              icon: <IconBulb />,
            },
          ],
        },

      ]
      : []),

    ...(role === ROLES.SELF_LEARNER
      ? [
        {
          label: "Dashboard",
          href: "/self-learner/dashboard",
          icon: <IconHome />,
        },

        {
          label: "Roadmap",
          href: "/self-learner/roadmap",
          icon: <IconTarget />,
        },

        {
          label: "Learning Lounge",
          href: "/self-learner/learning-lounge",
          icon: <IconClock />,
        },

        {
          label: "Self-Review",
          icon: <IconMessageChatbot />,
          defaultHref: "/self-learner/self-review",
          children: [
            {
              label: "Notes Generate",
              href: "/self-learner/self-review/notes-generate",
              icon: <IconNotebook />,
            },
            {
              label: "Homework Help",
              href: "/self-learner/self-review/homework-help",
              icon: <IconBulb />,
            },
            {
              label: "Weekly Quiz",
              href: "/self-learner/self-review/week-quiz",
              icon: <IconClipboardCheck />,
            },
          ],
        },

        {
          label: "Test Engine",
          icon: <IconChecklist />,
          defaultHref: "/self-learner/test-engine",
          children: [
            {
              label: "Create Test",
              href: "/self-learner/test-engine/create-test",
              icon: <IconPlus />,
            },
            {
              label: "Evaluate Yourself",
              href: "/self-learner/test-engine/test-yourself",
              icon: <IconClipboardCheck />,
            },
          ],
        },

        {
          label: "Analytics",
          href: "/self-learner/analytics",
          icon: <IconChartBar />,
        },

      ]
      : []),
  ];
};
