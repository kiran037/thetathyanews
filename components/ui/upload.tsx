///components/ui/upload.tsx
"use client";

import { useState, useRef } from "react";
import { Upload as UploadIcon, X, Loader2, Image as ImageIcon } from "lucide-react";
import { Button } from "./button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface UploadProps {
  value?: string;
  onChange: (url: string) => void;
  folder?: string;
  accept?: string;
  maxSize?: number; // in MB
  className?: string;
  preview?: boolean;
}

export function Upload({
  value,
  onChange,
  folder = "avatars",
  accept = "image/*",
  maxSize = 5,
  className,
  preview = true,
}: UploadProps) {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(value || "");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size
    if (file.size > maxSize * 1024 * 1024) {
      toast.error(`File too large. Maximum ${maxSize}MB allowed.`);
      return;
    }

    // Validate type
    if (accept === "image/*" && !file.type.startsWith("image/")) {
      toast.error("Only image files are allowed");
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Upload failed");
      }

      setPreviewUrl(data.url);
      onChange(data.url);
      toast.success("File uploaded successfully");
    } catch (error: any) {
      toast.error(error.message || "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  };

  const handleRemove = () => {
    setPreviewUrl("");
    onChange("");
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
        disabled={uploading}
      />

      {preview && previewUrl && (
        <div className="relative inline-block">
          <div className="relative w-32 h-32 rounded-lg overflow-hidden border-2 border-border">
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full h-full object-cover"
            />
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center hover:bg-destructive/90 transition-colors"
            disabled={uploading}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="gap-2"
        >
          {uploading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <UploadIcon className="h-4 w-4" />
              {previewUrl ? "Change Image" : "Upload Image"}
            </>
          )}
        </Button>

        {previewUrl && !uploading && (
          <Button
            type="button"
            variant="ghost"
            onClick={handleRemove}
            className="gap-2 text-destructive hover:text-destructive"
          >
            <X className="h-4 w-4" />
            Remove
          </Button>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        Maximum file size: {maxSize}MB. Accepted formats: {accept === "image/*" ? "JPG, PNG, GIF, WebP" : accept}
      </p>
    </div>
  );
}