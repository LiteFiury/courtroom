import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Trial, TrialConfig } from "@/types/trial.types";
import { getSocket, connectSocket } from "@/lib/socket";

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
    // Re-fetch trial status when the page loads to detect stale "active" trials
    refetchOnMount: true,
    staleTime: 0,
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
export function useStartTrialWithSocket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      // First call REST to mark trial as starting
      await api.startTrial(id);

      // Ensure socket is connected and joined before emitting start_trial
      const socket = connectSocket();

      await new Promise<void>((resolve) => {
        if (socket.connected) {
          // Already connected — join and start immediately
          socket.emit("join_trial", { trialId: id });
          setTimeout(() => {
            socket.emit("start_trial", { trialId: id });
            resolve();
          }, 200);
        } else {
          // Wait for connection then join + start
          const onConnect = () => {
            socket.off("connect", onConnect);
            socket.emit("join_trial", { trialId: id });
            setTimeout(() => {
              socket.emit("start_trial", { trialId: id });
              resolve();
            }, 200);
          };
          socket.on("connect", onConnect);
          // Timeout fallback after 8s (Render cold start)
          setTimeout(() => {
            socket.off("connect", onConnect);
            resolve();
          }, 8000);
        }
      });
    },
    onSuccess: (_, id) => qc.invalidateQueries({ queryKey: ["trial", id] }),
  });
}
