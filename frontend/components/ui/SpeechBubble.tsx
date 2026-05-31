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
  isAnimating: boolean;   // true only when this entry is at the front of the queue
  onComplete: () => void; // called when done typing → dequeues and starts next
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

const MS_PER_CHAR = 55; // ~3 words/sec

export default function SpeechBubble({
  role, content, isStreaming, isPaused, stricken, isAnimating, onComplete,
}: Props) {
  // Entries that are NOT animating show nothing until their turn
  // Entries that ARE animating type char by char
  const [displayed, setDisplayed] = useState("");
  const indexRef    = useRef(0);
  const contentRef  = useRef(content);
  const completedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);

  // Always keep refs fresh
  contentRef.current   = content;
  onCompleteRef.current = onComplete;

  useEffect(() => {
    // Do not start until this entry is at the front of the queue
    if (!isAnimating) return;

    const id = setInterval(() => {
      const full = contentRef.current;

      if (indexRef.current < full.length) {
        // Still have chars to type
        indexRef.current += 1;
        setDisplayed(full.slice(0, indexRef.current));
      } else if (!isStreaming && !completedRef.current) {
        // Caught up to end AND backend has finished sending — hand off to next
        completedRef.current = true;
        clearInterval(id);
        onCompleteRef.current();
      }
      // If caught up but still streaming, just idle — more chars will arrive
    }, MS_PER_CHAR);

    return () => clearInterval(id);
  }, [isAnimating, isStreaming]); // restart interval when isAnimating flips true

  return (
    <div
      className={cn(
        "relative rounded border px-4 py-3 font-serif text-sm leading-relaxed tracking-wide transition-all duration-200",
        roleStyles[role],
        stricken && "opacity-30 line-through",
        isPaused && "opacity-60",
        // Not yet animating — hide completely so it doesn't flash empty space
        !isAnimating && displayed.length === 0 && "hidden",
      )}
    >
      <span>{displayed}</span>

      {isAnimating && isStreaming && !isPaused && (
        <span className={cn(
          "ml-[2px] inline-block h-[1em] w-[2px] translate-y-[1px] animate-cursor-blink",
          cursorColors[role],
        )} />
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
