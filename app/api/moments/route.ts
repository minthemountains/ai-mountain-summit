import { list } from "@vercel/blob";

export const runtime = "nodejs";

interface Moment {
  id: string;
  photoUrl: string;
  name: string;
  caption: string;
  approved: boolean;
  uploadedAt: string;
}

export async function GET() {
  try {
    const { blobs } = await list({ prefix: "moments/meta/" });

    const moments: Moment[] = [];

    await Promise.all(
      blobs.map(async (blob) => {
        try {
          const res = await fetch(blob.url, { next: { revalidate: 0 } });
          if (!res.ok) return;
          const meta = (await res.json()) as Moment;
          if (meta.approved) {
            moments.push(meta);
          }
        } catch {
          // skip malformed entries
        }
      })
    );

    // Sort newest first
    moments.sort(
      (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    );

    return Response.json(moments);
  } catch (err) {
    console.error("List moments error:", err);
    return Response.json([], { status: 200 });
  }
}
