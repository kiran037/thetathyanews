// File: lib/storage/index.ts
import path from "path";
import fs from "fs";

export interface UploadResult {
  url: string;
  storageKey: string;
  storageProvider: "supabase" | "s3" | "local";
  storagePath: string;
}

export interface UploadOptions {
  buffer: Buffer;
  filename: string;
  mimeType: string;
  folder?: string;
}

/**
 * Storage Abstraction supporting Supabase Cloud Storage, S3, or Local Disk fallback.
 */
export class StorageService {
  private supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  private supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  private supabaseBucket = process.env.SUPABASE_STORAGE_BUCKET || "media";

  /**
   * Uploads file buffer to configured storage provider.
   */
  async upload(options: UploadOptions): Promise<UploadResult> {
    const { buffer, filename, mimeType, folder = "uploads" } = options;
    const cleanFolder = folder.toLowerCase().replace(/[^a-z0-9-_]/g, "") || "misc";
    const ext = path.extname(filename).toLowerCase();
    const storageKey = `${cleanFolder}/${Date.now()}-${Math.random().toString(36).substring(2, 10)}${ext}`;

    // 1. Try Supabase Storage if configured
    if (this.supabaseUrl && this.supabaseKey) {
      try {
        const uploadEndpoint = `${this.supabaseUrl.replace(/\/+$/, "")}/storage/v1/object/${this.supabaseBucket}/${storageKey}`;
        const response = await fetch(uploadEndpoint, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.supabaseKey}`,
            apikey: this.supabaseKey,
            "Content-Type": mimeType,
            "x-upsert": "true",
          },
          body: new Uint8Array(buffer),
        });

        if (response.ok) {
          const publicUrl = `${this.supabaseUrl.replace(/\/+$/, "")}/storage/v1/object/public/${this.supabaseBucket}/${storageKey}`;
          return {
            url: publicUrl,
            storageKey,
            storageProvider: "supabase",
            storagePath: `${this.supabaseBucket}/${storageKey}`,
          };
        } else {
          console.warn(`Supabase storage upload failed (${response.statusText}), falling back to local storage.`);
        }
      } catch (err) {
        console.warn("Error uploading to Supabase Storage, falling back to local:", err);
      }
    }

    // 2. Local fallback for local development or when cloud credentials are unconfigured
    const uploadRoot = path.resolve(process.env.UPLOAD_PATH || "uploads");
    const targetDir = path.join(uploadRoot, cleanFolder);
    await fs.promises.mkdir(targetDir, { recursive: true });

    const localFilename = path.basename(storageKey);
    const diskPath = path.join(targetDir, localFilename);
    const tmpPath = diskPath + ".part";

    await fs.promises.writeFile(tmpPath, buffer);
    await fs.promises.rename(tmpPath, diskPath);

    const publicUrl = `/uploads/${cleanFolder}/${localFilename}`;

    return {
      url: publicUrl,
      storageKey,
      storageProvider: "local",
      storagePath: diskPath,
    };
  }

  /**
   * Deletes an uploaded file (used for rollback if DB insertion fails).
   */
  async delete(storageKey: string, provider: "supabase" | "s3" | "local"): Promise<void> {
    try {
      if (provider === "supabase" && this.supabaseUrl && this.supabaseKey) {
        const deleteEndpoint = `${this.supabaseUrl.replace(/\/+$/, "")}/storage/v1/object/${this.supabaseBucket}/${storageKey}`;
        await fetch(deleteEndpoint, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${this.supabaseKey}`,
            apikey: this.supabaseKey,
          },
        });
        return;
      }

      if (provider === "local") {
        const uploadRoot = path.resolve(process.env.UPLOAD_PATH || "uploads");
        const diskPath = path.join(uploadRoot, storageKey);
        if (fs.existsSync(diskPath)) {
          await fs.promises.unlink(diskPath);
        }
      }
    } catch (err) {
      console.error(`Failed to clean up storage object ${storageKey}:`, err);
    }
  }
}

export const storage = new StorageService();
