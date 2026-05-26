import { Router } from "express";
import { prisma } from "../lib/db";

export const startRouter = Router();

// This is called by the frontend REST call. It signals the socket to start.
// The actual orchestrator starts via Socket.IO "start_trial" event.
// This route just validates + returns the trial for the frontend to then emit start_trial.
startRouter.post("/:id/start", async (req, res) => {
  try {
    const trial = await prisma.trial.findUnique({ where: { id: req.params.id } });
    if (!trial) return res.status(404).json({ message: "Not found" });
    if (trial.status !== "idle") return res.status(409).json({ message: "Trial already started" });
    return res.json({ trialId: trial.id, ready: true });
  } catch {
    return res.status(500).json({ message: "DB error" });
  }
});
