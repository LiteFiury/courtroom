import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Trial, TrialConfig } from "@/types/trial.types";

export function useTrials() {
  return useQuery<Trial[]>({
    queryKey: ["trials"],
    queryFn: () => api.getTrials() as Promise<Trial[]>,
  });
}

export function useTrial(id: string) {
  return useQuery<Trial>({
    queryKey: ["trial", id],
    queryFn: () => api.getTrial(id) as Promise<Trial>,
    enabled: !!id,
  });
}

export function useCreateTrial() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { title: string; caseDescription?: string; config: TrialConfig }) =>
      api.createTrial(data) as Promise<Trial>,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["trials"] }),
  });
}

export function useStartTrial() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.startTrial(id) as Promise<Trial>,
    onSuccess: (_, id) => qc.invalidateQueries({ queryKey: ["trial", id] }),
  });
}

// After REST start resolves, emit socket start_trial so orchestrator fires
import { getSocket } from "@/lib/socket";

export function useStartTrialWithSocket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.startTrial(id);
      const socket = getSocket();
      if (socket.connected) socket.emit("start_trial", { trialId: id });
    },
    onSuccess: (_, id) => qc.invalidateQueries({ queryKey: ["trial", id] }),
  });
}
