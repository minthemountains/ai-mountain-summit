import { NextRequest } from "next/server";
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

export async function GET(request: NextRequest) {
  const password = request.headers.get("x-admin-password");
  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { blobs } = await list({ prefix: "moments/meta/" });

    const moments: Moment[] = [];

    await Promise.all(
      blobs.map(async (blob) => {
        try {
          const res = await fetch(blob.url, { cache: "no-store" });
          if (!res.ok) return;
          const meta = (await res.json()) as Moment;
          moments.push(meta);
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
    console.error("Admin list moments error:", err);
    return Response.json([], { status: 200 });
  }
}
