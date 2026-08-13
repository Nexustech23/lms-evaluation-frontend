import axios from "axios";

const BASE_URL = "/api/self-learner/roadmap";

const roadmapClient = axios.create({
  withCredentials: true,
});

function normalizeError(error) {
  if (error?.response?.status === 401) {
    const authError = new Error("Your session has expired. Please log in again.");
    authError.status = 401;
    authError.response = error.response;
    throw authError;
  }

  throw error;
}

async function request(call) {
  try {
    const res = await call();
    return res.data;
  } catch (error) {
    normalizeError(error);
  }
}

// ─── Pre-Assessment Quiz ──────────────────────────────────────────────────────

/**
 * Generate 10 beginner-level MCQ questions for the given subject.
 * Used by SkillAssessmentModal before roadmap creation.
 *
 * @param {string} subject
 * @returns {{ questions: Array<{ question: string, options: string[], answer: number }> }}
 */
export async function getPreAssessmentQuiz(subject) {
  return request(() => roadmapClient.post(`${BASE_URL}/assess`, { subject }));
}

// ─── Course Material Upload (optional grounding document at creation) ────────

/**
 * Upload a syllabus/textbook to ground a NEW roadmap in real content.
 * Poll getCourseMaterialUploadStatus(job_id) until status === "done" — parsing
 * a large document (and rate-limited embedding for unstructured textbooks)
 * is too slow to do inline in the upload request.
 *
 * @param {File} file
 * @param {string} subject - used as course_title for the subject-match lookup
 * @returns {{ job_id: string, status: string }}
 */
export async function uploadCourseMaterial(file, subject) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("course_title", subject);

  return request(() => roadmapClient.post(
    "/api/self-learner/course-material",
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  ));
}

/**
 * Poll course material upload/processing job status.
 * @param {string} jobId
 * @returns {{ status: "processing"|"done"|"error", doc_id?: string, doc_type?: string, error?: string, step?: string }}
 */
export async function getCourseMaterialUploadStatus(jobId) {
  return request(() => roadmapClient.get(`/api/self-learner/course-material/status/${jobId}`));
}

// ─── Roadmap CRUD ─────────────────────────────────────────────────────────────

/**
 * Fetch all roadmaps for the current user.
 */
export async function getRoadmaps() {
  return request(() => roadmapClient.get(BASE_URL));
}

/**
 * Fetch a single roadmap by ID.
 */
export async function getRoadmapById(id) {
  return request(() => roadmapClient.get(`${BASE_URL}/${id}`));
}

/**
 * Start a new AI-generated roadmap (background job). The AI decides the
 * week count itself based on subject scope and daily study time.
 * Returns immediately with { job_id, status: "processing" }.
 * Poll getRoadmapCreationStatus(job_id) until status === "done".
 *
 * @param {Object} data - { subject, goal, skill_level, daily_study_time, revision_frequency, assessment_score? }
 * @returns {{ job_id: string, status: string }}
 */
export async function createRoadmap(data) {
  return request(() => roadmapClient.post(BASE_URL, data));
}

/**
 * Poll roadmap creation job status.
 * @param {string} jobId
 * @returns {{ status: "processing"|"done"|"error", roadmap_id?: string, error?: string, step?: string }}
 */
export async function getRoadmapCreationStatus(jobId) {
  return request(() => roadmapClient.get(`${BASE_URL}/status/${jobId}`));
}

// ─── Progress tracking ────────────────────────────────────────────────────────

/**
 * Mark a subtopic as complete or incomplete.
 * subtopicKey format: "<week>-<subtopicIdx>-<subtopicTitle>"
 */
export async function updateSubtopicProgress(roadmapId, subtopicKey, completed) {
  return request(() => roadmapClient.patch(
    `${BASE_URL}/${roadmapId}/subtopic`,
    { subtopic_key: subtopicKey, completed }
  ));
}

// ─── AI Study Notes (on-demand) ───────────────────────────────────────────────

/**
 * Fetch AI-generated study notes for a specific subtopic, personalized to a
 * VARK % blend + difficulty. Notes are cached server-side per
 * "<DominantStyle>-<Difficulty>" combo — the first call for a given combo
 * generates via Claude (~5-10s), subsequent calls for the same combo return
 * instantly from cache. A different blend/difficulty gets its own slot.
 *
 * @param {string} roadmapId
 * @param {number} week        - Week number (1-based)
 * @param {number} subtopicIdx - 0-based subtopic index within the week
 * @param {Object} vark        - { visual, auditory, reading, kinesthetic } (0-100 each)
 * @param {string} difficulty  - "Easy" | "Moderate" | "Difficult"
 * @param {boolean} regenerate - bypass cache and force a fresh generation
 * @returns {{ notes: object, cached: boolean, style: string, difficulty: string }}
 */
export async function fetchSubtopicNotes(roadmapId, week, subtopicIdx, vark, difficulty, regenerate = false) {
  return request(() => roadmapClient.get(`${BASE_URL}/${roadmapId}/notes`, {
    params: {
      week,
      subtopic_idx: subtopicIdx,
      visual: vark?.visual ?? 25,
      auditory: vark?.auditory ?? 25,
      reading: vark?.reading ?? 25,
      kinesthetic: vark?.kinesthetic ?? 25,
      difficulty: difficulty || "Moderate",
      regenerate,
    },
  }));
}

// ─── AI Learning Resources (on-demand — real YouTube/Wikipedia/arXiv links) ──

