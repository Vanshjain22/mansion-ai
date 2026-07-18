import type { AIGenerationInput, AIGenerationOutput } from "../ai/types";
import type { CreditTransactionRecord, SubscriptionRecord, PlanType } from "@/types/billing";

/**
 * DATABASE DESIGN MODELS & REPOSITORY INTERFACE
 */

export interface DesignRecord {
  id: string;
  userId: string;
  title: string;
  originalImageUrl: string;
  roomType: string;
  styleId: string;
  status: "pending" | "processing" | "completed" | "failed";
  customPrompt?: string | null;
  colorPalette?: string | null;
  mood?: string | null;
  lighting?: string | null;
  budget?: string | null;
  providerJobId?: string | null;
  errorMessage?: string | null;
  createdAt: number;
  updatedAt: number;
  variations: DesignVariationRecord[];
}

export interface DesignVariationRecord {
  id: string;
  designId: string;
  generatedImageUrl: string;
  aiProvider: string;
  aiModel: string;
  inferenceTimeMs: number;
  parameters: Record<string, any>;
  isFavorite: boolean;
  createdAt: number;
}

export interface CollectionRecord {
  id: string;
  userId: string;
  name: string;
  designIds: string[];
  createdAt: number;
}

export interface DesignRepository {
  createDesign(userId: string, input: AIGenerationInput): Promise<DesignRecord>;
  getDesign(id: string): Promise<DesignRecord | null>;
  updateDesignStatus(
    id: string,
    status: DesignRecord["status"],
    update: { providerJobId?: string; errorMessage?: string }
  ): Promise<DesignRecord>;
  addVariation(
    designId: string,
    output: AIGenerationOutput
  ): Promise<DesignVariationRecord>;
  listDesigns(userId: string): Promise<DesignRecord[]>;
  deleteDesign(id: string): Promise<void>;
  renameDesign(id: string, title: string): Promise<DesignRecord>;
  toggleFavoriteVariation(variationId: string): Promise<boolean>;
  getCollections(userId: string): Promise<CollectionRecord[]>;
  createCollection(userId: string, name: string): Promise<CollectionRecord>;
  addDesignToCollection(collectionId: string, designId: string): Promise<void>;
  removeDesignFromCollection(collectionId: string, designId: string): Promise<void>;

  // ── Billing Operations ──
  getUserCredits(userId: string): Promise<number>;
  deductCredits(
    userId: string,
    amount: number,
    description: string,
    designId?: string
  ): Promise<boolean>;
  addCredits(
    userId: string,
    amount: number,
    type: CreditTransactionRecord["type"],
    description: string,
    stripePaymentId?: string
  ): Promise<void>;
  getTransactionHistory(userId: string): Promise<CreditTransactionRecord[]>;
  getSubscription(userId: string): Promise<SubscriptionRecord | null>;
  updateSubscription(
    userId: string,
    stripeCustomerId: string,
    stripeSubscriptionId: string | null,
    plan: PlanType,
    status: SubscriptionRecord["status"],
    monthlyCredits: number,
    currentPeriodEnd: number
  ): Promise<void>;
}


