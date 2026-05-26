import { create } from "zustand";
import type { CourtroomState, ActiveSpeaker, StreamingEntry } from "@/types/courtroom.types";
import type { CourtPhase, Evidence, Objection, Verdict } from "@/types/trial.types";

interface CourtroomStore extends CourtroomState {
  setTrialId: (id: string) => void;
  setPhase: (phase: CourtPhase) => void;
  setActiveSpeaker: (speaker: ActiveSpeaker | null) => void;
  initStreamingEntry: (entry: StreamingEntry) => void;
  appendToken: (entryId: string, token: string) => void;
  pauseEntry: (entryId: string) => void;
  resumeEntry: (entryId: string) => void;
  finalizeEntry: (entryId: string) => void;
  strikeEntry: (entryId: string) => void;
  setPendingObjection: (objection: Objection | null) => void;
  addEvidence: (evidence: Evidence) => void;
  setVerdict: (verdict: Verdict) => void;
  setConnected: (connected: boolean) => void;
  incrementElapsed: () => void;
  reset: () => void;
}

const initial: CourtroomState = {
  trialId: null,
  phase: "IDLE",
  activeSpeaker: null,
  streamingEntries: {},
  pendingObjection: null,
  admittedEvidence: [],
  verdictData: null,
  isConnected: false,
  elapsedSeconds: 0,
};

export const useCourtroomStore = create<CourtroomStore>((set) => ({
  ...initial,

  setTrialId: (id) => set({ trialId: id }),
  setPhase: (phase) => set({ phase }),
  setActiveSpeaker: (activeSpeaker) => set({ activeSpeaker }),

  initStreamingEntry: (entry) =>
    set((s) => ({ streamingEntries: { ...s.streamingEntries, [entry.entryId]: entry } })),

  appendToken: (entryId, token) =>
    set((s) => {
      const e = s.streamingEntries[entryId];
      if (!e) return s;
      return { streamingEntries: { ...s.streamingEntries, [entryId]: { ...e, content: e.content + token } } };
    }),

  pauseEntry: (entryId) =>
    set((s) => {
      const e = s.streamingEntries[entryId];
      if (!e) return s;
      return { streamingEntries: { ...s.streamingEntries, [entryId]: { ...e, isPaused: true } } };
    }),

  resumeEntry: (entryId) =>
    set((s) => {
      const e = s.streamingEntries[entryId];
      if (!e) return s;
      return { streamingEntries: { ...s.streamingEntries, [entryId]: { ...e, isPaused: false } } };
    }),

  finalizeEntry: (entryId) =>
    set((s) => {
      const e = s.streamingEntries[entryId];
      if (!e) return s;
      return { streamingEntries: { ...s.streamingEntries, [entryId]: { ...e, isStreaming: false, isPaused: false } } };
    }),

  strikeEntry: (entryId) =>
    set((s) => {
      const e = s.streamingEntries[entryId];
      if (!e) return s;
      return { streamingEntries: { ...s.streamingEntries, [entryId]: { ...e, stricken: true, isStreaming: false, isPaused: false } } };
    }),

  setPendingObjection: (pendingObjection) => set({ pendingObjection }),
  addEvidence: (evidence) => set((s) => ({ admittedEvidence: [...s.admittedEvidence, evidence] })),
  setVerdict: (verdictData) => set({ verdictData }),
  setConnected: (isConnected) => set({ isConnected }),
  incrementElapsed: () => set((s) => ({ elapsedSeconds: s.elapsedSeconds + 1 })),
  reset: () => set(initial),
}));
