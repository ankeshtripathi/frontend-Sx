import api, { unwrapApiData } from "./axios";

/** @param {import('axios').AxiosRequestConfig['params']} params */
export async function getJobs() {
  const res = await api.get("/jobs");
  return unwrapApiData(res);
}

export async function getJob(jobId) {
  const res = await api.get(`/jobs/${jobId}`);
  return unwrapApiData(res);
}

export async function createJob(payload) {
  const res = await api.post("/jobs", payload);
  return unwrapApiData(res);
}

export async function uploadJobDocument(file) {
  const formData = new FormData();
  formData.append("job", file);
  const res = await api.post("/jobs/upload", formData);
  return unwrapApiData(res);
}

/**
 * @param {string} jobId
 * @param {{ topK?: number, skills?: string }} [query]
 */
export async function matchJobCandidates(jobId, query = {}) {
  const res = await api.get(`/jobs/${jobId}/matches`, {
    params: pickDefined({
      topK: query.topK,
      skills: query.skills,
    }),
  });
  return unwrapApiData(res);
}

function pickDefined(obj) {
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null || v === "") continue;
    out[k] = v;
  }
  return out;
}

/** Remove large embedding vectors from job objects for UI state. */
export function omitJobEmbedding(job) {
  if (!job || typeof job !== "object") return job;
  const { jobEmbedding: _j, ...rest } = job;
  return rest;
}
