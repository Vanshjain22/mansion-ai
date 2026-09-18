import { NextResponse } from "next/server";
import { generateStorageKey } from "@/lib/storage/types";
import { getLocalStorageProvider } from "@/lib/storage/local";
import { getSupabaseStorageProvider } from "@/lib/storage/supabase";
import { ACCEPTED_IMAGE_TYPES } from "@/lib/utils/constants";
import { getAuthUser } from "@/lib/supabase/auth-helpers";

// Dynamic storage provider factory
function getStorageProvider() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (supabaseUrl && !supabaseUrl.startsWith("your_")) {
    return getSupabaseStorageProvider();
  }
  return getLocalStorageProvider();
}

/**
 * POST /api/upload/presign
 *
 * Generates a presigned URL that authorizes the client to upload
 * directly to storage.
 *
 * REQUEST BODY:
 * {
 *   "fileName": "living-room.jpg",
 *   "contentType": "image/jpeg"
 * }
 *
 * RESPONSE:
 * {
 *   "success": true,
 *   "data": {
 *     "presignedUrl": "...",   // URL to PUT the file to
 *     "publicUrl": "...",      // URL to access the file after upload
 *     "key": "uploads/..."     // Storage key for database reference
 *   }
 * }
 *
 * PRODUCTION NOTES:
 * - This route should require authentication (check session)
 * - Add rate limiting (10 requests/minute per user)
 * - Deduct credits or check quota before generating URL
 * - Switch getLocalStorageProvider() to getR2Provider() for production
 */
import { uploadRateLimiter } from "@/lib/utils/rate-limiter";

export async function POST(request: Request) {
  try {
    // ── Rate Limiting ──
    const clientIp = request.headers.get("x-forwarded-for") || "127.0.0.1";
    const limitCheck = uploadRateLimiter.check(clientIp);
    if (!limitCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "RATE_LIMIT_EXCEEDED",
            message: `Too many upload requests. Please try again after ${Math.ceil(limitCheck.retryAfterMs / 1000)} seconds.`,
          },
        },
        {
          status: 429,
          headers: { "Retry-After": Math.ceil(limitCheck.retryAfterMs / 1000).toString() },
        }
      );
    }

    const body = await request.json();
    const { fileName, contentType } = body;

    // ── Server-side validation ──
    // NEVER trust client-side validation alone. The client can be bypassed.
    if (!fileName || typeof fileName !== "string") {
      return NextResponse.json(
        {
          success: false,
          error: { code: "INVALID_REQUEST", message: "fileName is required." },
        },
        { status: 400 }
      );
    }

    if (!contentType || !ACCEPTED_IMAGE_TYPES.includes(contentType)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_TYPE",
            message: `Content type "${contentType}" is not supported. Use: ${ACCEPTED_IMAGE_TYPES.join(", ")}`,
          },
        },
        { status: 400 }
      );
    }

    // ── Authentication ──
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Please sign in to upload." } },
        { status: 401 }
      );
    }

    // ── Generate storage key and presigned URL ──
    const key = generateStorageKey(fileName);
    const storage = getStorageProvider();
    const { presignedUrl, publicUrl } = await storage.generatePresignedUrl(
      key,
      contentType
    );

    return NextResponse.json({
      success: true,
      data: { presignedUrl, publicUrl, key },
    });
  } catch (error) {
    console.error("[UPLOAD/PRESIGN] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "SERVER_ERROR", message: "Failed to generate upload URL." },
      },
      { status: 500 }
    );
  }
}
