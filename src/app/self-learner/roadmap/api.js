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
 * Start a new AI-generated roadmap (background job).
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
 */
export async function updateSubtopicProgress(roadmapId, subtopicKey, completed) {
  return request(() => roadmapClient.patch(
    `${BASE_URL}/${roadmapId}/subtopic`,
    { subtopic_key: subtopicKey, completed }
  ));
}

// ─── AI Study Notes (on-demand) ───────────────────────────────────────────────

/**
 * Fetch AI-generated study notes for a specific subtopic.
 * If notes are not cached in the DB, Claude generates them (first call may be slow ~5s).
 * Subsequent calls return instantly from the cache.
 *
 * @param {string} roadmapId
 * @param {number} level       - Stage number (1–4)
 * @param {number} topicIdx    - 0-based topic index within the stage
 * @param {number} subtopicIdx - 0-based subtopic index within the topic
 * @returns {{ notes: object, cached: boolean }}
 */
export async function fetchSubtopicNotes(roadmapId, level, topicIdx, subtopicIdx) {
  return request(() => roadmapClient.get(`${BASE_URL}/${roadmapId}/notes`, {
    params: { level, topic_idx: topicIdx, subtopic_idx: subtopicIdx },
  }));
}

// ─── AI Stage Quiz (on-demand) ────────────────────────────────────────────────

/**
 * Fetch AI-generated stage quiz questions.
 * If the quiz is not cached, Claude generates 10 MCQ questions (first call may be slow ~5s).
 *
 * @param {string} roadmapId
 * @param {number} level - Stage number (1–4)
 * @returns {{ quiz: Array, cached: boolean }}
 */
export async function fetchStageQuiz(roadmapId, level) {
  return request(() => roadmapClient.get(`${BASE_URL}/${roadmapId}/quiz`, {
    params: { level },
  }));
}

/**
 * Fetch previous quiz attempts for this roadmap.
 */
export async function fetchQuizHistory(roadmapId) {
  return request(() => roadmapClient.get(`${BASE_URL}/${roadmapId}/quiz/history`));
}

/**
 * Submit quiz answers for backend grading.
 * The backend validates answers, calculates score, unlocks next level on pass (>= 70%).
 *
 * @param {string} roadmapId
 * @param {number} level
 * @param {Object} answers - { "0": optIdx, "1": optIdx, ... } (string keys, 0-based option indices)
 * @returns {{
 *   score: number,
 *   passed: boolean,
 *   correctCount: number,
 *   totalQuestions: number,
 *   nextLevelUnlocked: boolean,
 *   weakTopics: string[],
 *   results: Array,
 *   roadmap: object
 * }}
 */
export async function submitStageQuiz(roadmapId, level, answers) {
  return request(() => roadmapClient.post(
    `${BASE_URL}/${roadmapId}/quiz/submit`,
    { level, answers }
  ));
}
