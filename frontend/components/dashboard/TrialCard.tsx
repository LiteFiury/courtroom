"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import type { Trial } from "@/types/trial.types";
import { useDeleteTrial } from "@/hooks/useTrials";
import { cn } from "@/lib/utils";

const statusDot: Record<string, string> = {
  idle:      "bg-court-parchmentMuted/40",
  active:    "bg-court-judgeAcc animate-phase-pulse",
  concluded: "bg-court-gold/50",
};

export default function TrialCard({ trial, index }: { trial: Trial; index: number }) {
  const router = useRouter();
  const { mutate: deleteTrial, isPending } = useDeleteTrial();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirmDelete) { setConfirmDelete(true); return; }
    deleteTrial(trial.id);
  };

  const handleCancelDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirmDelete(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group relative w-full rounded border border-court-border bg-court-surface p-5 text-left transition-all hover:border-court-gold/30 hover:bg-court-panel cursor-pointer"
      onClick={() => router.push(`/trial/${trial.id}`)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-serif text-base text-court-parchment truncate group-hover:text-court-goldBright transition-colors">
            {trial.title}
          </h3>
          {trial.caseDescription && (
            <p className="mt-1 font-serif text-xs text-court-parchmentMuted leading-relaxed line-clamp-2">
              {trial.caseDescription}
            </p>
          )}
        </div>
        <span className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", statusDot[trial.status] ?? "bg-gray-600")} />
      </div>

      <div className="mt-3 flex items-center gap-3 text-[10px] uppercase tracking-widest text-court-parchmentMuted/60">
        <span className="capitalize">{trial.status}</span>
        <span className="h-px flex-1 bg-court-border" />
        <span>{new Date(trial.createdAt).toLocaleDateString()}</span>
      </div>

      {/* Delete button — appears on hover */}
      <div
        className="absolute bottom-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={(e) => e.stopPropagation()}
      >
        {confirmDelete ? (
          <>
            <button
              onClick={handleDelete}
              disabled={isPending}
              className="rounded border border-red-500/50 bg-red-950/40 px-2 py-0.5 font-serif text-[10px] text-red-300 hover:bg-red-950/70 transition-colors"
            >
              {isPending ? "Deleting…" : "Confirm"}
            </button>
            <button
              onClick={handleCancelDelete}
              className="rounded border border-court-border px-2 py-0.5 font-serif text-[10px] text-court-parchmentMuted hover:text-court-parchmentDim transition-colors"
            >
              Cancel
            </button>
          </>
        ) : (
          <button
            onClick={handleDelete}
            className="rounded border border-court-border px-2 py-0.5 font-serif text-[10px] text-court-parchmentMuted/60 hover:border-red-500/40 hover:text-red-400 transition-colors"
          >
            <i className="fa-solid fa-trash-can text-[9px]" />
          </button>
        )}
      </div>
    </motion.div>
  );
}
