// src/api/candidate.js
import api, { unwrapApiData } from "./axios";

export async function createCandidate(payload) {
  const res = await api.post("/candidates", payload);
  return unwrapApiData(res);
}

export async function getCandidates() {
  const res = await api.get("/candidates");
  return unwrapApiData(res);
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

export async function matchJD(file) {
  const formData = new FormData();
  formData.append("jd", file);

  const res = await api.post("/candidates/match/jd", formData);
  return unwrapApiData(res);
}

export async function getJobStatus(jobId) {
  const res = await api.get(`/candidates/upload/jobs/${jobId}`);
  return unwrapApiData(res);
}