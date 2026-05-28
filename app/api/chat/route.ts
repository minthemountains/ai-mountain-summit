import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { retrieveChunks } from "@/lib/retrieval";
import talksData from "@/data/talks.json";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const { message, talkSlug } = await req.json();

  if (!message || typeof message !== "string") {
    return new Response("Missing message", { status: 400 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const talks = talksData as any[];
  const results = retrieveChunks(message, talks, talkSlug, 5);

  const context = results
    .map(
      ({ chunk, talk }) =>
        `[${talk.speaker} — "${talk.title}"]\n${chunk.text}`
    )
    .join("\n\n---\n\n");

  const systemPrompt = `Du bist ein hilfreicher Assistent für den AI Mountain Summit in Laax, Schweiz. \
Besucherinnen und Besucher können dich alles zu den Keynote-Vorträgen fragen. \
Beantworte Fragen ausschliesslich auf Basis der unten bereitgestellten Vortragauszüge. \
Antworte auf Deutsch, präzise und aufschlussreich. Nenne den Sprecher, wenn relevant. \
Falls die Information nicht in den Auszügen enthalten ist, sag das ehrlich.

Vortragauszüge:
${context || "Keine relevanten Auszüge gefunden."}`;

  const stream = client.messages.stream({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1024,
    system: systemPrompt,
    messages: [{ role: "user", content: message }],
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      for await (const event of stream) {
        if (
          event.type === "content_block_delta" &&
          event.delta.type === "text_delta"
        ) {
          controller.enqueue(encoder.encode(event.delta.text));
        }
      }
      controller.close();
    },
    cancel() {
      stream.abort();
    },
  });

  return new Response(readable, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
