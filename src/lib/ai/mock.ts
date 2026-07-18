import type { AIProvider, AIGenerationInput, AIJobStatus } from "./types";

/**
 * MOCK AI PROVIDER (Development/Testing)
 *
 * Simulates a real-world machine learning generation pipeline.
 *
 * WHY A MOCK PROVIDER IS VITAL:
 * 1. ZERO COST: Testing generation pipelines takes 100s of runs. At $0.02 to $0.10
 *    per run on Replicate/Fal, this saves real budget during engineering.
 * 2. SPEED: We can simulate fast or slow generation speeds to test timeouts.
 * 3. OFFLINE DEVELOPMENT: Works without internet or API keys.
 * 4. DETERMINISTIC TESTING: We can force failures, successes, and cancellations
 *    to test edge case state handling in our UI.
 *
 * HOW IT WORKS:
 * It stores active jobs in an in-memory map. When checkJobStatus is called,
 * it increments the job's progress by 20% until it hits 100%, and then returns
 * a themed interior design image from Unsplash representing the selected style.
 */

interface MockJob {
  id: string;
  input: AIGenerationInput;
  status: "pending" | "processing" | "completed" | "failed" | "cancelled";
  progress: number;
  createdAt: number;
  outputUrl?: string;
  error?: string;
}

export class MockAIProvider implements AIProvider {
  private jobs = new Map<string, MockJob>();

  getProviderName(): string {
    return "mock";
  }

  async submitJob(input: AIGenerationInput): Promise<string> {
    const jobId = `mock_job_${Math.random().toString(36).substring(2, 9)}`;
    
    // Choose an aesthetic image URL based on the requested style
    const themeImages: Record<string, string> = {
      modern: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80",
      minimalist: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=800&q=80",
      scandinavian: "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80",
      industrial: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80",
      japandi: "https://images.unsplash.com/photo-1615529182904-14819c35db37?auto=format&fit=crop&w=800&q=80",
      luxury: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80",
      bohemian: "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=800&q=80",
      rustic: "https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=800&q=80",
      contemporary: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=80",
      traditional: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80",
    };

    const outputUrl = themeImages[input.styleId] || themeImages.modern;

    this.jobs.set(jobId, {
      id: jobId,
      input,
      status: "pending",
      progress: 0,
      createdAt: Date.now(),
      outputUrl,
    });

    return jobId;
  }

  async checkJobStatus(jobId: string): Promise<AIJobStatus> {
    const job = this.jobs.get(jobId);
    if (!job) {
      return { status: "failed", error: "Job not found" };
    }

    if (job.status === "failed") {
      return { status: "failed", error: job.error || "Job failed" };
    }

    if (job.status === "cancelled") {
      return { status: "failed", error: "Job was cancelled by the user" };
    }

    // Transition from pending to processing on first status request
    if (job.status === "pending") {
      job.status = "processing";
      job.progress = 10;
      this.jobs.set(jobId, job);
      return { status: "processing", progress: job.progress };
    }

    // Increment progress
    if (job.status === "processing") {
      job.progress += 20; // 20% progress step
      if (job.progress >= 100) {
        job.progress = 100;
        job.status = "completed";
      }
      this.jobs.set(jobId, job);
    }

    if (job.status === "completed") {
      return {
        status: "completed",
        output: {
          generatedImageUrl: job.outputUrl!,
          providerName: "mock",
          modelName: "mock-sdxl-interior-v1",
          inferenceTimeMs: Date.now() - job.createdAt,
          parameters: {
            steps: 30,
            guidance_scale: 7.5,
            seed: 42,
          },
        },
      };
    }

    return { status: "processing", progress: job.progress };
  }

  async cancelJob(jobId: string): Promise<void> {
    const job = this.jobs.get(jobId);
    if (job) {
      job.status = "cancelled";
      this.jobs.set(jobId, job);
    }
  }
}
