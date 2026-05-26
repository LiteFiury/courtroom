"use client";
import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUIStore } from "@/store/uiStore";
import { cn } from "@/lib/utils";

export default function ProceduralNotices() {
  const { proceduralNotices, removeNotice } = useUIStore();

  useEffect(() => {
    if (!proceduralNotices.length) return;
    const last = proceduralNotices[proceduralNotices.length - 1];
    const timer = setTimeout(() => removeNotice(last.id), 4000);
    return () => clearTimeout(timer);
  }, [proceduralNotices, removeNotice]);

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-40 flex flex-col gap-2">
      <AnimatePresence>
        {proceduralNotices.map((n) => (
          <motion.div
            key={n.id}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 40 }}
            className={cn(
              "rounded border px-4 py-2 font-serif text-xs shadow-lg",
              n.severity === "warning"
                ? "border-yellow-800/50 bg-yellow-950/80 text-yellow-200"
                : n.severity === "error"
                  ? "border-red-900/50 bg-red-950/80 text-red-200"
                  : "border-court-border bg-court-surface text-court-parchmentDim",
            )}
          >
            {n.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
