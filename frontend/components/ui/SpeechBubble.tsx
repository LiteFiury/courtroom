"use client";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import type { AgentRole } from "@/types/trial.types";

interface Props {
  role: AgentRole;
  content: string;
  isStreaming: boolean;
  isPaused: boolean;
  stricken: boolean;
}

const roleStyles: Record<AgentRole, string> = {
  judge:      "border-court-judgeBdr bg-court-judgeBg text-court-parchment",
  advocate_a: "border-court-prosecutionBdr bg-court-prosecutionBg text-court-parchment",
  advocate_b: "border-court-defenseBdr bg-court-defenseBg text-court-parchment",
  witness:    "border-court-witnessBdr bg-court-witnessBg text-court-parchmentDim",
};

const cursorColors: Record<AgentRole, string> = {
  judge:      "bg-court-judgeAcc",
  advocate_a: "bg-court-prosecutionAcc",
  advocate_b: "bg-court-defenseAcc",
  witness:    "bg-court-witnessAcc",
};

// 3 words/sec ≈ 18 chars/sec → 1000/18 ≈ 55ms per char
const MS_PER_CHAR = 55;

export default function SpeechBubble({ role, content, isStreaming, isPaused, stricken }: Props) {
  const [displayed, setDisplayed] = useState("");
  // Keep a ref to the full content so the interval always sees latest value
  const fullContentRef = useRef("");
  const indexRef = useRef(0); // how many chars we've shown so far

  // Sync latest content into ref whenever it changes
  useEffect(() => {
    fullContentRef.current = content;
  }, [content]);

  // Single interval that ticks every MS_PER_CHAR and reveals one char
  useEffect(() => {
    indexRef.current = 0;
    setDisplayed("");
    fullContentRef.current = content;

    const id = setInterval(() => {
      const full = fullContentRef.current;
      if (indexRef.current >= full.length) {
        // Nothing new yet — keep waiting
        return;
      }
      indexRef.current += 1;
      setDisplayed(full.slice(0, indexRef.current));
    }, MS_PER_CHAR);

    return () => clearInterval(id);
  // Only create a new interval when a new entry starts (entryId changes)
  // We use content's initial value as a proxy — but really we want per-entry.
  // The parent should remount this component per entry so this is fine.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When streaming ends, show everything immediately (no text left behind)
  useEffect(() => {
    if (!isStreaming) {
      setDisplayed(fullContentRef.current);
      indexRef.current = fullContentRef.current.length;
    }
  }, [isStreaming]);

  return (
    <div
      className={cn(
        "relative rounded border px-4 py-3 font-serif text-sm leading-relaxed tracking-wide transition-all duration-200",
        roleStyles[role],
        stricken && "opacity-30 line-through",
        isPaused && "opacity-60",
      )}
    >
      <span>{displayed}</span>

      {isStreaming && !isPaused && (
        <span
          className={cn(
            "ml-[2px] inline-block h-[1em] w-[2px] translate-y-[1px] animate-cursor-blink",
            cursorColors[role],
          )}
        />
      )}
      {isPaused && isStreaming && (
        <span className="ml-1 animate-cursor-blink text-court-gold text-xs">▌</span>
      )}
      {stricken && (
        <span className="absolute right-2 top-1 text-[10px] uppercase tracking-widest text-red-400 opacity-70">
          stricken
        </span>
      )}
    </div>
  );
}
