import { put, list } from "@vercel/blob";

export const runtime = "nodejs";

async function getCount(): Promise<{ count: number; url: string | null }> {
  try {
    const { blobs } = await list({ prefix: "likes/" });
    const blob = blobs.find((b) => b.pathname === "likes/count.json");
    if (!blob) return { count: 0, url: null };
    const res = await fetch(blob.url, { cache: "no-store" });
    if (!res.ok) return { count: 0, url: blob.url };
    const data = await res.json();
    return { count: typeof data.count === "number" ? data.count : 0, url: blob.url };
  } catch {
    return { count: 0, url: null };
  }
}

export async function GET() {
  const { count } = await getCount();
  return Response.json({ count });
}

export async function POST() {
  const { count: current } = await getCount();
  const newCount = current + 1;

  await put("likes/count.json", JSON.stringify({ count: newCount }), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
  });

  return Response.json({ count: newCount });
}
