import { NextResponse } from "next/server";
import { jobQueue } from "@/lib/queue/job-queue";

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
    const body = await request.json().catch(() => ({}));
    const { jobId } = body;

    if (!jobId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "MISSING_PARAMETER",
            message: "jobId is required in request body.",
          },
        },
        { status: 400 }
      );
    }

    const job = await jobQueue.getJob(jobId);
    if (!job) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "JOB_NOT_FOUND",
            message: "Job was not found.",
          },
        },
        { status: 404 }
      );
    }

    if (job.designId !== designId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Job ID does not match this design resource.",
          },
        },
        { status: 403 }
      );
    }

    // Trigger cancellation in queue context
    await jobQueue.cancelJob(jobId);

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
