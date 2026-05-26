import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/db";

export const trialsRouter = Router();

const CreateSchema = z.object({
  title:           z.string().min(1),
  caseDescription: z.string().optional(),
  config: z.object({
    rules: z.enum(["federal", "simplified"]).default("simplified"),
    agentAssignments: z.array(z.object({
      role:        z.enum(["judge", "advocate_a", "advocate_b", "witness"]),
      provider:    z.enum(["groq", "anthropic", "openrouter", "ollama", "gemini", "cerebras"]),
      model:       z.string(),
      temperature: z.number().optional(),
    })),
  }),
});

// GET /trials
trialsRouter.get("/", async (_req, res) => {
  try {
    const trials = await prisma.trial.findMany({
      orderBy: { createdAt: "desc" },
      select: { id: true, title: true, caseDescription: true, status: true, config: true, createdAt: true, concludedAt: true },
    });
    res.json(trials);
  } catch (e) {
    res.status(500).json({ message: "DB error" });
  }
});

// POST /trials
trialsRouter.post("/", async (req, res) => {
  const parsed = CreateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid body", errors: parsed.error.issues });

  try {
    const trial = await prisma.trial.create({
      data: {
        title:           parsed.data.title,
        caseDescription: parsed.data.caseDescription,
        config:          parsed.data.config as object,
        status:          "idle",
      },
    });
    return res.status(201).json(trial);
  } catch (e) {
    return res.status(500).json({ message: "DB error" });
  }
});

// GET /trials/:id
trialsRouter.get("/:id", async (req, res) => {
  try {
    const trial = await prisma.trial.findUnique({ where: { id: req.params.id } });
    if (!trial) return res.status(404).json({ message: "Not found" });
    return res.json(trial);
  } catch {
    return res.status(500).json({ message: "DB error" });
  }
});

// GET /trials/:id/transcript
trialsRouter.get("/:id/transcript", async (req, res) => {
  try {
    const entries = await prisma.transcriptEntry.findMany({
      where: { trialId: req.params.id },
      orderBy: { sequence: "asc" },
    });
    res.json(entries);
  } catch {
    res.status(500).json({ message: "DB error" });
  }
});

// GET /trials/:id/evidence
trialsRouter.get("/:id/evidence", async (req, res) => {
  try {
    const evidence = await prisma.evidence.findMany({ where: { trialId: req.params.id } });
    res.json(evidence);
  } catch {
    res.status(500).json({ message: "DB error" });
  }
});

// POST /trials/:id/evidence
trialsRouter.post("/:id/evidence", async (req, res) => {
  const schema = z.object({
    submittedBy: z.string(),
    title:       z.string(),
    content:     z.string(),
    fileUrl:     z.string().optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid body" });

  try {
    const evidence = await prisma.evidence.create({
      data: { ...parsed.data, trialId: req.params.id, status: "pending" },
    });
    return res.status(201).json(evidence);
  } catch {
    return res.status(500).json({ message: "DB error" });
  }
});
