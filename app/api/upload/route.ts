// File: app/api/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { verifySession } from "@/lib/middleware";
import { storage } from "@/lib/storage";
import { db } from "@/db";
import { media, mediaMimeTypeEnum } from "@/db/schema";

export const runtime = "nodejs";

const MAX_IMAGE_MB = 5;
const MAX_IMAGE_BYTES = MAX_IMAGE_MB * 1024 * 1024;

const ALLOWED_MIME_TYPES: Record<string, "image/jpeg" | "image/png" | "image/webp" | "image/gif"> = {
  "image/jpeg": "image/jpeg",
  "image/jpg": "image/jpeg",
  "image/png": "image/png",
  "image/gif": "image/gif",
  "image/webp": "image/webp",
};

/**
 * Validates binary file signatures (magic bytes) to prevent extension spoofing.
 */
function validateImageMagicBytes(buffer: Buffer): boolean {
  if (buffer.length < 12) return false;

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return true;

  // PNG: 89 50 4E 47
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) return true;

  // GIF: 47 49 46 38 ('GIF8')
  if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x38) return true;

  // WebP: RIFF [4 bytes length] WEBP
  if (
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return true;
  }

  return false;
}

function sanitizeFolder(v: string): string {
  const cleaned = v.toLowerCase().replace(/[^a-z0-9-_]/g, "");
  return cleaned || "misc";
}

function sanitizeFilename(originalName: string): string {
  const ext = path.extname(originalName).toLowerCase();
  const nameWithoutExt = path.basename(originalName, ext);
  const cleaned = nameWithoutExt
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-_]/g, "")
    .substring(0, 80);
  return (cleaned || "asset") + ext;
}

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate session
    const authContext = await verifySession(req);
    if (!authContext) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const folder = sanitizeFolder((formData.get("folder") as string) || "avatars");

    if (!file) {
      return NextResponse.json({ error: "No file provided in upload request" }, { status: 400 });
    }

    // 2. MIME & Extension check
    const rawMime = (file.type || "").toLowerCase();
    const normalizedMime = ALLOWED_MIME_TYPES[rawMime];
    if (!normalizedMime) {
      return NextResponse.json(
        { error: `Unsupported image format: ${rawMime || "unknown"}. Only JPEG, PNG, WebP, and GIF are permitted.` },
        { status: 400 }
      );
    }

    // 3. File size check
    if (typeof file.size === "number" && file.size > MAX_IMAGE_BYTES) {
      return NextResponse.json(
        { error: `File size exceeds the ${MAX_IMAGE_MB}MB limit.` },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (buffer.length > MAX_IMAGE_BYTES) {
      return NextResponse.json(
        { error: `File size exceeds the ${MAX_IMAGE_MB}MB limit.` },
        { status: 400 }
      );
    }

    // 4. Magic bytes binary inspection
    if (!validateImageMagicBytes(buffer)) {
      return NextResponse.json(
        { error: "Invalid file content. The file binary header does not match a valid image signature." },
        { status: 400 }
      );
    }

    const safeOriginalName = sanitizeFilename(file.name || "upload.jpg");

    // 5. Upload via Storage Service
    const uploadResult = await storage.upload({
      buffer,
      filename: safeOriginalName,
      mimeType: normalizedMime,
      folder,
    });

    // 6. Record metadata in PostgreSQL media table
    try {
      const [mediaRecord] = await db
        .insert(media)
        .values({
          uploadedBy: authContext.user.id,
          filename: path.basename(uploadResult.storageKey),
          originalFilename: safeOriginalName,
          mimeType: normalizedMime,
          mediaType: "image",
          fileSize: buffer.length,
          url: uploadResult.url,
          storageProvider: uploadResult.storageProvider,
          storageKey: uploadResult.storageKey,
          storagePath: uploadResult.storagePath,
          isPublic: true,
        })
        .returning();

      return NextResponse.json({
        message: "File uploaded successfully",
        url: uploadResult.url,
        id: mediaRecord.id,
        filename: mediaRecord.filename,
        size: buffer.length,
      });
    } catch (dbError) {
      // Rollback storage upload if DB insert fails
      console.error("Database insert failed during media upload, rolling back file:", dbError);
      await storage.delete(uploadResult.storageKey, uploadResult.storageProvider);
      return NextResponse.json({ error: "Failed to persist media metadata record" }, { status: 500 });
    }
  } catch (error: any) {
    console.error("Upload handler error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}