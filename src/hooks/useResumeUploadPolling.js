import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  bootstrapResumeUpload,
  fetchResumeUploadJob,
  FINISHED_STATUSES,
  setResumeUploadPolling,
} from "@/store/resumeUpload/resumeUploadSlice";

const POLL_MS = 2500;

/**
 * Keeps resume upload job polling alive while the user navigates between screens.
 * Mount once inside AppLayout.
 */
export default function useResumeUploadPolling() {
  const dispatch = useDispatch();
  const job = useSelector((state) => state.resumeUpload.job);
  const isPolling = useSelector((state) => state.resumeUpload.isPolling);
  const intervalRef = useRef(null);
  const bootstrappedRef = useRef(false);

  useEffect(() => {
    if (bootstrappedRef.current) return;
    bootstrappedRef.current = true;

    const status = job?.status;
    if (job?.id && status && !FINISHED_STATUSES.has(status)) {
      dispatch(setResumeUploadPolling(true));
      return;
    }

    dispatch(bootstrapResumeUpload());
  }, [dispatch, job?.id, job?.status]);

  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    const jobId = job?.id;
    const shouldPoll =
      isPolling && jobId && job?.status && !FINISHED_STATUSES.has(job.status);

    if (!shouldPoll) return undefined;

    const tick = () => {
      dispatch(fetchResumeUploadJob(jobId));
    };

    intervalRef.current = setInterval(tick, POLL_MS);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [dispatch, isPolling, job?.id, job?.status]);

  useEffect(() => {
    if (job?.status && FINISHED_STATUSES.has(job.status) && isPolling) {
      dispatch(setResumeUploadPolling(false));
    }
  }, [dispatch, job?.status, isPolling]);
}
