// Canonical product FAQ. Content mirrors
// .codex-gradelytics/output/Gradelytics_Product_FAQ_A4_Portrait.pdf, plus
// a "Data & security" and an "Evaluation accuracy & limitations" section
// answering questions raised in live demos (30 questions, 7 sections).
// Replaced the original hand-written 18-question set, archived as old_faq.pdf.
// Every answer here is checked against what the system actually does and
// against the Terms / Privacy Policy pages.

export const faqSections = [
  {
    section: "The platform",
    blurb: "What Gradelytics is and the value it creates",
    items: [
      {
        q: "What is Gradelytics?",
        a: "Gradelytics is an AI-assisted education platform that connects academic administration, teaching, assessment and personalized learning. It brings question-paper generation, answer-script evaluation, course materials, results, transcripts, outcome analysis, learning roadmaps and practice into one coordinated platform.",
      },
      {
        q: "Who can use Gradelytics?",
        a: "The platform supports Institute Administrators, Faculty, Institute Students and independent Self-Learners. Role-based access gives each person the tools and information relevant to their responsibilities.",
      },
      {
        q: "Does Gradelytics replace teachers?",
        a: "No. It works as an academic assistant. AI can prepare drafts, suggestions, explanations and preliminary evaluations, while educators retain responsibility for teaching decisions, feedback, marks and final approval.",
      },
    ],
  },
  {
    section: "Data & security",
    blurb: "Where your academic data lives and who can reach it",
    items: [
      {
        q: "Who can see our institution's data?",
        a: "Only people inside your institution, and only what their role lets them see. Your data is walled off from every other institution on the platform. No outside institution, faculty or student can reach it.",
      },
      {
        q: "Who owns the academic data?",
        a: "You do. Student records, submissions, marks, results and transcripts belong to your institution and the people they concern. Gradelytics only processes that data to run the service. We do not own it, and neither do the AI services we use to process it. We may use de-identified, aggregated data to operate and improve the service, as set out in the Privacy Policy.",
      },
      {
        q: "Is student data shared with third parties?",
        a: "Only with the services needed to actually run the evaluation. ImageKit stores the uploaded scripts and reports, Google's Gemini reads the handwriting into text, and Anthropic's Claude grades it. On the paid plans we use, none of them train their models on your content, none of it is sold, and it is kept only briefly for security checks. Nothing goes anywhere else. Full details are in the Privacy Policy.",
      },
    ],
  },
  {
    section: "Time-saving assessment",
    blurb: "How faculty move from preparation to reviewed results faster",
    items: [
      {
        q: "How does Gradelytics save time?",
        a: "It reduces repetitive work across question-paper preparation, answer-script checking, feedback, marks management, results, transcripts and CO-PO analysis. Instead of rebuilding each step in separate tools, faculty and administrators work through connected academic workflows.",
      },
      {
        q: "How does question-paper generation save time?",
        a: "Faculty provide the subject, syllabus, difficulty, marks distribution, question types and other requirements. Gradelytics prepares a structured draft that can be reviewed, edited, regenerated and finalized, reducing the time spent writing, balancing and formatting every question manually.",
      },
      {
        q: "How does AI-assisted copy checking save time?",
        a: "For uploaded answer scripts, Gradelytics can prepare suggested marks, answer-level feedback, reasons for deductions and identification of incomplete or incorrect responses. This gives faculty a structured first review instead of starting every script from zero.",
      },
      {
        q: "Can faculty change AI-generated marks or feedback?",
        a: "Yes. Faculty review the generated evaluation and can correct marks or feedback before finalization. AI accelerates the initial work; faculty remain the academic decision-makers.",
      },
      {
        q: "What if an AI output is unsuitable?",
        a: "The user can regenerate content, choose another option or edit the result manually. High-impact outputs such as question papers, evaluations, marks, results and transcripts should always be reviewed by an authorized person.",
      },
    ],
  },
  {
    section: "Evaluation accuracy & limitations",
    blurb: "What the AI can and cannot judge, and how faculty stay in control",
    items: [
      {
        q: "Can Gradelytics get an evaluation wrong? What causes it, and how do we fix it?",
        a: "Yes, it can. It does not predict future scores; it works only from what is actually on the page. Even so, the first attempt at an evaluation can be off if the handwriting is hard to read, the answer is unusual or ambiguous, it leans on a diagram the system cannot judge, or the rubric is thin. That is why nothing is final until a faculty member has checked it. They can adjust the marks, override any question, or re-run the whole evaluation.",
      },
      {
        q: "How are diagrams, formulas, graphs and ruled tables handled?",
        a: "It grades from the text of the answer. Formulas and step by step working written out in text are read and marked against the rubric, and it will dock marks for missing steps or derivations the rubric asks for. Diagrams and graphs work differently. The system notes that one is present and can flag when a required diagram is missing, but it does not judge whether the drawing itself is right. For that, add a manual parameter and let faculty score it.",
      },
      {
        q: "If the handwriting is misread, can faculty correct it?",
        a: "Faculty correct it at the marks stage, not before. The system transcribes the handwriting as it is, without quietly rewriting what the student wrote, and it does not show faculty that raw transcription to edit. What faculty do get is the full result: every question's marks, the score for each parameter, and the feedback, all of which they can change or override before finalising.",
      },
      {
        q: "For parameters like logical reasoning or creativity, what does the AI actually look at? Does it learn from our examples?",
        a: "It goes by whatever your faculty put in the rubric. For each question the AI gets the question, the student's answer, and your rubric: the parameters and their weights, any guidelines you have written, and the course outcomes. It scores the answer against those, not by hunting for keywords. There is no fixed idea of 'reasoning' or 'creativity' built in; it assesses exactly what your rubric describes. It also does not learn from your data. Every evaluation is judged fresh against the rubric you set.",
      },
      {
        q: "How does handwriting quality affect results?",
        a: "Neat handwriting transcribes well. Cursive, light pen pressure, smudges and heavy crossing out make it harder, which is part of why every evaluation gets a faculty review. The best way to know how it will do with your students is a short pilot on a sample of your own scripts.",
      },
    ],
  },
  {
    section: "Learning experience",
    blurb: "Structured, personalized support for independent learners",
    items: [
      {
        q: "What is the Self-Learner module?",
        a: "It provides a personalized learning journey based on the learner's subject, current knowledge, goal, available study time, preferred learning style and selected difficulty. It includes roadmaps, guided lessons, practice, mock tests, progress tracking, analytics and AI-assisted doubt resolution.",
      },
      {
        q: "How are learning roadmaps created?",
        a: "Gradelytics converts the learner's course, level, outcome and schedule into a week-by-week sequence of topics and subtopics. The roadmap makes the next learning step clear and helps learners work toward a defined goal.",
      },
      {
        q: "What is the Learning Lounge?",
        a: "The Learning Lounge turns roadmap topics into focused sessions using clear explanations, worked examples, visual representations, structured tables or grids, interactive activities, practice questions, knowledge checks and real-world connections when appropriate.",
      },
      {
        q: "Is the platform limited to computer science?",
        a: "No. Gradelytics can support technical and non-technical subjects, including engineering, business, marketing and management. The learning format changes with the topic — for example, code traces for programming or scenarios, funnels and case-based questions for marketing.",
      },
      {
        q: "Does every learner receive identical content?",
        a: "Not necessarily. Self-learning content can reflect the selected topic, difficulty, learning preferences, roadmap position and progress, creating a more relevant experience than a single fixed set of notes.",
      },
    ],
  },
  {
    section: "Academic operations",
    blurb: "Connected workflows for faculty and institutions",
    items: [
      {
        q: "How does Gradelytics help Institute Administrators?",
        a: "Administrators can manage academic structure and users — including schools, programmes, departments, batches, subjects, faculty and student enrollment — and oversee grading, results, transcripts and outcome-related academic information.",
      },
      {
        q: "Can faculty manage course materials?",
        a: "Yes. Faculty can organize and provide materials for assigned subjects, while eligible students can access the resources made available for their courses.",
      },
      {
        q: "Does Gradelytics support results and transcripts?",
        a: "Yes. Institutional workflows cover marks, academic results, grading and transcripts. The exact screens and actions available depend on the user's role and the academic information configured by the institution.",
      },
      {
        q: "Does it support CO-PO and outcome analysis?",
        a: "Yes. Gradelytics includes Course Outcomes, Programme Outcomes, CO-PO mapping, attainment and performance-analysis workflows. These help institutions organize outcome-based education information and review it more efficiently.",
      },
      {
        q: "How does Gradelytics help students?",
        a: "Institute Students can use the academic resources and features made available to their account. Self-Learners can additionally build roadmaps, study guided lessons, complete practice activities and monitor their progress.",
      },
    ],
  },
  {
    section: "Responsible use & support",
    blurb: "Keeping academic decisions controlled and dependable",
    items: [
      {
        q: "Can generated content be used without review?",
        a: "Learning content can support study, but important academic outputs must be reviewed. Question papers, evaluations, marks, results and transcripts should be finalized only by authorized faculty or administrators.",
      },
      {
        q: "How is access controlled?",
        a: "Gradelytics uses role-based access. Institute Administrators, Faculty, Institute Students and Self-Learners receive different dashboards and permissions. Users should keep credentials private and report unauthorized access immediately.",
      },
      {
        q: "What should a user do if an AI feature fails?",
        a: "Retry once after checking the internet connection. If the issue continues, record the page, action, time and visible error message, then contact the institution administrator or technical support team. Avoid repeatedly submitting the same request while it is processing.",
      },
      {
        q: "What is the best way to use Gradelytics?",
        a: "Use it to accelerate preparation, organize evidence, guide learning and support decisions — not to remove professional judgment. The strongest results come from accurate academic inputs, careful review and consistent institutional processes.",
      },
    ],
  },
];
