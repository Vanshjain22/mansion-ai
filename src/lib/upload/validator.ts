import { ACCEPTED_IMAGE_TYPES, MAX_UPLOAD_SIZE_BYTES } from "@/lib/utils/constants";
import type { UploadConfig, UploadValidationError } from "./types";

/**
 * Validate a file before entering the upload pipeline.
 *
 * Returns null if valid, or a structured error if invalid.
 * Structured errors (code + message) let the UI show specific guidance:
 * - INVALID_TYPE → "Try uploading a JPG, PNG, or WebP image"
 * - FILE_TOO_LARGE → "Compress the image or choose a smaller one"
 *
 * Why validate on the client AND server?
 * Client validation = instant feedback (no network round-trip).
 * Server validation = security (clients can be tampered with).
 * Never trust client-side validation alone.
 */
export function validateFile(
  file: File | null | undefined,
  config?: Pick<UploadConfig, "maxSizeMB" | "acceptedTypes">
): UploadValidationError | null {
  if (!file) {
    return {
      code: "NO_FILE",
      message: "No file selected. Please choose an image to upload.",
    };
  }

  const acceptedTypes = config?.acceptedTypes ?? ACCEPTED_IMAGE_TYPES;
  const maxSizeBytes =
    (config?.maxSizeMB ?? MAX_UPLOAD_SIZE_BYTES / (1024 * 1024)) * 1024 * 1024;

  // Check MIME type. We check both the type property AND the file extension
  // because some browsers report incorrect MIME types for renamed files.
  const hasValidType = acceptedTypes.includes(file.type);
  const extension = file.name.split(".").pop()?.toLowerCase();
  const validExtensions = ["jpg", "jpeg", "png", "webp"];
  const hasValidExtension = extension ? validExtensions.includes(extension) : false;

  if (!hasValidType && !hasValidExtension) {
    return {
      code: "INVALID_TYPE",
      message: `Unsupported file type "${file.type || extension}". Please upload a JPG, PNG, or WebP image.`,
    };
  }

  if (file.size > maxSizeBytes) {
    const maxMB = (maxSizeBytes / (1024 * 1024)).toFixed(0);
    const fileMB = (file.size / (1024 * 1024)).toFixed(1);
    return {
      code: "FILE_TOO_LARGE",
      message: `File is ${fileMB}MB, but the maximum is ${maxMB}MB. Please choose a smaller image.`,
    };
  }

  return null;
}
