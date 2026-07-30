import fs from "fs/promises";
import path from "path";
import type { DesignRepository, DesignRecord, DesignVariationRecord, CollectionRecord } from "./design-repository";
import type { AIGenerationInput, AIGenerationOutput } from "../ai/types";
import type { CreditTransactionRecord, SubscriptionRecord, PlanType } from "@/types/billing";

/**
 * LOCAL JSON FILE DATABASE (Development only)
 *
 * Implements DesignRepository using flat JSON files.
 * Saved to:
 * - Designs: `public/uploads/designs_db.json`
 * - Collections: `public/uploads/collections_db.json`
 */

const DB_DIR = path.join(process.cwd(), "public", "uploads");
const DB_FILE = path.join(DB_DIR, "designs_db.json");
const COLLECTIONS_FILE = path.join(DB_DIR, "collections_db.json");
const TRANSACTIONS_FILE = path.join(DB_DIR, "transactions_db.json");
const SUBSCRIPTIONS_FILE = path.join(DB_DIR, "subscriptions_db.json");

export class LocalDesignRepository implements DesignRepository {
  private memoryCache: DesignRecord[] | null = null;
  private collectionsCache: CollectionRecord[] | null = null;
  private transactionsCache: CreditTransactionRecord[] | null = null;
  private subscriptionsCache: SubscriptionRecord[] | null = null;

  private async ensureDb(): Promise<void> {
    await fs.mkdir(DB_DIR, { recursive: true });
    try {
      await fs.access(DB_FILE);
    } catch {
      await fs.writeFile(DB_FILE, JSON.stringify([], null, 2));
    }
    try {
      await fs.access(COLLECTIONS_FILE);
    } catch {
      await fs.writeFile(COLLECTIONS_FILE, JSON.stringify([], null, 2));
    }
    try {
      await fs.access(TRANSACTIONS_FILE);
    } catch {
      await fs.writeFile(TRANSACTIONS_FILE, JSON.stringify([], null, 2));
    }
    try {
      await fs.access(SUBSCRIPTIONS_FILE);
    } catch {
      await fs.writeFile(SUBSCRIPTIONS_FILE, JSON.stringify([], null, 2));
    }
  }

  private async load(): Promise<DesignRecord[]> {
    if (this.memoryCache) {
      return this.memoryCache;
    }
    await this.ensureDb();
    const data = await fs.readFile(DB_FILE, "utf-8");
    try {
      this.memoryCache = JSON.parse(data);
      return this.memoryCache || [];
    } catch {
      this.memoryCache = [];
      return [];
    }
  }

  private async save(data: DesignRecord[]): Promise<void> {
    this.memoryCache = data;
    await this.ensureDb();
    const tempFile = `${DB_FILE}.tmp`;
    await fs.writeFile(tempFile, JSON.stringify(data, null, 2));
    await fs.rename(tempFile, DB_FILE);
  }

  private async loadCollections(): Promise<CollectionRecord[]> {
    if (this.collectionsCache) {
      return this.collectionsCache;
    }
    await this.ensureDb();
    const data = await fs.readFile(COLLECTIONS_FILE, "utf-8");
    try {
      this.collectionsCache = JSON.parse(data);
      return this.collectionsCache || [];
    } catch {
      this.collectionsCache = [];
      return [];
    }
  }

  private async saveCollections(data: CollectionRecord[]): Promise<void> {
    this.collectionsCache = data;
    await this.ensureDb();
    const tempFile = `${COLLECTIONS_FILE}.tmp`;
    await fs.writeFile(tempFile, JSON.stringify(data, null, 2));
    await fs.rename(tempFile, COLLECTIONS_FILE);
  }

  async createDesign(userId: string, input: AIGenerationInput): Promise<DesignRecord> {
    const db = await this.load();
    const friendlyStyle = input.styleId.charAt(0).toUpperCase() + input.styleId.slice(1);
    const friendlyRoom = input.roomType.replace("_", " ");
    
    const newRecord: DesignRecord = {
      id: `design_${Math.random().toString(36).substring(2, 9)}`,
      userId,
      title: `${friendlyStyle} ${friendlyRoom}`,
      originalImageUrl: input.originalImageUrl,
      roomType: input.roomType,
      styleId: input.styleId,
      status: "pending",
      customPrompt: input.customPrompt || null,
      colorPalette: input.colorPalette || null,
      mood: input.mood || null,
      lighting: input.lighting || null,
      budget: input.budget || null,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      variations: [],
    };

    db.push(newRecord);
    await this.save(db);
    return newRecord;
  }

  async getDesign(id: string): Promise<DesignRecord | null> {
    const db = await this.load();
    return db.find((d) => d.id === id) || null;
  }

  async updateDesignStatus(
    id: string,
    status: DesignRecord["status"],
    update: { providerJobId?: string; errorMessage?: string }
  ): Promise<DesignRecord> {
    const db = await this.load();
    const index = db.findIndex((d) => d.id === id);
    if (index === -1) {
      throw new Error(`Design record ${id} not found.`);
    }

    const record = db[index];
    record.status = status;
    record.updatedAt = Date.now();
    
    if (update.providerJobId !== undefined) {
      record.providerJobId = update.providerJobId;
    }
    if (update.errorMessage !== undefined) {
      record.errorMessage = update.errorMessage;
    }

    db[index] = record;
    await this.save(db);
    return record;
  }

