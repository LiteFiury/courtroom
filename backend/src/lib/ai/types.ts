export interface StreamChunk { token: string; done: boolean; }

export interface AIProvider {
  streamCompletion(params: {
    model: string;
    systemPrompt: string;
    messages: { role: "user" | "assistant"; content: string }[];
    temperature?: number;
    maxTokens?: number;
    onToken: (token: string) => void;
  }): Promise<string>;
}
