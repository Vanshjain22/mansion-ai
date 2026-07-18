import type { RoomType, StyleId, ColorPalette, Mood, LightingPreference, BudgetRange } from "@/types/design";

/**
 * AI GENERATION TYPES
 *
 * Defines the strict input/output models for the AI generation pipeline.
 * By decoupling this from specific provider SDK types, our core application
 * code remains completely provider-agnostic.
 */

export interface AIGenerationInput {
  originalImageUrl: string;
  roomType: RoomType;
  styleId: StyleId;
  colorPalette?: ColorPalette | null;
  mood?: Mood | null;
  lighting?: LightingPreference | null;
  budget?: BudgetRange | null;
  customPrompt?: string;
}

export interface AIGenerationOutput {
  generatedImageUrl: string;
  providerName: string;
  modelName: string;
  inferenceTimeMs: number;
  parameters: Record<string, any>;
}

export type AIJobStatus =
  | { status: "pending" }
  | { status: "processing"; progress: number } // 0-100%
  | { status: "completed"; output: AIGenerationOutput }
  | { status: "failed"; error: string };

export interface AIProvider {
  /** Get the identifier name of this provider (e.g. "mock", "replicate") */
  getProviderName(): string;

  /**
   * Submit an image generation request to the provider.
   *
   * @returns A provider-specific job ID that can be used to check status or cancel.
   */
  submitJob(input: AIGenerationInput): Promise<string>;

  /**
   * Check the progress status of a running job.
   */
  checkJobStatus(jobId: string): Promise<AIJobStatus>;

  /**
   * Request the provider to terminate/abort a running generation job.
   */
  cancelJob(jobId: string): Promise<void>;
}
