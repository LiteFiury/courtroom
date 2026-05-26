"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useUIStore } from "@/store/uiStore";
import { useCourtroomStore } from "@/store/courtroomStore";

export default function VerdictModal() {
  const { showVerdictModal, closeVerdictModal } = useUIStore();
  const verdict = useCourtroomStore((s) => s.verdictData);

  return (
    <AnimatePresence>
      {showVerdictModal && verdict && (
        <motion.div
          key="verdict-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={closeVerdictModal}
        >
          <motion.div
            key="verdict-card"
            initial={{ opacity: 0, scale: 0.88, filter: "blur(8px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0)" }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="mx-4 max-w-lg rounded border border-court-gold/30 bg-court-surface p-8 shadow-2xl"
          >
            <p className="mb-1 font-serif text-xs uppercase tracking-widest text-court-gold">
              The Court&apos;s Verdict
            </p>
            <h2 className="font-serif text-3xl text-court-parchment">{verdict.outcome}</h2>
            <div className="my-4 h-px bg-court-border" />
            <p className="font-serif text-sm leading-relaxed text-court-parchmentDim">
              {verdict.reasoning}
            </p>
            <button
              onClick={closeVerdictModal}
              className="mt-6 w-full rounded border border-court-border py-2 font-serif text-xs uppercase tracking-widest text-court-parchmentMuted hover:border-court-gold/40 hover:text-court-parchmentDim transition-colors"
            >
              Dismiss
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
