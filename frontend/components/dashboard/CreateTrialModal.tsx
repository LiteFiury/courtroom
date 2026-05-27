"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useCreateTrial } from "@/hooks/useTrials";
import type { AIProvider, AgentRole } from "@/types/trial.types";
import { cn } from "@/lib/utils";

const PROVIDERS: AIProvider[] = ["groq", "cerebras", "gemini", "openrouter", "anthropic", "ollama"];
const ROLES: { role: AgentRole; label: string }[] = [
  { role: "judge",      label: "Judge" },
  { role: "advocate_a", label: "Prosecution" },
  { role: "advocate_b", label: "Defence" },
  { role: "witness",    label: "Witness" },
];

// Active models as of May 2026
const DEFAULT_MODELS: Record<AIProvider, string> = {
  groq:        "llama-3.3-70b-versatile",
  cerebras:    "llama-3.3-70b",
  gemini:      "gemini-2.5-flash",
  openrouter:  "deepseek/deepseek-r1:free",
  anthropic:   "claude-3-5-haiku-20241022",
  ollama:      "llama3",
};

export default function CreateTrialModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const { mutateAsync, isPending } = useCreateTrial();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [rules, setRules] = useState<"federal" | "simplified">("simplified");
  const [assignments, setAssignments] = useState<
    Record<AgentRole, { provider: AIProvider; model: string }>
  >({
    judge:      { provider: "groq",       model: "llama-3.3-70b-versatile" },
    advocate_a: { provider: "groq",       model: "llama-3.1-8b-instant" },
    advocate_b: { provider: "gemini",     model: "gemini-2.5-flash" },
    witness:    { provider: "openrouter", model: "deepseek/deepseek-r1:free" },
  });

  const setAssignment = (role: AgentRole, provider: AIProvider) =>
    setAssignments((a) => ({ ...a, [role]: { provider, model: DEFAULT_MODELS[provider] } }));

  const setModel = (role: AgentRole, model: string) =>
    setAssignments((a) => ({ ...a, [role]: { ...a[role], model } }));

  const handleSubmit = async () => {
    if (!title.trim()) return;
    try {
      const trial = await mutateAsync({
        title,
        caseDescription: description,
        config: {
          rules,
          agentAssignments: ROLES.map(({ role }) => ({
            role,
            provider: assignments[role].provider,
            model: assignments[role].model,
          })),
        },
      }) as { id: string };
      onClose();
      router.push(`/trial/${trial.id}`);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="modal-bg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            key="modal-card"
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="mx-4 w-full max-w-xl rounded border border-court-border bg-court-surface p-6 shadow-2xl"
          >
            <h2 className="font-serif text-lg text-court-parchment">Convene New Trial</h2>
            <p className="mt-1 font-serif text-xs text-court-parchmentMuted">
              Configure the session before calling agents to order.
            </p>

            <div className="mt-5 space-y-4">
              {/* Title */}
              <div>
                <label className="font-serif text-xs uppercase tracking-widest text-court-parchmentMuted">
                  Case Title
                </label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="The State v. ..."
                  className="mt-1 w-full rounded border border-court-border bg-court-panel px-3 py-2 font-serif text-sm text-court-parchment placeholder-court-parchmentMuted/40 outline-none focus:border-court-gold/40"
                />
              </div>

              {/* Description */}
              <div>
                <label className="font-serif text-xs uppercase tracking-widest text-court-parchmentMuted">
                  Case Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Briefly describe the facts of the case…"
                  className="mt-1 w-full rounded border border-court-border bg-court-panel px-3 py-2 font-serif text-sm text-court-parchment placeholder-court-parchmentMuted/40 outline-none focus:border-court-gold/40 resize-none"
                />
              </div>

              {/* Rules */}
              <div className="flex gap-3">
                {(["simplified", "federal"] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setRules(r)}
                    className={cn(
                      "flex-1 rounded border py-2 font-serif text-xs uppercase tracking-widest transition-colors",
                      rules === r
                        ? "border-court-gold/50 bg-court-panel text-court-gold"
                        : "border-court-border text-court-parchmentMuted hover:border-court-border/80",
                    )}
                  >
                    {r}
                  </button>
                ))}
              </div>

              {/* Agent assignments */}
              <div>
                <label className="font-serif text-xs uppercase tracking-widest text-court-parchmentMuted">
                  Agent Assignments
                </label>
                <div className="mt-2 space-y-2">
                  {ROLES.map(({ role, label }) => (
                    <div key={role} className="flex items-center gap-2">
                      <span className="w-24 shrink-0 font-serif text-xs text-court-parchmentDim">{label}</span>
                      <select
                        value={assignments[role].provider}
                        onChange={(e) => setAssignment(role, e.target.value as AIProvider)}
                        className="rounded border border-court-border bg-court-panel px-2 py-1 font-serif text-xs text-court-parchment outline-none focus:border-court-gold/40"
                      >
                        {PROVIDERS.map((p) => <option key={p} value={p}>{p}</option>)}
                      </select>
                      <input
                        value={assignments[role].model}
                        onChange={(e) => setModel(role, e.target.value)}
                        className="flex-1 rounded border border-court-border bg-court-panel px-2 py-1 font-mono text-xs text-court-parchmentDim outline-none focus:border-court-gold/40"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={onClose}
                className="rounded border border-court-border px-4 py-2 font-serif text-xs uppercase tracking-widest text-court-parchmentMuted hover:text-court-parchmentDim transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!title.trim() || isPending}
                className="rounded border border-court-gold/40 bg-court-gold/10 px-5 py-2 font-serif text-xs uppercase tracking-widest text-court-goldBright hover:bg-court-gold/20 transition-colors disabled:opacity-40"
              >
                {isPending ? "Convening…" : "Convene"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
