import { NextResponse } from "next/server";
import { verifySignature, getLocalStorageProvider } from "@/lib/storage/local";

/**
 * PUT /api/upload/store
 *
 * LOCAL DEVELOPMENT ONLY — receives file uploads from presigned URLs.
 *
 * In production, presigned URLs point directly to S3/R2, so this
 * endpoint is never hit. It exists only to simulate the presigned URL
 * pattern during local development.
 *
 * FLOW:
 * 1. Client received a presigned URL from /api/upload/presign
 * 2. Client PUTs file bytes to this endpoint (the presigned URL)
 * 3. We verify the HMAC signature to ensure the URL is legitimate
 * 4. We check the expiration timestamp
 * 5. We save the file to public/{key} (served as a static file)
 *
 * This mirrors real S3 behavior:
 * - Signature verification = S3's query string authentication
 * - Expiration check = S3's X-Amz-Expires
 * - Single-use intent = each presigned URL maps to one specific key
 */
export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");
    const contentType = searchParams.get("contentType");
    const expires = searchParams.get("expires");
    const signature = searchParams.get("signature");

    // ── Validate all required parameters ──
    if (!key || !contentType || !expires || !signature) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_URL",
            message: "Missing required URL parameters.",
          },
        },
        { status: 400 }
      );
    }

    // ── Verify the signature matches ──
    const expiresAt = parseInt(expires, 10);
    const isValid = verifySignature(key, contentType, expiresAt, signature);

    if (!isValid) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_SIGNATURE",
            message: "The upload URL signature is invalid.",
          },
        },
        { status: 403 }
      );
    }

    // ── Check expiration ──
    if (Date.now() > expiresAt) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "URL_EXPIRED",
            message: "The upload URL has expired. Please request a new one.",
          },
        },
        { status: 410 }
      );
    }

    // ── Read file bytes and save ──
    const arrayBuffer = await request.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (buffer.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "EMPTY_FILE", message: "No file data received." },
        },
        { status: 400 }
      );
    }

    const storage = getLocalStorageProvider();
    await storage.saveFile(key, buffer);

    // Return 200 with no body — matching S3 PUT behavior
    return new NextResponse(null, { status: 200 });
  } catch (error) {
    console.error("[UPLOAD/STORE] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "SERVER_ERROR", message: "Failed to store file." },
      },
      { status: 500 }
    );
  }
}
