import { NextRequest } from "next/server";
import { put } from "@vercel/blob";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const name = (formData.get("name") as string | null)?.trim() || "";
    const caption = (formData.get("caption") as string | null)?.trim() || "";

    if (!file) {
      return Response.json({ error: "No file provided" }, { status: 400 });
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return Response.json({ error: "Only JPEG, PNG, and WebP images are allowed" }, { status: 400 });
    }

    const maxSize = 10 * 1024 * 1024; // 10 MB
    if (file.size > maxSize) {
      return Response.json({ error: "File too large. Maximum size is 10 MB." }, { status: 400 });
    }

    const id = crypto.randomUUID();
    const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";

    // Upload photo
    const photoBlob = await put(`moments/photos/${id}.${ext}`, file, {
      access: "public",
      contentType: file.type,
    });

    // Upload metadata as JSON blob
    const meta = {
      id,
      photoUrl: photoBlob.url,
      name,
      caption,
      approved: false,
      uploadedAt: new Date().toISOString(),
    };

    await put(`moments/meta/${id}.json`, JSON.stringify(meta), {
      access: "public",
      contentType: "application/json",
      addRandomSuffix: false,
    });

    return Response.json({ success: true, id });
  } catch (err) {
    console.error("Upload error:", err);
    return Response.json({ error: "Upload failed" }, { status: 500 });
  }
}
