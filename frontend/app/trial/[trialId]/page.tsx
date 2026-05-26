"use client";
import { useEffect } from "react";
import { useSocket } from "@/hooks/useSocket";
import { useTrial, useStartTrialWithSocket } from "@/hooks/useTrials";
import { useCourtroomStore } from "@/store/courtroomStore";
import CourtroomLayout from "@/components/courtroom/CourtroomLayout";

export default function TrialPage({ params }: { params: { trialId: string } }) {
  const { trialId } = params;
  const { data: trial, isLoading } = useTrial(trialId);
  const { mutate: startTrial } = useStartTrialWithSocket();
  const setTrialId = useCourtroomStore((s) => s.setTrialId);

  useSocket(trialId);

  useEffect(() => {
    setTrialId(trialId);
  }, [trialId, setTrialId]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-court-bg gap-2">
        <i className="fa-solid fa-circle-notch fa-spin text-court-gold" />
        <span className="font-serif text-sm text-court-parchmentMuted">Convening court…</span>
      </div>
    );
  }

  if (!trial) {
    return (
      <div className="flex h-screen items-center justify-center bg-court-bg">
        <div className="text-center">
          <i className="fa-solid fa-triangle-exclamation text-3xl text-court-parchmentMuted/30 mb-3" />
          <p className="font-serif text-sm text-court-parchmentMuted">Trial not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen bg-court-bg">
      {/* Start button if idle */}
      {trial.status === "idle" && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="text-center space-y-4">
            <i className="fa-solid fa-landmark-dome text-court-gold text-4xl" />
            <h2 className="font-serif text-xl text-court-parchment">{trial.title}</h2>
            {trial.caseDescription && (
              <p className="font-serif text-sm text-court-parchmentMuted max-w-md mx-auto leading-relaxed">
                {trial.caseDescription}
              </p>
            )}
            <button
              onClick={() => startTrial(trialId)}
              className="mt-4 flex items-center gap-2 mx-auto rounded border border-court-gold/50 bg-court-gold/10 px-8 py-3 font-serif text-sm uppercase tracking-widest text-court-goldBright hover:bg-court-gold/20 transition-colors"
            >
              <i className="fa-solid fa-gavel text-xs" />
              Call to Order
            </button>
          </div>
        </div>
      )}
      <CourtroomLayout trialTitle={trial.title} />
    </div>
  );
}
