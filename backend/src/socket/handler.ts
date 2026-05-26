import { Server as IOServer, Socket } from "socket.io";
import { prisma } from "../lib/db";
import { TrialOrchestrator } from "../orchestrator/TrialOrchestrator";
import type { TrialConfig } from "../lib/types";

// Map of trialId -> orchestrator (so we don't start duplicates)
const active = new Map<string, TrialOrchestrator>();

export function registerSocketHandlers(io: IOServer) {
  io.on("connection", (socket: Socket) => {
    console.log(`[socket] connected: ${socket.id}`);

    socket.on("join_trial", ({ trialId }: { trialId: string }) => {
      socket.join(trialId);
      console.log(`[socket] ${socket.id} joined trial ${trialId}`);
    });

    socket.on("leave_trial", ({ trialId }: { trialId: string }) => {
      socket.leave(trialId);
    });

    socket.on("start_trial", async ({ trialId }: { trialId: string }) => {
      if (active.has(trialId)) return;

      try {
        const trial = await prisma.trial.findUnique({ where: { id: trialId } });
        if (!trial || trial.status !== "idle") return;

        const config = trial.config as unknown as TrialConfig;
        const orchestrator = new TrialOrchestrator(io, trialId, config);
        active.set(trialId, orchestrator);

        orchestrator.run().finally(() => active.delete(trialId));
      } catch (e) {
        console.error("[socket] start_trial error:", e);
        io.to(trialId).emit("courtroom_event", {
          type: "ERROR", trialId, timestamp: new Date().toISOString(), message: String(e),
        });
      }
    });

    socket.on("disconnect", () => {
      console.log(`[socket] disconnected: ${socket.id}`);
    });
  });
}
