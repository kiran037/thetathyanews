///app/uploads/[...key]/route.ts
import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";

export const runtime = "nodejs";

const UPLOAD_ROOT = path.resolve(process.env.UPLOAD_PATH || "uploads");

const clean = (s: string) => {
  const t = s.replace(/[^a-zA-Z0-9._-]/g, "");
  return t && t !== "." && t !== ".." ? t : "";
};

const MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".pdf": "application/pdf",
  ".txt": "text/plain; charset=utf-8",
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ key: string[] }> }
) {
  try {
    const { key } = await params;
    const safe = (key || []).map(clean).filter(Boolean);
    
    if (!safe.length) {
      return NextResponse.json({ message: "File not specified" }, { status: 400 });
    }

    const abs = path.normalize(path.join(UPLOAD_ROOT, ...safe));
    const root = path.normalize(UPLOAD_ROOT);
    
    if (!abs.startsWith(root + path.sep)) {
      return NextResponse.json({ message: "Access denied" }, { status: 403 });
    }

    if (!fs.existsSync(abs)) {
      return NextResponse.json({ message: "File not found" }, { status: 404 });
    }

    const stat = await fs.promises.stat(abs);
    const ext = path.extname(abs).toLowerCase();
    const type = MIME[ext] || "application/octet-stream";
    const etag = `"${stat.mtime.getTime()}-${stat.size}"`;

    // Handle cache
    if (
      req.headers.get("if-none-match") === etag ||
      (req.headers.get("if-modified-since") &&
        new Date(req.headers.get("if-modified-since")!) >= stat.mtime)
    ) {
      return new NextResponse(null, {
        status: 304,
        headers: {
          "Cache-Control": "public, max-age=31536000, immutable",
          ETag: etag,
          "Last-Modified": stat.mtime.toUTCString(),
        },
      });
    }

    const fileBuffer = await fs.promises.readFile(abs);
    const uint8Array = new Uint8Array(fileBuffer);

    return new NextResponse(uint8Array, {
      status: 200,
      headers: {
        "Content-Type": type,
        "Content-Length": String(stat.size),
        "Cache-Control": "public, max-age=31536000, immutable",
        ETag: etag,
        "Last-Modified": stat.mtime.toUTCString(),
      },
    });
  } catch (error) {
    console.error("Error serving file:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}