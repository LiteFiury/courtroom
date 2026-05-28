"use client";
import { useEffect, useRef } from "react";
import { useSocket } from "@/hooks/useSocket";
import { useTrial, useStartTrialWithSocket } from "@/hooks/useTrials";
import { useCourtroomStore } from "@/store/courtroomStore";
import CourtroomLayout from "@/components/courtroom/CourtroomLayout";
import type { TrialConfig } from "@/types/trial.types";

export default function TrialPage({ params }: { params: { trialId: string } }) {
  const { trialId } = params;
  const { data: trial, isLoading } = useTrial(trialId);
  const { mutate: startTrial, isPending } = useStartTrialWithSocket();
  const setTrialId = useCourtroomStore((s) => s.setTrialId);
  const started = useRef(false);

  useSocket(trialId);

  useEffect(() => {
    setTrialId(trialId);
  }, [trialId, setTrialId]);

  // Auto-start as soon as trial loads and is idle
  useEffect(() => {
    if (trial?.status === "idle" && !started.current) {
      started.current = true;
      startTrial(trialId);
    }
  }, [trial?.status, trialId, startTrial]);

  if (isLoading || (trial?.status === "idle" && !started.current)) {
    return (
      <div className="flex h-screen items-center justify-center bg-court-bg gap-3 flex-col">
        <i className="fa-solid fa-landmark-dome text-court-gold text-3xl" />
        <span className="font-serif text-sm text-court-parchmentMuted">Convening court…</span>
        {isPending && (
          <span className="font-serif text-xs text-court-parchmentMuted/50">Calling agents to order…</span>
        )}
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
    <CourtroomLayout
      trialTitle={trial.title}
      config={trial.config as unknown as TrialConfig}
    />
  );
}
