export const STAGES = {
  CHOOSE:     "choose",
  INPUT:      "input",
  GENERATING: "generating",
  EDITOR:     "editor",
};

/** All possible generation steps (label shown in the spinner UI) */
export const ALL_STEPS = [
  { key: "starting",                  label: "Starting job"              },
  { key: "extracting_question_bank",  label: "Extracting question bank"  },
  { key: "extracting_course_planner", label: "Extracting course planner" },
  { key: "generating_paper",          label: "Generating paper with AI"  },
  { key: "building_docx",             label: "Building DOCX"             },
  { key: "uploading",                 label: "Uploading document"        },
  { key: "done",                      label: "Finishing up"              },
];