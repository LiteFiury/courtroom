"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { useTrials } from "@/hooks/useTrials";
import TrialCard from "@/components/dashboard/TrialCard";
import CreateTrialModal from "@/components/dashboard/CreateTrialModal";

export default function DashboardPage() {
  const { data: trials, isLoading, error } = useTrials();
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="flex h-screen flex-col bg-court-bg">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-court-border bg-court-surface px-8 py-4 shrink-0">
        <div className="flex items-center gap-3">
          <i className="fa-solid fa-landmark-dome text-court-gold text-lg" />
          <div>
            <h1 className="font-serif text-lg tracking-widest text-court-parchment">CourtRoom AI</h1>
            <p className="font-serif text-[10px] uppercase tracking-[0.25em] text-court-parchmentMuted">
              Multi-Agent Trial Simulator
            </p>
          </div>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 rounded border border-court-gold/40 bg-court-gold/10 px-4 py-2 font-serif text-xs uppercase tracking-widest text-court-goldBright hover:bg-court-gold/20 transition-colors"
        >
          <i className="fa-solid fa-gavel text-[11px]" />
          Convene Trial
        </button>
      </header>

      {/* Body */}
      <main className="flex-1 overflow-y-auto px-8 py-8 scrollbar-thin">
        <div className="mx-auto max-w-4xl">
          {/* Stats strip */}
          <div className="mb-8 grid grid-cols-3 gap-4">
            {[
              { icon: "fa-solid fa-scale-balanced", label: "Total Trials", value: trials?.length ?? "—" },
              { icon: "fa-solid fa-circle-dot", label: "Active", value: trials?.filter((t) => t.status === "active").length ?? "—" },
              { icon: "fa-solid fa-check-double", label: "Concluded", value: trials?.filter((t) => t.status === "concluded").length ?? "—" },
            ].map((stat) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded border border-court-border bg-court-surface p-4"
              >
                <i className={`${stat.icon} text-court-parchmentMuted text-xs mb-2`} />
                <p className="font-serif text-2xl text-court-parchment">{stat.value}</p>
                <p className="font-serif text-[10px] uppercase tracking-widest text-court-parchmentMuted">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Trial list */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-xs uppercase tracking-widest text-court-parchmentMuted">
              Trial Docket
            </h2>
            <span className="font-serif text-[10px] text-court-parchmentMuted/50">
              {trials?.length ?? 0} session{trials?.length !== 1 ? "s" : ""}
            </span>
          </div>

          {isLoading && (
            <div className="flex items-center justify-center py-16 gap-2 text-court-parchmentMuted">
              <i className="fa-solid fa-circle-notch fa-spin text-sm" />
              <span className="font-serif text-xs">Retrieving docket…</span>
            </div>
          )}

          {error && (
            <div className="rounded border border-red-900/40 bg-red-950/20 p-4 font-serif text-xs text-red-300">
              <i className="fa-solid fa-triangle-exclamation mr-2" />
              Unable to reach orchestrator. Ensure the backend is running.
            </div>
          )}

          {!isLoading && !error && trials?.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
              <i className="fa-solid fa-gavel text-court-parchmentMuted/20 text-5xl" />
              <p className="font-serif text-sm text-court-parchmentMuted">No trials on record.</p>
              <button
                onClick={() => setModalOpen(true)}
                className="font-serif text-xs text-court-gold underline underline-offset-4 hover:text-court-goldBright transition-colors"
              >
                Convene the first session
              </button>
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {trials?.map((trial, i) => (
              <TrialCard key={trial.id} trial={trial} index={i} />
            ))}
          </div>
        </div>
      </main>

      <CreateTrialModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
