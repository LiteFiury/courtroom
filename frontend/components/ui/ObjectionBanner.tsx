"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useUIStore } from "@/store/uiStore";
import { roleLabel } from "@/lib/utils";
import { cn } from "@/lib/utils";

export default function ObjectionBanner() {
  const { showObjectionBanner, objectionBannerData } = useUIStore();

  return (
    <AnimatePresence>
      {showObjectionBanner && objectionBannerData && (
        <motion.div
          key="objection"
          initial={{ opacity: 0, y: -60, scaleY: 0.7 }}
          animate={{ opacity: 1, y: 0, scaleY: 1 }}
          exit={{ opacity: 0, y: -30 }}
          transition={{ type: "spring", stiffness: 420, damping: 28 }}
          className="pointer-events-none fixed inset-x-0 top-0 z-50 flex flex-col items-center pt-4"
        >
          <div className="rounded border border-court-gold/40 bg-court-surface px-8 py-4 text-center shadow-2xl shadow-black/60">
            <p
              className={cn(
                "font-serif text-2xl font-bold uppercase tracking-[0.2em]",
                objectionBannerData.ruling
                  ? objectionBannerData.ruling === "sustained"
                    ? "text-court-judgeAcc"
                    : "text-court-prosecutionAcc"
                  : "text-court-gold animate-objection-slam",
              )}
            >
              {objectionBannerData.ruling
                ? objectionBannerData.ruling === "sustained"
                  ? "Sustained"
                  : "Overruled"
                : "Objection"}
            </p>
            <p className="mt-1 font-serif text-xs text-court-parchmentDim">
              {roleLabel(objectionBannerData.raisedBy)} — {objectionBannerData.grounds}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
