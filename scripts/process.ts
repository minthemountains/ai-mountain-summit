import * as fs from "fs";
import * as path from "path";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const TRANSCRIPTS_DIR = path.join(process.cwd(), "transcripts");
const OUTPUT_FILE = path.join(process.cwd(), "data", "talks.json");
const CHUNK_SIZE = 500; // approximate tokens (~2000 chars)

interface Chunk {
  id: string;
  talkSlug: string;
  text: string;
  index: number;
}

interface Talk {
  slug: string;
  speaker: string;
  title: string;
  tagline: string;
  summary: string;
  insights: string[];
  quotes: string[];
  chunks: Chunk[];
}

function chunkText(text: string, slug: string): Chunk[] {
  const paragraphs = text.split(/\n\n+/).filter((p) => p.trim().length > 50);
  const chunks: Chunk[] = [];
  let current = "";
  let index = 0;

  for (const para of paragraphs) {
    if ((current + para).length > CHUNK_SIZE * 4) {
      if (current.trim()) {
        chunks.push({ id: `${slug}-${index}`, talkSlug: slug, text: current.trim(), index });
        index++;
      }
      current = para;
    } else {
      current = current ? `${current}\n\n${para}` : para;
    }
  }
  if (current.trim()) {
    chunks.push({ id: `${slug}-${index}`, talkSlug: slug, text: current.trim(), index });
  }
  return chunks;
}

async function processTranscript(filePath: string): Promise<Talk> {
  const slug = path.basename(filePath, ".txt");
  const transcript = fs.readFileSync(filePath, "utf-8");

  console.log(`  Processing ${slug}...`);

  const prompt = `Du analysierst ein Vortragstranskript vom AI Mountain Summit in Laax, Schweiz.

Transkript:
---
${transcript.slice(0, 15000)}
---

Gib ein JSON-Objekt mit genau diesen Feldern zurück. Alle Texte auf Deutsch:
{
  "speaker": "Vollständiger Name des Sprechers",
  "title": "Vortragstitel (aus dem Inhalt ableiten, falls nicht explizit genannt)",
  "tagline": "Ein prägnanter Satz (max. 12 Wörter), der die Kernbotschaft einfängt",
  "summary": "Eine klare, packende Zusammenfassung der wichtigsten Ideen (120–150 Wörter, auf Deutsch)",
  "insights": ["5–7 konkrete, umsetzbare Erkenntnisse als vollständige Sätze auf Deutsch. Jeder Satz beginnt mit einem Verb oder Substantiv."],
  "quotes": ["2–3 wörtliche, einprägsame Zitate des Sprechers. Nur aufnehmen, wenn klar im Transkript vorhanden."]
}

Nur gültiges JSON zurückgeben, ohne Markdown-Fences.`;

  const response = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 2000,
    messages: [{ role: "user", content: prompt }],
  });

  const content = response.content[0];
  if (content.type !== "text") throw new Error("Unexpected response type");

  let parsed: Omit<Talk, "slug" | "chunks">;
  try {
    parsed = JSON.parse(content.text);
  } catch {
    const match = content.text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error(`Could not parse JSON for ${slug}`);
    parsed = JSON.parse(match[0]);
  }

  const chunks = chunkText(transcript, slug);

  return { slug, ...parsed, chunks };
}

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("Error: ANTHROPIC_API_KEY environment variable is required");
    process.exit(1);
  }

  if (!fs.existsSync(TRANSCRIPTS_DIR)) {
    fs.mkdirSync(TRANSCRIPTS_DIR, { recursive: true });
    console.log("Created transcripts/ directory. Add .txt transcript files and run again.");
    return;
  }

  const files = fs.readdirSync(TRANSCRIPTS_DIR).filter((f) => f.endsWith(".txt"));

  if (files.length === 0) {
    console.log("No .txt files found in transcripts/. Add transcript files and run again.");
    return;
  }

  console.log(`Found ${files.length} transcript(s). Processing...`);

  const talks: Talk[] = [];
  for (const file of files) {
    try {
      const talk = await processTranscript(path.join(TRANSCRIPTS_DIR, file));
      talks.push(talk);
      console.log(`  ✓ ${talk.speaker} — "${talk.title}"`);
    } catch (err) {
      console.error(`  ✗ Failed to process ${file}:`, err);
    }
  }

  const dataDir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(talks, null, 2));
  console.log(`\nWrote ${talks.length} talks to data/talks.json`);
}

main().catch(console.error);
