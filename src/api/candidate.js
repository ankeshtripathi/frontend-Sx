// src/api/candidate.js
import api, { unwrapApiData } from "./axios";

export async function createCandidate(payload) {
  const res = await api.post("/candidates", payload);
  return unwrapApiData(res);
}

/**
 * List candidates with server pagination and filters.
 * @param {Record<string, unknown>} [params] — page, limit, search, location, skills, etc.
 * @returns {Promise<{ items: object[], pagination: { page, limit, total, totalPages } }>}
 */
export async function getCandidates(params = {}) {
  const res = await api.get("/candidates", { params: stripEmptyParams(params) });
  return unwrapApiData(res);
}

export async function deleteCandidate(id) {
  const res = await api.delete(`/candidates/${id}`);
  return unwrapApiData(res);
}

function stripEmptyParams(raw) {
  const out = {};
  for (const [k, v] of Object.entries(raw)) {
    if (v === undefined || v === null || v === "") continue;
    out[k] = v;
  }
  return out;
}

export async function uploadResumes(files) {
  const formData = new FormData();

  files.forEach((file) => {
    formData.append("resumes", file);
  });

  const res = await api.post("/candidates/upload/resume", formData);
  return unwrapApiData(res);
}

export async function uploadCsv(file) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await api.post("/candidates/upload/csv", formData);
  return unwrapApiData(res);
}

/**
 * Match candidates against an uploaded JD file (no persisted job).
 * @param {File} file
 * @param {{ topK?: number, skills?: string }} [options]
 */
export async function matchJD(file, options = {}) {
  const formData = new FormData();
  formData.append("jd", file);
  if (options.topK != null && options.topK !== "") {
    formData.append("topK", String(options.topK));
  }
  if (options.skills != null && String(options.skills).trim() !== "") {
    formData.append("skills", String(options.skills).trim());
  }

  const res = await api.post("/candidates/match/jd", formData);
  return unwrapApiData(res);
}

export async function getJobStatus(jobId) {
  const res = await api.get(`/candidates/upload/jobs/${jobId}`);
  return unwrapApiData(res);
}

export async function getActiveResumeUploadJob() {
  const res = await api.get("/candidates/upload/jobs/active");
  return unwrapApiData(res);
}