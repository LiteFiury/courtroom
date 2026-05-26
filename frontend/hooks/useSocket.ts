import { useEffect, useRef } from "react";
import { connectSocket, disconnectSocket, getSocket } from "@/lib/socket";
import { useCourtroomStore } from "@/store/courtroomStore";
import { useTranscriptStore } from "@/store/transcriptStore";
import { useUIStore } from "@/store/uiStore";
import type { CourtroomEvent } from "@/types/events.types";
import type { TranscriptEntry } from "@/types/trial.types";

export function useSocket(trialId: string) {
  const mounted = useRef(false);
  const courtroom = useCourtroomStore();
  const transcript = useTranscriptStore();
  const ui = useUIStore();

  useEffect(() => {
    if (mounted.current) return;
    mounted.current = true;

    const socket = connectSocket();

    socket.on("connect", () => {
      courtroom.setConnected(true);
      socket.emit("join_trial", { trialId });
    });

    socket.on("disconnect", () => courtroom.setConnected(false));

    socket.on("courtroom_event", (event: CourtroomEvent) => {
      switch (event.type) {
        case "PHASE_CHANGE":
          courtroom.setPhase(event.phase);
          break;

        case "SPEAKER_CHANGE":
          courtroom.setActiveSpeaker({
            agentId: event.agentId,
            role: event.role,
            entryId: "",
            startedAt: event.timestamp,
          });
          ui.setSpotlight(event.role);
          break;

        case "STREAM_START":
          courtroom.setActiveSpeaker({
            agentId: event.agentId,
            role: event.role,
            entryId: event.entryId,
            startedAt: event.timestamp,
          });
          courtroom.initStreamingEntry({
            entryId: event.entryId,
            role: event.role,
            content: "",
            isStreaming: true,
            isPaused: false,
            stricken: false,
          });
          break;

        case "TOKEN":
          courtroom.appendToken(event.entryId, event.token);
          break;

        case "STREAM_END": {
          courtroom.finalizeEntry(event.entryId);
          const entry = courtroom.streamingEntries[event.entryId];
          if (entry) {
            const transcriptEntry: TranscriptEntry = {
              id: event.entryId,
              trialId,
              participantId: event.agentId,
              role: event.role,
              phase: courtroom.phase,
              content: entry.content,
              stricken: false,
              tokenCount: event.tokenCount,
              sequence: Date.now(),
              createdAt: event.timestamp,
            };
            transcript.addEntry(transcriptEntry);
          }
          break;
        }

        case "OBJECTION_RAISED":
          if (courtroom.activeSpeaker?.entryId) {
            courtroom.pauseEntry(courtroom.activeSpeaker.entryId);
          }
          courtroom.setPendingObjection({
            id: event.objectionId,
            trialId,
            raisedBy: event.raisedBy,
            grounds: event.grounds,
            sequence: Date.now(),
            targetEntryId: event.targetEntryId,
          });
          ui.showObjection({ grounds: event.grounds, raisedBy: event.raisedBy });
          break;

        case "OBJECTION_RESOLVED":
          courtroom.setPendingObjection(null);
          ui.resolveObjection(event.ruling);
          if (event.ruling === "sustained" && event.strickenEntryId) {
            courtroom.strikeEntry(event.strickenEntryId);
            transcript.strikeEntry(event.strickenEntryId);
          } else if (event.ruling === "overruled") {
            const pending = courtroom.activeSpeaker?.entryId;
            if (pending) courtroom.resumeEntry(pending);
          }
          setTimeout(() => ui.hideObjection(), 3000);
          break;

        case "EVIDENCE_ADMITTED":
          courtroom.addEvidence(event.evidence);
          ui.addNotice(`Evidence admitted: ${event.evidence.title}`, "info");
          break;

        case "EVIDENCE_EXCLUDED":
          ui.addNotice(`Evidence excluded: ${event.evidence.title}`, "warning");
          break;

        case "VERDICT_ISSUED":
          courtroom.setVerdict(event.verdict);
          courtroom.setPhase("VERDICT");
          setTimeout(() => ui.openVerdictModal(), 1200);
          break;

        case "PROCEDURAL_NOTICE":
          ui.addNotice(event.message, event.severity);
          break;
      }
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("courtroom_event");
      socket.emit("leave_trial", { trialId });
      disconnectSocket();
      courtroom.reset();
      transcript.reset();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trialId]);
}
