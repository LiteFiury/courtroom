"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useCourtroomStore } from "@/store/courtroomStore";

export default function EvidenceRail() {
  const evidence = useCourtroomStore((s) => s.admittedEvidence);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-court-border px-4 py-2">
        <i className="fa-solid fa-folder-open text-court-parchmentMuted text-xs" />
        <span className="font-serif text-xs uppercase tracking-widest text-court-parchmentMuted">
          Evidence
        </span>
        <span className="ml-auto font-mono text-[10px] text-court-parchmentMuted/60">
          {evidence.length}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-3">
        <AnimatePresence initial={false}>
          {evidence.length === 0 && (
            <p className="font-serif text-xs italic text-court-parchmentMuted/30 mt-4 text-center">
              No evidence admitted
            </p>
          )}
          {evidence.map((e) => (
            <motion.div
              key={e.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="animate-evidence-slide rounded border border-court-border bg-court-surface p-2"
            >
              <p className="font-serif text-xs text-court-parchmentDim">{e.title}</p>
              <p className="mt-1 font-serif text-[10px] text-court-parchmentMuted/60 leading-relaxed">
                {e.content.slice(0, 80)}…
              </p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
