import { createClient } from "@/lib/supabase/server";
import type { StorageProvider } from "./types";

/**
 * SUPABASE STORAGE PROVIDER (Production)
 *
 * Uses Supabase Storage for file uploads.
 * Supabase Storage is an S3-compatible object store with built-in CDN.
 *
 * HOW IT WORKS:
 * 1. Client requests a signed upload URL from our API
 * 2. We generate a signed URL using Supabase's createSignedUploadUrl
 * 3. Client uploads directly to Supabase Storage (bypasses our server)
 * 4. Public URL is served via Supabase's CDN
 *
 * BUCKET SETUP:
 * Create a bucket called "room-uploads" in Supabase Dashboard → Storage
 * Set it as PUBLIC for serving images via CDN URLs.
 */

const BUCKET_NAME = "room-uploads";

export class SupabaseStorageProvider implements StorageProvider {

  async generatePresignedUrl(
    key: string,
    contentType: string,
    _expiresInSeconds?: number
  ): Promise<{ presignedUrl: string; publicUrl: string }> {
    const supabase = await createClient();

    // Create a signed URL that allows the client to upload directly
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUploadUrl(key);

    if (error) {
      throw new Error(`Failed to create upload URL: ${error.message}`);
    }

    // Get the public URL for viewing the file after upload
    const { data: publicData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(key);

    return {
      presignedUrl: data.signedUrl,
      publicUrl: publicData.publicUrl,
    };
  }

  async deleteFile(key: string): Promise<void> {
    const supabase = await createClient();

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([key]);

    if (error) {
      // File might already be deleted — that's fine (idempotent)
      console.warn(`[SupabaseStorage] Failed to delete ${key}:`, error.message);
    }
  }
}

/** Singleton instance */
let instance: SupabaseStorageProvider | null = null;

export function getSupabaseStorageProvider(): SupabaseStorageProvider {
  if (!instance) {
    instance = new SupabaseStorageProvider();
  }
  return instance;
}
