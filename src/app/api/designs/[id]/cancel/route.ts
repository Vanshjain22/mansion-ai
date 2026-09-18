import { NextResponse } from "next/server";
import { getDesignRepository } from "@/lib/db/local-db";
import { getAuthUser } from "@/lib/supabase/auth-helpers";

/**
 * POST /api/designs/[id]/cancel
 *
 * Request cancellation of a pending or running design job.
 *
 * REQUEST BODY:
 * {
 *   "jobId": "job_xyz789"
 * }
 *
 * RESPONSE:
 * {
 *   "success": true,
 *   "message": "Job cancellation request sent."
 * }
 */
export async function POST(
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
            message: "Please sign in to cancel a generation.",
          },
        },
        { status: 401 }
      );
    }

    const db = getDesignRepository();
    const design = await db.getDesign(designId);
    if (!design || design.userId !== user.id) {
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

    if (design.status === "completed") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "ALREADY_COMPLETED",
            message: "Completed generations cannot be cancelled.",
          },
        },
        { status: 409 }
      );
    }

    // The worker checks this persisted marker before and during provider polling.
    await db.updateDesignStatus(designId, "failed", {
      errorMessage: "Generation cancelled by user.",
    });

    return NextResponse.json({
      success: true,
      message: "Job cancellation request completed successfully.",
    });
  } catch (error) {
    console.error("[DESIGNS/CANCEL] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "SERVER_ERROR",
          message: "Failed to process cancellation request.",
        },
      },
      { status: 500 }
    );
  }
}
