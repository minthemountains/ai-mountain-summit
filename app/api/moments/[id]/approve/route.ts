import { NextRequest } from "next/server";
import { list, put, del } from "@vercel/blob";

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
    // Find the meta blob
    const { blobs } = await list({ prefix: `moments/meta/${id}.json` });
    if (blobs.length === 0) {
      return Response.json({ error: "Moment not found" }, { status: 404 });
    }

    const blob = blobs[0];
    const res = await fetch(blob.url, { cache: "no-store" });
    if (!res.ok) {
      return Response.json({ error: "Could not read moment" }, { status: 500 });
    }

    const meta = (await res.json()) as Moment;

    // Delete old meta, re-upload with approved: true
    await del(blob.url);
    await put(`moments/meta/${id}.json`, JSON.stringify({ ...meta, approved: true }), {
      access: "public",
      contentType: "application/json",
      addRandomSuffix: false,
    });

    return Response.json({ success: true });
  } catch (err) {
    console.error("Approve error:", err);
    return Response.json({ error: "Approve failed" }, { status: 500 });
  }
}
