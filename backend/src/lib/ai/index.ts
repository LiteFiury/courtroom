import type { AIProvider } from "./types";
import { groqProvider }       from "./groq";
import { anthropicProvider }  from "./anthropic";
import { openrouterProvider } from "./openrouter";
import { ollamaProvider }     from "./ollama";
import { geminiProvider }     from "./gemini";
import { cerebrasProvider }   from "./cerebras";

export type ProviderKey = "groq" | "anthropic" | "openrouter" | "ollama" | "gemini" | "cerebras";

const providers: Record<ProviderKey, AIProvider> = {
  groq:        groqProvider,
  anthropic:   anthropicProvider,
  openrouter:  openrouterProvider,
  ollama:      ollamaProvider,
  gemini:      geminiProvider,
  cerebras:    cerebrasProvider,
};

export function getProvider(key: ProviderKey): AIProvider {
  const p = providers[key];
  if (!p) throw new Error(`Unknown AI provider: ${key}`);
  return p;
}