  async addVariation(
    designId: string,
    output: AIGenerationOutput
  ): Promise<DesignVariationRecord> {
    const db = await this.load();
    const index = db.findIndex((d) => d.id === designId);
    if (index === -1) {
      throw new Error(`Design record ${designId} not found.`);
    }

    const design = db[index];
    const newVariation: DesignVariationRecord = {
      id: `var_${Math.random().toString(36).substring(2, 9)}`,
      designId,
      generatedImageUrl: output.generatedImageUrl,
      aiProvider: output.providerName,
      aiModel: output.modelName,
      inferenceTimeMs: output.inferenceTimeMs,
      parameters: output.parameters,
      isFavorite: false,
      createdAt: Date.now(),
    };

    design.variations.push(newVariation);
    design.status = "completed";
    design.updatedAt = Date.now();

    db[index] = design;
    await this.save(db);
    return newVariation;
  }

  async listDesigns(userId: string): Promise<DesignRecord[]> {
    const db = await this.load();
    return db.filter((d) => d.userId === userId).sort((a, b) => b.createdAt - a.createdAt);
  }

  async deleteDesign(id: string): Promise<void> {
    const db = await this.load();
    const filtered = db.filter((d) => d.id !== id);
    if (filtered.length === db.length) {
      throw new Error(`Design ${id} not found.`);
    }
    await this.save(filtered);

    // Also scrub this design from any collection mapping
    const collections = await this.loadCollections();
    let changed = false;
    const updatedCollections = collections.map((col) => {
      if (col.designIds.includes(id)) {
        changed = true;
        return {
          ...col,
          designIds: col.designIds.filter((dId) => dId !== id),
        };
      }
      return col;
    });

    if (changed) {
      await this.saveCollections(updatedCollections);
    }
  }

  async renameDesign(id: string, title: string): Promise<DesignRecord> {
    const db = await this.load();
    const index = db.findIndex((d) => d.id === id);
    if (index === -1) {
      throw new Error(`Design ${id} not found.`);
    }
    db[index].title = title;
    db[index].updatedAt = Date.now();
    await this.save(db);
    return db[index];
  }

  async toggleFavoriteVariation(variationId: string): Promise<boolean> {
    const db = await this.load();
    let newFavoriteStatus = false;
    let found = false;

    for (let i = 0; i < db.length; i++) {
      const vIndex = db[i].variations.findIndex((v) => v.id === variationId);
      if (vIndex !== -1) {
        newFavoriteStatus = !db[i].variations[vIndex].isFavorite;
        db[i].variations[vIndex].isFavorite = newFavoriteStatus;
        db[i].updatedAt = Date.now();
        found = true;
        break;
      }
    }

    if (!found) {
      throw new Error(`Variation ${variationId} not found.`);
    }

    await this.save(db);
    return newFavoriteStatus;
  }

  async getCollections(userId: string): Promise<CollectionRecord[]> {
    const cols = await this.loadCollections();
    return cols.filter((c) => c.userId === userId);
  }

  async createCollection(userId: string, name: string): Promise<CollectionRecord> {
    const cols = await this.loadCollections();
    const newCol: CollectionRecord = {
      id: `col_${Math.random().toString(36).substring(2, 9)}`,
      userId,
      name,
      designIds: [],
      createdAt: Date.now(),
    };
    cols.push(newCol);
    await this.saveCollections(cols);
    return newCol;
  }

  async addDesignToCollection(collectionId: string, designId: string): Promise<void> {
    const cols = await this.loadCollections();
    const index = cols.findIndex((c) => c.id === collectionId);
    if (index === -1) {
      throw new Error(`Collection ${collectionId} not found.`);
    }
    if (!cols[index].designIds.includes(designId)) {
      cols[index].designIds.push(designId);
      await this.saveCollections(cols);
    }
  }

  async removeDesignFromCollection(collectionId: string, designId: string): Promise<void> {
    const cols = await this.loadCollections();
    const index = cols.findIndex((c) => c.id === collectionId);
    if (index === -1) {
      throw new Error(`Collection ${collectionId} not found.`);
    }
    cols[index].designIds = cols[index].designIds.filter((id) => id !== designId);
    await this.saveCollections(cols);
  }

  // ── Billing Implementation ──

  private async loadTransactions(): Promise<CreditTransactionRecord[]> {
    if (this.transactionsCache) {
      return this.transactionsCache;
    }
    await this.ensureDb();
    const data = await fs.readFile(TRANSACTIONS_FILE, "utf-8");
    try {
      this.transactionsCache = JSON.parse(data);
      return this.transactionsCache || [];
    } catch {
      this.transactionsCache = [];
      return [];
    }
  }

  private async saveTransactions(data: CreditTransactionRecord[]): Promise<void> {
    this.transactionsCache = data;
    await this.ensureDb();
    const tempFile = `${TRANSACTIONS_FILE}.tmp`;
    await fs.writeFile(tempFile, JSON.stringify(data, null, 2));
    await fs.rename(tempFile, TRANSACTIONS_FILE);
  }

