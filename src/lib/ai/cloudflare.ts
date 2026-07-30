import type { AIProvider, AIGenerationInput, AIJobStatus } from "./types";

/**
 * CLOUDFLARE WORKERS AI PROVIDER — FLUX Image Generation
 *
 * Uses Cloudflare's Workers AI API with FLUX models for room redesign.
 *
 * FLUX is an image generation model that supports text-to-image.
 * For room redesign, we describe the original room and the desired style
 * transformation in the prompt.
 *
 * API ENDPOINT:
 * POST https://api.cloudflare.com/client/v4/accounts/{account_id}/ai/run/{model}
 *
 * The model returns a base64-encoded image that we then upload to Supabase Storage
 * and return the public URL.
 */

interface CloudflareJob {
  id: string;
  input: AIGenerationInput;
  status: "pending" | "processing" | "completed" | "failed";
  progress: number;
  outputUrl?: string;
  error?: string;
  createdAt: number;
}

// Style-specific prompt templates for interior design
const STYLE_PROMPTS: Record<string, string> = {
  modern: "modern contemporary interior design with clean lines, neutral palette, minimalist furniture, large windows with natural light",
  minimalist: "minimalist interior design with sparse decor, white walls, simple functional furniture, zen aesthetic",
  scandinavian: "scandinavian interior design with light wood tones, hygge atmosphere, soft textiles, warm lighting, white and beige palette",
  industrial: "industrial loft interior design with exposed brick walls, metal fixtures, concrete floors, Edison bulbs, raw materials",
  japandi: "japandi interior design blending Japanese minimalism with Scandinavian warmth, natural materials, low furniture, neutral tones",
  luxury: "luxury high-end interior design with marble accents, gold fixtures, velvet upholstery, crystal chandelier, rich textures",
  bohemian: "bohemian eclectic interior design with colorful textiles, layered rugs, plants, macrame, warm earthy tones",
  rustic: "rustic farmhouse interior design with reclaimed wood, stone fireplace, vintage fixtures, cozy blankets, natural materials",
  contemporary: "contemporary interior design with bold geometric shapes, mixed materials, statement art pieces, open floor plan",
  traditional: "traditional classic interior design with ornate moldings, antique furniture, rich fabrics, symmetrical layout",
};

export class CloudflareAIProvider implements AIProvider {
  private accountId: string;
  private apiToken: string;
  private jobs = new Map<string, CloudflareJob>();

  // Using FLUX Schnell for fast generation
  private model = "@cf/black-forest-labs/flux-1-schnell";

  constructor(accountId: string, apiToken: string) {
    this.accountId = accountId;
    this.apiToken = apiToken;
  }

  getProviderName(): string {
    return "cloudflare-workers-ai";
  }

  async submitJob(input: AIGenerationInput): Promise<string> {
    if (!this.apiToken || !this.accountId) {
      throw new Error("Cloudflare AI credentials are not configured.");
    }

    const jobId = `cf_job_${Math.random().toString(36).substring(2, 9)}`;

    this.jobs.set(jobId, {
      id: jobId,
      input,
      status: "pending",
      progress: 0,
      createdAt: Date.now(),
    });

    // Fire-and-forget: start generation in background
    this.runGeneration(jobId).catch((err) => {
      console.error(`[CloudflareAI] Job ${jobId} failed:`, err);
    });

    return jobId;
  }

  async checkJobStatus(jobId: string): Promise<AIJobStatus> {
    const job = this.jobs.get(jobId);
    if (!job) {
      return { status: "failed", error: "Job not found" };
    }

    if (job.status === "failed") {
      return { status: "failed", error: job.error || "Generation failed" };
    }

    if (job.status === "completed" && job.outputUrl) {
      return {
        status: "completed",
        output: {
          generatedImageUrl: job.outputUrl,
          providerName: "cloudflare-workers-ai",
          modelName: this.model,
          inferenceTimeMs: Date.now() - job.createdAt,
          parameters: {
            prompt: this.buildPrompt(job.input),
          },
        },
      };
    }

    return { status: "processing", progress: job.progress };
  }

  async cancelJob(jobId: string): Promise<void> {
    const job = this.jobs.get(jobId);
    if (job && job.status !== "completed") {
      job.status = "failed";
      job.error = "Cancelled by user";
      this.jobs.set(jobId, job);
    }
  }

  private buildPrompt(input: AIGenerationInput): string {
    const stylePrompt = STYLE_PROMPTS[input.styleId] || STYLE_PROMPTS.modern;
    const roomType = input.roomType.replace(/_/g, " ");

    let prompt = `A beautiful ${roomType} with ${stylePrompt}`;

    if (input.colorPalette) {
      prompt += `, ${input.colorPalette} color palette`;
    }
    if (input.mood) {
      prompt += `, ${input.mood} atmosphere`;
    }
    if (input.lighting) {
      prompt += `, ${input.lighting} lighting`;
    }
    if (input.customPrompt) {
      prompt += `, ${input.customPrompt}`;
    }

    prompt += ", professional interior photography, 8k, ultra detailed, architectural digest quality";

    return prompt;
  }

  private async runGeneration(jobId: string): Promise<void> {
    const job = this.jobs.get(jobId);
    if (!job) return;

    try {
      // Update progress
      job.status = "processing";
      job.progress = 30;
      this.jobs.set(jobId, job);

      const prompt = this.buildPrompt(job.input);

      // Call Cloudflare Workers AI API
      const response = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${this.accountId}/ai/run/${this.model}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.apiToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            prompt,
            num_steps: 4, // FLUX Schnell uses fewer steps
          }),
        }
      );

      job.progress = 70;
      this.jobs.set(jobId, job);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Cloudflare AI API error (${response.status}): ${errorText}`);
      }

      // FLUX returns binary image data (PNG)
      const imageBuffer = await response.arrayBuffer();
      const base64Image = Buffer.from(imageBuffer).toString("base64");

      // Upload the generated image to Supabase Storage
      const imageUrl = await this.uploadGeneratedImage(jobId, base64Image);

      job.status = "completed";
      job.progress = 100;
      job.outputUrl = imageUrl;
      this.jobs.set(jobId, job);

    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Generation failed";
      job.status = "failed";
      job.error = errMsg;
      this.jobs.set(jobId, job);
    }
  }

  /**
   * Upload the AI-generated image to Supabase Storage and return the public URL.
   * This keeps generated images persistent and CDN-served.
   */
  private async uploadGeneratedImage(jobId: string, base64Data: string): Promise<string> {
    try {
      // Dynamically import to avoid circular deps
      const { createClient } = await import("@/lib/supabase/server");
      const supabase = await createClient();

      const buffer = Buffer.from(base64Data, "base64");
      const key = `generated/${Date.now()}-${jobId}.png`;

      const { error } = await supabase.storage
        .from("room-uploads")
        .upload(key, buffer, {
          contentType: "image/png",
          upsert: false,
        });

      if (error) throw error;

      const { data } = supabase.storage
        .from("room-uploads")
        .getPublicUrl(key);

      return data.publicUrl;
    } catch (err) {
      // Fallback: return a data URL if storage upload fails
      console.error("[CloudflareAI] Failed to upload to storage, using data URL fallback:", err);
      return `data:image/png;base64,${base64Data.substring(0, 100)}...`;
    }
  }
}
