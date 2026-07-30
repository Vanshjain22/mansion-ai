import type { AIProvider } from "./types";
import { MockAIProvider } from "./mock";
import { ReplicateAIProvider } from "./replicate";
import { CloudflareAIProvider } from "./cloudflare";

/**
 * AI PROVIDER FACTORY — Strategy Pattern Resolver
 *
 * Instantiates the active AI provider based on environment config.
 *
 * ACTIVE CONFIGURATION:
 * - AI_PROVIDER: "mock" | "replicate" | "cloudflare" (default: "mock")
 */

let activeProviderInstance: AIProvider | null = null;

export function getAIProvider(): AIProvider {
  if (activeProviderInstance) {
    return activeProviderInstance;
  }

  const providerType = process.env.AI_PROVIDER || "mock";

  if (providerType === "cloudflare") {
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const apiToken = process.env.CLOUDFLARE_AI_API_TOKEN;

    if (accountId && apiToken) {
      activeProviderInstance = new CloudflareAIProvider(accountId, apiToken);
    } else {
      console.warn(
        "CLOUDFLARE_ACCOUNT_ID or CLOUDFLARE_AI_API_TOKEN is missing. Falling back to MockAIProvider."
      );
      activeProviderInstance = new MockAIProvider();
    }
  } else if (providerType === "replicate") {
    const replicateKey = process.env.REPLICATE_API_KEY;
    const replicateModel =
      process.env.REPLICATE_MODEL_ID ||
      "stability-ai/sdxl:39ed7e0ede851168f00f3c180a8c2f1b41366a9380f136122d65d06b1897c9d3";

    if (replicateKey) {
      activeProviderInstance = new ReplicateAIProvider(replicateKey, replicateModel);
    } else {
      console.warn(
        "REPLICATE_API_KEY is missing. Falling back to MockAIProvider."
      );
      activeProviderInstance = new MockAIProvider();
    }
  } else {
    activeProviderInstance = new MockAIProvider();
  }

  return activeProviderInstance;
}
