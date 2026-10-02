"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { CheckCircle2, FileText, Loader2, UploadCloud, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { UploadResult } from "@/types";

interface FileUploadProps {
  label: string;
  hint?: string;
  value: string;
  onChange: (url: string) => void;
  purpose: "content" | "application" | "career";
  accept?: string;
  error?: string;
  id?: string;
}

/** Uploads a single file to /api/upload and stores the returned URL. */
export function FileUpload({
  label,
  hint = "JPG, PNG, WEBP or PDF · max 5 MB",
  value,
  onChange,
  purpose,
  accept = "image/jpeg,image/png,image/webp,application/pdf",
  error,
  id,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const isPdf = value.toLowerCase().endsWith(".pdf");
  const inputId = id ?? `upload-${label.replace(/\W+/g, "-").toLowerCase()}`;

  async function handleFile(file: File) {
    setUploadError(null);
    setUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      body.append("purpose", purpose);
      const res = await fetch("/api/upload", { method: "POST", body });
      const data = (await res.json()) as UploadResult & { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      onChange(data.url);
    } catch (err) {
      setUploadError((err as Error).message);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  const message = uploadError ?? error;

  return (
    <div>
      <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium">
        {label}
      </label>
      {value ? (
        <div className="flex items-center gap-3 rounded-xl border border-leaf-500/40 bg-leaf-500/5 p-3">
          {isPdf || !value.startsWith("http") ? (
            <FileText className="size-10 shrink-0 text-brand-600" aria-hidden />
          ) : (
            <span className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-muted">
              <Image src={value} alt="" fill sizes="48px" className="object-cover" />
            </span>
          )}
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1.5 text-sm font-medium text-leaf-600">
              <CheckCircle2 className="size-4" aria-hidden /> Uploaded
            </p>
            <a href={value} target="_blank" rel="noopener noreferrer" className="block truncate text-xs text-muted-foreground underline">
              View file
            </a>
          </div>
          <button type="button" onClick={() => onChange("")} className="rounded-md p-2 text-muted-foreground hover:bg-muted" aria-label={`Remove ${label}`}>
            <X className="size-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className={cn(
            "flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-6 text-center transition-colors hover:border-brand-400 hover:bg-brand-50/50",
            message ? "border-destructive/60" : "border-border",
          )}
          aria-describedby={`${inputId}-hint`}
        >
          {uploading ? <Loader2 className="size-7 animate-spin text-brand-600" /> : <UploadCloud className="size-7 text-brand-500" />}
          <span className="text-sm font-medium">{uploading ? "Uploading…" : "Click to upload"}</span>
          <span id={`${inputId}-hint`} className="text-xs text-muted-foreground">
            {hint}
          </span>
        </button>
      )}
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={accept}
        className="sr-only"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void handleFile(f);
        }}
      />
      {message ? (
        <p className="mt-1.5 text-xs text-destructive" role="alert">
          {message}
        </p>
      ) : null}
    </div>
  );
}