/**
 * Fetch real external learning resources (video/reading/paper) for a
 * subtopic. Unlike notes, NOT personalized by VARK/difficulty — cached once
 * per subtopic. The AI only ever picks among real search results by index;
 * it never writes a URL, so a link can never be hallucinated.
 *
 * @param {string} roadmapId
 * @param {number} week
 * @param {number} subtopicIdx
 * @param {boolean} regenerate - bypass cache and force a fresh fetch
 * @returns {{ resources: {video: Array, reading: Array, paper: Array, generatedAt?: string}, cached: boolean }}
 */
export async function fetchLearningResources(roadmapId, week, subtopicIdx, regenerate = false) {
  return request(() => roadmapClient.get(`${BASE_URL}/${roadmapId}/resources`, {
    params: { week, subtopic_idx: subtopicIdx, regenerate },
  }));
}

// ─── AI Practice Questions (on-demand, self-check only — not scored) ─────────

/**
 * Fetch 10 self-check practice questions for ONE subtopic (not the whole
 * week) — generated automatically the moment that subtopic is marked
 * complete. Never scored, never gates unlock — cached server-side per
 * subtopic once generated.
 *
 * @param {string} roadmapId
 * @param {number} week
 * @param {number} subtopicIdx
 * @returns {{ questions: Array, cached: boolean }}
 */
export async function fetchPracticeQuestions(roadmapId, week, subtopicIdx) {
  return request(() => roadmapClient.get(`${BASE_URL}/${roadmapId}/practice`, {
    params: { week, subtopic_idx: subtopicIdx },
  }));
}

/**
 * Submit a written answer to a theoretical practice question for AI feedback.
 * Not scored, not saved — just a live self-check.
 *
 * @param {string} roadmapId
 * @param {number} week
 * @param {number} subtopicIdx
 * @param {number} questionIdx - index of the question within that subtopic's practice set
 * @param {string} studentAnswer
 * @returns {{ verdict: "correct"|"partially_correct"|"incorrect", feedback: string, modelAnswer: string }}
 */
export async function evaluatePracticeAnswer(roadmapId, week, subtopicIdx, questionIdx, studentAnswer) {
  return request(() => roadmapClient.post(`${BASE_URL}/${roadmapId}/practice/evaluate`, {
    week,
    subtopic_idx: subtopicIdx,
    question_idx: questionIdx,
    student_answer: studentAnswer,
  }));
}

// ─── Auto Test (configurable MCQ/Subjective/Practical mix) ────────────────────

/**
 * Configure and generate a new Auto Test for a week — always generates
 * fresh (never cached long-term like notes), since the student reconfigures
 * percentages/count/prompt on every attempt. Questions come back with
 * answer/modelAnswer/explanation stripped until after submission.
 *
 * @param {string} roadmapId
 * @param {number} week
 * @param {Object} config - { mcqPercent, subjectivePercent, practicalPercent, questionCount, customPrompt? }
 * @returns {{ questions: Array, config: object }}
 */
export async function generateAutoTest(roadmapId, week, config) {
  return request(() => roadmapClient.post(`${BASE_URL}/${roadmapId}/quiz/generate`, {
    week,
    mcq_percent: config.mcqPercent,
    subjective_percent: config.subjectivePercent,
    practical_percent: config.practicalPercent,
    question_count: config.questionCount,
    custom_prompt: config.customPrompt || null,
  }));
}

/**
 * Resume-only — returns the active (not yet submitted) Auto Test for a week
 * if one was already generated, or { questions: null, config: null } if
 * not. Never generates on its own.
 *
 * @param {string} roadmapId
 * @param {number} week - Week number (1-based)
 * @returns {{ questions: Array|null, config: object|null }}
 */
export async function resumeAutoTest(roadmapId, week) {
  return request(() => roadmapClient.get(`${BASE_URL}/${roadmapId}/quiz`, {
    params: { week },
  }));
}

/**
 * Fetch previous quiz attempts for this roadmap.
 */
export async function fetchQuizHistory(roadmapId) {
  return request(() => roadmapClient.get(`${BASE_URL}/${roadmapId}/quiz/history`));
}

/**
 * Submit Auto Test answers for backend grading. MCQ graded by exact match;
 * Subjective/Practical graded by AI (partial credit, 0-100) in one batched
 * call. Unlocks next week on pass (>= 50% mean score).
 *
 * @param {string} roadmapId
 * @param {number} week
 * @param {Object} answers - { "0": optIdx, "1": "free text answer", ... } (string keys — 0-based
 *   option index for MCQ questions, free-text string for Subjective/Practical)
 * @returns {{
 *   score: number,
 *   passed: boolean,
 *   correctCount: number,
 *   totalQuestions: number,
 *   nextWeekUnlocked: boolean,
 *   weakTopics: string[],
 *   results: Array,
 *   roadmap: object
 * }}
 */
export async function submitWeekQuiz(roadmapId, week, answers) {
  return request(() => roadmapClient.post(
    `${BASE_URL}/${roadmapId}/quiz/submit`,
    { week, answers }
  ));
}

// ─── PDF Export ─────────────────────────────────────────────────────────────

/**
 * Download the roadmap as a PDF and trigger a browser save. Doesn't go
 * through the shared request() helper since this needs a blob response
 * type, not JSON.
 */
export async function downloadRoadmapPdf(roadmapId) {
  try {
    const res = await roadmapClient.get(`${BASE_URL}/${roadmapId}/pdf`, {
      responseType: "blob",
    });

    const disposition = res.headers["content-disposition"] || "";
    const match = disposition.match(/filename="?([^"]+)"?/);
    const filename = match ? match[1] : "roadmap.pdf";

    const url = window.URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    normalizeError(error);
  }
}
