import useResumeUploadPolling from "@/hooks/useResumeUploadPolling";

/** Mount once in AppLayout so upload progress survives route changes. */
export default function ResumeUploadPoller() {
  useResumeUploadPolling();
  return null;
}
