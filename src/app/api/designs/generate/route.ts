import { NextResponse } from "next/server";
import { getDesignRepository } from "@/lib/db/local-db";
import { jobQueue } from "@/lib/queue/job-queue";
import { ROOM_TYPES, STYLE_PRESETS } from "@/lib/utils/constants";

/**
 * POST /api/designs/generate
 *
 * Starts a design generation task.
 *
 * REQUEST BODY:
 * {
 *   "originalImageUrl": "/uploads/123-room.jpg",
 *   "roomType": "living_room",
 *   "styleId": "modern",
 *   "customPrompt": "...",
 *   "colorPalette": "warm",
 *   "mood": "cozy",
 *   "lighting": "natural",
 *   "budget": "moderate"
 * }
 *
 * RESPONSE (202 Accepted):
 * {
 *   "success": true,
 *   "data": {
 *     "designId": "design_abc123",
 *     "jobId": "job_xyz789",
 *     "status": "pending"
 *   }
 * }
 */
import { generateRateLimiter } from "@/lib/utils/rate-limiter";

export async function POST(request: Request) {
  try {
    // ── Rate Limiting ──
    const clientIp = request.headers.get("x-forwarded-for") || "127.0.0.1";
    const limitCheck = generateRateLimiter.check(clientIp);
    if (!limitCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "RATE_LIMIT_EXCEEDED",
            message: `Too many generation requests. Please try again after ${Math.ceil(limitCheck.retryAfterMs / 1000)} seconds.`,
          },
        },
        {
          status: 429,
          headers: { "Retry-After": Math.ceil(limitCheck.retryAfterMs / 1000).toString() },
        }
      );
    }

    const body = await request.json();
    const {
      originalImageUrl,
      roomType,
      styleId,
      customPrompt,
      colorPalette,
      mood,
      lighting,
      budget,
    } = body;

    // ── Input Validation ──
    if (!originalImageUrl || typeof originalImageUrl !== "string") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "originalImageUrl is required.",
          },
        },
        { status: 400 }
      );
    }

    if (!roomType || !ROOM_TYPES.includes(roomType)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: `Invalid roomType. Must be one of: ${ROOM_TYPES.join(", ")}`,
          },
        },
        { status: 400 }
      );
    }

    // Validate styleId against our style catalog presets
    const validStyleSlugs = STYLE_PRESETS.map((s) => s.slug);
    // Include the styles mapped in our styles.ts list (modern, minimalist, etc.)
    const allStyles = [
      ...validStyleSlugs,
      "modern",
      "minimalist",
      "scandinavian",
      "industrial",
      "japandi",
      "luxury",
      "bohemian",
      "rustic",
      "contemporary",
      "traditional",
    ];

    if (!styleId || !allStyles.includes(styleId)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "A valid styleId selection is required.",
          },
        },
        { status: 400 }
      );
    }

    // ── Database Entry ──
    const userId = "dev-user-123"; // In production, resolve this from next-auth session
    const db = getDesignRepository();

    // Deduct 1 credit per generation request
    const friendlyStyle = styleId.charAt(0).toUpperCase() + styleId.slice(1);
    const friendlyRoom = roomType.replace("_", " ");
    const hasSufficientCredits = await db.deductCredits(
      userId,
      1,
      `Render: ${friendlyStyle} ${friendlyRoom}`
    );

    if (!hasSufficientCredits) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INSUFFICIENT_CREDITS",
            message: "Insufficient credits. Please upgrade your plan or purchase credits to continue.",
          },
        },
        { status: 402 } // 402 Payment Required
      );
    }

    const designRecord = await db.createDesign(userId, {
      originalImageUrl,
      roomType,
      styleId,
      customPrompt,
      colorPalette,
      mood,
      lighting,
      budget,
    });


    // ── Enqueue Job ──
    const jobId = await jobQueue.addJob(designRecord.id, userId);

    return NextResponse.json(
      {
        success: true,
        data: {
          designId: designRecord.id,
          jobId,
          status: "pending",
        },
      },
      { status: 202 } // 202 Accepted: request received and enqueued, processing active
    );
  } catch (error) {
    console.error("[DESIGNS/GENERATE] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "SERVER_ERROR",
          message: "Failed to submit design generation request.",
        },
      },
      { status: 500 }
    );
  }
}
