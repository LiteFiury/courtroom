"use client";
import { useEffect, useRef } from "react";
import { useTranscriptStore } from "@/store/transcriptStore";
import { roleLabel, cn } from "@/lib/utils";

const roleColor: Record<string, string> = {
  judge:      "text-court-judgeAcc",
  advocate_a: "text-blue-400",
  advocate_b: "text-red-400",
  witness:    "text-court-witnessAcc",
};

export default function TranscriptRail() {
  const entries = useTranscriptStore((s) => s.entries);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [entries.length]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-court-border px-4 py-2">
        <i className="fa-solid fa-scroll text-court-parchmentMuted text-xs" />
        <span className="font-serif text-xs uppercase tracking-widest text-court-parchmentMuted">
          Transcript
        </span>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {entries.map((e) => (
          <div
            key={e.id}
            className={cn("font-serif text-[11px] leading-relaxed", e.stricken && "line-through opacity-30")}
          >
            <span className={cn("font-semibold", roleColor[e.role] ?? "text-court-parchmentDim")}>
              [{roleLabel(e.role as never)}]
            </span>{" "}
            <span className="text-court-parchmentMuted">{e.content}</span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
