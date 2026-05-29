import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { put } from "@vercel/blob";
import { NextRequest } from "next/server";

export const runtime = "nodejs";

export async function POST(request: NextRequest): Promise<Response> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (_pathname, clientPayload) => {
        // Validate and pass metadata through to the completion callback
        return {
          allowedContentTypes: ["image/jpeg", "image/png", "image/webp"],
          maximumSizeInBytes: 20 * 1024 * 1024, // 20 MB — no function body limit here
          tokenPayload: clientPayload ?? "",
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        // Parse name + caption the client sent alongside the file
        let name = "";
        let caption = "";
        try {
          const meta = JSON.parse(tokenPayload || "{}");
          name = meta.name ?? "";
          caption = meta.caption ?? "";
        } catch {
          // ignore parse errors
        }

        const id = crypto.randomUUID();

        // Store metadata as a JSON blob next to the photo
        await put(
          `moments/meta/${id}.json`,
          JSON.stringify({
            id,
            photoUrl: blob.url,
            name,
            caption,
            approved: false,
            uploadedAt: new Date().toISOString(),
          }),
          {
            access: "public",
            contentType: "application/json",
            addRandomSuffix: false,
          }
        );
      },
    });

    return Response.json(jsonResponse);
  } catch (error) {
    return Response.json(
      { error: (error as Error).message },
      { status: 400 }
    );
  }
}
