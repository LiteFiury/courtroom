import Anthropic from "@anthropic-ai/sdk";
import type { AIProvider } from "./types";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export const anthropicProvider: AIProvider = {
  async streamCompletion({ model, systemPrompt, messages, temperature = 0.7, maxTokens = 1024, onToken }) {
    const stream = await client.messages.create({
      model,
      max_tokens: maxTokens,
      temperature,
      system: systemPrompt,
      stream: true,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    });

    let full = "";
    for await (const event of stream) {
      if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
        onToken(event.delta.text);
        full += event.delta.text;
      }
    }
    return full;
  },
};
