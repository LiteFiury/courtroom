import { useEffect } from "react";
import { useCourtroomStore } from "@/store/courtroomStore";

export function useElapsed() {
  const phase = useCourtroomStore((s) => s.phase);
  const increment = useCourtroomStore((s) => s.incrementElapsed);

  useEffect(() => {
    if (phase === "IDLE" || phase === "CONCLUDED") return;
    const id = setInterval(increment, 1000);
    return () => clearInterval(id);
  }, [phase, increment]);
}
