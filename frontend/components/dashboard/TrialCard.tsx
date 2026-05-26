"use client";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import type { Trial } from "@/types/trial.types";
import { cn } from "@/lib/utils";

const statusDot: Record<string, string> = {
  idle:      "bg-court-parchmentMuted/40",
  active:    "bg-court-judgeAcc animate-phase-pulse",
  concluded: "bg-court-gold/50",
};

export default function TrialCard({ trial, index }: { trial: Trial; index: number }) {
  const router = useRouter();

  return (
    <motion.button
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={() => router.push(`/trial/${trial.id}`)}
      className="group w-full rounded border border-court-border bg-court-surface p-5 text-left transition-all hover:border-court-gold/30 hover:bg-court-panel"
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
    </motion.button>
  );
}
