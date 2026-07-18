/*
 * STORAGE PROVIDER INTERFACE
 *
 * This defines the contract that ANY storage backend must satisfy.
 * Whether we're using local filesystem (dev), Cloudflare R2, or AWS S3,
 * the calling code (API routes) uses these same methods.
 *
 * This is the Strategy Pattern applied to infrastructure:
 * - In development: LocalStorageProvider (writes to public/uploads/)
 * - In production: R2StorageProvider (writes to Cloudflare R2)
 *
 * Swapping providers = changing one line in a factory function.
 * No API route changes, no hook changes, no component changes.
 */

export interface StorageProvider {
  /**
   * Generate a URL that allows the client to upload directly to storage,
   * bypassing our server. This is how S3, R2, and GCS all work.
   *
   * @param key - The storage path (e.g., "uploads/abc123-room.jpg")
   * @param contentType - MIME type the client will upload
   * @param expiresInSeconds - How long the URL is valid (default: 300 = 5 min)
   * @returns presignedUrl (for uploading) and publicUrl (for viewing)
   */
  generatePresignedUrl(
    key: string,
    contentType: string,
    expiresInSeconds?: number
  ): Promise<{
    presignedUrl: string;
    publicUrl: string;
  }>;

  /** Remove a file from storage (used when user deletes a design) */
  deleteFile(key: string): Promise<void>;
}

/**
 * Generate a unique storage key for an uploaded file.
 * Format: "uploads/{timestamp}-{random}-{sanitized-filename}"
 *
 * Why this format?
 * - Timestamp prefix: files sort chronologically in storage browsers
 * - Random segment: prevents collisions if two users upload "room.jpg" simultaneously
 * - Original filename: helps humans identify files when debugging
 * - Sanitization: removes special characters that could break URLs or filesystem paths
 */
export function generateStorageKey(originalFilename: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const sanitized = originalFilename
    .toLowerCase()
    .replace(/[^a-z0-9.]/g, "-")
    .replace(/-+/g, "-");

  return `uploads/${timestamp}-${random}-${sanitized}`;
}
