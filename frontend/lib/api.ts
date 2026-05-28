const BASE_URL = process.env.NEXT_PUBLIC_ORCHESTRATOR_URL ?? "http://localhost:4000";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000);
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      ...options,
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.message ?? `HTTP ${res.status}`);
    }
    // 204 No Content (delete)
    if (res.status === 204) return undefined as T;
    return res.json();
  } catch (err: unknown) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error("Backend is taking too long to respond. It may still be waking up — please refresh.");
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}

export const api = {
  createTrial:   (data: unknown) => request("/trials", { method: "POST", body: JSON.stringify(data) }),
  getTrials:     () => request("/trials"),
  getTrial:      (id: string) => request(`/trials/${id}`),
  startTrial:    (id: string) => request(`/trials/${id}/start`, { method: "POST" }),
  deleteTrial:   (id: string) => request(`/trials/${id}`, { method: "DELETE" }),
  getTranscript: (id: string) => request(`/trials/${id}/transcript`),
  getEvidence:   (id: string) => request(`/trials/${id}/evidence`),
  submitEvidence:(id: string, data: unknown) => request(`/trials/${id}/evidence`, { method: "POST", body: JSON.stringify(data) }),
};
