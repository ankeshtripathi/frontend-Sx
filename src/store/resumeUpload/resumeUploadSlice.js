import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getActiveResumeUploadJob,
  getJobStatus,
  uploadResumes,
} from "@/api/candidate";
import { getApiErrorMessage } from "@/api/axios";

const STORAGE_KEY = "ats_resume_upload_job_id";

export const FINISHED_STATUSES = new Set(["completed", "failed"]);

export function loadStoredJobId() {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function persistJobId(jobId) {
  try {
    if (jobId) localStorage.setItem(STORAGE_KEY, jobId);
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export const startResumeUpload = createAsyncThunk(
  "resumeUpload/start",
  async (files, { rejectWithValue }) => {
    try {
      const res = await uploadResumes(files);
      const jobId = res?.jobId ?? res?.id;
      if (!jobId) {
        return rejectWithValue("Missing upload job id from server");
      }
      persistJobId(jobId);
      return { jobId, initial: res };
    } catch (err) {
      return rejectWithValue(getApiErrorMessage(err, "Upload failed"));
    }
  }
);

export const fetchResumeUploadJob = createAsyncThunk(
  "resumeUpload/fetch",
  async (jobId, { rejectWithValue }) => {
    try {
      const job = await getJobStatus(jobId);
      if (!job?.id) {
        return rejectWithValue("Upload job not found");
      }
      return job;
    } catch (err) {
      return rejectWithValue(getApiErrorMessage(err, "Failed to fetch upload status"));
    }
  }
);

/** Restore in-progress or recent job after refresh / navigation (localStorage + API). */
export const bootstrapResumeUpload = createAsyncThunk(
  "resumeUpload/bootstrap",
  async (_, { rejectWithValue }) => {
    try {
      const storedId = loadStoredJobId();
      if (storedId) {
        try {
          const job = await getJobStatus(storedId);
          if (job?.id) return job;
        } catch {
          persistJobId(null);
        }
      }
      const active = await getActiveResumeUploadJob();
      return active ?? null;
    } catch (err) {
      return rejectWithValue(getApiErrorMessage(err, "Failed to restore upload job"));
    }
  }
);

const resumeUploadSlice = createSlice({
  name: "resumeUpload",
  initialState: {
    job: null,
    isSubmitting: false,
    isPolling: false,
    error: null,
  },
  reducers: {
    setResumeUploadJob(state, action) {
      state.job = action.payload;
      state.error = null;
      if (action.payload?.id) {
        persistJobId(action.payload.id);
      }
    },
    clearResumeUpload(state) {
      state.job = null;
      state.isSubmitting = false;
      state.isPolling = false;
      state.error = null;
      persistJobId(null);
    },
    setResumeUploadPolling(state, action) {
      state.isPolling = action.payload;
    },
    setResumeUploadError(state, action) {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(startResumeUpload.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(startResumeUpload.fulfilled, (state, action) => {
        state.isSubmitting = false;
        const { jobId, initial } = action.payload;
        state.job = {
          id: jobId,
          status: initial?.status ?? "queued",
          total: initial?.total ?? 0,
          processed: 0,
          created: 0,
          duplicate: 0,
          skipped: 0,
          error: 0,
          results: [],
          progressPercent: 0,
          isTerminal: false,
        };
        state.isPolling = true;
      })
      .addCase(startResumeUpload.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload || "Upload failed";
      })
      .addCase(fetchResumeUploadJob.fulfilled, (state, action) => {
        state.job = action.payload;
        state.error = null;
        if (action.payload?.id) {
          persistJobId(action.payload.id);
        }
        if (FINISHED_STATUSES.has(action.payload?.status)) {
          state.isPolling = false;
        }
      })
      .addCase(fetchResumeUploadJob.rejected, (state, action) => {
        state.error = action.payload || "Failed to fetch status";
        state.isPolling = false;
      })
      .addCase(bootstrapResumeUpload.fulfilled, (state, action) => {
        const job = action.payload;
        if (!job?.id) return;
        state.job = job;
        state.error = null;
        persistJobId(job.id);
        state.isPolling = !FINISHED_STATUSES.has(job.status);
      })
      .addCase(bootstrapResumeUpload.rejected, () => {
        /* no active job — ignore */
      });
  },
});

export const {
  setResumeUploadJob,
  clearResumeUpload,
  setResumeUploadPolling,
  setResumeUploadError,
} = resumeUploadSlice.actions;

export default resumeUploadSlice.reducer;
