import { getAIProvider } from "../ai/factory";
import { getDesignRepository } from "../db/local-db";

/**
 * IN-MEMORY BACKGROUND JOB QUEUE (Development / Testing)
 *
 * Emulates the asynchronous worker queue patterns of BullMQ + Redis.
 *
 * WHY THIS ARCHITECTURE?
 *
 * Next.js API routes run inside serverless environments or short-lived requests.
 * We cannot block the API route while the AI model is executing (10-40 seconds).
 *
 * The solution is a job queue:
 * 1. Client POSTs request to API route.
 * 2. API route pushes task to Queue and returns a 202 Enqueued response instantly (~5ms).
 * 3. Queue processor (this class) dequeues tasks and runs them in a background worker context.
 * 4. Client polls a status endpoint using the returned Job ID to check progress.
 *
 * PRODUCTION SWAP:
 * This class exposes an interface that mirrors BullMQ. When moving to production:
 * - Swap this in-memory list with a Redis-backed `bullmq` Queue instance.
 * - Swap the local worker thread with a separate server process.
 * - API route files do not change a single line of code!
 */

export interface DesignJob {
  id: string;
  designId: string;
  userId: string;
  status: "pending" | "processing" | "completed" | "failed" | "cancelled";
  progress: number;
  providerJobId?: string;
  error?: string;
  createdAt: number;
}

export class InMemoryJobQueue {
  private jobs = new Map<string, DesignJob>();
  private activeIntervals = new Map<string, NodeJS.Timeout>();

  /**
   * Enqueue a new image generation job.
   * Runs the task processing asynchronously so it doesn't block the API caller.
   */
  async addJob(designId: string, userId: string): Promise<string> {
    const jobId = `job_${Math.random().toString(36).substring(2, 9)}`;
    const newJob: DesignJob = {
      id: jobId,
      designId,
      userId,
      status: "pending",
      progress: 0,
      createdAt: Date.now(),
    };

    this.jobs.set(jobId, newJob);

    // Trigger async processing immediately without waiting for execution (fire-and-forget)
    // This allows the API route to return a response immediately.
    this.processJobAsync(jobId).catch((err) => {
      console.error(`[QUEUE] Critical failure in background job ${jobId}:`, err);
    });

    return jobId;
  }

  async getJob(jobId: string): Promise<DesignJob | null> {
    return this.jobs.get(jobId) || null;
  }

  /**
   * Cancel a running job. Interrupts active polling or provider operations.
   */
  async cancelJob(jobId: string): Promise<void> {
    const job = this.jobs.get(jobId);
    if (!job) return;

    if (job.status === "processing" || job.status === "pending") {
      job.status = "cancelled";
      this.jobs.set(jobId, job);

      // Stop local polling loop
      const interval = this.activeIntervals.get(jobId);
      if (interval) {
        clearInterval(interval);
        this.activeIntervals.delete(jobId);
      }

      // Propagate cancellation to AI provider if it has started
      if (job.providerJobId) {
        try {
          const provider = getAIProvider();
          await provider.cancelJob(job.providerJobId);
        } catch (err) {
          console.error(`[QUEUE] Error propagating cancel to provider:`, err);
        }
      }

      // Update database record
      const db = getDesignRepository();
      await db.updateDesignStatus(job.designId, "failed", {
        errorMessage: "Generation cancelled by user.",
      });
    }
  }

  /**
   * The background worker loop.
   * Simulates the exact polling logic that queries the AI provider
   * and writes results to the database.
   */
  private async processJobAsync(jobId: string): Promise<void> {
    const job = this.jobs.get(jobId);
    if (!job) return;

    const db = getDesignRepository();
    const provider = getAIProvider();

    try {
      // 1. Fetch the design config from database
      const design = await db.getDesign(job.designId);
      if (!design) {
        throw new Error(`Design ${job.designId} was not found in DB.`);
      }

      // Update job state
      job.status = "processing";
      job.progress = 10;
      this.jobs.set(jobId, job);
      await db.updateDesignStatus(job.designId, "processing", {});

      // 2. Submit the job to the AI Provider
      const providerJobId = await provider.submitJob({
        originalImageUrl: design.originalImageUrl,
        roomType: design.roomType as any,
        styleId: design.styleId as any,
        customPrompt: design.customPrompt || undefined,
        colorPalette: design.colorPalette as any,
        mood: design.mood as any,
        lighting: design.lighting as any,
        budget: design.budget as any,
      });

      // Track provider specific job ID
      job.providerJobId = providerJobId;
      this.jobs.set(jobId, job);
      await db.updateDesignStatus(job.designId, "processing", { providerJobId });

      // 3. Start Polling the AI Provider until finished
      const pollInterval = setInterval(async () => {
        // Double check if job was cancelled during interval wait
        const currentJobState = this.jobs.get(jobId);
        if (!currentJobState || currentJobState.status === "cancelled") {
          clearInterval(pollInterval);
          this.activeIntervals.delete(jobId);
          return;
        }

        try {
          const statusResult = await provider.checkJobStatus(providerJobId);

          if (statusResult.status === "processing") {
            currentJobState.progress = Math.max(currentJobState.progress, statusResult.progress);
            this.jobs.set(jobId, currentJobState);
          } 
          else if (statusResult.status === "completed") {
            clearInterval(pollInterval);
            this.activeIntervals.delete(jobId);

            currentJobState.status = "completed";
            currentJobState.progress = 100;
            this.jobs.set(jobId, currentJobState);

            // Write final variation output to database
            await db.addVariation(job.designId, statusResult.output);
          } 
          else if (statusResult.status === "failed") {
            clearInterval(pollInterval);
            this.activeIntervals.delete(jobId);

            throw new Error(statusResult.error || "AI provider failed during execution.");
          }
        } catch (pollError) {
          clearInterval(pollInterval);
          this.activeIntervals.delete(jobId);
          this.handleWorkerFailure(jobId, pollError);
        }
      }, 2000); // Poll every 2s

      this.activeIntervals.set(jobId, pollInterval);

    } catch (err) {
      this.handleWorkerFailure(jobId, err);
    }
  }

  private handleWorkerFailure(jobId: string, error: any): void {
    const job = this.jobs.get(jobId);
    if (!job || job.status === "cancelled") return;

    const errMsg = error instanceof Error ? error.message : "Generation failed.";
    
    job.status = "failed";
    job.error = errMsg;
    this.jobs.set(jobId, job);

    const db = getDesignRepository();
    db.updateDesignStatus(job.designId, "failed", { errorMessage: errMsg })
      .catch((err) => console.error("[QUEUE] Failed to update fail status in DB:", err));

    console.error(`[QUEUE] Job ${jobId} failed:`, error);
  }
}

// Global queue singleton instance (preserves state across HMR file reloads in Next.js dev)
const globalForQueue = global as unknown as { jobQueue: InMemoryJobQueue };
export const jobQueue = globalForQueue.jobQueue || new InMemoryJobQueue();

if (process.env.NODE_ENV !== "production") {
  globalForQueue.jobQueue = jobQueue;
}
