import type { AIProvider } from "./types";
import { MockAIProvider } from "./mock";
import { ReplicateAIProvider } from "./replicate";

/**
 * AI PROVIDER FACTORY — Strategy Pattern Resolver
 *
 * Instantiates the active AI provider based on environment config.
 *
 * ACTIVE CONFIGURATION:
 * - AI_PROVIDER: "mock" | "replicate" (default: "mock" if keys are missing)
 */

let activeProviderInstance: AIProvider | null = null;

export function getAIProvider(): AIProvider {
  if (activeProviderInstance) {
    return activeProviderInstance;
  }

  const providerType = process.env.AI_PROVIDER || "mock";
  const replicateKey = process.env.REPLICATE_API_KEY;
  const replicateModel =
    process.env.REPLICATE_MODEL_ID ||
    "stability-ai/sdxl:39ed7e0ede851168f00f3c180a8c2f1b41366a9380f136122d65d06b1897c9d3";

  if (providerType === "replicate" && replicateKey) {
    activeProviderInstance = new ReplicateAIProvider(replicateKey, replicateModel);
  } else {
    // Graceful fallback: If keys are missing or provider type is mock,
    // we use the MockAIProvider. This keeps the environment running
    // without crashes.
    if (providerType === "replicate") {
      console.warn(
        "REPLICATE_API_KEY is missing. Falling back to MockAIProvider."
      );
    }
    activeProviderInstance = new MockAIProvider();
  }

  return activeProviderInstance;
}
