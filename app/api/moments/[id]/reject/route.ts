import { NextRequest } from "next/server";
import { list, del } from "@vercel/blob";

export const runtime = "nodejs";

interface Moment {
  id: string;
  photoUrl: string;
  name: string;
  caption: string;
  approved: boolean;
  uploadedAt: string;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const password = request.headers.get("x-admin-password");
  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    // Find and delete meta blob
    const { blobs: metaBlobs } = await list({ prefix: `moments/meta/${id}.json` });
    if (metaBlobs.length === 0) {
      return Response.json({ error: "Moment not found" }, { status: 404 });
    }

    const metaBlob = metaBlobs[0];
    const res = await fetch(metaBlob.url, { cache: "no-store" });
    let photoUrl: string | null = null;
    if (res.ok) {
      const meta = (await res.json()) as Moment;
      photoUrl = meta.photoUrl;
    }

    // Delete meta
    await del(metaBlob.url);

    // Delete photo if we have the URL
    if (photoUrl) {
      await del(photoUrl);
    }

    return Response.json({ success: true });
  } catch (err) {
    console.error("Reject error:", err);
    return Response.json({ error: "Reject failed" }, { status: 500 });
  }
}
