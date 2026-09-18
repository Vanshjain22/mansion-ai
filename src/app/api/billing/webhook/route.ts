import { NextResponse } from "next/server";
import { getStripeClient, getPlanByPriceId, isMockBillingEnabled, PLANS } from "@/lib/stripe/client";
import { getDesignRepository } from "@/lib/db/local-db";
import { getAuthUser } from "@/lib/supabase/auth-helpers";
import type { PlanType } from "@/types/billing";

/**
 * GET /api/billing/webhook
 *
 * DEVELOPMENT ONLY: Mock payment completion handler.
 * Simulates Stripe webhook execution when Stripe keys are missing.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mockCompleted = searchParams.get("mock_checkout_completed");
  const priceId = searchParams.get("priceId");
  const userId = searchParams.get("userId");

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  if (!isMockBillingEnabled()) {
    return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
  }

  const user = await getAuthUser();
  if (!user || user.id !== userId) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const plan = priceId ? getPlanByPriceId(priceId) : undefined;
  if (mockCompleted === "true" && priceId && userId && plan && plan.id !== "free") {
    const db = getDesignRepository();

    // Determine plan type by matching price ID
    let matchedPlan: PlanType = "free";
    let creditBonus = 0;

    matchedPlan = plan.id;
    creditBonus = plan.credits;

    // 1. Grant subscription plan details
    if (matchedPlan !== "free") {
      await db.updateSubscription(
        userId,
        `cus_mock_${Math.random().toString(36).substring(2, 9)}`,
        `sub_mock_${Math.random().toString(36).substring(2, 9)}`,
        matchedPlan,
        "active",
        creditBonus,
        Date.now() + 30 * 24 * 60 * 60 * 1000 // 30 days period
      );
    }

    // 2. Log credit purchase transaction
    const desc = matchedPlan !== "free" ? `${PLANS[matchedPlan].name} Subscription` : "One-Time Credit Purchase";
    await db.addCredits(userId, creditBonus, "purchase", desc, `ch_mock_${Math.random().toString(36).substring(2, 9)}`);

    return NextResponse.redirect(`${appUrl}/billing?success=true`);
  }

  return NextResponse.redirect(`${appUrl}/billing?error=invalid_mock_params`);
}

/**
 * POST /api/billing/webhook
 *
 * PRODUCTION ONLY: Stripe Webhooks Listener.
 * Receives POST events from Stripe and updates our database schema.
 */
export async function POST(request: Request) {
  const stripe = getStripeClient();
  const db = getDesignRepository();

  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return NextResponse.json(
      { success: false, error: "Missing signature or webhook secret" },
      { status: 400 }
    );
  }

  let event;
  try {
    const rawBody = await request.text();
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err: any) {
    console.error(`[STRIPE WEBHOOK] Cryptographic signature check failed:`, err.message);
    return NextResponse.json(
      { success: false, error: `Webhook error: ${err.message}` },
      { status: 400 }
    );
  }

  const session = event.data.object as any;

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        // Stripe session completed. Check if subscription or one-time payment.
        const userId = session.metadata?.userId;
        const customerId = session.customer;

        if (!userId) {
          throw new Error("No userId found in checkout session metadata.");
        }

        if (session.mode === "subscription") {
          const subscriptionId = session.subscription;
          const subscription = (await stripe.subscriptions.retrieve(subscriptionId)) as any;
          const priceId = subscription.items.data[0].price.id;

          const planConfig = getPlanByPriceId(priceId);
          if (!planConfig) {
            throw new Error(`Plan config not found for price: ${priceId}`);
          }

          // Update Subscription Status in database
          await db.updateSubscription(
            userId,
            customerId,
            subscriptionId,
            planConfig.id,
            "active",
            planConfig.credits,
            subscription.current_period_end * 1000
          );

          // Credit the account with plan monthly allowance
          await db.addCredits(
            userId,
            planConfig.credits,
            "purchase",
            `${planConfig.name} Plan Activation`,
            session.payment_intent || subscriptionId
          );
        } else if (session.mode === "payment") {
          // Grant custom credit pack
          // e.g. metadata price matches a one-time pack
          const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
          const priceId = lineItems.data[0].price?.id;

          let creditAmount = 20; // Default pack
          if (priceId === process.env.STRIPE_PRICE_ID_PACK_50) creditAmount = 50;

          await db.addCredits(
            userId,
            creditAmount,
            "purchase",
            "Credit Pack purchase",
            session.payment_intent
          );
        }
        break;
      }

      case "customer.subscription.updated": {
        // Subscription renewed or changed plans
        const customerId = session.customer as string;
        const status = session.status === "active" ? "active" as const : "past_due" as const;
        const priceId = session.items.data[0].price.id;
        const userId = session.metadata?.userId;

        if (userId) {
          const planConfig = getPlanByPriceId(priceId);
          const plan = planConfig ? planConfig.id : "free";
          const credits = planConfig ? planConfig.credits : 0;

          await db.updateSubscription(
            userId,
            customerId,
            session.id,
            plan as PlanType,
            status,
            credits,
            session.current_period_end * 1000
          );
        }
        break;
      }

      case "customer.subscription.deleted": {
        // Subscription cancelled — downgrade to free
        const userId = session.metadata?.userId;

        if (userId) {
          await db.updateSubscription(
            userId,
            session.customer as string,
            null,
            "free",
            "cancelled",
            0,
            0
          );
        }
        break;
      }
    }

    return NextResponse.json({ success: true, received: true });
  } catch (error: any) {
    console.error(`[STRIPE WEBHOOK ERROR] failed processing:`, error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed webhook handling" },
      { status: 500 }
    );
  }
}
