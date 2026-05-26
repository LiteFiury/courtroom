const BASE_URL = process.env.NEXT_PUBLIC_ORCHESTRATOR_URL ?? "http://localhost:4000";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? `HTTP ${res.status}`);
  }
  return res.json();
}

export const api = {
  createTrial: (data: unknown) =>
    request("/trials", { method: "POST", body: JSON.stringify(data) }),
  getTrials: () => request("/trials"),
  getTrial: (id: string) => request(`/trials/${id}`),
  startTrial: (id: string) =>
    request(`/trials/${id}/start`, { method: "POST" }),
  getTranscript: (id: string) => request(`/trials/${id}/transcript`),
  getEvidence: (id: string) => request(`/trials/${id}/evidence`),
  submitEvidence: (id: string, data: unknown) =>
    request(`/trials/${id}/evidence`, { method: "POST", body: JSON.stringify(data) }),
};