  private async loadSubscriptions(): Promise<SubscriptionRecord[]> {
    if (this.subscriptionsCache) {
      return this.subscriptionsCache;
    }
    await this.ensureDb();
    const data = await fs.readFile(SUBSCRIPTIONS_FILE, "utf-8");
    try {
      this.subscriptionsCache = JSON.parse(data);
      return this.subscriptionsCache || [];
    } catch {
      this.subscriptionsCache = [];
      return [];
    }
  }

  private async saveSubscriptions(data: SubscriptionRecord[]): Promise<void> {
    this.subscriptionsCache = data;
    await this.ensureDb();
    const tempFile = `${SUBSCRIPTIONS_FILE}.tmp`;
    await fs.writeFile(tempFile, JSON.stringify(data, null, 2));
    await fs.rename(tempFile, SUBSCRIPTIONS_FILE);
  }

  async getUserCredits(userId: string): Promise<number> {
    const txs = await this.loadTransactions();
    const userTxs = txs.filter((t) => t.userId === userId);
    
    // Onboarding Bonus: If the user has zero ledger history, grant 10 Free credits automatically.
    if (userTxs.length === 0) {
      await this.addCredits(userId, 10, "bonus", "Onboarding Credit Bonus");
      return 10;
    }

    return userTxs.reduce((sum, tx) => sum + tx.amount, 0);
  }

  async deductCredits(
    userId: string,
    amount: number,
    description: string,
    designId?: string
  ): Promise<boolean> {
    const currentCredits = await this.getUserCredits(userId);
    if (currentCredits < amount) {
      return false; // Insufficient balance
    }

    const txs = await this.loadTransactions();
    const newTx: CreditTransactionRecord = {
      id: `tx_${Math.random().toString(36).substring(2, 9)}`,
      userId,
      amount: -amount, // Negative for deduction
      type: "usage",
      description,
      stripePaymentId: null,
      designId: designId || null,
      createdAt: Date.now(),
    };

    txs.push(newTx);
    await this.saveTransactions(txs);
    return true;
  }

  async addCredits(
    userId: string,
    amount: number,
    type: CreditTransactionRecord["type"],
    description: string,
    stripePaymentId?: string
  ): Promise<void> {
    const txs = await this.loadTransactions();
    const newTx: CreditTransactionRecord = {
      id: `tx_${Math.random().toString(36).substring(2, 9)}`,
      userId,
      amount,
      type,
      description,
      stripePaymentId: stripePaymentId || null,
      designId: null,
      createdAt: Date.now(),
    };

    txs.push(newTx);
    await this.saveTransactions(txs);
  }

  async getTransactionHistory(userId: string): Promise<CreditTransactionRecord[]> {
    const txs = await this.loadTransactions();
    return txs
      .filter((t) => t.userId === userId)
      .sort((a, b) => b.createdAt - a.createdAt);
  }

  async getSubscription(userId: string): Promise<SubscriptionRecord | null> {
    const subs = await this.loadSubscriptions();
    const sub = subs.find((s) => s.userId === userId);
    
    if (!sub) {
      // Return a default free plan state if no Stripe record exists
      return {
        id: `sub_${Math.random().toString(36).substring(2, 9)}`,
        userId,
        stripeCustomerId: "",
        stripeSubscriptionId: null,
        plan: "free",
        status: "none",
        monthlyCredits: 0,
        currentPeriodEnd: 0,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
    }
    return sub;
  }

  async updateSubscription(
    userId: string,
    stripeCustomerId: string,
    stripeSubscriptionId: string | null,
    plan: PlanType,
    status: SubscriptionRecord["status"],
    monthlyCredits: number,
    currentPeriodEnd: number
  ): Promise<void> {
    const subs = await this.loadSubscriptions();
    const index = subs.findIndex((s) => s.userId === userId);

    if (index !== -1) {
      subs[index] = {
        ...subs[index],
        stripeCustomerId,
        stripeSubscriptionId,
        plan,
        status,
        monthlyCredits,
        currentPeriodEnd,
        updatedAt: Date.now(),
      };
    } else {
      const newSub: SubscriptionRecord = {
        id: `sub_${Math.random().toString(36).substring(2, 9)}`,
        userId,
        stripeCustomerId,
        stripeSubscriptionId,
        plan,
        status,
        monthlyCredits,
        currentPeriodEnd,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      subs.push(newSub);
    }

    await this.saveSubscriptions(subs);
  }
}

// Singleton database instance resolver
let repoInstance: DesignRepository | null = null;

export function getDesignRepository(): DesignRepository {
  if (!repoInstance) {
    // Use Supabase when configured, fallback to local JSON for dev
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (supabaseUrl && !supabaseUrl.startsWith("your_")) {
      // Dynamic import to avoid loading Supabase client when not needed
      const { SupabaseDesignRepository } = require("./supabase-db");
      repoInstance = new SupabaseDesignRepository();
    } else {
      repoInstance = new LocalDesignRepository();
    }
  }
  return repoInstance!;
}
