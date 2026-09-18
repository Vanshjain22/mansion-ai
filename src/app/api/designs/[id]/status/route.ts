import { NextResponse } from "next/server";
import { getDesignRepository } from "@/lib/db/local-db";
import { getAuthUser } from "@/lib/supabase/auth-helpers";

/**
 * GET /api/designs/[id]/status
 *
 * Polling endpoint to check design generation progress.
 * Query Parameter: `jobId` (required to read worker queue state)
 *
 * RESPONSE:
 * {
 *   "success": true,
 *   "data": {
 *     "designId": "design_abc123",
 *     "jobId": "job_xyz789",
 *     "status": "processing",
 *     "progress": 50,
 *     "error": null,
 *     "variations": [] // Array of outputs if status is 'completed'
 *   }
 * }
 */
export async function GET(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id: designId } = await props.params;
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Please sign in to view generation status.",
          },
        },
        { status: 401 }
      );
    }

    // The database is the source of truth in production because QStash jobs
    // are intentionally not kept in per-instance process memory.
    const db = getDesignRepository();
    const designRecord = await db.getDesign(designId);
    if (!designRecord || designRecord.userId !== user.id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Design was not found.",
          },
        },
        { status: 404 }
      );
    }

    const progress =
      designRecord.status === "completed" ? 100 : designRecord.status === "processing" ? 50 : 0;

    return NextResponse.json({
      success: true,
      data: {
        designId,
        status: designRecord.status,
        progress,
        error: designRecord.errorMessage || null,
        variations: designRecord.variations,
      },
    });
  } catch (error) {
    console.error("[DESIGNS/STATUS] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "SERVER_ERROR",
          message: "Failed to retrieve job status.",
        },
      },
      { status: 500 }
    );
  }
}
