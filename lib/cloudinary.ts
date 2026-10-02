import "server-only";
import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";
import { ALLOWED_UPLOAD_TYPES, MAX_UPLOAD_BYTES } from "@/lib/constants";
import type { UploadResult } from "@/types";

/** True when Cloudinary credentials are configured. */
export function isCloudinaryConfigured(): boolean {
  return Boolean(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);
}

function configure() {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

/** Magic-number check so a renamed file cannot pass as an image or PDF. */
function sniffType(bytes: Uint8Array): string | null {
  const hex = Array.from(bytes.slice(0, 12), (b) => b.toString(16).padStart(2, "0")).join("");
  if (hex.startsWith("ffd8ff")) return "image/jpeg";
  if (hex.startsWith("89504e47")) return "image/png";
  if (hex.startsWith("52494646") && hex.slice(16, 24) === "57454250") return "image/webp";
  if (hex.startsWith("25504446")) return "application/pdf";
  return null;
}

export class UploadError extends Error {}

/**
 * Validates and uploads a file to Cloudinary.
 * @param file - File from multipart form data.
 * @param folder - Destination folder, e.g. "isc/applications".
 * @throws UploadError with a user-facing message on invalid input.
 */
export async function uploadFile(file: File, folder: string): Promise<UploadResult> {
  if (!isCloudinaryConfigured()) throw new UploadError("File uploads are not configured yet. Please contact the office.");
  if (file.size === 0) throw new UploadError("The file is empty.");
  if (file.size > MAX_UPLOAD_BYTES) throw new UploadError(`File is too large. Maximum size is ${MAX_UPLOAD_BYTES / 1024 / 1024} MB.`);

  const buffer = Buffer.from(await file.arrayBuffer());
  const detected = sniffType(buffer);
  if (!detected || !(ALLOWED_UPLOAD_TYPES as readonly string[]).includes(detected)) {
    throw new UploadError("Only JPG, PNG, WEBP images or PDF files are allowed.");
  }

  configure();
  const result = await new Promise<UploadApiResponse>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
        use_filename: false,
        unique_filename: true,
        overwrite: false,
        ...(detected !== "application/pdf" ? { transformation: [{ width: 2400, height: 2400, crop: "limit", quality: "auto" }] } : {}),
      },
      (error, res) => (error || !res ? reject(error ?? new Error("Upload failed")) : resolve(res)),
    );
    stream.end(buffer);
  });

  return { url: result.secure_url, publicId: result.public_id, format: result.format, bytes: result.bytes };
}
