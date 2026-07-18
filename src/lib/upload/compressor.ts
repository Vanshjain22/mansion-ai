import imageCompression from "browser-image-compression";
import type { UploadConfig } from "./types";

/**
 * Compress an image on the client side before uploading.
 *
 * WHY CLIENT-SIDE COMPRESSION?
 *
 * A 12MP phone photo is typically 4-8MB. Our AI model only needs ~1-2MP
 * (2048px max dimension). Uploading the full 8MB wastes:
 * - User's bandwidth and time (especially on mobile)
 * - Storage space (and money)
 * - AI processing time (larger images = slower inference)
 *
 * By compressing to ~1MB before upload, we save 80%+ bandwidth.
 *
 * HOW IT WORKS (browser-image-compression):
 * 1. Decodes the image into a Canvas element
 * 2. Resizes to maxWidthOrHeight (maintains aspect ratio)
 * 3. Re-encodes with quality reduction until target size is met
 * 4. Uses Web Workers to avoid blocking the UI thread
 *
 * TRADEOFF: We use browser-image-compression over manual Canvas API because:
 * - It handles edge cases (EXIF orientation, alpha channels, iOS memory limits)
 * - It provides progress callbacks
 * - It uses Web Workers (Canvas API blocks the main thread on large images)
 * - Manual implementation would be ~200 lines with the same bugs
 */

interface CompressionOptions {
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
  onProgress?: (progress: number) => void;
}

export async function compressImage(
  file: File,
  options?: CompressionOptions
): Promise<File> {
  const targetSizeMB = options?.maxSizeMB ?? 1;
  const alreadySmallEnough = file.size <= targetSizeMB * 1024 * 1024;

  // Skip compression if the file is already under the target size.
  // This avoids unnecessary re-encoding which can reduce quality.
  if (alreadySmallEnough) {
    options?.onProgress?.(100);
    return file;
  }

  const compressed = await imageCompression(file, {
    maxSizeMB: targetSizeMB,
    maxWidthOrHeight: options?.maxWidthOrHeight ?? 2048,
    useWebWorker: true,
    onProgress: options?.onProgress,
    // Preserve the original format. Converting to WebP would save more space
    // but some AI models prefer JPEG input for consistent color handling.
    fileType: file.type as "image/jpeg" | "image/png" | "image/webp",
  });

  // browser-image-compression returns a Blob, convert back to File
  // to preserve the filename (needed for generating storage keys)
  return new File([compressed], file.name, {
    type: compressed.type,
    lastModified: Date.now(),
  });
}

/** Build compression options from our upload config */
export function getCompressionOptions(
  config?: Pick<UploadConfig, "compressionTargetMB" | "compressionMaxDimension">
): Omit<CompressionOptions, "onProgress"> {
  return {
    maxSizeMB: config?.compressionTargetMB ?? 1,
    maxWidthOrHeight: config?.compressionMaxDimension ?? 2048,
  };
}
