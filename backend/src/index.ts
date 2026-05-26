import "dotenv/config";
import express from "express";
import cors from "cors";
import http from "http";
import { Server as IOServer } from "socket.io";

import { trialsRouter } from "./routes/trials";
import { startRouter }  from "./routes/start";
import { registerSocketHandlers } from "./socket/handler";

const app    = express();
const server = http.createServer(app);
const io     = new IOServer(server, {
  cors: { origin: process.env.FRONTEND_URL ?? "http://localhost:3000", methods: ["GET", "POST"] },
});

app.use(cors({ origin: process.env.FRONTEND_URL ?? "http://localhost:3000" }));
app.use(express.json());

app.use("/trials", trialsRouter);
app.use("/trials", startRouter);

app.get("/health", (_req, res) => res.json({ status: "ok", time: new Date().toISOString() }));

registerSocketHandlers(io);

// Wire up REST start → socket start_trial
app.post("/trials/:id/start", async (req, res) => {
  const { id } = req.params;
  io.to(id).emit("start_trial_server", { trialId: id });
  // Actually emit start_trial to the orchestrator via server-side socket
  const sockets = await io.in(id).fetchSockets();
  if (sockets.length === 0) {
    // No client connected yet — start via direct import
    const { prisma } = await import("./lib/db");
    const { TrialOrchestrator } = await import("./orchestrator/TrialOrchestrator");
    const trial = await prisma.trial.findUnique({ where: { id } });
    if (!trial || trial.status !== "idle") return res.status(409).json({ message: "Cannot start" });
    const config = trial.config as never;
    const orch = new TrialOrchestrator(io, id, config);
    orch.run().catch(console.error);
    return res.json({ trialId: id, started: true });
  }
  return res.json({ trialId: id, started: true });
});

const PORT = parseInt(process.env.PORT ?? "4000", 10);
server.listen(PORT, () => console.log(`[server] Listening on :${PORT}`));
