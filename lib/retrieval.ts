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

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2);
}

function buildIdf(chunks: Chunk[]): Map<string, number> {
  const docFreq = new Map<string, number>();
  for (const chunk of chunks) {
    const terms = new Set(tokenize(chunk.text));
    for (const term of terms) {
      docFreq.set(term, (docFreq.get(term) ?? 0) + 1);
    }
  }
  const idf = new Map<string, number>();
  const N = chunks.length;
  for (const [term, df] of docFreq) {
    idf.set(term, Math.log((N + 1) / (df + 1)) + 1);
  }
  return idf;
}

function tfidfVector(text: string, idf: Map<string, number>): Map<string, number> {
  const tokens = tokenize(text);
  const tf = new Map<string, number>();
  for (const token of tokens) {
    tf.set(token, (tf.get(token) ?? 0) + 1);
  }
  const vec = new Map<string, number>();
  for (const [term, freq] of tf) {
    const idfScore = idf.get(term) ?? 0;
    vec.set(term, (freq / tokens.length) * idfScore);
  }
  return vec;
}

function cosineSimilarity(a: Map<string, number>, b: Map<string, number>): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (const [term, val] of a) {
    dot += val * (b.get(term) ?? 0);
    normA += val * val;
  }
  for (const val of b.values()) {
    normB += val * val;
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

export function retrieveChunks(
  query: string,
  talks: Talk[],
  talkSlug?: string,
  topK = 5
): Array<{ chunk: Chunk; score: number; talk: Talk }> {
  const allChunks = talks.flatMap((t) =>
    t.chunks.map((c) => ({ chunk: c, talk: t }))
  );

  const filtered = talkSlug
    ? allChunks.filter((c) => c.chunk.talkSlug === talkSlug)
    : allChunks;

  if (filtered.length === 0) return [];

  const chunks = filtered.map((f) => f.chunk);
  const idf = buildIdf(chunks);
  const queryVec = tfidfVector(query, idf);

  const scored = filtered.map(({ chunk, talk }) => ({
    chunk,
    talk,
    score: cosineSimilarity(queryVec, tfidfVector(chunk.text, idf)),
  }));

  return scored.sort((a, b) => b.score - a.score).slice(0, topK);
}
