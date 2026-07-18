import type { AIProvider, AIGenerationInput, AIJobStatus } from "./types";

/**
 * REPLICATE AI PROVIDER (Production Template)
 *
 * Implements the AIProvider interface for Replicate's API.
 * This class encapsulates the HTTP requests to Replicate's prediction endpoint.
 *
 * REPLICATE FLOW:
 * 1. POST /v1/predictions with the model ID and input variables.
 * 2. Receive a prediction object containing a status URL.
 * 3. GET that status URL periodically to poll for the result.
 * 4. POST to prediction URL + /cancel to terminate it.
 */
export class ReplicateAIProvider implements AIProvider {
  private apiKey: string;
  private modelIdentifier: string;

  constructor(apiKey: string, modelIdentifier: string) {
    this.apiKey = apiKey;
    this.modelIdentifier = modelIdentifier;
  }

  getProviderName(): string {
    return "replicate";
  }

  async submitJob(input: AIGenerationInput): Promise<string> {
    if (!this.apiKey) {
      throw new Error("Replicate API key is not configured.");
    }

    // This is the model version for SDXL or a specialized ControlNet room model.
    // e.g. "stability-ai/sdxl:39ed7e0ede851168f00f3c180a8c2f1b41366a9380f136122d65d06b1897c9d3"
    const [owner, nameAndVersion] = this.modelIdentifier.split("/");
    const [name, version] = nameAndVersion.split(":");

    const response = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        Authorization: `Token ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        version: version,
        input: {
          image: input.originalImageUrl,
          // Build prompt based on style prompt templates and preferences
          prompt: `${input.customPrompt || ""}, style: ${input.styleId}, color palette: ${input.colorPalette || "matching"}, lighting: ${input.lighting || "natural"}`,
          negative_prompt: "low quality, blurry, distorted rooms, bad perspective, unrealistic walls",
          num_inference_steps: 35,
          guidance_scale: 7.5,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Replicate API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.id; // Returns Replicate's prediction ID
  }

  async checkJobStatus(jobId: string): Promise<AIJobStatus> {
    if (!this.apiKey) {
      return { status: "failed", error: "Replicate API key is not configured" };
    }

    const response = await fetch(`https://api.replicate.com/v1/predictions/${jobId}`, {
      headers: {
        Authorization: `Token ${this.apiKey}`,
      },
    });

    if (!response.ok) {
      return { status: "failed", error: `Failed to fetch prediction status (${response.status})` };
    }

    const data = await response.json();
    const status = data.status; // "starting", "processing", "succeeded", "failed", "canceled"

    if (status === "starting" || status === "processing") {
      // Replicate does not always return numerical progress percentage,
      // so we fallback to parsing log strings or using standard intervals.
      return { status: "processing", progress: status === "starting" ? 10 : 50 };
    }

    if (status === "succeeded") {
      const outputUrl = Array.isArray(data.output) ? data.output[0] : data.output;
      return {
        status: "completed",
        output: {
          generatedImageUrl: outputUrl,
          providerName: "replicate",
          modelName: this.modelIdentifier,
          inferenceTimeMs: data.metrics?.predict_time * 1000 || 0,
          parameters: data.input,
        },
      };
    }

    if (status === "canceled") {
      return { status: "failed", error: "Prediction was cancelled by the user" };
    }

    // Default to failed
    return { status: "failed", error: data.error || "Generation failed" };
  }

  async cancelJob(jobId: string): Promise<void> {
    if (!this.apiKey) return;

    await fetch(`https://api.replicate.com/v1/predictions/${jobId}/cancel`, {
      method: "POST",
      headers: {
        Authorization: `Token ${this.apiKey}`,
      },
    });
  }
}
