import type { AIProvider } from "./types";

const BASE = process.env.OLLAMA_BASE_URL ?? "http://localhost:11434";

export const ollamaProvider: AIProvider = {
  async streamCompletion({ model, systemPrompt, messages, temperature = 0.7, maxTokens = 1024, onToken }) {
    const res = await fetch(`${BASE}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        stream: true,
        options: { temperature, num_predict: maxTokens },
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
      }),
    });

    const reader = res.body?.getReader();
    if (!reader) throw new Error("No stream body from Ollama");

    let full = "";
    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const lines = decoder.decode(value).split("\n").filter(Boolean);
      for (const line of lines) {
        try {
          const parsed = JSON.parse(line);
          const token = parsed.message?.content ?? "";
          if (token) { onToken(token); full += token; }
        } catch { /* skip */ }
      }
    }
    return full;
  },
};
