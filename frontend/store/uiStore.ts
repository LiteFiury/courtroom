import { create } from "zustand";
import type { UIState } from "@/types/courtroom.types";
import type { AgentRole } from "@/types/trial.types";

interface UIStore extends UIState {
  showObjection: (data: NonNullable<UIState["objectionBannerData"]>) => void;
  resolveObjection: (ruling: "sustained" | "overruled") => void;
  hideObjection: () => void;
  openVerdictModal: () => void;
  closeVerdictModal: () => void;
  setSpotlight: (role: AgentRole | null) => void;
  addNotice: (message: string, severity: string) => void;
  removeNotice: (id: string) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  showObjectionBanner: false,
  objectionBannerData: null,
  showVerdictModal: false,
  spotlightRole: null,
  proceduralNotices: [],

  showObjection: (data) => set({ showObjectionBanner: true, objectionBannerData: data }),

  resolveObjection: (ruling) =>
    set((s) => ({
      objectionBannerData: s.objectionBannerData ? { ...s.objectionBannerData, ruling } : null,
    })),

  hideObjection: () => set({ showObjectionBanner: false, objectionBannerData: null }),
  openVerdictModal: () => set({ showVerdictModal: true }),
  closeVerdictModal: () => set({ showVerdictModal: false }),
  setSpotlight: (spotlightRole) => set({ spotlightRole }),

  addNotice: (message, severity) =>
    set((s) => ({
      proceduralNotices: [
        ...s.proceduralNotices,
        { id: `${Date.now()}-${Math.random()}`, message, severity },
      ],
    })),

  removeNotice: (id) =>
    set((s) => ({ proceduralNotices: s.proceduralNotices.filter((n) => n.id !== id) })),
}));
