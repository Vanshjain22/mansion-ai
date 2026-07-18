import { NextResponse } from "next/server";
import { jobQueue } from "@/lib/queue/job-queue";
import { getDesignRepository } from "@/lib/db/local-db";

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
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get("jobId");

    if (!jobId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "MISSING_PARAMETER",
            message: "jobId query parameter is required.",
          },
        },
        { status: 400 }
      );
    }

    // 1. Check current state in queue (high priority)
    const job = await jobQueue.getJob(jobId);
    if (!job) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "JOB_NOT_FOUND",
            message: `Job ${jobId} was not found in active memory.`,
          },
        },
        { status: 404 }
      );
    }

    // Double check that jobId maps to this designId
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

    // 2. Fetch latest record from the database to see variations on complete
    const db = getDesignRepository();
    const designRecord = await db.getDesign(designId);

    return NextResponse.json({
      success: true,
      data: {
        designId,
        jobId,
        status: job.status,
        progress: job.progress,
        error: job.error || null,
        variations: designRecord?.variations || [],
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
