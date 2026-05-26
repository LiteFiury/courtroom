import { phaseLabel } from "@/lib/utils";
import type { CourtPhase } from "@/types/trial.types";
import { cn } from "@/lib/utils";

const activePhases: CourtPhase[] = [
  "OPENING_PROSECUTION","OPENING_DEFENSE","DIRECT_EXAMINATION",
  "CROSS_EXAMINATION","REDIRECT","CLOSING_PROSECUTION","CLOSING_DEFENSE",
];

export default function PhaseTag({ phase }: { phase: CourtPhase }) {
  const isActive = activePhases.includes(phase);
  return (
    <div className={cn(
      "inline-flex items-center gap-2 rounded border px-3 py-1 font-serif text-xs uppercase tracking-widest",
      "border-court-border text-court-parchmentDim",
    )}>
      {isActive && (
        <span className="h-1.5 w-1.5 animate-phase-pulse rounded-full bg-court-gold" />
      )}
      {phaseLabel(phase)}
    </div>
  );
}
