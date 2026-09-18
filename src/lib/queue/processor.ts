import { getAIProvider } from "@/lib/ai/factory";
import { getDesignRepository } from "@/lib/db/local-db";
import type { AIGenerationInput } from "@/lib/ai/types";

const POLL_INTERVAL_MS = 2_000;

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Runs one generation job. Throwing marks the QStash delivery as failed, so
 * QStash retries it. The design state is the durable source of truth.
 */
export async function processQueuedDesign(designId: string, userId: string): Promise<void> {
  const db = getDesignRepository();
  const design = await db.getDesign(designId);

  if (!design || design.userId !== userId) {
    throw new Error("Queued design does not exist or does not belong to the requested user.");
  }

  if (design.status === "completed" || design.errorMessage === "Generation cancelled by user.") {
    return;
  }

  try {
    const provider = getAIProvider();
    await db.updateDesignStatus(designId, "processing", {});

    const providerJobId = await provider.submitJob({
      originalImageUrl: design.originalImageUrl,
      roomType: design.roomType as AIGenerationInput["roomType"],
      styleId: design.styleId as AIGenerationInput["styleId"],
      customPrompt: design.customPrompt || undefined,
      colorPalette: design.colorPalette as AIGenerationInput["colorPalette"],
      mood: design.mood as AIGenerationInput["mood"],
      lighting: design.lighting as AIGenerationInput["lighting"],
      budget: design.budget as AIGenerationInput["budget"],
    });
    await db.updateDesignStatus(designId, "processing", { providerJobId });

    while (true) {
      await delay(POLL_INTERVAL_MS);
      const latestDesign = await db.getDesign(designId);
      if (latestDesign?.errorMessage === "Generation cancelled by user.") {
        await provider.cancelJob(providerJobId);
        return;
      }

      const result = await provider.checkJobStatus(providerJobId);
      if (result.status === "processing" || result.status === "pending") continue;
      if (result.status === "completed") {
        await db.addVariation(designId, result.output);
        return;
      }
      throw new Error(result.error || "AI provider failed during execution.");
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Generation failed.";
    await db.updateDesignStatus(designId, "failed", { errorMessage: message });
    throw error;
  }
}
