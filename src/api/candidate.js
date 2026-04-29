// src/api/candidate.js
import api from "./axios";

// ✅ Create candidate
export async function createCandidate(payload) {
  const res = await api.post("/candidates", payload);
  return res.data;
}

// ✅ Get all candidates
export async function getCandidates() {
  const res = await api.get("/candidates");
  return res.data;
}

// ✅ Upload resumes
export async function uploadResumes(files) {
  const formData = new FormData();

  files.forEach((file) => {
    formData.append("resumes", file);
  });

  const res = await api.post("/candidates/upload/resume", formData);
  return res.data;
}

// ✅ Upload CSV
export async function uploadCsv(file) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await api.post("/candidates/upload/csv", formData);
  return res.data;
}

// ✅ Match JD
export async function matchJD(file) {
  const formData = new FormData();
  formData.append("jd", file);

  const res = await api.post("/candidates/match/jd", formData);
  return res.data;
}

// ✅ Get upload job status
export async function getJobStatus(jobId) {
  const res = await api.get(`/candidates/upload/jobs/${jobId}`);
  return res.data;
}