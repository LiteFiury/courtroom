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

const MS_PER_CHAR = 55; // ~3 words/sec

export default function SpeechBubble({ role, content, isStreaming, isPaused, stricken }: Props) {
  const [displayed, setDisplayed] = useState("");
  const indexRef = useRef(0);

  // Direct assignment — always reflects latest content on every render cycle
  // No useEffect needed; this runs synchronously before the interval fires
  const contentRef = useRef(content);
  contentRef.current = content;

  useEffect(() => {
    // Single interval, mounted once, never restarted
    // Advances one character every MS_PER_CHAR ms
    // If caught up to content length, it simply idles and waits
    // NO flush on isStreaming=false — that was the bug
    const id = setInterval(() => {
      if (indexRef.current < contentRef.current.length) {
        indexRef.current += 1;
        setDisplayed(contentRef.current.slice(0, indexRef.current));
      }
    }, MS_PER_CHAR);

    return () => clearInterval(id);
  }, []); // empty deps — start once on mount, clean up on unmount

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

      {/* Show cursor only while still typing — based on displayed vs full content */}
      {isStreaming && !isPaused && displayed.length < contentRef.current.length && (
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
