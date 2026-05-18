import { Navigate } from "react-router-dom";

/** Legacy route — resume upload lives on Add Candidate. */
export default function UploadPDF() {
  return <Navigate to="/dashboard/candidates" replace />;
}
