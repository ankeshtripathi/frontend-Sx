import React from "react";
import { useNavigate } from "react-router-dom";
import { FileSpreadsheet, Users } from "lucide-react";
import PageHero, { HeroGhostButton } from "@/components/workspace/PageHero";
import WorkspacePage from "@/components/workspace/WorkspacePage";
import CandidateWorkspaceTabs from "@/components/workspace/CandidateWorkspaceTabs";
import ResumeUploadPanel from "@/components/candidates/ResumeUploadPanel";
import { Button } from "@/components/ui/button";

const AddCandidate = () => {
  const navigate = useNavigate();

  return (
    <WorkspacePage>
      <PageHero
        eyebrow="Add candidates"
        title="Upload resumes to your talent pool"
        description="Drop resume files here to parse and add candidates. Progress is saved if you navigate away — come back anytime to see status."
        actions={
          <HeroGhostButton onClick={() => navigate("/dashboard/get-candidates")}>
            <Users className="size-4" aria-hidden />
            Browse all candidates
          </HeroGhostButton>
        }
      />

      <CandidateWorkspaceTabs />

      <ResumeUploadPanel />

      <div className="flex justify-center">
        <Button
          type="button"
          variant="outline"
          className="gap-2 font-semibold"
          onClick={() => navigate("/candidate/upload-csv")}
        >
          <FileSpreadsheet className="size-4" aria-hidden />
          Upload candidates from CSV instead
        </Button>
      </div>
    </WorkspacePage>
  );
};

export default AddCandidate;
