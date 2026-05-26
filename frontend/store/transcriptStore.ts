import { create } from "zustand";
import type { TranscriptEntry } from "@/types/trial.types";

interface TranscriptStore {
  entries: TranscriptEntry[];
  addEntry: (entry: TranscriptEntry) => void;
  strikeEntry: (entryId: string) => void;
  reset: () => void;
}

export const useTranscriptStore = create<TranscriptStore>((set) => ({
  entries: [],
  addEntry: (entry) => set((s) => ({ entries: [...s.entries, entry] })),
  strikeEntry: (entryId) =>
    set((s) => ({
      entries: s.entries.map((e) => (e.id === entryId ? { ...e, stricken: true } : e)),
    })),
  reset: () => set({ entries: [] }),
}));
