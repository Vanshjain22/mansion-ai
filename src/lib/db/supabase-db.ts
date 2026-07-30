import { createClient } from "@/lib/supabase/server";
import type { DesignRepository, DesignRecord, DesignVariationRecord, CollectionRecord } from "./design-repository";
import type { AIGenerationInput, AIGenerationOutput } from "../ai/types";
import type { CreditTransactionRecord, SubscriptionRecord, PlanType } from "@/types/billing";

/**
 * SUPABASE DESIGN REPOSITORY (Production)
 *
 * Implements DesignRepository using Supabase Postgres.
 * Each method creates a fresh Supabase server client to ensure proper
 * cookie-based auth context per request.
 */
export class SupabaseDesignRepository implements DesignRepository {

  private async db() {
    return await createClient();
  }

  async createDesign(userId: string, input: AIGenerationInput): Promise<DesignRecord> {
    const supabase = await this.db();
    const friendlyStyle = input.styleId.charAt(0).toUpperCase() + input.styleId.slice(1);
    const friendlyRoom = input.roomType.replace("_", " ");

    const { data, error } = await supabase
      .from("designs")
      .insert({
        user_id: userId,
        title: `${friendlyStyle} ${friendlyRoom}`,
        original_image_url: input.originalImageUrl,
        room_type: input.roomType,
        style_id: input.styleId,
        status: "pending",
        custom_prompt: input.customPrompt || null,
        color_palette: input.colorPalette || null,
        mood: input.mood || null,
        lighting: input.lighting || null,
        budget: input.budget || null,
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create design: ${error.message}`);
    return this.mapDesignRow(data, []);
  }

  async getDesign(id: string): Promise<DesignRecord | null> {
    const supabase = await this.db();

    const { data: design, error } = await supabase
      .from("designs")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !design) return null;

    const { data: variations } = await supabase
      .from("design_variations")
      .select("*")
      .eq("design_id", id)
      .order("created_at", { ascending: false });

    return this.mapDesignRow(design, variations || []);
  }

  async updateDesignStatus(
    id: string,
    status: DesignRecord["status"],
    update: { providerJobId?: string; errorMessage?: string }
  ): Promise<DesignRecord> {
    const supabase = await this.db();

    const updatePayload: Record<string, any> = {
      status,
      updated_at: new Date().toISOString(),
    };
    if (update.providerJobId !== undefined) updatePayload.provider_job_id = update.providerJobId;
    if (update.errorMessage !== undefined) updatePayload.error_message = update.errorMessage;

    const { data, error } = await supabase
      .from("designs")
      .update(updatePayload)
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update design: ${error.message}`);

    const { data: variations } = await supabase
      .from("design_variations")
      .select("*")
      .eq("design_id", id);

    return this.mapDesignRow(data, variations || []);
  }

  async addVariation(designId: string, output: AIGenerationOutput): Promise<DesignVariationRecord> {
    const supabase = await this.db();

    const { data, error } = await supabase
      .from("design_variations")
      .insert({
        design_id: designId,
        generated_image_url: output.generatedImageUrl,
        ai_provider: output.providerName,
        ai_model: output.modelName,
        inference_time_ms: output.inferenceTimeMs,
        parameters: output.parameters,
        is_favorite: false,
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to add variation: ${error.message}`);

    // Mark design as completed
    await supabase
      .from("designs")
      .update({ status: "completed", updated_at: new Date().toISOString() })
      .eq("id", designId);

    return this.mapVariationRow(data);
  }

  async listDesigns(userId: string): Promise<DesignRecord[]> {
    const supabase = await this.db();

    const { data: designs, error } = await supabase
      .from("designs")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw new Error(`Failed to list designs: ${error.message}`);

    // Fetch all variations for these designs in one query
    const designIds = (designs || []).map((d: any) => d.id);
    const { data: allVariations } = await supabase
      .from("design_variations")
      .select("*")
      .in("design_id", designIds.length > 0 ? designIds : ["__none__"]);

    const variationsMap = new Map<string, any[]>();
    for (const v of allVariations || []) {
      const list = variationsMap.get(v.design_id) || [];
      list.push(v);
      variationsMap.set(v.design_id, list);
    }

    return (designs || []).map((d: any) =>
      this.mapDesignRow(d, variationsMap.get(d.id) || [])
    );
  }

  async deleteDesign(id: string): Promise<void> {
    const supabase = await this.db();
    const { error } = await supabase.from("designs").delete().eq("id", id);
    if (error) throw new Error(`Failed to delete design: ${error.message}`);
  }

  async renameDesign(id: string, title: string): Promise<DesignRecord> {
    const supabase = await this.db();
    const { data, error } = await supabase
      .from("designs")
      .update({ title, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(`Failed to rename design: ${error.message}`);
    return this.mapDesignRow(data, []);
  }

  async toggleFavoriteVariation(variationId: string): Promise<boolean> {
    const supabase = await this.db();

    const { data: current, error: fetchError } = await supabase
      .from("design_variations")
      .select("is_favorite")
      .eq("id", variationId)
      .single();

    if (fetchError || !current) throw new Error(`Variation ${variationId} not found.`);

    const newValue = !current.is_favorite;
    const { error } = await supabase
      .from("design_variations")
      .update({ is_favorite: newValue })
      .eq("id", variationId);

    if (error) throw new Error(`Failed to toggle favorite: ${error.message}`);
    return newValue;
  }

  // ── Collections ──

  async getCollections(userId: string): Promise<CollectionRecord[]> {
    const supabase = await this.db();

    const { data: cols, error } = await supabase
      .from("collections")
      .select("*, collection_designs(design_id)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw new Error(`Failed to fetch collections: ${error.message}`);

    return (cols || []).map((c: any) => ({
      id: c.id,
      userId: c.user_id,
      name: c.name,
      designIds: (c.collection_designs || []).map((cd: any) => cd.design_id),
      createdAt: new Date(c.created_at).getTime(),
    }));
  }

  async createCollection(userId: string, name: string): Promise<CollectionRecord> {
    const supabase = await this.db();
    const { data, error } = await supabase
      .from("collections")
      .insert({ user_id: userId, name })
      .select()
      .single();

    if (error) throw new Error(`Failed to create collection: ${error.message}`);
    return {
      id: data.id,
      userId: data.user_id,
      name: data.name,
      designIds: [],
      createdAt: new Date(data.created_at).getTime(),
    };
  }

  async addDesignToCollection(collectionId: string, designId: string): Promise<void> {
    const supabase = await this.db();
    const { error } = await supabase
      .from("collection_designs")
      .upsert({ collection_id: collectionId, design_id: designId });

    if (error) throw new Error(`Failed to add to collection: ${error.message}`);
  }

  async removeDesignFromCollection(collectionId: string, designId: string): Promise<void> {
    const supabase = await this.db();
    const { error } = await supabase
      .from("collection_designs")
      .delete()
      .eq("collection_id", collectionId)
      .eq("design_id", designId);

    if (error) throw new Error(`Failed to remove from collection: ${error.message}`);
  }

  // ── Billing ──

  async getUserCredits(userId: string): Promise<number> {
    const supabase = await this.db();
    const { data, error } = await supabase
      .from("credit_transactions")
      .select("amount")
      .eq("user_id", userId);

    if (error) throw new Error(`Failed to fetch credits: ${error.message}`);
    return (data || []).reduce((sum: number, tx: any) => sum + tx.amount, 0);
  }

  async deductCredits(
    userId: string,
    amount: number,
    description: string,
    designId?: string
  ): Promise<boolean> {
    const currentCredits = await this.getUserCredits(userId);
    if (currentCredits < amount) return false;

    const supabase = await this.db();
    const { error } = await supabase.from("credit_transactions").insert({
      user_id: userId,
      amount: -amount,
      type: "usage",
      description,
      design_id: designId || null,
    });

    if (error) throw new Error(`Failed to deduct credits: ${error.message}`);
    return true;
  }

  async addCredits(
    userId: string,
    amount: number,
    type: CreditTransactionRecord["type"],
    description: string,
    stripePaymentId?: string
  ): Promise<void> {
    const supabase = await this.db();
    const { error } = await supabase.from("credit_transactions").insert({
      user_id: userId,
      amount,
      type,
      description,
      stripe_payment_id: stripePaymentId || null,
    });

    if (error) throw new Error(`Failed to add credits: ${error.message}`);
  }

  async getTransactionHistory(userId: string): Promise<CreditTransactionRecord[]> {
    const supabase = await this.db();
    const { data, error } = await supabase
      .from("credit_transactions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw new Error(`Failed to fetch transactions: ${error.message}`);

    return (data || []).map((t: any) => ({
      id: t.id,
      userId: t.user_id,
      amount: t.amount,
      type: t.type,
      description: t.description,
      stripePaymentId: t.stripe_payment_id,
      designId: t.design_id,
      createdAt: new Date(t.created_at).getTime(),
    }));
  }

  async getSubscription(userId: string): Promise<SubscriptionRecord | null> {
    const supabase = await this.db();
    const { data, error } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error || !data) {
      return {
        id: `sub_default`,
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

    return {
      id: data.id,
      userId: data.user_id,
      stripeCustomerId: data.stripe_customer_id || "",
      stripeSubscriptionId: data.stripe_subscription_id,
      plan: data.plan as PlanType,
      status: data.status,
      monthlyCredits: data.monthly_credits,
      currentPeriodEnd: data.current_period_end ? new Date(data.current_period_end).getTime() : 0,
      createdAt: new Date(data.created_at).getTime(),
      updatedAt: new Date(data.updated_at).getTime(),
    };
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
    const supabase = await this.db();

    const { error } = await supabase
      .from("subscriptions")
      .upsert({
        user_id: userId,
        stripe_customer_id: stripeCustomerId,
        stripe_subscription_id: stripeSubscriptionId,
        plan,
        status,
        monthly_credits: monthlyCredits,
        current_period_end: new Date(currentPeriodEnd).toISOString(),
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id" });

    if (error) throw new Error(`Failed to update subscription: ${error.message}`);
  }

  // ── Private Mappers ──

  private mapDesignRow(row: any, variations: any[]): DesignRecord {
    return {
      id: row.id,
      userId: row.user_id,
      title: row.title,
      originalImageUrl: row.original_image_url,
      roomType: row.room_type,
      styleId: row.style_id,
      status: row.status,
      customPrompt: row.custom_prompt,
      colorPalette: row.color_palette,
      mood: row.mood,
      lighting: row.lighting,
      budget: row.budget,
      providerJobId: row.provider_job_id,
      errorMessage: row.error_message,
      createdAt: new Date(row.created_at).getTime(),
      updatedAt: new Date(row.updated_at).getTime(),
      variations: variations.map((v: any) => this.mapVariationRow(v)),
    };
  }

  private mapVariationRow(row: any): DesignVariationRecord {
    return {
      id: row.id,
      designId: row.design_id,
      generatedImageUrl: row.generated_image_url,
      aiProvider: row.ai_provider,
      aiModel: row.ai_model,
      inferenceTimeMs: row.inference_time_ms,
      parameters: row.parameters || {},
      isFavorite: row.is_favorite,
      createdAt: new Date(row.created_at).getTime(),
    };
  }
}
