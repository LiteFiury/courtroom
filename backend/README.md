# courtroom-ai-backend

Express + Socket.IO orchestrator for the CourtRoom AI research platform.

## Setup

```bash
cp .env.example .env
# fill in DATABASE_URL, UPSTASH_*, AI provider keys
npm install
npm run db:push      # push schema to Neon
npm run dev          # start with hot-reload
```

## Deploy (Railway / Render)

1. Set all env vars from `.env.example`
2. Build command: `npm run build`
3. Start command:  `npm start`
4. Expose port 4000

## Environment variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | Neon Postgres connection string |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis REST URL |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis REST token |
| `GROQ_API_KEY` | Groq API key |
| `ANTHROPIC_API_KEY` | Anthropic API key |
| `OPENROUTER_API_KEY` | OpenRouter API key |
| `OLLAMA_BASE_URL` | Ollama base URL (default: http://localhost:11434) |
| `FRONTEND_URL` | Frontend origin for CORS (e.g. https://your-app.vercel.app) |
| `PORT` | Server port (default: 4000) |
