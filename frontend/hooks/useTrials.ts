import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { connectSocket } from "@/lib/socket";
import type { Trial, TrialConfig } from "@/types/trial.types";

export function useTrials() {
  return useQuery<Trial[]>({
    queryKey: ["trials"],
    queryFn: () => api.getTrials() as Promise<Trial[]>,
    refetchOnMount: true,
    staleTime: 0,
  });
}

export function useTrial(id: string) {
  return useQuery<Trial>({
    queryKey: ["trial", id],
    queryFn: () => api.getTrial(id) as Promise<Trial>,
    enabled: !!id,
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

export function useDeleteTrial() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteTrial(id),
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

export function useStartTrialWithSocket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.startTrial(id);
      const socket = connectSocket();

      await new Promise<void>((resolve) => {
        if (socket.connected) {
          socket.emit("join_trial", { trialId: id });
          setTimeout(() => { socket.emit("start_trial", { trialId: id }); resolve(); }, 200);
        } else {
          const onConnect = () => {
            socket.off("connect", onConnect);
            socket.emit("join_trial", { trialId: id });
            setTimeout(() => { socket.emit("start_trial", { trialId: id }); resolve(); }, 200);
          };
          socket.on("connect", onConnect);
          setTimeout(() => { socket.off("connect", onConnect); resolve(); }, 8000);
        }
      });
    },
    onSuccess: (_, id) => qc.invalidateQueries({ queryKey: ["trial", id] }),
  });
}
