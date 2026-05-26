import Groq from "groq-sdk";
import type { AIProvider } from "./types";

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

export const groqProvider: AIProvider = {
  async streamCompletion({ model, systemPrompt, messages, temperature = 0.7, maxTokens = 1024, onToken }) {
    const stream = await client.chat.completions.create({
      model,
      temperature,
      max_tokens: maxTokens,
      stream: true,
      messages: [
        { role: "system", content: systemPrompt },
        ...messages,
      ],
    });

    let full = "";
    for await (const chunk of stream) {
      const token = chunk.choices[0]?.delta?.content ?? "";
      if (token) { onToken(token); full += token; }
    }
    return full;
  },
};
