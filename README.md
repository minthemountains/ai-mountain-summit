# AI Mountain Summit — Insights Tool

A public web tool for exploring key insights from AI Mountain Summit keynotes. Visitors can browse talk summaries, read insights and quotes, and ask questions about any talk using AI.

## Setup

### 1. Add your Anthropic API key

```bash
cp .env.local.example .env.local
# Edit .env.local and add your key
```

### 2. Add transcript files

Drop raw `.txt` transcription files into the `transcripts/` folder. Name them after the speaker:

```
transcripts/
  sam-altman.txt
  yann-lecun.txt
  ...
```

### 3. Process transcripts

```bash
npm run process
```

This calls Claude to generate summaries, key insights, quotes, and stores everything in `data/talks.json`. Run it again whenever you add new transcripts.

### 4. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Deploying to Vercel

1. Push this repo to GitHub
2. Import it in [Vercel](https://vercel.com/new)
3. Add `ANTHROPIC_API_KEY` as an environment variable
4. Deploy

The chat feature streams responses via a serverless API route — no additional infrastructure needed.

---

## How it works

- **Ingestion** (`scripts/process.ts`): Reads transcript files, calls Claude Haiku to extract structured data, chunks text for retrieval
- **Retrieval** (`lib/retrieval.ts`): TF-IDF cosine similarity search over transcript chunks — no vector DB required
- **Chat** (`app/api/chat/route.ts`): Finds relevant chunks, sends them as context to Claude, streams the response
- **Pages**: Home (insights + talk cards), Talk page (summary + insights + quotes + inline chat), floating global chat

---

## Stack

Next.js 16 · TypeScript · Tailwind CSS · Claude API (Haiku) · Vercel
